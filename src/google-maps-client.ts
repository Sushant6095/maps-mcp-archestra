import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Place, PlaceDetails, PlaceActivity, SearchParams, SentimentFilter } from './types.js';
import { Neo4jClient } from './neo4j-client.js';
import { QdrantClientWrapper } from './qdrant-client.js';
import { EmbeddingService } from './embedding-service.js';

export class GoogleMapsClient {
  private oauth2Client: OAuth2Client;
  // Places API client - reserved for future Google Maps API integration
  // @ts-expect-error - Reserved for future Google Maps API integration
  private _places: ReturnType<typeof google.places> | undefined;
  private tokenPath: string;
  private neo4j: Neo4jClient | null = null;
  private qdrant: QdrantClientWrapper | null = null;
  private embeddings: EmbeddingService | null = null;
  private useDatabases: boolean = false;
  private userId: string = 'default-user'; // Default user ID

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    tokenPath: string,
    apiKey?: string,
    neo4jUri?: string,
    neo4jUser?: string,
    neo4jPassword?: string,
    qdrantUrl?: string,
    qdrantApiKey?: string,
    openaiApiKey?: string
  ) {
    this.oauth2Client = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri,
    });
    this.tokenPath = tokenPath;

    // Initialize Places API
    if (apiKey) {
      this._places = google.places({
        version: 'v1',
        auth: apiKey,
      });
    }

    // Initialize Neo4j if credentials provided
    if (neo4jUri && neo4jUser && neo4jPassword) {
      this.neo4j = new Neo4jClient(neo4jUri, neo4jUser, neo4jPassword);
      this.useDatabases = true;
      this.initializeNeo4j();
    }

    // Initialize Qdrant if URL provided
    if (qdrantUrl) {
      this.qdrant = new QdrantClientWrapper(qdrantUrl, qdrantApiKey);
      this.useDatabases = true;
      this.initializeQdrant();
    }

    // Initialize Embedding Service
    if (openaiApiKey) {
      this.embeddings = new EmbeddingService(openaiApiKey);
    } else {
      // Use fallback embedding service
      this.embeddings = new EmbeddingService();
    }
  }

  private async initializeNeo4j(): Promise<void> {
    if (!this.neo4j) return;

    try {
      const connected = await this.neo4j.verifyConnectivity();
      if (connected) {
        await this.neo4j.initializeSchema();
        console.error('Neo4j connected and schema initialized');
      }
    } catch (error) {
      console.error('Neo4j initialization failed:', error);
      this.neo4j = null;
      this.useDatabases = false;
    }
  }

  private async initializeQdrant(): Promise<void> {
    if (!this.qdrant || !this.embeddings) return;

    try {
      const vectorSize = this.embeddings.getVectorSize();
      await this.qdrant.initializeCollection(vectorSize);
      console.error('Qdrant collection initialized');
    } catch (error) {
      console.error('Qdrant initialization failed:', error);
      this.qdrant = null;
      this.useDatabases = false;
    }
  }

  async loadToken(): Promise<void> {
    try {
      const token = await fs.readFile(this.tokenPath, 'utf-8');
      const tokenData = JSON.parse(token);
      this.oauth2Client.setCredentials(tokenData);

      // Refresh token if needed
      if (tokenData.expiry_date && tokenData.expiry_date <= Date.now()) {
        try {
          const { credentials } = await this.oauth2Client.refreshAccessToken();
          await this.saveToken(credentials);
        } catch (refreshError) {
          console.warn(
            'Failed to refresh access token. Re-authentication may be required.'
          );
          throw refreshError;
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Token file doesn't exist - this is expected on first run
        console.warn(
          'Token file not found. OAuth authentication required on first use.'
        );
      } else {
        // Token file exists but is invalid
        console.warn(
          'Token file is invalid or corrupted. OAuth re-authentication required.'
        );
        throw error;
      }
    }
  }

  async saveToken(token: unknown): Promise<void> {
    try {
      const dir = path.dirname(this.tokenPath);
      if (dir !== '.' && dir !== '') {
        await fs.mkdir(dir, { recursive: true });
      }
      await fs.writeFile(this.tokenPath, JSON.stringify(token, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save token:', error);
      throw error;
    }
  }

  async getSavedPlaces(params?: {
    category?: string;
    location?: { lat: number; lng: number; radius?: number };
    limit?: number;
  }): Promise<Place[]> {
    // Use Neo4j if available for better querying
    if (this.neo4j && this.useDatabases) {
      try {
        const places = await this.neo4j.getUserPlaces(this.userId, {
          category: params?.category,
          limit: params?.limit,
        });

        // Filter by location if specified
        if (params?.location && places.length > 0) {
          const { lat, lng, radius = 5000 } = params.location;
          const radiusKm = radius / 1000;
          return await this.neo4j.findNearbyPlaces(lat, lng, radiusKm, params.limit || 10);
        }

        return places;
      } catch (error) {
        console.error('Neo4j query failed, falling back to mock data:', error);
      }
    }

    // Fallback to mock implementation
    const mockPlaces: Place[] = [
      {
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        name: 'Sydney Opera House',
        address: 'Bennelong Point, Sydney NSW 2000, Australia',
        category: 'Landmark',
        rating: 4.7,
        userRating: 5,
        location: { lat: -33.8568, lng: 151.2153 },
        tags: ['iconic', 'architecture', 'must-visit'],
        notes: 'Amazing architecture and great views',
        sentiment: 'positive',
        lastVisited: '2024-01-15',
        visitCount: 3,
      },
      {
        placeId: 'ChIJ3S-JXmauEmsRUcIaWtf4MzE',
        name: 'Bondi Beach',
        address: 'Bondi Beach NSW 2026, Australia',
        category: 'Beach',
        rating: 4.5,
        userRating: 4,
        location: { lat: -33.8915, lng: 151.2767 },
        tags: ['beach', 'surfing', 'relaxing'],
        notes: 'Great for surfing and sunbathing',
        sentiment: 'positive',
        lastVisited: '2024-01-10',
        visitCount: 5,
      },
    ];

    let filtered = [...mockPlaces];

    if (params?.category) {
      filtered = filtered.filter((p) => p.category === params.category);
    }

    if (params?.location) {
      const { lat, lng, radius = 5000 } = params.location;
      filtered = filtered.filter((place) => {
        const distance = this.calculateDistance(
          lat,
          lng,
          place.location.lat,
          place.location.lng
        );
        return distance <= radius;
      });
    }

    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    // Mock implementation - replace with actual Google Maps API calls
    const mockDetails: PlaceDetails = {
      placeId,
      name: 'Sydney Opera House',
      address: 'Bennelong Point, Sydney NSW 2000, Australia',
      category: 'Landmark',
      rating: 4.7,
      userRating: 5,
      location: { lat: -33.8568, lng: 151.2153 },
      tags: ['iconic', 'architecture', 'must-visit'],
      notes: 'Amazing architecture and great views',
      sentiment: 'positive',
      lastVisited: '2024-01-15',
      visitCount: 3,
      phoneNumber: '+61 2 9250 7111',
      website: 'https://www.sydneyoperahouse.com',
      openingHours: {
        openNow: true,
        weekdayText: [
          'Monday: 9:00 AM – 5:00 PM',
          'Tuesday: 9:00 AM – 5:00 PM',
          'Wednesday: 9:00 AM – 5:00 PM',
          'Thursday: 9:00 AM – 5:00 PM',
          'Friday: 9:00 AM – 5:00 PM',
          'Saturday: 9:00 AM – 5:00 PM',
          'Sunday: 9:00 AM – 5:00 PM',
        ],
      },
      priceLevel: 3,
      photos: [
        {
          id: 'photo1',
          url: 'https://example.com/photo1.jpg',
          date: '2024-01-15',
          caption: 'Beautiful architecture',
          sentiment: 'positive',
        },
      ],
      reviews: [
        {
          id: 'review1',
          date: '2024-01-15',
          rating: 5,
          text: 'Absolutely stunning!',
          sentiment: 'positive',
        },
      ],
      activity: {
        visits: [
          {
            date: '2024-01-15',
            duration: 120,
            companions: ['family'],
            notes: 'Great tour',
            rating: 5,
            sentiment: 'positive',
          },
        ],
        reviews: [],
        photos: [],
        insights: {
          favoriteTime: 'afternoon',
          averageVisitDuration: 120,
        },
      },
    };

    return mockDetails;
  }

  async searchSavedPlaces(params: SearchParams): Promise<Place[]> {
    // Use Qdrant for semantic search if available
    if (this.qdrant && this.embeddings && params.query) {
      try {
        const queryEmbedding = await this.embeddings.generateQueryEmbedding(params.query);
        const searchResults = await this.qdrant.semanticSearch(queryEmbedding, {
          category: params.category,
          sentiment: params.sentiment,
          location: params.location
            ? {
                lat: params.location.lat,
                lng: params.location.lng,
                radiusKm: params.location.radius ? params.location.radius / 1000 : undefined,
              }
            : undefined,
        }, params.limit || 10);

        return searchResults.map((result) => result.place);
      } catch (error) {
        console.error('Qdrant search failed, falling back to text search:', error);
      }
    }

    // Fallback to text-based search
    const allPlaces = await this.getSavedPlaces();
    let results = [...allPlaces];

    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(
        (place) =>
          place.name.toLowerCase().includes(query) ||
          place.address.toLowerCase().includes(query) ||
          place.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          place.notes?.toLowerCase().includes(query)
      );
    }

    if (params.category) {
      results = results.filter((p) => p.category === params.category);
    }

    if (params.location) {
      const { lat, lng, radius = 5000 } = params.location;
      results = results.filter((place) => {
        const distance = this.calculateDistance(
          lat,
          lng,
          place.location.lat,
          place.location.lng
        );
        return distance <= radius;
      });
    }

    if (params.sentiment) {
      results = results.filter((p) => p.sentiment === params.sentiment);
    }

    if (params.limit) {
      results = results.slice(0, params.limit);
    }

    return results;
  }

  async getPlaceActivity(placeId: string): Promise<PlaceActivity> {
    // Mock implementation
    const details = await this.getPlaceDetails(placeId);
    return details.activity || {
      visits: [],
      reviews: [],
      photos: [],
    };
  }

  async getPlacesBySentiment(filter: SentimentFilter): Promise<Place[]> {
    const allPlaces = await this.getSavedPlaces();
    let filtered = allPlaces.filter((p) => p.sentiment === filter.sentiment);

    if (filter.minRating) {
      filtered = filtered.filter(
        (p) => (p.userRating || p.rating || 0) >= filter.minRating!
      );
    }

    if (filter.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}
