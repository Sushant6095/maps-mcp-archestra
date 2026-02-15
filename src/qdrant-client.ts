import { QdrantClient } from '@qdrant/js-client-rest';
import type { Place } from './types.js';

export class QdrantClientWrapper {
  private client: QdrantClient;
  private collectionName: string;

  constructor(url: string, apiKey?: string, collectionName: string = 'places') {
    this.client = new QdrantClient({
      url,
      apiKey,
    });
    this.collectionName = collectionName;
  }

  // Initialize collection with proper vector configuration
  async initializeCollection(vectorSize: number = 1536): Promise<void> {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some((c: any) => c.name === this.collectionName);

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          },
          // Optional: Add payload indexes for filtering
          optimizers_config: {
            default_segment_number: 2,
          },
        });
        console.log(`Created Qdrant collection: ${this.collectionName}`);
      }
    } catch (error) {
      console.error('Failed to initialize Qdrant collection:', error);
      throw error;
    }
  }

  // Upsert a place with its embedding
  async upsertPlace(placeId: string, embedding: number[], place: Place): Promise<void> {
    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: this.placeIdToUint64(placeId),
            vector: embedding,
            payload: {
              placeId,
              name: place.name,
              address: place.address,
              category: place.category || null,
              rating: place.rating || null,
              userRating: place.userRating || null,
              sentiment: place.sentiment || null,
              tags: place.tags || [],
              notes: place.notes || '',
              latitude: place.location.lat,
              longitude: place.location.lng,
              visitCount: place.visitCount || 0,
              lastVisited: place.lastVisited || null,
            },
          },
        ],
      });
    } catch (error) {
      console.error(`Failed to upsert place ${placeId}:`, error);
      throw error;
    }
  }

  // Semantic search using vector similarity
  async semanticSearch(
    queryEmbedding: number[],
    filters?: {
      category?: string;
      sentiment?: 'positive' | 'negative' | 'neutral';
      minRating?: number;
      location?: { lat: number; lng: number; radiusKm?: number };
    },
    limit: number = 10
  ): Promise<Array<{ place: Place; score: number }>> {
    try {
      const filter: any = {};

      if (filters?.category) {
        filter.must = [
          ...(filter.must || []),
          {
            key: 'category',
            match: { value: filters.category },
          },
        ];
      }

      if (filters?.sentiment) {
        filter.must = [
          ...(filter.must || []),
          {
            key: 'sentiment',
            match: { value: filters.sentiment },
          },
        ];
      }

      if (filters?.minRating) {
        filter.must = [
          ...(filter.must || []),
          {
            key: 'userRating',
            range: {
              gte: filters.minRating,
            },
          },
        ];
      }

      const searchParams: any = {
        vector: queryEmbedding,
        limit,
        with_payload: true,
        score_threshold: 0.3, // Minimum similarity score
      };

      if (Object.keys(filter).length > 0) {
        searchParams.filter = filter;
      }

      const result = await this.client.search(this.collectionName, searchParams);

      return result.map((point: any) => {
        const payload = point.payload as any;
        const place: Place = {
          placeId: payload.placeId,
          name: payload.name,
          address: payload.address,
          category: payload.category,
          rating: payload.rating,
          userRating: payload.userRating,
          location: {
            lat: payload.latitude,
            lng: payload.longitude,
          },
          tags: payload.tags || [],
          notes: payload.notes,
          sentiment: payload.sentiment,
          lastVisited: payload.lastVisited,
          visitCount: payload.visitCount || 0,
        };

        // Filter by location if specified
        if (filters?.location) {
          const distance = this.calculateDistance(
            filters.location.lat,
            filters.location.lng,
            place.location.lat,
            place.location.lng
          ) / 1000; // Convert to km

          const radius = filters.location.radiusKm || 50;
          if (distance > radius) {
            return null;
          }
        }

        return {
          place,
          score: point.score || 0,
        };
      }).filter((item): item is { place: Place; score: number } => item !== null);
    } catch (error) {
      console.error('Semantic search failed:', error);
      throw error;
    }
  }

  // Find similar places based on embedding
  async findSimilarPlaces(placeId: string, limit: number = 10): Promise<Array<{ place: Place; score: number }>> {
    try {
      // First, get the place's embedding
      const point = await this.client.retrieve(this.collectionName, {
        ids: [this.placeIdToUint64(placeId)],
        with_payload: true,
        with_vector: true,
      });

      if (point.length === 0 || !point[0].vector) {
        return [];
      }

      // Search for similar places (excluding the place itself)
      const result = await this.client.search(this.collectionName, {
        vector: point[0].vector as number[],
        limit: limit + 1, // +1 to account for excluding self
        filter: {
          must_not: [
            {
              key: 'placeId',
              match: { value: placeId },
            },
          ],
        },
        with_payload: true,
        score_threshold: 0.5,
      });

      return result
        .filter((p: any) => (p.payload as any).placeId !== placeId)
        .slice(0, limit)
        .map((point: any) => {
          const payload = point.payload as any;
          return {
            place: {
              placeId: payload.placeId,
              name: payload.name,
              address: payload.address,
              category: payload.category,
              rating: payload.rating,
              userRating: payload.userRating,
              location: {
                lat: payload.latitude,
                lng: payload.longitude,
              },
              tags: payload.tags || [],
              notes: payload.notes,
              sentiment: payload.sentiment,
              lastVisited: payload.lastVisited,
              visitCount: payload.visitCount || 0,
            } as Place,
            score: point.score || 0,
          };
        });
    } catch (error) {
      console.error(`Failed to find similar places for ${placeId}:`, error);
      throw error;
    }
  }

  // Batch upsert multiple places
  async batchUpsertPlaces(
    places: Array<{ placeId: string; embedding: number[]; place: Place }>
  ): Promise<void> {
    try {
      const points = places.map((item) => ({
        id: this.placeIdToUint64(item.placeId),
        vector: item.embedding,
        payload: {
          placeId: item.placeId,
          name: item.place.name,
          address: item.place.address,
          category: item.place.category || null,
          rating: item.place.rating || null,
          userRating: item.place.userRating || null,
          sentiment: item.place.sentiment || null,
          tags: item.place.tags || [],
          notes: item.place.notes || '',
          latitude: item.place.location.lat,
          longitude: item.place.location.lng,
          visitCount: item.place.visitCount || 0,
          lastVisited: item.place.lastVisited || null,
        },
      }));

      await this.client.upsert(this.collectionName, {
        wait: true,
        points,
      });
    } catch (error) {
      console.error('Batch upsert failed:', error);
      throw error;
    }
  }

  // Delete a place from the collection
  async deletePlace(placeId: string): Promise<void> {
    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        points: [this.placeIdToUint64(placeId)],
      });
    } catch (error) {
      console.error(`Failed to delete place ${placeId}:`, error);
      throw error;
    }
  }

  // Convert placeId string to uint64 for Qdrant
  private placeIdToUint64(placeId: string): string {
    // Simple hash function to convert string to number
    let hash = 0;
    for (let i = 0; i < placeId.length; i++) {
      const char = placeId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Convert to positive uint64 string representation
    return Math.abs(hash).toString();
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
