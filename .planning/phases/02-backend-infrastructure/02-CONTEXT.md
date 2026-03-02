# Phase 2 Context: Backend Infrastructure

## Decisions Captured

### MongoDB Approach
**Decision**: Native MongoDB driver (not Mongoose)
**Rationale**: Lighter weight, better TypeScript support, Zod already handles validation at API boundary

### Operation Logging for CRDT
**Decision**: Sync in transaction - mutation + operation log in same MongoDB transaction
**Rationale**: Guarantees consistency between data changes and operation log, critical for future CRDT sync

### Deployment Target
**Decision**: Fly.io with Docker (not Vercel Serverless)
**Rationale**:
- No cold starts (always-on container)
- Zero vendor lock-in (standard Dockerfile runs anywhere)
- Better for real-time features later (WebSocket support)
- Free tier sufficient for prototype
- Can move to self-hosted Docker anytime

### Logging Configuration
**Decision**: Pino with `info` level in development
**Rationale**: See requests and business events without excessive noise; `debug` available via env var if needed

## Existing Assets

### Already in place (from Phase 1):
- `@solve/api` package with Fastify 5.x, mongodb 6.10, pino, zod 4.x
- `@solve/common` types: `IGraph`, `INode`, `IEdge`, `IOperation`, `IUser`
- Auth controller/service stubs (placeholders for Phase 3)
- TypeScript config with Bundler moduleResolution

### Needs creation:
- `src/index.ts` - Fastify server entry point
- `src/config/` - Environment config with validation
- `src/db/` - MongoDB connection singleton and collections
- `src/plugins/` - Fastify plugins (logging, error handling, CORS)
- `src/routes/` - Health check endpoint
- `Dockerfile` - Container build (portable, runs anywhere)
- `fly.toml` - Fly.io deployment config
- `.env.example` - Environment variable template

## Architecture Notes

### Collection Structure (INFRA-02)
```
graphs      - Graph metadata (name, description, tags, ownerId)
nodes       - Individual nodes (graphId reference, position, data)
edges       - Individual edges (graphId, sourceId, targetId)
operations  - Operation log (graphId, userId, type, target, data, timestamp)
users       - User accounts (Phase 3)
```

### Operation Logging Pattern (INFRA-03)
Every mutation that modifies graph data must:
1. Start MongoDB transaction
2. Apply data change to appropriate collection
3. Insert operation record with type, target, and data snapshot
4. Commit transaction

### Deployment Configuration (INFRA-05)
- Standard Dockerfile with Node 22 Alpine base
- Entry point: `src/index.ts` (standard Fastify server)
- MongoDB connection via `MONGODB_URI` env var
- CORS configured for frontend domains
- Fly.io deployment via `fly.toml` (non-proprietary - Dockerfile portable to any container host)
- Graceful shutdown handling for container orchestration

---
_Context captured: 2026-03-01_
_Ready for planning_
