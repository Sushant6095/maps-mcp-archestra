# 🗺️ Google Maps MCP Server for Archestra

## Overview

An intelligent MCP (Model Context Protocol) server that provides AI-powered access to Google Maps saved places. This server exposes 8 specialized tools for searching, analyzing, and getting personalized recommendations from your saved places through Archestra's agent platform.

## 🎯 Key Features

- **8 Powerful Tools**: Search, filter, analyze, and get recommendations from saved places
- **AI-Powered Intelligence**: Sentiment analysis, mood-based recommendations, preference insights
- **Mock Data Support**: Works perfectly for demos without API keys
- **Real Data Import**: Import your actual Google Maps saved places via Google Takeout
- **Production Ready**: Dockerized, scalable, and extensible architecture
- **Archestra Integration**: One-click deployment through Archestra's MCP Catalog

## 📸 System Overview

### 1. Chat Interface - Agent in Action

![Chat Interface](Screenshot%202026-02-15%20131333.png)

The Google Maps Personal Assistant agent interacting with users through Archestra's chat interface, demonstrating real-time tool calls and intelligent responses.

### 2. Agent Configuration

![Agent Configuration](Screenshot%202026-02-15%20131419.png)

Agent setup showing the system prompt configuration, MCP server connection, and all 8 tools installed and ready to use.

### 3. MCP Registry & Tools

![MCP Registry](Screenshot%202026-02-15%20131536.png)

MCP server registered in Archestra's catalog, showing the Docker container deployment and available tools.

### 4. System Architecture

![System Architecture](Screenshot%202026-02-15%20220136.png)

Complete system design showing the integration between Archestra platform, MCP server, tools, and data sources.

## 🛠️ The 8 Tools

1. **get_saved_places** - Retrieve saved places with filtering
2. **search_saved_places** - Fuzzy search across names, addresses, tags
3. **get_place_details** - Comprehensive place information
4. **get_place_activity** - Visit history and activity insights
5. **get_recommendations** - Mood-based intelligent recommendations
6. **analyze_preferences** - Deep preference and pattern analysis
7. **get_places_by_sentiment** - Filter by sentiment (positive/negative/neutral)
8. **get_insights** - Comprehensive insights and trends

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker (for containerized deployment)
- Archestra platform access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd archestra-mcp-googlemaps
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Build Docker image**
   ```bash
   docker build -t sushantjainn/google-maps-mcp:latest .
   ```

5. **Push to registry**
   ```bash
   docker push sushantjainn/google-maps-mcp:latest
   ```

### Archestra Setup

1. Register MCP server in Archestra MCP Catalog
2. Use Docker image: `sushantjainn/google-maps-mcp:latest`
3. Create agent and connect to MCP server
4. Install all 8 tools in the agent
5. Configure system prompt (see `SYSTEM_PROMPT_FINAL.md`)

## 📊 System Design

For complete system design, architecture diagrams, deployment flow, and technical details, please refer to the comprehensive documentation in this repository. The architecture includes:

- **MCP Protocol**: Standardized tool communication
- **Agent Orchestration**: Intelligent query routing and tool chaining
- **Data Layer**: Mock data support with optional Neo4j/Qdrant integration
- **Scalability**: Docker containerization for easy deployment
- **Extensibility**: Modular design for adding new features

## 🎬 Demo

The system works with mock data (2 demo places: Sydney Opera House, Bondi Beach) and demonstrates:

- Real-time tool calls
- Intelligent query understanding
- Multi-tool orchestration
- Sentiment analysis
- Mood-based recommendations
- Preference insights

## 📝 Documentation

- **System Design**: See architecture diagrams and flow charts in repository
- **API Setup**: `API_SETUP_GUIDE.md` - Google Maps API configuration
- **Real Data Import**: `REAL_DATA_SETUP.md` - Import your saved places
- **Troubleshooting**: `TROUBLESHOOTING.md` - Common issues and solutions

## 🔧 Development

```bash
# Development mode
npm run dev

# Build
npm run build

# Test
npm test

# Import real data
npm run import:takeout "path/to/Saved Places.json"
```

## 📦 Project Structure

```
archestra-mcp-googlemaps/
├── src/
│   ├── server.ts              # MCP server implementation
│   ├── google-maps-client.ts  # Google Maps client
│   ├── types.ts               # TypeScript interfaces
│   ├── preference-analyzer.ts # Preference analysis
│   ├── recommendation-engine.ts # Recommendation engine
│   └── ...
├── dist/                      # Compiled JavaScript
├── scripts/                   # Utility scripts
├── Dockerfile                 # Docker configuration
└── README.md                  # This file
```

## 🤝 Contributing

Contributions welcome! This project demonstrates MCP protocol integration with Archestra's agent platform.

## 📄 License

MIT

---

**Built with ❤️ for the Archestra ecosystem**

*One click. Infinite possibilities. Your entire Google Maps universe, intelligently accessible.*
