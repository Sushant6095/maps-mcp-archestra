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

## 🏗️ System Architecture

### High-Level Overview

```mermaid
graph TB
    User[👤 User Query] --> Archestra[🏛️ Archestra Platform]
    Archestra --> Agent[🤖 Master Agent]
    Agent --> SubAgent1[🔍 Search Agent]
    Agent --> SubAgent2[📊 Analytics Agent]
    Agent --> SubAgent3[💡 Recommendation Agent]
    
    SubAgent1 --> MCP[MCP Server]
    SubAgent2 --> MCP
    SubAgent3 --> MCP
    
    MCP --> Tools[🛠️ 8 Specialized Tools]
    Tools --> GoogleMaps[🗺️ Google Maps API]
    Tools --> Neo4j[(📈 Neo4j Graph DB)]
    Tools --> Qdrant[(🔮 Qdrant Vector DB)]
    Tools --> OpenAI[🧠 OpenAI Embeddings]
    
    style User fill:#e1f5ff
    style Archestra fill:#4a90e2
    style Agent fill:#7b68ee
    style MCP fill:#50c878
    style Tools fill:#ff6b6b
```

### Complete Deployment Flow

```mermaid
sequenceDiagram
    participant Dev as 👨‍💻 Developer
    participant Docker as 🐳 Docker Registry
    participant Catalog as 📚 Archestra Catalog
    participant Platform as 🏛️ Archestra Platform
    participant Agent as 🤖 AI Agent
    participant MCP as 🗺️ MCP Server
    participant Google as 🌐 Google Maps

    Dev->>Docker: 1. Build & Push Image
    Note over Docker: google-maps-mcp:latest
    
    Dev->>Catalog: 2. Register MCP Server
    Note over Catalog: Add to Catalog Registry
    
    Catalog->>Platform: 3. Server Available
    Note over Platform: Server Installed
    
    Platform->>Agent: 4. Create Agent
    Note over Agent: Configure Tools
    
    Agent->>MCP: 5. Install Tools
    Note over MCP: 8 Tools Registered
    
    User->>Agent: 6. Ask Question
    Agent->>MCP: 7. Call Tool
    MCP->>Google: 8. Fetch Data
    Google->>MCP: 9. Return Data
    MCP->>Agent: 10. Processed Result
    Agent->>User: 11. Intelligent Answer
```

### Agent Chain Architecture

```mermaid
graph LR
    Query[User Query:<br/>"Romantic beach<br/>restaurants I loved"] --> Router{Query Router}
    
    Router -->|Search| SearchAgent[🔍 Search Agent]
    Router -->|Analyze| AnalyticsAgent[📊 Analytics Agent]
    Router -->|Recommend| RecAgent[💡 Recommendation Agent]
    
    SearchAgent --> Tool1[get_saved_places]
    SearchAgent --> Tool2[search_saved_places]
    
    AnalyticsAgent --> Tool3[analyze_preferences]
    AnalyticsAgent --> Tool4[get_insights]
    AnalyticsAgent --> Tool5[get_places_by_sentiment]
    
    RecAgent --> Tool6[get_recommendations]
    RecAgent --> Tool7[get_place_details]
    RecAgent --> Tool8[get_place_activity]
    
    Tool1 --> MCP[MCP Server]
    Tool2 --> MCP
    Tool3 --> MCP
    Tool4 --> MCP
    Tool5 --> MCP
    Tool6 --> MCP
    Tool7 --> MCP
    Tool8 --> MCP
    
    MCP --> Aggregator[Result Aggregator]
    Aggregator --> Response[Intelligent Response]
    
    style Query fill:#e1f5ff
    style Router fill:#4a90e2
    style SearchAgent fill:#7b68ee
    style AnalyticsAgent fill:#7b68ee
    style RecAgent fill:#7b68ee
    style MCP fill:#50c878
    style Response fill:#ff6b6b
```

### Tool Execution Flow

```mermaid
flowchart TD
    Start[Tool Call Request] --> Validate{Validate Input}
    Validate -->|Invalid| Error[Return Error]
    Validate -->|Valid| Process[Process Request]
    
    Process --> CheckDB{Database<br/>Available?}
    
    CheckDB -->|Neo4j| Neo4jQuery[Query Neo4j<br/>for Relationships]
    CheckDB -->|Qdrant| VectorSearch[Vector Similarity<br/>Search]
    CheckDB -->|None| DirectQuery[Direct Google<br/>Maps Query]
    
    Neo4jQuery --> Enrich[Enrich with<br/>Graph Data]
    VectorSearch --> Enrich
    DirectQuery --> Enrich
    
    Enrich --> Analyze[AI Analysis:<br/>- Sentiment<br/>- Preferences<br/>- Patterns]
    
    Analyze --> Format[Format Response]
    Format --> Return[Return to Agent]
    
    style Start fill:#e1f5ff
    style Process fill:#4a90e2
    style Analyze fill:#7b68ee
    style Return fill:#50c878
```

---

## 📦 Installation & Setup

### Step 1: Build the MCP Server

```bash
# Clone the repository
git clone https://github.com/Sushant6095/maps-mcp-archestra.git
cd maps-mcp-archestra

# Build Docker image
docker build -t your-registry/google-maps-mcp:latest .

# Push to registry
docker push your-registry/google-maps-mcp:latest
```

### Step 2: Register in Archestra Catalog

```mermaid
graph LR
    A[Open Archestra] --> B[Navigate to Catalog]
    B --> C[Add MCP Server]
    C --> D[Enter Docker Image]
    D --> E[Configure Environment]
    E --> F[Set Transport: stdio]
    F --> G[✅ Server Registered]
    
    style G fill:#50c878
```

**In Archestra UI:**
1. Navigate to `http://127.0.0.1:3000/mcp-catalog/registry`
2. Click "Add New MCP Server"
3. Provide Docker image: `your-registry/google-maps-mcp:latest`
4. Configure environment variables (see below)
5. Set transport type to `stdio`

### Step 3: Install Tools in Your Agent

```mermaid
graph TB
    A[Create Agent] --> B[Select MCP Server]
    B --> C[Install Tools]
    C --> D[8 Tools Available]
    D --> E[Configure Agent Logic]
    E --> F[✅ Agent Ready]
    
    style F fill:#50c878
```

### Step 4: Create Agent Chain

```mermaid
graph TB
    Master[Master Agent] --> Router[Query Router]
    Router --> Search[Search Sub-Agent]
    Router --> Analytics[Analytics Sub-Agent]
    Router --> Recommend[Recommendation Sub-Agent]
    
    Search --> SearchTools[Tools 1-2]
    Analytics --> AnalyticsTools[Tools 3-5]
    Recommend --> RecTools[Tools 6-8]
    
    SearchTools --> MCP[MCP Server]
    AnalyticsTools --> MCP
    RecTools --> MCP
    
    style Master fill:#7b68ee
    style MCP fill:#50c878
```

---

## 🛠️ The 8 Powerful Tools

### Tool Categories

```mermaid
mindmap
  root((Google Maps<br/>MCP Tools))
    Search
      get_saved_places
      search_saved_places
    Details
      get_place_details
      get_place_activity
    Intelligence
      get_recommendations
      analyze_preferences
      get_insights
    Filtering
      get_places_by_sentiment
```

### 1. `get_saved_places` - Foundation Tool
Retrieve saved places with intelligent filtering.

**Use Case**: "Show me all my saved restaurants in San Francisco"

### 2. `search_saved_places` - Fuzzy Search
Search across names, addresses, tags, and notes.

**Use Case**: "Find that Italian place I saved last year"

### 3. `get_place_details` - Deep Dive
Comprehensive place information with activity history.

**Use Case**: "Tell me everything about that beach I visited"

### 4. `get_place_activity` - History Analysis
Visit history, reviews, photos, and insights.

**Use Case**: "When did I last visit this place and what did I think?"

### 5. `get_recommendations` - Mood-Based AI
Intelligent recommendations based on mood and context.

**Use Case**: "I'm feeling adventurous, what should I explore?"

### 6. `analyze_preferences` - Pattern Discovery
Deep analysis of preferences, patterns, and trends.

**Use Case**: "What are my travel patterns and preferences?"

### 7. `get_places_by_sentiment` - Emotional Filter
Filter places by sentiment (positive, negative, neutral).

**Use Case**: "Show me only places I loved"

### 8. `get_insights` - Comprehensive Intelligence
Complete insights including trends, favorites, and discoveries.

**Use Case**: "Give me a complete overview of my places"

---

## 🔄 Agent Chain Example

### Query: "Show me romantic restaurants near beaches I've visited, but only ones I rated 4+ stars"

```mermaid
sequenceDiagram
    participant User
    participant Master as Master Agent
    participant Search as Search Agent
    participant Analytics as Analytics Agent
    participant Rec as Recommendation Agent
    participant MCP as MCP Server

    User->>Master: Complex Query
    Master->>Master: Parse Intent
    
    Master->>Search: Find beaches I visited
    Search->>MCP: get_saved_places(category: "Beach")
    MCP-->>Search: Beach locations
    
    Master->>Analytics: Get my preferences
    Analytics->>MCP: analyze_preferences()
    MCP-->>Analytics: Preference patterns
    
    Master->>Search: Find restaurants near beaches
    Search->>MCP: search_saved_places(query: "restaurant", location: beach_coords)
    MCP-->>Search: Restaurant list
    
    Master->>Analytics: Filter by rating
    Analytics->>MCP: get_places_by_sentiment(sentiment: "positive", minRating: 4)
    MCP-->>Analytics: High-rated places
    
    Master->>Rec: Get romantic recommendations
    Rec->>MCP: get_recommendations(mood: "romantic", category: "Restaurant")
    MCP-->>Rec: Romantic suggestions
    
    Master->>Master: Aggregate & Rank Results
    Master-->>User: Intelligent Answer
```

---

## ⚙️ Environment Variables

```bash
# Required
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
GOOGLE_TOKEN_PATH=./token.json

# Optional but Recommended
GOOGLE_MAPS_API_KEY=your_api_key

# Optional: Enhanced Features
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_key
OPENAI_API_KEY=your_openai_key
```

---

## 🎯 Use Cases & Examples

### Use Case 1: Travel Planning Agent

```mermaid
graph TB
    User[User: Plan my trip] --> Agent[Travel Planning Agent]
    Agent --> Sub1[Location Agent]
    Agent --> Sub2[Preference Agent]
    Agent --> Sub3[Recommendation Agent]
    
    Sub1 --> T1[get_saved_places]
    Sub2 --> T2[analyze_preferences]
    Sub3 --> T3[get_recommendations]
    
    T1 --> MCP
    T2 --> MCP
    T3 --> MCP
    
    MCP --> Result[Complete Travel Plan]
    
    style Result fill:#50c878
```

### Use Case 2: Personal Assistant Agent

```mermaid
graph TB
    User[User: Where should I go?] --> Assistant[Personal Assistant Agent]
    Assistant --> Context[Context Analyzer]
    Context --> Mood[Mood Detector]
    Mood --> Rec[Recommendation Engine]
    Rec --> Filter[Smart Filter]
    Filter --> T1[get_recommendations]
    Filter --> T2[get_insights]
    T1 --> MCP
    T2 --> MCP
    MCP --> Answer[Personalized Answer]
    
    style Answer fill:#50c878
```

---

## 🚨 Important Notes

### ⚠️ Current Status: Using Mock Data

**Important:** This server currently uses **mock/hardcoded data** for demonstration.

### ⚠️ Critical: Google Maps API Key Limitations

**Just providing a Google Maps API key is NOT enough to get your saved places.**

- ❌ Google doesn't have a "Saved Places" API
- ✅ API key can search places and get details (public data)
- ✅ To get YOUR saved places: Use Google Takeout export + Places API

**Recommended approach:** Google Takeout export + Places API integration.

---

## 📊 Data Flow Architecture

```mermaid
graph TB
    subgraph "Archestra Platform"
        Agent[AI Agent]
        Catalog[MCP Catalog]
    end
    
    subgraph "MCP Server"
        Handler[Request Handler]
        Tools[8 Tools]
        Client[Google Maps Client]
    end
    
    subgraph "Data Sources"
        Google[Google Maps API]
        Neo4j[(Neo4j Graph)]
        Qdrant[(Qdrant Vector)]
        OpenAI[OpenAI Embeddings]
    end
    
    subgraph "Processing"
        Analyzer[Preference Analyzer]
        Engine[Recommendation Engine]
        Embedding[Embedding Service]
    end
    
    Agent --> Catalog
    Catalog --> Handler
    Handler --> Tools
    Tools --> Client
    Client --> Google
    Client --> Neo4j
    Client --> Qdrant
    Client --> OpenAI
    
    Neo4j --> Analyzer
    Qdrant --> Embedding
    OpenAI --> Embedding
    Analyzer --> Engine
    Embedding --> Engine
    
    Engine --> Tools
    Tools --> Handler
    Handler --> Catalog
    Catalog --> Agent
    
    style Agent fill:#7b68ee
    style Tools fill:#ff6b6b
    style Engine fill:#50c878
```

---

## 🔧 Development

### Project Structure

```
.
├── src/
│   ├── server.ts              # Main MCP server
│   ├── types.ts               # TypeScript interfaces
│   ├── google-maps-client.ts  # Google Maps API client
│   ├── preference-analyzer.ts # Preference analysis logic
│   ├── recommendation-engine.ts # Recommendation engine
│   ├── embedding-service.ts   # Embedding service
│   ├── neo4j-client.ts        # Neo4j integration
│   └── qdrant-client.ts       # Qdrant integration
├── dist/                      # Compiled JavaScript
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

### Scripts

```bash
npm run build      # Compile TypeScript
npm run dev        # Watch mode
npm start          # Run server
npm test           # Test server
```

---

## 🎓 How It Works: The Complete Picture

```mermaid
graph TB
    subgraph "1. Setup Phase"
        A1[Build Docker Image] --> A2[Push to Registry]
        A2 --> A3[Register in Catalog]
    end
    
    subgraph "2. Installation Phase"
        B1[Install MCP Server] --> B2[Configure Environment]
        B2 --> B3[Tools Available]
    end
    
    subgraph "3. Agent Creation"
        C1[Create Master Agent] --> C2[Create Sub-Agents]
        C2 --> C3[Install Tools to Agents]
        C3 --> C4[Configure Agent Logic]
    end
    
    subgraph "4. Runtime Phase"
        D1[User Query] --> D2[Master Agent Routes]
        D2 --> D3[Sub-Agents Execute]
        D3 --> D4[Tools Called]
        D4 --> D5[Data Processed]
        D5 --> D6[Results Aggregated]
        D6 --> D7[Intelligent Response]
    end
    
    A3 --> B1
    B3 --> C1
    C4 --> D1
    
    style A1 fill:#e1f5ff
    style B3 fill:#4a90e2
    style C4 fill:#7b68ee
    style D7 fill:#50c878
```

---

## 🌟 Why Archestra + This MCP Server = Game Changer

1. **🔗 Seamless Integration**: One-click deployment, zero configuration complexity
2. **🤖 Agent Orchestration**: Build complex agent chains that work together
3. **📈 Scalability**: Handle thousands of queries with intelligent caching
4. **🧠 AI-Powered**: Not just data retrieval, but intelligent understanding
5. **🔄 Extensibility**: Easy to add new tools and capabilities
6. **📊 Analytics**: Built-in insights and pattern recognition
7. **🎯 Personalization**: Understands your preferences and adapts

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions welcome! This is a revolutionary approach to location intelligence, and we'd love your input.

---

**Built with ❤️ for the Archestra ecosystem**

*One click. Infinite possibilities. Your entire Google Maps universe, intelligently accessible.*
