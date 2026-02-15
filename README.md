# 🗺️ Google Maps MCP Server for Archestra

## 🚀 Overview

An intelligent **MCP (Model Context Protocol) server** that provides AI-powered access to Google Maps saved places. This server exposes **8 specialized tools** for searching, analyzing, and getting personalized recommendations from your saved places through **Archestra's agent platform**. Built with production-grade architecture, Docker containerization, and seamless integration with Archestra's ecosystem.

---

## 📸 System Overview - Live Screenshots

### 1. Chat Interface - Agent in Action

![Chat Interface](Screenshot%202026-02-15%20131333.png)

**The Google Maps Personal Assistant agent** interacting with users through Archestra's chat interface, demonstrating **real-time tool calls** and intelligent responses. The agent understands natural language queries and automatically routes them to the appropriate MCP tools.

### 2. Agent Configuration

![Agent Configuration](Screenshot%202026-02-15%20131419.png)

**Agent setup** showing the system prompt configuration, MCP server connection, and all **8 tools installed and ready to use**. The agent is configured with anti-hallucination prompts to ensure it always calls tools instead of inventing data.

### 3. MCP Registry & Tools

![MCP Registry](Screenshot%202026-02-15%20131536.png)

**MCP server registered** in Archestra's catalog, showing the Docker container deployment (`sushantjainn/google-maps-mcp:latest`) and all available tools. The server is running and ready to handle tool calls from connected agents.

### 4. System Architecture

![System Architecture](Screenshot%202026-02-15%20220136.png)

**Complete system design** showing the integration between Archestra platform, MCP server, tools, and data sources. This diagram illustrates the end-to-end flow from user query to intelligent response.

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│                    (Archestra Chat UI)                           │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Archestra Platform                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Google Maps Personal Assistant Agent             │  │
│  │  • System Prompt Configuration                           │  │
│  │  • Query Understanding & Routing                         │  │
│  │  • Tool Orchestration                                    │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└───────────────────────┼────────────────────────────────────────┘
                        │ MCP Protocol
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Server Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Google Maps MCP Server                          │  │
│  │  • Tool Registration & Discovery                       │  │
│  │  • Request Handling & Validation                        │  │
│  │  • Response Formatting                                  │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└───────────────────────┼────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  8 MCP Tools │ │  Data Layer  │ │  AI Services │
│              │ │              │ │              │
│ • get_saved  │ │ • Mock Data  │ │ • Embeddings │
│   _places    │ │ • Neo4j      │ │ • Analysis   │
│ • search_    │ │ • Qdrant     │ │ • Sentiment │
│   saved_     │ │              │ │              │
│   places     │ │              │ │              │
│ • get_place  │ │              │ │              │
│   _details   │ │              │ │              │
│ • ...        │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Component Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Archestra Platform                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MCP Catalog                              │   │
│  │  • Server Registration                               │   │
│  │  • Docker Container Management                        │   │
│  │  • Health Monitoring                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Agent Framework                          │   │
│  │  • Agent Creation & Configuration                    │   │
│  │  • Tool Installation & Management                    │   │
│  │  • Conversation Handling                             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────┬───────────────────────────────┘
                                │
                                │ Docker Container
                                ▼
┌──────────────────────────────────────────────────────────────┐
│              Google Maps MCP Server                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Server Core (server.ts)                 │   │
│  │  • MCP Protocol Implementation                       │   │
│  │  • Tool Handler Registration                         │   │
│  │  • Request/Response Processing                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Google Maps Client                       │   │
│  │  • Data Retrieval                                    │   │
│  │  • API Integration                                   │   │
│  │  • Mock Data Management                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Intelligence Layer                       │   │
│  │  • Preference Analyzer                               │   │
│  │  • Recommendation Engine                             │   │
│  │  • Sentiment Analysis                                │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Query
    │
    ▼
┌─────────────────────────────────────┐
│   Archestra Agent                   │
│   • Parses Intent                   │
│   • Routes to Tools                 │
└──────────────┬──────────────────────┘
               │
               │ MCP Tool Call
               ▼
┌─────────────────────────────────────┐
│   MCP Server                       │
│   • Validates Request              │
│   • Processes Query               │
└──────────────┬──────────────────────┘
               │
               ├─────────────────┬─────────────────┐
               ▼                 ▼                 ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │  Mock Data   │   │    Neo4j     │   │   Qdrant     │
    │  (Default)   │   │  (Optional)  │   │  (Optional)  │
    └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  AI Processing  │
                    │  • Analysis     │
                    │  • Insights     │
                    │  • Recommendations│
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Formatted      │
                    │  Response       │
                    └────────┬────────┘
                              │
                              ▼
                    User Receives Answer
```

---

## 🎯 Key Features

### Core Capabilities

- **8 Powerful Tools**: Comprehensive toolset for searching, filtering, analyzing, and getting recommendations
- **AI-Powered Intelligence**: Sentiment analysis, mood-based recommendations, preference insights
- **Mock Data Support**: Works perfectly for demos without API keys or external dependencies
- **Real Data Import**: Import your actual Google Maps saved places via Google Takeout export
- **Production Ready**: Dockerized, scalable, and extensible architecture
- **Archestra Integration**: One-click deployment through Archestra's MCP Catalog

### Technical Excellence

- **Type-Safe**: Built with TypeScript for reliability
- **Modular Design**: Clean separation of concerns
- **Extensible**: Easy to add new tools and features
- **Well-Documented**: Comprehensive documentation and examples
- **Error Handling**: Graceful error handling and fallbacks

---

## 🛠️ The 8 Tools - Detailed Overview

### Search & Discovery Tools

1. **`get_saved_places`**
   - **Purpose**: Retrieve saved places with intelligent filtering
   - **Filters**: Category, location (lat/lng/radius), limit
   - **Use Case**: "Show me all restaurants in San Francisco"

2. **`search_saved_places`**
   - **Purpose**: Fuzzy search across names, addresses, tags, and notes
   - **Features**: Semantic search, category filtering, sentiment filtering
   - **Use Case**: "Find that Italian place I saved last year"

3. **`get_place_details`**
   - **Purpose**: Comprehensive place information
   - **Returns**: Ratings, reviews, photos, activity history, insights
   - **Use Case**: "Tell me everything about Sydney Opera House"

### Analysis & Intelligence Tools

4. **`analyze_preferences`**
   - **Purpose**: Deep analysis of user preferences and patterns
   - **Returns**: Top categories, locations, rating distribution, trends
   - **Use Case**: "What are my travel patterns?"

5. **`get_places_by_sentiment`**
   - **Purpose**: Filter places by emotional sentiment
   - **Filters**: Positive, negative, neutral + minimum rating
   - **Use Case**: "Show me only places I loved"

6. **`get_insights`**
   - **Purpose**: Comprehensive insights and trends
   - **Returns**: Favorites, recent discoveries, patterns, recommendations
   - **Use Case**: "Give me a complete overview of my places"

### Recommendation & Activity Tools

7. **`get_recommendations`**
   - **Purpose**: Mood-based intelligent recommendations
   - **Features**: Mood matching, category filtering, location-based
   - **Use Case**: "I'm feeling adventurous, where should I go?"

8. **`get_place_activity`**
   - **Purpose**: Visit history, reviews, photos, and insights
   - **Returns**: Complete activity timeline for a place
   - **Use Case**: "When did I last visit this place?"

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** 18+ (for development)
- **Docker** (for containerized deployment)
- **Archestra Platform** access (for deployment)
- **Git** (for cloning repository)

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/Sushant6095/maps-mcp-archestra.git
cd maps-mcp-archestra
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Build Project

```bash
npm run build
```

#### 4. Build Docker Image

```bash
docker build -t sushantjainn/google-maps-mcp:latest .
```

#### 5. Push to Registry

```bash
docker push sushantjainn/google-maps-mcp:latest
```

### Archestra Deployment

1. **Register MCP Server**
   - Go to Archestra MCP Catalog
   - Click "Add New MCP Server"
   - Enter Docker image: `sushantjainn/google-maps-mcp:latest`
   - Set transport type: `stdio`

2. **Create Agent**
   - Create new agent in Archestra
   - Name: "Google Maps Personal Assistant"
   - Connect to `maps-mcp-server`

3. **Install Tools**
   - Install all 8 tools from the MCP server
   - Tools will be automatically discovered

4. **Configure System Prompt**
   - Copy system prompt from `SYSTEM_PROMPT_FINAL.md`
   - Paste into agent's system prompt field
   - This ensures agent always calls tools

5. **Test**
   - Try query: "show me my saved places"
   - Should return: Sydney Opera House, Bondi Beach

---

## 📊 System Design Deep Dive

### MCP Protocol Integration

The server implements the **Model Context Protocol (MCP)** standard, enabling seamless communication between AI agents and tools. The protocol handles:

- **Tool Discovery**: Automatic tool registration and discovery
- **Request Validation**: Input validation using Zod schemas
- **Error Handling**: Graceful error responses
- **Response Formatting**: Standardized JSON responses

### Agent Orchestration

The Archestra agent intelligently routes user queries to appropriate tools:

- **Query Understanding**: Natural language processing
- **Tool Selection**: Automatic tool selection based on intent
- **Tool Chaining**: Combining multiple tools for complex queries
- **Response Synthesis**: Formatting tool responses for users

### Data Layer Architecture

```
┌─────────────────────────────────────────┐
│         Data Layer                      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Mock Data (Default)             │ │
│  │   • 2 Demo Places                 │ │
│  │   • No Dependencies               │ │
│  │   • Perfect for Demos             │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Neo4j (Optional)                 │ │
│  │   • Graph Database                 │ │
│  │   • Relationship Queries          │ │
│  │   • Advanced Filtering            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Qdrant (Optional)               │ │
│  │   • Vector Database               │ │
│  │   • Semantic Search               │ │
│  │   • Similarity Matching           │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Scalability & Performance

- **Containerized**: Docker enables easy scaling
- **Stateless**: Server is stateless, supports horizontal scaling
- **Caching**: Optional caching layer for frequently accessed data
- **Async Processing**: Non-blocking I/O for better performance

---

## 🎬 Demo & Usage Examples

### Basic Queries

```bash
# Get all saved places
"show me my saved places"

# Filter by category
"show me beaches"

# Search
"find places with architecture"
```

### Advanced Queries

```bash
# Analysis
"analyze my preferences"

# Recommendations
"I'm feeling romantic, suggest places"

# Complex queries
"show me landmarks I loved near Sydney"
```

### Expected Behavior

The system works with **mock data** (2 demo places):
- ✅ Sydney Opera House (Landmark)
- ✅ Bondi Beach (Beach)

All tools function correctly with this mock data, demonstrating:
- Real-time tool calls
- Intelligent query understanding
- Multi-tool orchestration
- Sentiment analysis
- Mood-based recommendations
- Preference insights

---

## 🔧 Development

### Development Commands

```bash
# Development mode (watch)
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Import real data from Google Takeout
npm run import:takeout "path/to/Saved Places.json"
```

### Project Structure

```
archestra-mcp-googlemaps/
├── src/
│   ├── server.ts              # MCP server implementation
│   ├── google-maps-client.ts   # Google Maps client & data layer
│   ├── types.ts               # TypeScript interfaces
│   ├── preference-analyzer.ts # Preference analysis engine
│   ├── recommendation-engine.ts # Recommendation engine
│   ├── embedding-service.ts   # Embedding generation
│   ├── neo4j-client.ts        # Neo4j integration
│   └── qdrant-client.ts       # Qdrant integration
├── dist/                      # Compiled JavaScript
├── scripts/
│   └── import-takeout.ts      # Google Takeout import script
├── Dockerfile                 # Docker configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

---

## 📝 Documentation

- **System Design**: Complete architecture diagrams and flow charts
- **API Setup**: `API_SETUP_GUIDE.md` - Google Maps API configuration
- **Real Data Import**: `REAL_DATA_SETUP.md` - Import your saved places
- **Troubleshooting**: `TROUBLESHOOTING.md` - Common issues and solutions
- **System Prompts**: `SYSTEM_PROMPT_FINAL.md` - Agent configuration

---

## 🎯 Use Cases

### Personal Travel Assistant
- Track and analyze travel patterns
- Get personalized recommendations
- Discover new places based on preferences

### Location Intelligence
- Understand place preferences
- Analyze sentiment and ratings
- Generate insights from saved places

### Smart Recommendations
- Mood-based suggestions
- Category-specific recommendations
- Location-aware recommendations

---

## 🔐 Security & Privacy

- **No API Keys Required**: Works with mock data for demos
- **Optional Authentication**: OAuth2 support for real data
- **Data Privacy**: All data processing happens locally
- **Secure Deployment**: Docker containerization for isolation

---

## 🚀 Production Deployment

### Docker Deployment

```bash
# Build
docker build -t sushantjainn/google-maps-mcp:latest .

# Run locally
docker run --rm sushantjainn/google-maps-mcp:latest

# Push to registry
docker push sushantjainn/google-maps-mcp:latest
```

### Environment Variables

```bash
# Optional - for enhanced features
GOOGLE_MAPS_API_KEY=your_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
NEO4J_URI=bolt://localhost:7687
QDRANT_URL=http://localhost:6333
OPENAI_API_KEY=your_key
```

**Note**: All environment variables are optional. The server works perfectly with mock data without any configuration.

---

## 🤝 Contributing

Contributions are welcome! This project demonstrates:
- MCP protocol integration
- Archestra platform integration
- AI agent orchestration
- Production-ready architecture

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Archestra Platform** - For the amazing MCP ecosystem
- **Model Context Protocol** - For the standardized tool protocol
- **Google Maps** - For location data inspiration

---

**Built with ❤️ for the Archestra ecosystem**

*One click. Infinite possibilities. Your entire Google Maps universe, intelligently accessible.*

---

## 📞 Contact & Support

For questions, issues, or contributions:
- **GitHub**: [Repository Link]
- **Issues**: Open an issue on GitHub
- **Documentation**: See docs folder for detailed guides
