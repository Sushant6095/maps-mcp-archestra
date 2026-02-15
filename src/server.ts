import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { GoogleMapsClient } from './google-maps-client.js';
import { PreferenceAnalyzer } from './preference-analyzer.js';
import { RecommendationEngine } from './recommendation-engine.js';
import * as dotenv from 'dotenv';

dotenv.config();

// Zod schemas for tool inputs
const GetSavedPlacesSchema = z.object({
  category: z.string().optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      radius: z.number().optional(),
    })
    .optional(),
  limit: z.number().int().positive().optional(),
});

const GetPlaceDetailsSchema = z.object({
  placeId: z.string(),
});

const SearchSavedPlacesSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      radius: z.number().optional(),
    })
    .optional(),
  limit: z.number().int().positive().optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
});

const GetPlaceActivitySchema = z.object({
  placeId: z.string(),
});

const GetRecommendationsSchema = z.object({
  mood: z.string().optional(),
  category: z.string().optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      radius: z.number().optional(),
    })
    .optional(),
  limit: z.number().int().positive().optional(),
});

const AnalyzePreferencesSchema = z.object({});

const GetPlacesBySentimentSchema = z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  minRating: z.number().min(0).max(5).optional(),
  limit: z.number().int().positive().optional(),
});

const GetInsightsSchema = z.object({});

class GoogleMapsMCPServer {
  private server: Server;
  private client: GoogleMapsClient;

  constructor() {
    this.server = new Server(
      {
        name: 'google-maps-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Google Maps client
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || '';
    const tokenPath = process.env.GOOGLE_TOKEN_PATH || './token.json';
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // Database connections (optional)
    const neo4jUri = process.env.NEO4J_URI;
    const neo4jUser = process.env.NEO4J_USER;
    const neo4jPassword = process.env.NEO4J_PASSWORD;
    const qdrantUrl = process.env.QDRANT_URL;
    const qdrantApiKey = process.env.QDRANT_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    this.client = new GoogleMapsClient(
      clientId,
      clientSecret,
      redirectUri,
      tokenPath,
      apiKey,
      neo4jUri,
      neo4jUser,
      neo4jPassword,
      qdrantUrl,
      qdrantApiKey,
      openaiApiKey
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_saved_places',
            description:
              'Retrieve saved places with optional filtering by category, location, or limit',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Filter by category (e.g., "Restaurant", "Beach")',
                },
                location: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number', description: 'Latitude' },
                    lng: { type: 'number', description: 'Longitude' },
                    radius: {
                      type: 'number',
                      description: 'Radius in meters (default: 5000)',
                    },
                  },
                  description: 'Filter by location and radius',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return',
                },
              },
            },
          },
          {
            name: 'get_place_details',
            description:
              'Get comprehensive details for a specific place including activity, sentiment, and insights',
            inputSchema: {
              type: 'object',
              properties: {
                placeId: {
                  type: 'string',
                  description: 'The unique identifier for the place',
                },
              },
              required: ['placeId'],
            },
          },
          {
            name: 'search_saved_places',
            description:
              'Fuzzy search across saved places by name, address, tags, or notes',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query to match against name, address, tags, or notes',
                },
                category: {
                  type: 'string',
                  description: 'Filter by category',
                },
                location: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' },
                    radius: { type: 'number' },
                  },
                },
                limit: { type: 'number' },
                sentiment: {
                  type: 'string',
                  enum: ['positive', 'negative', 'neutral'],
                },
              },
            },
          },
          {
            name: 'get_place_activity',
            description:
              'Get visit history, reviews, photos, and insights for a place',
            inputSchema: {
              type: 'object',
              properties: {
                placeId: {
                  type: 'string',
                  description: 'The unique identifier for the place',
                },
              },
              required: ['placeId'],
            },
          },
          {
            name: 'get_recommendations',
            description:
              'Get intelligent, mood-based recommendations for places to visit',
            inputSchema: {
              type: 'object',
              properties: {
                mood: {
                  type: 'string',
                  description:
                    'Mood or preference (e.g., "relaxed", "adventurous", "romantic")',
                },
                category: { type: 'string', description: 'Filter by category' },
                location: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' },
                    radius: { type: 'number' },
                  },
                },
                limit: { type: 'number' },
              },
            },
          },
          {
            name: 'analyze_preferences',
            description:
              'Perform deep analysis of user preferences, patterns, and trends',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_places_by_sentiment',
            description: 'Filter places by sentiment (positive, negative, neutral)',
            inputSchema: {
              type: 'object',
              properties: {
                sentiment: {
                  type: 'string',
                  enum: ['positive', 'negative', 'neutral'],
                  description: 'Sentiment filter',
                },
                minRating: {
                  type: 'number',
                  description: 'Minimum rating (0-5)',
                },
                limit: { type: 'number' },
              },
              required: ['sentiment'],
            },
          },
          {
            name: 'get_insights',
            description:
              'Get comprehensive insights including trends, patterns, favorites, and discoveries',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_saved_places': {
            const params = GetSavedPlacesSchema.parse(args);
            await this.client.loadToken();
            const places = await this.client.getSavedPlaces(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(places, null, 2),
                },
              ],
            };
          }

          case 'get_place_details': {
            const params = GetPlaceDetailsSchema.parse(args);
            await this.client.loadToken();
            const details = await this.client.getPlaceDetails(params.placeId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(details, null, 2),
                },
              ],
            };
          }

          case 'search_saved_places': {
            const params = SearchSavedPlacesSchema.parse(args);
            await this.client.loadToken();
            const places = await this.client.searchSavedPlaces(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(places, null, 2),
                },
              ],
            };
          }

          case 'get_place_activity': {
            const params = GetPlaceActivitySchema.parse(args);
            await this.client.loadToken();
            const activity = await this.client.getPlaceActivity(params.placeId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(activity, null, 2),
                },
              ],
            };
          }

          case 'get_recommendations': {
            const params = GetRecommendationsSchema.parse(args);
            await this.client.loadToken();
            const allPlaces = await this.client.getSavedPlaces();
            const engine = new RecommendationEngine(allPlaces);
            const recommendations = engine.getRecommendations(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(recommendations, null, 2),
                },
              ],
            };
          }

          case 'analyze_preferences': {
            AnalyzePreferencesSchema.parse(args);
            await this.client.loadToken();
            const allPlaces = await this.client.getSavedPlaces();
            const analyzer = new PreferenceAnalyzer(allPlaces);
            const analysis = analyzer.analyze();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(analysis, null, 2),
                },
              ],
            };
          }

          case 'get_places_by_sentiment': {
            const params = GetPlacesBySentimentSchema.parse(args);
            await this.client.loadToken();
            const places = await this.client.getPlacesBySentiment(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(places, null, 2),
                },
              ],
            };
          }

          case 'get_insights': {
            GetInsightsSchema.parse(args);
            await this.client.loadToken();
            const allPlaces = await this.client.getSavedPlaces();
            const analyzer = new PreferenceAnalyzer(allPlaces);
            const insights = analyzer.getInsights();
            const engine = new RecommendationEngine(allPlaces);
            insights.recommendations = engine.getRecommendations({ limit: 5 });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(insights, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    error: 'Validation error',
                    details: error.errors.map((err: z.ZodIssue) => ({
                      path: err.path.join('.'),
                      message: err.message,
                    })),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorStack =
          error instanceof Error && error.stack ? error.stack : undefined;

        console.error(`Error in tool ${name}:`, error);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: errorMessage,
                  ...(errorStack && process.env.NODE_ENV === 'development'
                    ? { stack: errorStack }
                    : {}),
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Google Maps MCP server running on stdio');
  }
}

// Start the server
async function main(): Promise<void> {
  const server = new GoogleMapsMCPServer();
  await server.run();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
