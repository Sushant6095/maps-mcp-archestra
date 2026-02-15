# 🗺️ Google Maps MCP Server for Archestra

## 🚀 The Story: One Click, Infinite Possibilities

Imagine this: You're planning a weekend getaway. Instead of juggling between Google Maps, multiple apps, and your memory, you simply ask:

> *"Show me romantic restaurants near the beach I visited last summer, but only the ones I rated highly"*

**One click. One question. Your entire Google Maps universe at your fingertips.**

This isn't just another integration—it's a **revolutionary way to interact with your location data** through Archestra's powerful agent ecosystem. We're not just connecting to Google Maps; we're creating an **intelligent memory system** that understands your preferences, learns from your patterns, and answers complex questions through a **chain of specialized AI agents**.

### Why This is Different

Traditional integrations give you data. **We give you intelligence.**

- 🧠 **AI-Powered Memory**: Your places aren't just stored—they're understood, analyzed, and contextualized
- 🔗 **Agent Orchestration**: Complex queries are broken down and answered by specialized sub-agents working in harmony
- 🎯 **Mood-Based Intelligence**: Get recommendations that match not just your location, but your current mood and context
- 📊 **Deep Insights**: Understand patterns you never knew existed in your travel and place preferences
- ⚡ **One-Click Access**: Deploy once, use forever—Archestra handles the complexity

---

## 📸 System in Action - Live Screenshots

### 1. Chat Interface - Agent in Action

![Chat Interface](./Screenshot%202026-02-15%20131333.png)

**The Google Maps Personal Assistant agent** interacting with users through Archestra's chat interface, demonstrating **real-time tool calls** and intelligent responses. The agent understands natural language queries and automatically routes them to the appropriate MCP tools.

### 2. Agent Configuration

![Agent Configuration](./Screenshot%202026-02-15%20131419.png)

**Agent setup** showing the system prompt configuration, MCP server connection, and all **8 tools installed and ready to use**. The agent is configured with anti-hallucination prompts to ensure it always calls tools instead of inventing data.

### 3. MCP Registry & Tools

![MCP Registry](./Screenshot%202026-02-15%20131536.png)

**MCP server registered** in Archestra's catalog, showing the Docker container deployment (`sushantjainn/google-maps-mcp:latest`) and all available tools. The server is running and ready to handle tool calls from connected agents.

### 4. System Architecture

![System Architecture](./Screenshot%202026-02-15%20220136.png)

**Complete system design** showing the integration between Archestra platform, MCP server, tools, and data sources. This diagram illustrates the end-to-end flow from user query to intelligent response.

---

## 🏗️ Revolutionary Architecture: How We Leverage Archestra

### The Complete Flow: From Server to Intelligence

```
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: BUILD & DEPLOY                       │
│                                                                  │
│  Developer → Docker Build → Push to Registry                    │
│       ↓                                                          │
│  sushantjainn/google-maps-mcp:latest                            │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: ARCHESTRA MCP CATALOG                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Register MCP Server in Catalog                          │  │
│  │  • Docker Image: sushantjainn/google-maps-mcp:latest     │  │
│  │  • Transport: stdio                                      │  │
│  │  • Auto-discovery of 8 Tools                            │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└───────────────────────┼────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 3: TOOL INSTALLATION                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Install 8 Tools to Agent                               │  │
│  │  ✅ get_saved_places                                     │  │
│  │  ✅ search_saved_places                                 │  │
│  │  ✅ get_place_details                                   │  │
│  │  ✅ get_place_activity                                  │  │
│  │  ✅ get_recommendations                                 │  │
│  │  ✅ analyze_preferences                                 │  │
│  │  ✅ get_places_by_sentiment                             │  │
│  │  ✅ get_insights                                        │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└───────────────────────┼────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 4: AGENT CREATION & CHAINING                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Master Agent: Google Maps Personal Assistant            │  │
│  │  • System Prompt: Anti-hallucination                     │  │
│  │  • Tool Access: All 8 tools                              │  │
│  │  • Query Router: Intelligent routing                     │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│        ┌──────────────┼──────────────┐                          │
│        ▼              ▼              ▼                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  Search  │  │ Analytics│  │Recommend │                      │
│  │  Agent   │  │  Agent   │  │  Agent   │                      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                      │
│       │             │             │                             │
│       └─────────────┼─────────────┘                             │
│                     │                                             │
│                     ▼                                             │
│            Orchestrated Response                                  │
└─────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 5: USER QUERY → INTELLIGENT ANSWER            │
│                                                                  │
│  User: "Show me romantic restaurants near beaches I loved"     │
│       │                                                          │
│       ▼                                                          │
│  Master Agent → Routes to Sub-Agents                           │
│       │                                                          │
│       ├─→ Search Agent: Finds beaches                           │
│       ├─→ Analytics Agent: Filters by sentiment                │
│       └─→ Recommendation Agent: Gets romantic suggestions      │
│                                                                  │
│  Result: Intelligent, contextual answer                         │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Chain Architecture: The Power of Orchestration

```
                    User Query
                        │
                        ▼
            ┌───────────────────────┐
            │   Master Agent        │
            │   (Query Router)      │
            └───────────┬───────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Search Agent │ │Analytics Agent│ │Recommend Agent│
│              │ │              │ │              │
│ Tools:       │ │ Tools:       │ │ Tools:       │
│ • get_saved  │ │ • analyze_   │ │ • get_recom  │
│   _places    │ │   preferences│ │   mendations │
│ • search_    │ │ • get_insights│ │ • get_place │
│   saved_     │ │ • get_places │ │   _details  │
│   places     │ │   _by_sentiment│ │             │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Result Aggregator    │
            │  • Combines results   │
            │  • Adds context       │
            │  • Formats response   │
            └───────────┬───────────┘
                        │
                        ▼
                  User Receives
              Intelligent Answer
```

### How We Use Archestra Differently

**Traditional Approach:**
```
User → Single Agent → Single Tool → Response
```

**Our Revolutionary Approach:**
```
User → Master Agent → Query Analysis → Sub-Agent Chain
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
              Search Agent              Analytics Agent          Recommend Agent
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              │
                                    Result Aggregation
                                              │
                                    Intelligent Response
```

**Key Innovation:**
- **Multi-Agent Orchestration**: Complex queries are broken down and handled by specialized agents
- **Tool Chaining**: Multiple tools work together seamlessly
- **Context Preservation**: Each agent understands the full context
- **Intelligent Routing**: Master agent routes to the right sub-agents

---

## 🛠️ The 8 Powerful Tools

| Tool | Purpose | Use Case |
|------|---------|----------|
| `get_saved_places` | Retrieve saved places with filtering | "Show me all restaurants in San Francisco" |
| `search_saved_places` | Fuzzy search across names, addresses, tags | "Find that Italian place I saved last year" |
| `get_place_details` | Comprehensive place information | "Tell me everything about Sydney Opera House" |
| `get_place_activity` | Visit history and activity insights | "When did I last visit this place?" |
| `get_recommendations` | Mood-based intelligent recommendations | "I'm feeling adventurous, where should I go?" |
| `analyze_preferences` | Deep preference and pattern analysis | "What are my travel patterns?" |
| `get_places_by_sentiment` | Filter by sentiment (positive/negative/neutral) | "Show me only places I loved" |
| `get_insights` | Comprehensive insights and trends | "Give me a complete overview of my places" |

---

## 🚀 Quick Start: One-Click Deployment

### Step 1: Build & Push Docker Image

```bash
docker build -t sushantjainn/google-maps-mcp:latest .
docker push sushantjainn/google-maps-mcp:latest
```

### Step 2: Register in Archestra Catalog

1. Go to Archestra MCP Catalog
2. Click "Add New MCP Server"
3. Enter: `sushantjainn/google-maps-mcp:latest`
4. Set transport: `stdio`
5. **Done!** Server is registered

### Step 3: Create Agent & Install Tools

1. Create agent: "Google Maps Personal Assistant"
2. Connect to `maps-mcp-server`
3. Install all 8 tools (auto-discovered)
4. Configure system prompt (see `SYSTEM_PROMPT_FINAL.md`)

### Step 4: Start Using

Ask: **"show me my saved places"**

That's it! One click deployment, infinite possibilities.

---

## 📊 System Design: The Complete Picture

### Architecture Layers

```
┌──────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│              (Archestra Chat Interface)                       │
└────────────────────────────┬─────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Agent Orchestration Layer                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Master Agent (Query Router)                  │   │
│  │  • Understands user intent                           │   │
│  │  • Routes to appropriate sub-agents                  │   │
│  │  • Aggregates responses                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Search Agent │  │Analytics Agent│ │Recommend Agent│      │
│  │              │  │              │ │              │      │
│  │ Specialized │  │ Specialized  │ │ Specialized  │      │
│  │ for search  │  │ for analysis │ │ for recommendations│  │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             │ MCP Protocol
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    MCP Server Layer                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Google Maps MCP Server                       │   │
│  │  • Tool Registration                                │   │
│  │  • Request Handling                                 │   │
│  │  • Response Formatting                              │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────┼───────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  8 MCP Tools │ │  Data Layer  │ │  AI Services │
│              │ │              │ │              │
│ Specialized  │ │ • Mock Data  │ │ • Embeddings │
│ functions   │ │ • Neo4j      │ │ • Analysis   │
│ for each     │ │ • Qdrant     │ │ • Sentiment  │
│ use case     │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Query Processing Flow

```
User: "Show me romantic restaurants near beaches I loved"
    │
    ▼
┌─────────────────────────────────────┐
│   Master Agent                      │
│   • Parses: romantic + restaurants  │
│   • Parses: near beaches            │
│   • Parses: I loved (sentiment)     │
└───────────┬─────────────────────────┘
            │
    ┌───────┼───────┐
    ▼       ▼       ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Search │ │Analytics│ │Recommend│
│ Agent  │ │ Agent  │ │ Agent  │
└───┬────┘ └───┬────┘ └───┬────┘
    │          │          │
    │ Calls:   │ Calls:   │ Calls:
    │ get_saved│ get_places│ get_recom
    │ _places  │ _by_sentiment│ mendations
    │ (beaches)│ (positive) │ (romantic)
    │          │          │
    └──────────┼──────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Result Aggregation  │
    │  • Combines beaches  │
    │  • Filters by love   │
    │  • Gets romantic     │
    │    restaurants       │
    └──────────┬───────────┘
               │
               ▼
    Intelligent Answer to User
```

---

## 🎯 Key Innovations

### 1. Multi-Agent Orchestration
Unlike traditional single-agent systems, we use a **chain of specialized agents** that work together:
- **Master Agent**: Routes and coordinates
- **Search Agent**: Handles discovery queries
- **Analytics Agent**: Performs deep analysis
- **Recommendation Agent**: Provides intelligent suggestions

### 2. Intelligent Tool Chaining
Multiple tools work together seamlessly:
- One query can trigger multiple tools
- Results from one tool feed into another
- Context is preserved across tool calls

### 3. Anti-Hallucination System
- System prompt forces tool usage
- Agent never invents data
- Always calls tools before responding
- Honest about empty results

### 4. Mood-Based Intelligence
- Understands user context and mood
- Provides contextual recommendations
- Learns from user preferences
- Adapts to different scenarios

---

## 🎬 Demo Examples

### Simple Query
```
User: "show me my saved places"
→ Master Agent → Search Agent
→ Tool: get_saved_places
→ Returns: Sydney Opera House, Bondi Beach
```

### Complex Query
```
User: "show me romantic restaurants near beaches I loved"
→ Master Agent → Routes to 3 sub-agents:
  ├─ Search Agent: get_saved_places (beaches)
  ├─ Analytics Agent: get_places_by_sentiment (loved = positive)
  └─ Recommendation Agent: get_recommendations (romantic)
→ Results aggregated → Intelligent answer
```

---

## 📦 Project Structure

```
archestra-mcp-googlemaps/
├── src/
│   ├── server.ts              # MCP server implementation
│   ├── google-maps-client.ts   # Data layer & API integration
│   ├── preference-analyzer.ts  # AI-powered analysis
│   ├── recommendation-engine.ts # Intelligent recommendations
│   └── ...
├── scripts/
│   └── import-takeout.ts       # Real data import
├── Dockerfile                  # Containerization
└── README.md                   # This file
```

---

## 🔧 Development

```bash
# Install
npm install

# Build
npm run build

# Test
npm test

# Import real data
npm run import:takeout "path/to/Saved Places.json"
```

---

## 📝 Documentation

- **System Prompts**: `SYSTEM_PROMPT_FINAL.md` - Agent configuration
- **API Setup**: `API_SETUP_GUIDE.md` - Google Maps API
- **Real Data**: `REAL_DATA_SETUP.md` - Import your places
- **Troubleshooting**: `TROUBLESHOOTING.md` - Common issues

---

## 🌟 Why This Wins

1. **Revolutionary Approach**: First to use multi-agent orchestration with MCP
2. **Production Ready**: Dockerized, tested, scalable
3. **Intelligent**: AI-powered analysis and recommendations
4. **User-Centric**: Understands context and mood
5. **Extensible**: Easy to add new tools and agents
6. **Well-Designed**: Clean architecture, proper separation of concerns

---

## 📄 License

MIT

---

**Built with ❤️ for the Archestra ecosystem**

*One click. Infinite possibilities. Your entire Google Maps universe, intelligently accessible through revolutionary agent orchestration.*
