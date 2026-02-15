# Google Maps MCP Server

An advanced TypeScript MCP (Model Context Protocol) server for Google Maps that provides an AI-powered personal memory system for saved places. This server enables intelligent place management, preference analysis, and mood-based recommendations.

## ⚠️ Current Status: Using Mock Data

**Important:** This server currently uses **mock/hardcoded data** for demonstration.

### ⚠️ Critical: Google Maps API Key Limitations

**Just providing a Google Maps API key is NOT enough to get your saved places.**

- ❌ Google doesn't have a "Saved Places" API
- ✅ API key can search places and get details (public data)
- ✅ To get YOUR saved places: Use Google Takeout export + Places API

See [GOOGLE_MAPS_API_LIMITATIONS.md](docs/GOOGLE_MAPS_API_LIMITATIONS.md) for details.

**Recommended approach:** Google Takeout export + Places API integration. See [CONNECTING_TO_GOOGLE.md](docs/CONNECTING_TO_GOOGLE.md).

## Features

- **8 Powerful Tools**: Comprehensive set of tools for place management and analysis
- **AI-Powered Memory**: Intelligent preference analysis and pattern recognition
- **Mood-Based Recommendations**: Get personalized recommendations based on your mood and preferences
- **Sentiment Analysis**: Track and filter places by sentiment (positive, negative, neutral)
- **Activity Tracking**: Monitor visit history, reviews, and photos with insights
- **Fuzzy Search**: Search across names, addresses, tags, and notes
- **Deep Analytics**: Understand your preferences, trends, and patterns
- **Neo4j Integration** (Optional): Graph database for relationship-based queries and recommendations
- **Qdrant Integration** (Optional): Vector database for semantic similarity search
- **OpenAI Embeddings** (Optional): High-quality embeddings for semantic search

## Quick Start

### Prerequisites

- Node.js 18+ 
- Google Cloud Project with OAuth2 credentials
- (Optional) Google Maps API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd archestra-mcp-googlemaps
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Build the project:
```bash
npm run build
```

5. Run the server:
```bash
npm start
```

## Tools Documentation

### 1. `get_saved_places`

Retrieve saved places with optional filtering.

**Parameters:**
- `category` (optional): Filter by category (e.g., "Restaurant", "Beach")
- `location` (optional): Filter by location and radius
  - `lat`: Latitude
  - `lng`: Longitude
  - `radius`: Radius in meters (default: 5000)
- `limit` (optional): Maximum number of results

**Example:**
```json
{
  "category": "Restaurant",
  "location": {
    "lat": -33.8568,
    "lng": 151.2153,
    "radius": 2000
  },
  "limit": 10
}
```

### 2. `get_place_details`

Get comprehensive details for a specific place including activity, sentiment, and insights.

**Parameters:**
- `placeId` (required): The unique identifier for the place

**Returns:** Complete place details with opening hours, photos, reviews, and activity history.

### 3. `search_saved_places`

Fuzzy search across saved places by name, address, tags, or notes.

**Parameters:**
- `query` (optional): Search query
- `category` (optional): Filter by category
- `location` (optional): Filter by location
- `limit` (optional): Maximum results
- `sentiment` (optional): Filter by sentiment ("positive", "negative", "neutral")

### 4. `get_place_activity`

Get visit history, reviews, photos, and insights for a place.

**Parameters:**
- `placeId` (required): The unique identifier for the place

**Returns:** Activity data including visits, reviews, photos, and derived insights.

### 5. `get_recommendations`

Get intelligent, mood-based recommendations for places to visit.

**Parameters:**
- `mood` (optional): Mood or preference (e.g., "relaxed", "adventurous", "romantic")
- `category` (optional): Filter by category
- `location` (optional): Filter by location
- `limit` (optional): Maximum recommendations (default: 10)

**Example:**
```json
{
  "mood": "romantic",
  "category": "Restaurant",
  "location": {
    "lat": -33.8568,
    "lng": 151.2153,
    "radius": 5000
  }
}
```

### 6. `analyze_preferences`

Perform deep analysis of user preferences, patterns, and trends.

**Parameters:** None

**Returns:** 
- Top categories and locations
- Rating and sentiment distributions
- Time and seasonal patterns
- Recent favorites and emerging trends

### 7. `get_places_by_sentiment`

Filter places by sentiment.

**Parameters:**
- `sentiment` (required): "positive", "negative", or "neutral"
- `minRating` (optional): Minimum rating (0-5)
- `limit` (optional): Maximum results

### 8. `get_insights`

Get comprehensive insights including trends, patterns, favorites, and discoveries.

**Parameters:** None

**Returns:**
- Total places and visits
- Average rating
- Favorite places
- Recent discoveries
- Trends and patterns
- Personalized recommendations

## Archestra Registration

To register this MCP server with Archestra:

1. **Build the Docker image:**
```bash
docker build -t your-registry/google-maps-mcp:latest .
```

2. **Push to your registry:**
```bash
docker push your-registry/google-maps-mcp:latest
```

3. **Register in Archestra:**
   - Navigate to http://127.0.0.1:3000/mcp-catalog/registry (or your Archestra instance)
   - Add a new MCP server
   - Provide the Docker image path
   - Configure environment variables
   - Set the transport type to "stdio"

4. **Environment Variables:**
   - `GOOGLE_CLIENT_ID`: Your OAuth2 client ID
   - `GOOGLE_CLIENT_SECRET`: Your OAuth2 client secret
   - `GOOGLE_REDIRECT_URI`: OAuth2 redirect URI
   - `GOOGLE_TOKEN_PATH`: Path to store OAuth tokens (default: `./token.json`)
   - `GOOGLE_MAPS_API_KEY`: (Optional) Google Maps API key
   - `NEO4J_URI`: (Optional) Neo4j database URI (e.g., `bolt://localhost:7687`)
   - `NEO4J_USER`: (Optional) Neo4j username
   - `NEO4J_PASSWORD`: (Optional) Neo4j password
   - `QDRANT_URL`: (Optional) Qdrant vector database URL (e.g., `http://localhost:6333`)
   - `QDRANT_API_KEY`: (Optional) Qdrant API key
   - `OPENAI_API_KEY`: (Optional) OpenAI API key for embeddings (uses fallback if not provided)

## NPM/NPX Execution

This package can be executed via npx:

```bash
npx google-maps-mcp-server
```

Make sure to set up your `.env` file with the required credentials before running.

## Development

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Watch mode for development
- `npm start`: Run the compiled server
- `npm run type-check`: Type check without emitting files
- `npm run lint`: Run ESLint

### Project Structure

```
.
├── src/
│   ├── server.ts              # Main MCP server
│   ├── types.ts               # TypeScript interfaces
│   ├── google-maps-client.ts  # Google Maps API client
│   ├── preference-analyzer.ts # Preference analysis logic
│   └── recommendation-engine.ts # Recommendation engine
├── dist/                      # Compiled JavaScript
├── package.json
├── tsconfig.json
├── Dockerfile
├── .env.example
├── .gitignore
└── README.md
```

## Authentication

The server uses OAuth2 for Google authentication. On first run, you'll need to:

1. Obtain OAuth2 credentials from Google Cloud Console
2. Complete the OAuth flow to get initial tokens
3. Tokens are stored in `token.json` (or path specified in `GOOGLE_TOKEN_PATH`)
4. Tokens are automatically refreshed when expired

## License

MIT
