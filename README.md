# AuraStore AI — High-Performance E-Commerce Engine with AI Vector Search

AuraStore AI is a premium, production-ready, full-stack e-commerce platform built with the MERN stack, Redis Cache-Aside, and MongoDB Atlas Vector Search. The platform delivers modern UI aesthetics, robust security controls, high performance caching, and conceptual semantic search.

---

## Key Platform Features

- **AI Semantic Vector Search**: Find products naturally by describing concepts (e.g., "warm winter clothing" or "latest smartphone with high battery life") using high-performance vector aggregation stages, with keyword fallback.
- **Cache-Aside Performance Architecture**: Up to 99% reduction in latency for product listings and detail pages utilizing Redis buffer caching.
- **Transactional Consistency**: Multi-document transactional order checkouts ensuring atomic stock reduction and inventory control.
- **Security Hardening**: Integrated Helmet headers, request rate-limiters, MongoDB injection sanitization, CORS protection, and encrypted JWT auth scopes.
- **Premium User Experience**: Responsive layout with smooth micro-animations, product filtering/sorting, checkout pages, and dark mode support.
- **Interactive Admin Dashboard**: Access platform analytics, cache performance hit rates, total revenue telemetry, and update user privileges.

---

## Technology Stack

- **Frontend**: React 19, Vite 8, TypeScript, Tailwind CSS, Lucide Icons, Axios, React Hot Toast
- **Backend**: Node.js, Express 5, TypeScript 7, Mongoose 9, MongoDB Atlas, Redis 6
- **Tooling**: Winston loggers, Zod validation middleware, Docker & Docker Compose

---

## Folder Structure

```
ecommerce-ai-engine/
├── client/                     # Frontend SPA (React 19 + Vite 8)
│   ├── public/                 # Favicons and static assets
│   └── src/
│       ├── api/                # Axios instance configuration
│       ├── components/         # Layout & reusable UI widgets
│       ├── context/            # Global state (Auth, Shopping Cart)
│       ├── hooks/              # Custom helper hooks (useDebounce)
│       ├── pages/              # Platform views (Shop, Checkout, Admin)
│       └── types/              # TypeScript typings
├── server/                     # Backend API (Express + TypeScript)
│   ├── src/
│   │   ├── config/             # DB and Redis setups
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Security, validation, logging, errors
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routes
│   │   └── utils/              # Embedding generators, logger, cache helper
│   └── dist/                   # Transpiled build files
├── docker-compose.yml          # Container configuration
└── README.md                   # Platform documentation
```

---

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- Redis Server (local or cloud instance)
- MongoDB (Atlas or local instance)

### Local Configuration
1. Clone the repository.
2. In the `server` directory, create a `.env` file based on `.env.example`:
   ```bash
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret_key
   REDIS_URI=redis://127.0.0.1:6379
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```
3. In the `client` directory, create a `.env` file based on `.env.example`:
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```

### Running Locally
```bash
# 1. Install & Seed database (In server directory)
cd server
npm install
npm run import-products # Imports Amazon product catalog with AI vector embeddings

# 2. Run Backend
npm run dev

# 3. Run Frontend (In client directory in new terminal)
cd client
npm install
npm run dev
```

---

## 📦 Amazon Product Dataset Import

- **Dataset Source**: Kaggle Amazon Products Dataset (1.4M+ catalog records across 248 categories)
- **CSV File Paths**:
  - Products: `server/data/amazon_products.csv`
  - Categories: `server/data/amazon_categories.csv`
- **Import Command**:
  ```bash
  cd server
  npm run import-products   # Streaming import, deduplication, & vector embedding calculation
  # OR
  npm run seed              # Alias for dataset import
  ```
- **Expected Output**:
  ```
  ====================================
  🚀 AMAZON PRODUCT CATALOG IMPORTING SCRIPT
  ====================================
  MongoDB Connected: 127.0.0.1
  ✅ Loaded 248 categories from amazon_categories.csv
  📦 Processing dataset stream & inserting in optimized batches...
     ➜ Imported 130,000 products...
  ✅ AMAZON PRODUCT CATALOG IMPORT COMPLETE
  📄 Summary report saved to: IMPORT_REPORT.md
  ```

---

## Deployment & Docker Configuration

To launch the complete infrastructure stack (Client, Server, MongoDB, Redis) locally using Docker Compose:

```bash
# Build and run containers
docker-compose up --build
```
The Client will be served at `http://localhost:80` and the Backend API at `http://localhost:5000`.

---

## AI Vector Search & Caching Implementations

### Redis Caching (Cache-Aside Strategy)
When a client requests products, AuraStore AI first queries Redis:
- **Cache Hit**: Data is returned instantly (typically < 5ms).
- **Cache Miss**: AuraStore AI queries MongoDB, writes the result to Redis with a Time-To-Live (TTL), and returns it to the client.
- **Cache Invalidation**: Mongoose hooks automatically invalidate related product caches on save, update, or delete.

### MongoDB Vector Search
Products are seeded with a 256-dimension vector embedding field generated by `server/src/utils/embeddings.ts`. When semantic search is used, AuraStore AI:
1. Generates an embedding for the search phrase.
2. Runs a MongoDB aggregation pipeline using the `$vectorSearch` operator (requires a search index named `vector_index`).
3. If an index is not configured, it gracefully falls back to text search + regex match.
