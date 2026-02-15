import neo4j, { Driver } from 'neo4j-driver';
import type { Place, Visit } from './types.js';

export class Neo4jClient {
  private driver: Driver;

  constructor(uri: string, user: string, password: string) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  async close(): Promise<void> {
    await this.driver.close();
  }

  async verifyConnectivity(): Promise<boolean> {
    try {
      await this.driver.verifyConnectivity();
      return true;
    } catch (error) {
      console.error('Neo4j connection failed:', error);
      return false;
    }
  }

  // Initialize schema (create indexes and constraints)
  async initializeSchema(): Promise<void> {
    const session = this.driver.session();
    try {
      // Create constraints
      await session.run(`
        CREATE CONSTRAINT place_id IF NOT EXISTS
        FOR (p:Place) REQUIRE p.placeId IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT user_id IF NOT EXISTS
        FOR (u:User) REQUIRE u.userId IS UNIQUE
      `);

      // Create indexes for better performance
      await session.run(`
        CREATE INDEX place_category IF NOT EXISTS
        FOR (p:Place) ON (p.category)
      `);

      await session.run(`
        CREATE INDEX place_sentiment IF NOT EXISTS
        FOR (p:Place) ON (p.sentiment)
      `);

      await session.run(`
        CREATE INDEX visit_date IF NOT EXISTS
        FOR ()-[v:VISITED]-() ON (v.date)
      `);
    } catch (error) {
      // Constraints/indexes might already exist
      console.warn('Schema initialization warning:', error);
    } finally {
      await session.close();
    }
  }

  // Save or update a place
  async savePlace(place: Place): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        MERGE (p:Place {placeId: $placeId})
        SET p.name = $name,
            p.address = $address,
            p.category = $category,
            p.rating = $rating,
            p.userRating = $userRating,
            p.latitude = $latitude,
            p.longitude = $longitude,
            p.sentiment = $sentiment,
            p.lastVisited = $lastVisited,
            p.visitCount = $visitCount,
            p.tags = $tags,
            p.notes = $notes
        `,
        {
          placeId: place.placeId,
          name: place.name,
          address: place.address,
          category: place.category || null,
          rating: place.rating || null,
          userRating: place.userRating || null,
          latitude: place.location.lat,
          longitude: place.location.lng,
          sentiment: place.sentiment || null,
          lastVisited: place.lastVisited || null,
          visitCount: place.visitCount || 0,
          tags: place.tags || [],
          notes: place.notes || null,
        }
      );
    } finally {
      await session.close();
    }
  }

  // Create relationships between places (similar, near, same category)
  async createPlaceRelationships(placeId1: string, placeId2: string, relationship: 'SIMILAR' | 'NEAR' | 'SAME_CATEGORY'): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        MATCH (p1:Place {placeId: $placeId1})
        MATCH (p2:Place {placeId: $placeId2})
        MERGE (p1)-[r:${relationship}]-(p2)
        SET r.createdAt = datetime()
        `,
        { placeId1, placeId2 }
      );
    } finally {
      await session.close();
    }
  }

  // Record a visit
  async recordVisit(userId: string, placeId: string, visit: Visit): Promise<void> {
    const session = this.driver.session();
    try {
      // Ensure user exists
      await session.run(
        `
        MERGE (u:User {userId: $userId})
        `,
        { userId }
      );

      // Create visit relationship
      await session.run(
        `
        MATCH (u:User {userId: $userId})
        MATCH (p:Place {placeId: $placeId})
        CREATE (u)-[v:VISITED {
          date: $date,
          duration: $duration,
          rating: $rating,
          sentiment: $sentiment,
          notes: $notes
        }]->(p)
        `,
        {
          userId,
          placeId,
          date: visit.date,
          duration: visit.duration || null,
          rating: visit.rating || null,
          sentiment: visit.sentiment || null,
          notes: visit.notes || null,
        }
      );
    } finally {
      await session.close();
    }
  }

  // Get places by relationship (similar places, nearby places, etc.)
  async getRelatedPlaces(placeId: string, relationship: 'SIMILAR' | 'NEAR' | 'SAME_CATEGORY', limit: number = 10): Promise<Place[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (p1:Place {placeId: $placeId})-[r:${relationship}]-(p2:Place)
        RETURN p2
        ORDER BY p2.userRating DESC, p2.rating DESC
        LIMIT $limit
        `,
        { placeId, limit }
      );

      return result.records.map((record: any) => {
        const p = record.get('p2').properties;
        return {
          placeId: p.placeId,
          name: p.name,
          address: p.address,
          category: p.category,
          rating: p.rating,
          userRating: p.userRating,
          location: {
            lat: p.latitude,
            lng: p.longitude,
          },
          tags: p.tags || [],
          notes: p.notes,
          sentiment: p.sentiment,
          lastVisited: p.lastVisited,
          visitCount: p.visitCount || 0,
        } as Place;
      });
    } finally {
      await session.close();
    }
  }

  // Get places visited by user with filters
  async getUserPlaces(
    userId: string,
    filters?: {
      category?: string;
      sentiment?: 'positive' | 'negative' | 'neutral';
      minRating?: number;
      limit?: number;
    }
  ): Promise<Place[]> {
    const session = this.driver.session();
    try {
      let query = `
        MATCH (u:User {userId: $userId})-[v:VISITED]->(p:Place)
        WHERE 1=1
      `;

      const params: any = { userId };

      if (filters?.category) {
        query += ` AND p.category = $category`;
        params.category = filters.category;
      }

      if (filters?.sentiment) {
        query += ` AND p.sentiment = $sentiment`;
        params.sentiment = filters.sentiment;
      }

      if (filters?.minRating) {
        query += ` AND (p.userRating >= $minRating OR p.rating >= $minRating)`;
        params.minRating = filters.minRating;
      }

      query += `
        RETURN p, v
        ORDER BY v.date DESC, p.userRating DESC
      `;

      if (filters?.limit) {
        query += ` LIMIT $limit`;
        params.limit = filters.limit;
      }

      const result = await session.run(query, params);

      return result.records.map((record: any) => {
        const p = record.get('p').properties;
        return {
          placeId: p.placeId,
          name: p.name,
          address: p.address,
          category: p.category,
          rating: p.rating,
          userRating: p.userRating,
          location: {
            lat: p.latitude,
            lng: p.longitude,
          },
          tags: p.tags || [],
          notes: p.notes,
          sentiment: p.sentiment,
          lastVisited: p.lastVisited,
          visitCount: p.visitCount || 0,
        } as Place;
      });
    } finally {
      await session.close();
    }
  }

  // Find places near a location using graph traversal
  async findNearbyPlaces(lat: number, lng: number, radiusKm: number, limit: number = 10): Promise<Place[]> {
    const session = this.driver.session();
    try {
      // Use Neo4j spatial functions if available, otherwise filter by distance
      const result = await session.run(
        `
        MATCH (p:Place)
        WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
        WITH p, 
          distance(
            point({latitude: p.latitude, longitude: p.longitude}),
            point({latitude: $lat, longitude: $lng})
          ) / 1000 AS distanceKm
        WHERE distanceKm <= $radiusKm
        RETURN p, distanceKm
        ORDER BY distanceKm, p.userRating DESC
        LIMIT $limit
        `,
        { lat, lng, radiusKm, limit }
      );

      return result.records.map((record: any) => {
        const p = record.get('p').properties;
        return {
          placeId: p.placeId,
          name: p.name,
          address: p.address,
          category: p.category,
          rating: p.rating,
          userRating: p.userRating,
          location: {
            lat: p.latitude,
            lng: p.longitude,
          },
          tags: p.tags || [],
          notes: p.notes,
          sentiment: p.sentiment,
          lastVisited: p.lastVisited,
          visitCount: p.visitCount || 0,
        } as Place;
      });
    } catch (error) {
      // Fallback if spatial functions not available
      console.warn('Spatial query failed, using fallback:', error);
      return this.findNearbyPlacesFallback(lat, lng, radiusKm, limit);
    } finally {
      await session.close();
    }
  }

  private async findNearbyPlacesFallback(lat: number, lng: number, radiusKm: number, limit: number): Promise<Place[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (p:Place)
        WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
        RETURN p
        LIMIT 1000
        `
      );

      const places = result.records.map((record) => {
        const p = record.get('p').properties;
        return {
          placeId: p.placeId,
          name: p.name,
          address: p.address,
          category: p.category,
          rating: p.rating,
          userRating: p.userRating,
          location: {
            lat: p.latitude,
            lng: p.longitude,
          },
          tags: p.tags || [],
          notes: p.notes,
          sentiment: p.sentiment,
          lastVisited: p.lastVisited,
          visitCount: p.visitCount || 0,
        } as Place;
      });

      // Filter by distance
      const nearby = places
        .map((place: any) => {
          const distance = this.calculateDistance(lat, lng, place.location.lat, place.location.lng) / 1000;
          return { place, distance };
        })
        .filter((item: any) => item.distance <= radiusKm)
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, limit)
        .map((item: any) => item.place);

      return nearby;
    } finally {
      await session.close();
    }
  }

  // Get recommendation paths (places visited by users who also visited this place)
  async getRecommendationPaths(placeId: string, limit: number = 10): Promise<Place[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (p1:Place {placeId: $placeId})<-[:VISITED]-(u:User)-[:VISITED]->(p2:Place)
        WHERE p1 <> p2
        WITH p2, count(DISTINCT u) AS commonUsers
        RETURN p2, commonUsers
        ORDER BY commonUsers DESC, p2.userRating DESC
        LIMIT $limit
        `,
        { placeId, limit }
      );

      return result.records.map((record: any) => {
        const p = record.get('p2').properties;
        return {
          placeId: p.placeId,
          name: p.name,
          address: p.address,
          category: p.category,
          rating: p.rating,
          userRating: p.userRating,
          location: {
            lat: p.latitude,
            lng: p.longitude,
          },
          tags: p.tags || [],
          notes: p.notes,
          sentiment: p.sentiment,
          lastVisited: p.lastVisited,
          visitCount: p.visitCount || 0,
        } as Place;
      });
    } finally {
      await session.close();
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}
