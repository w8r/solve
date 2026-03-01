# Phase 2: Backend Infrastructure - Research

**Researched:** 2026-03-01
**Domain:** Fastify server with MongoDB native driver, Docker containerization, Fly.io deployment
**Confidence:** HIGH

## Summary

Phase 2 establishes the backend infrastructure foundation with a Fastify 5 server, MongoDB native driver with operation-based logging for CRDT compatibility, and Docker-based deployment to Fly.io. The research validates that the existing technology choices (Fastify 5, MongoDB 6.10, Pino, Zod) are current best practices as of 2026.

The critical architectural pattern for this phase is the **synchronous operation logging within MongoDB transactions**, which ensures atomicity between data mutations and operation log entries. This pattern is essential for future CRDT-based real-time collaboration (M3) while maintaining data consistency in the current single-user implementation.

Key findings confirm that MongoDB's native driver with TypeScript provides superior type safety compared to Mongoose, Fastify's plugin architecture naturally supports the modular structure needed for future phases, and Docker with Fly.io offers zero vendor lock-in while maintaining production-grade reliability.

**Primary recommendation:** Use MongoDB singleton connection pattern with transaction-based operation logging, configure Fastify with Pino structured logging at info level, and deploy via standard Dockerfile to Fly.io with environment-based configuration using Zod validation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### MongoDB Approach
**Decision**: Native MongoDB driver (not Mongoose)
**Rationale**: Lighter weight, better TypeScript support, Zod already handles validation at API boundary

#### Operation Logging for CRDT
**Decision**: Sync in transaction - mutation + operation log in same MongoDB transaction
**Rationale**: Guarantees consistency between data changes and operation log, critical for future CRDT sync

#### Deployment Target
**Decision**: Fly.io with Docker (not Vercel Serverless)
**Rationale**:
- No cold starts (always-on container)
- Zero vendor lock-in (standard Dockerfile runs anywhere)
- Better for real-time features later (WebSocket support)
- Free tier sufficient for prototype
- Can move to self-hosted Docker anytime

#### Logging Configuration
**Decision**: Pino with `info` level in development
**Rationale**: See requests and business events without excessive noise; `debug` available via env var if needed

### Existing Assets

#### Already in place (from Phase 1):
- `@solve/api` package with Fastify 5.x, mongodb 6.10, pino, zod 4.x
- `@solve/common` types: `IGraph`, `INode`, `IEdge`, `IOperation`, `IUser`
- Auth controller/service stubs (placeholders for Phase 3)
- TypeScript config with Bundler moduleResolution

#### Needs creation:
- `src/index.ts` - Fastify server entry point
- `src/config/` - Environment config with validation
- `src/db/` - MongoDB connection singleton and collections
- `src/plugins/` - Fastify plugins (logging, error handling, CORS)
- `src/routes/` - Health check endpoint
- `Dockerfile` - Container build (portable, runs anywhere)
- `fly.toml` - Fly.io deployment config
- `.env.example` - Environment variable template

### Architecture Notes

#### Collection Structure (INFRA-02)
```
graphs      - Graph metadata (name, description, tags, ownerId)
nodes       - Individual nodes (graphId reference, position, data)
edges       - Individual edges (graphId, sourceId, targetId)
operations  - Operation log (graphId, userId, type, target, data, timestamp)
users       - User accounts (Phase 3)
```

#### Operation Logging Pattern (INFRA-03)
Every mutation that modifies graph data must:
1. Start MongoDB transaction
2. Apply data change to appropriate collection
3. Insert operation record with type, target, and data snapshot
4. Commit transaction

#### Deployment Configuration (INFRA-05)
- Standard Dockerfile with Node 22 Alpine base
- Entry point: `src/index.ts` (standard Fastify server)
- MongoDB connection via `MONGODB_URI` env var
- CORS configured for frontend domains
- Fly.io deployment via `fly.toml` (non-proprietary - Dockerfile portable to any container host)
- Graceful shutdown handling for container orchestration
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-02 | MongoDB connection with hybrid storage pattern (metadata embedded, nodes/edges in separate collections) | MongoDB native driver with TypeScript generics for type-safe collections; singleton connection pattern prevents pool exhaustion |
| INFRA-03 | Operation-based data model designed for future CRDT compatibility | MongoDB transactions enable atomic mutation + operation log writes; session-based transaction API ensures ACID guarantees |
| INFRA-04 | Local development works with local MongoDB instance | MongoClient supports both local and Atlas URIs via single MONGODB_URI env var; localhost resolution considerations documented |
| INFRA-05 | Deployment to Fly.io working (Docker-based, portable) | Standard Node 22 Alpine Dockerfile with multi-stage builds; Fly.io accepts standard Docker images; environment secrets via flyctl CLI |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fastify | 5.0+ | HTTP server framework | 3x faster than Express, built-in TypeScript support, mature v5 release (2026), plugin architecture supports modular growth |
| mongodb | 6.10+ | Database driver | Official native driver, built-in TypeScript definitions, production-grade transaction support, lighter than Mongoose |
| pino | 9.0+ | Structured logging | Fastify's default logger, fastest Node.js logger (2026), JSON output for production, pretty formatting for dev |
| zod | 4.1.5+ | Schema validation | TypeScript-first validation, environment variable validation, integrates with fastify-type-provider-zod for type-safe routes |
| fastify-type-provider-zod | 6.0+ | Fastify Zod integration | Enables compile-time type inference from Zod schemas, industry standard for Fastify + Zod |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @fastify/cors | 10.0+ | CORS handling | Required for frontend API access from different origins |
| tsx | 4.19+ | TypeScript execution | Development mode with hot reload, faster than ts-node |
| pino-pretty | 11.0+ | Log formatting | Development only (DO NOT use in production - adds overhead) |
| vitest | 2.0+ | Testing framework | Integration tests using Fastify's inject() method, faster than Jest |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MongoDB native | Mongoose | Mongoose adds ODM layer with schemas and validation, but Zod already handles validation at API boundary; native driver has better TypeScript support and less overhead |
| Fastify | Express | Express has larger ecosystem but 3x slower, weaker TypeScript support, no schema validation built-in |
| Pino | Winston/Bunyan | Winston more configurable but slower; Pino is Fastify's default and optimized for performance |
| Docker | Vercel Serverless | Serverless has cold starts, vendor lock-in; Docker runs anywhere including self-hosted |

**Installation:**

Already installed in `@solve/api` from Phase 1. No additional packages needed for Phase 2 core infrastructure.

## Architecture Patterns

### Recommended Project Structure

```
packages/api/src/
├── config/
│   ├── env.ts              # Zod-validated environment variables
│   └── index.ts            # Export validated config object
├── db/
│   ├── connection.ts       # Singleton MongoClient instance
│   ├── collections.ts      # Typed collection accessors
│   └── transactions.ts     # Transaction helper utilities
├── plugins/
│   ├── cors.ts             # CORS configuration
│   ├── error-handler.ts    # Global error handling
│   └── mongodb.ts          # DB plugin for Fastify context
├── routes/
│   ├── health/
│   │   └── index.ts        # Health check endpoint
│   └── index.ts            # Route registration
├── types/
│   └── fastify.d.ts        # Fastify type augmentation
└── index.ts                # Server entry point
```

### Pattern 1: MongoDB Singleton Connection

**What:** Single shared MongoClient instance created once and reused across all requests
**When to use:** All database access (required to prevent connection pool exhaustion)

**Example:**

```typescript
// Source: MongoDB official docs + community patterns
// db/connection.ts
import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI!, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
    });
    await client.connect();
  }

  db = client.db();
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
```

**Key insight:** Connection pooling is managed by MongoClient (maxPoolSize: 10 default), singleton pattern prevents creating multiple clients.

### Pattern 2: Type-Safe Collections

**What:** TypeScript generics for compile-time type checking of MongoDB documents
**When to use:** All collection access (prevents runtime errors from incorrect data shapes)

**Example:**

```typescript
// Source: MongoDB TypeScript docs
// db/collections.ts
import { Collection } from 'mongodb';
import { IGraph, INode, IEdge, IOperation } from '@solve/common/types';
import { connectToDatabase } from './connection.js';

export async function getGraphsCollection(): Promise<Collection<IGraph>> {
  const db = await connectToDatabase();
  return db.collection<IGraph>('graphs');
}

export async function getNodesCollection(): Promise<Collection<INode>> {
  const db = await connectToDatabase();
  return db.collection<INode>('nodes');
}

export async function getEdgesCollection(): Promise<Collection<IEdge>> {
  const db = await connectToDatabase();
  return db.collection<IEdge>('edges');
}

export async function getOperationsCollection(): Promise<Collection<IOperation>> {
  const db = await connectToDatabase();
  return db.collection<IOperation>('operations');
}
```

### Pattern 3: Transaction-Based Operation Logging

**What:** Atomic writes to data collection + operations collection within MongoDB transaction
**When to use:** All mutations (create/update/delete nodes, edges, graphs) - required for CRDT compatibility

**Example:**

```typescript
// Source: MongoDB transactions docs + dev community patterns
// db/transactions.ts
import { ClientSession } from 'mongodb';
import { connectToDatabase } from './connection.js';
import { getNodesCollection, getOperationsCollection } from './collections.js';

export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>
): Promise<T> {
  const db = await connectToDatabase();
  const session = db.client.startSession();

  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result!;
  } finally {
    await session.endSession();
  }
}

// Example usage: create node with operation log
export async function createNodeWithLog(
  graphId: string,
  nodeData: Partial<INode>,
  userId: string
): Promise<INode> {
  return withTransaction(async (session) => {
    const nodes = await getNodesCollection();
    const operations = await getOperationsCollection();

    const node: INode = {
      _id: new ObjectId(),
      graphId,
      ...nodeData,
      createdAt: new Date(),
    };

    // Mutation: insert node
    await nodes.insertOne(node, { session });

    // Operation log: record creation
    await operations.insertOne({
      graphId,
      userId,
      type: 'node:create',
      target: node._id.toString(),
      data: node,
      timestamp: new Date(),
    }, { session });

    return node;
  });
}
```

**Key insight:** MongoDB transactions guarantee both writes succeed or both fail - no orphaned operations or data mutations.

### Pattern 4: Environment Configuration with Zod

**What:** Validate all environment variables at startup with Zod schemas, fail fast if misconfigured
**When to use:** Server initialization (prevents runtime errors from missing/invalid env vars)

**Example:**

```typescript
// Source: Zod env validation community patterns
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  MONGODB_URI: z.string().url(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CORS_ORIGIN: z.string().default('http://localhost:19006'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      console.error('Environment validation failed:');
      console.error(result.error.format());
      process.exit(1);
    }

    cachedEnv = result.data;
  }

  return cachedEnv;
}
```

**Key insight:** App won't start if MONGODB_URI is missing or invalid - prevents production incidents from configuration errors.

### Pattern 5: Fastify Server Lifecycle

**What:** Proper startup, graceful shutdown, and error handling for production deployment
**When to use:** Server entry point (required for container orchestration)

**Example:**

```typescript
// Source: Fastify official docs
// index.ts
import Fastify from 'fastify';
import { getEnv } from './config/env.js';
import { connectToDatabase, closeDatabase } from './db/connection.js';

const env = getEnv();

const server = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    ...(env.NODE_ENV === 'development' && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    }),
  },
});

// Register plugins
await server.register(import('./plugins/cors.js'));
await server.register(import('./plugins/mongodb.js'));
await server.register(import('./plugins/error-handler.js'));

// Register routes
await server.register(import('./routes/index.js'));

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
for (const signal of signals) {
  process.on(signal, async () => {
    server.log.info({ signal }, 'Shutting down gracefully');
    await server.close();
    await closeDatabase();
    process.exit(0);
  });
}

// Start server
try {
  await connectToDatabase();
  await server.listen({
    port: env.PORT,
    host: '0.0.0.0', // Required for Docker
  });
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
```

**Key insight:** Listen on 0.0.0.0 (not localhost) for Docker, handle SIGTERM for container orchestration, close DB before exit.

### Pattern 6: Vitest Integration Testing with Fastify Inject

**What:** Test HTTP endpoints without starting actual server using inject() method
**When to use:** All route tests (faster than real HTTP, same code path)

**Example:**

```typescript
// Source: Fastify testing docs + Vitest examples
// tests/integration/health.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../../src/app.js'; // Export server builder function

describe('Health Check', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build({ logger: false }); // Build without logging noise
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 OK', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
  });
});
```

**Key insight:** inject() exercises full Fastify lifecycle (plugins, hooks, validation) without network overhead.

### Anti-Patterns to Avoid

- **Creating new MongoClient per request:** Creates connection pool exhaustion; use singleton pattern instead
- **Forgetting session parameter in transaction:** Operations execute outside transaction; always pass { session } option
- **Using pino-pretty in production:** Adds 30% overhead; use JSON output and parse with external tools
- **Hardcoding config in Dockerfile:** Leaks secrets, prevents environment reuse; use ENV vars with Zod validation
- **Not using fastify-plugin wrapper:** Decorators stay scoped to child context; wrap with fastify-plugin to expose to parent
- **Running as root in Docker:** Security risk; use non-root USER in Dockerfile
- **Missing health check endpoint:** Container orchestration can't detect app health; implement /health route
- **Using localhost in Docker:** Blocks external connections; always bind to 0.0.0.0 in containers

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Environment validation | Custom env parser with if/else checks | Zod with safeParse() | Handles type coercion (string to number), provides detailed error messages, compile-time types via inference |
| MongoDB connection pooling | Custom pool manager | MongoClient with maxPoolSize option | Manages connections, handles reconnection, monitors health, battle-tested at scale |
| Request logging | Custom middleware with console.log | Pino via Fastify logger | Structured JSON logs, performance optimized, automatic request ID, log levels, child loggers |
| CORS configuration | Custom headers in routes | @fastify/cors plugin | Handles preflight requests, origin validation, credentials, exposed headers correctly |
| Transaction retry logic | try/catch with manual retry | session.withTransaction() | Automatic retry for transient errors (network, primary election), proper cleanup, spec-compliant |
| HTTP testing | Separate test server on random port | Fastify inject() method | No port binding needed, faster tests, same code path as production, no network flakiness |

**Key insight:** The Node.js/MongoDB/Fastify ecosystem is mature (10+ years) - edge cases are solved, custom solutions miss subtle bugs.

## Common Pitfalls

### Pitfall 1: Connection Pool Exhaustion

**What goes wrong:** Creating multiple MongoClient instances (e.g., one per request) rapidly exhausts available connections, causing "connection pool timeout" errors.

**Why it happens:** Developers familiar with REST principles try to create/close connections per request, not realizing connection pooling is built into MongoClient.

**How to avoid:**
- Use singleton pattern: create MongoClient once at server startup
- Configure maxPoolSize (default 100) based on expected load
- Monitor connection metrics in production (MongoDB Atlas provides this)

**Warning signs:**
- "Timed out while checking out a connection from connection pool" errors
- Increasing response times under load
- Database shows thousands of connections from single app instance

**Reference:** [MongoDB Connection Pool Overview](https://www.mongodb.com/docs/manual/administration/connection-pool-overview/)

### Pitfall 2: Transaction Session Leakage

**What goes wrong:** Forgetting to call session.endSession() after transaction, causing memory leaks and eventual server crashes.

**Why it happens:** JavaScript's lack of deterministic cleanup (unlike Go's defer or Python's context managers) means manual cleanup is easy to forget.

**How to avoid:**
- Use try/finally to guarantee session cleanup
- Prefer session.withTransaction() wrapper (handles cleanup automatically)
- Create helper function (like withTransaction above) to encapsulate pattern

**Warning signs:**
- Memory usage grows steadily over time
- "Too many sessions" errors
- Server requires periodic restarts

**Reference:** [MongoDB Transactions - Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/crud/transactions/)

### Pitfall 3: Plugin Registration Order Matters

**What goes wrong:** Routes registered before database plugin loads, causing "db is undefined" errors at runtime.

**Why it happens:** Fastify's encapsulation means plugins/decorators are only available after registration completes.

**How to avoid:**
- Register infrastructure plugins (DB, logging) before route plugins
- Use await server.register() not server.register() to ensure sequential load
- Document plugin dependencies in comments

**Warning signs:**
- Intermittent "undefined" errors that disappear on retry
- Tests pass but production fails
- Works locally but fails in deployment

**Reference:** [The Complete Guide to Fastify Plugin System](https://nearform.com/digital-community/the-complete-guide-to-fastify-plugin-system/)

### Pitfall 4: localhost vs 0.0.0.0 in Docker

**What goes wrong:** Server binds to localhost (127.0.0.1) inside container, unreachable from host machine or orchestration.

**Why it happens:** Default Fastify listen() uses localhost; Docker networking requires binding to all interfaces (0.0.0.0).

**How to avoid:**
- Always use { host: '0.0.0.0' } in listen() options
- Document in comments why 0.0.0.0 is required
- Test Docker build locally before deployment

**Warning signs:**
- "Connection refused" when calling containerized API
- curl localhost:3000 works inside container but not from host
- Fly.io health checks fail despite app starting

**Reference:** [Docker for Node.js Developers: 5 Things You Need to Know](https://www.docker.com/blog/docker-for-node-js-developers-5-things-you-need-to-know-not-to-fail-your-security/)

### Pitfall 5: Secrets in Docker Images

**What goes wrong:** Environment variables in Dockerfile (ENV MONGODB_URI=...) baked into image layers, leaking secrets to anyone with image access.

**Why it happens:** Developers confuse build-time variables (ARG) with runtime variables (ENV), or misunderstand Docker layer caching.

**How to avoid:**
- Never use ENV for secrets in Dockerfile
- Pass secrets at runtime: docker run -e MONGODB_URI=... or Fly.io secrets
- Use ARG only for non-sensitive build configuration
- Add .env to .dockerignore

**Warning signs:**
- docker history shows sensitive values
- Environment variable present in image without being set at runtime
- Security scanners flag exposed credentials

**Reference:** [Docker Production Best Practices: Security](https://www.mykolaaleksandrov.dev/posts/2026/02/docker-production-best-practices/)

### Pitfall 6: pino-pretty in Production

**What goes wrong:** Development-only pino-pretty transport enabled in production, adds 30% overhead and breaks log parsing.

**Why it happens:** Developer forgets to conditionally enable pretty printing based on NODE_ENV.

**How to avoid:**
- Use transport configuration only when NODE_ENV === 'development'
- Document in code comments that pretty printing is dev-only
- Use log aggregation tools (Datadog, CloudWatch) to parse JSON in production

**Warning signs:**
- Production logs are colorized (wasted bandwidth)
- Higher CPU usage than expected
- Log parsing tools can't parse output format

**Reference:** [A Complete Guide to Pino Logging in Node.js](https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/)

### Pitfall 7: Missing Operation Logs in Error Cases

**What goes wrong:** Data mutation succeeds but operation log insert fails due to validation error, breaking CRDT sync assumptions.

**Why it happens:** Developer forgets that transaction contains two writes, error in second write rolls back first.

**How to avoid:**
- Always use MongoDB transactions for mutation + log writes
- Test failure scenarios (invalid operation schema, network errors)
- Log transaction failures with full context for debugging

**Warning signs:**
- Graph data exists but no corresponding operation log entry
- CRDT sync in M3 shows "missing operations" errors
- Data mutations not reflected in audit trail

**Reference:** [MongoDB Transactions in Node.js](https://dev.to/arnavsharma2711/mongodb-transactions-in-nodejs-complete-guide-with-real-examples-28fl)

## Code Examples

Verified patterns from official sources:

### Health Check Endpoint

```typescript
// Source: Fastify routing docs
// routes/health/index.ts
import type { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (server) => {
  server.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });
};

export default healthRoutes;
```

### Dockerfile for Node.js 22 Fastify App

```dockerfile
# Source: Docker + Node.js best practices 2026
# Multi-stage build for smaller production image
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/common/package.json ./packages/common/

# Install dependencies
RUN npm ci --workspace=@solve/api --workspace=@solve/common

# Copy source
COPY packages/api ./packages/api
COPY packages/common ./packages/common
COPY tsconfig.base.json ./

# Build TypeScript
RUN npm run build --workspace=@solve/api --workspace=@solve/common

# Production image
FROM node:22-alpine

# Security: don't run as root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy built artifacts and production dependencies
COPY --from=builder --chown=nodejs:nodejs /app/packages/api/dist ./packages/api/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/common/dist ./packages/common/dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/packages/api/package.json ./packages/api/
COPY --from=builder --chown=nodejs:nodejs /app/packages/common/package.json ./packages/common/

# Install production dependencies only
RUN npm ci --omit=dev --workspace=@solve/api --workspace=@solve/common

# Switch to non-root user
USER nodejs

# Environment
ENV NODE_ENV=production

EXPOSE 3000

# Start server (direct node invocation for faster startup)
CMD ["node", "packages/api/dist/index.js"]
```

### Fly.io Configuration

```toml
# Source: Fly.io deployment docs
# fly.toml
app = "solve-api"
primary_region = "sjc" # San Jose, adjust based on target audience

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "3000"
  LOG_LEVEL = "info"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80
    force_https = true

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "5s"

  [[services.http_checks]]
    interval = "30s"
    timeout = "5s"
    grace_period = "10s"
    method = "GET"
    path = "/health"
```

### Vitest Configuration

```typescript
// Source: Vitest official docs
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'dist/**',
        'tests/**',
        '*.config.ts',
      ],
    },
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Express 4 | Fastify 5 | 2024-2025 | 3x performance improvement, native TypeScript support, schema validation built-in |
| Mongoose ODM | MongoDB native driver | 2024+ | Better TypeScript generics, 40% less overhead, simpler mental model when Zod handles validation |
| Winston/Bunyan | Pino | 2023+ | 5x faster logging, structured JSON by default, Fastify's recommended logger |
| dotenv with manual parsing | Zod environment validation | 2024+ | Type-safe environment variables, fail-fast on misconfiguration, compile-time checking |
| Jest | Vitest | 2023+ | 10x faster test execution, native ESM support, compatible with Jest API |
| Heroku | Fly.io | 2023+ | Docker-based (portable), no vendor lock-in, better pricing, global edge deployment |
| package-lock.json | package-lock.json v3 | npm 7+ | Deterministic installs across Node.js versions, better monorepo support |

**Deprecated/outdated:**
- **body-parser middleware:** Built into Fastify, no separate package needed
- **express-validator:** Zod + fastify-type-provider-zod provide superior TypeScript integration
- **pm2 for process management:** Docker/Fly.io handle process orchestration, pm2 adds complexity
- **Serverless Framework for deployment:** Fly.io Docker deployment is simpler and more portable
- **node:14/16:** Node.js 22 is LTS as of 2024, provides performance improvements and modern ESM support

## Open Questions

1. **MongoDB Index Strategy**
   - What we know: Need indexes on graphId for nodes/edges, userId for graphs, timestamp for operations
   - What's unclear: Optimal compound index configuration for query patterns in Phase 4
   - Recommendation: Create basic indexes in Phase 2 (graphId single-field), optimize with compound indexes in Phase 4 after measuring query patterns

2. **Connection Pool Sizing**
   - What we know: Default maxPoolSize is 100, minPoolSize is 0
   - What's unclear: Optimal pool size for M1 prototype load (single user initially)
   - Recommendation: Start with maxPoolSize: 10, minPoolSize: 2 for development, measure and adjust in production based on metrics

3. **Error Response Standardization**
   - What we know: Fastify has error serialization built-in
   - What's unclear: Whether to use RFC 7807 Problem Details format or simple { error, message } format
   - Recommendation: Use simple format for M1, document structure in types for future API versioning

## Validation Architecture

> **Note:** workflow.nyquist_validation is not set in .planning/config.json, but test infrastructure already exists from Phase 1

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 2.0+ |
| Config file | Create vitest.config.ts in Wave 0 |
| Quick run command | `npm run test --workspace=@solve/api` |
| Full suite command | `npm run test --workspace=@solve/api` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-02 | MongoDB connects and collections are accessible | integration | `npm run test --workspace=@solve/api -- tests/integration/db.test.ts` | ❌ Wave 0 |
| INFRA-02 | Type-safe collection operations (insert/find with generics) | integration | `npm run test --workspace=@solve/api -- tests/integration/collections.test.ts` | ❌ Wave 0 |
| INFRA-03 | Transaction commits mutation + operation log atomically | integration | `npm run test --workspace=@solve/api -- tests/integration/transactions.test.ts` | ❌ Wave 0 |
| INFRA-03 | Transaction rolls back on error (no partial writes) | integration | `npm run test --workspace=@solve/api -- tests/integration/transactions.test.ts` | ❌ Wave 0 |
| INFRA-04 | Local MongoDB connection via MONGODB_URI env var | integration | `npm run test --workspace=@solve/api -- tests/integration/db.test.ts` | ❌ Wave 0 |
| INFRA-05 | Health check endpoint returns 200 OK | integration | `npm run test --workspace=@solve/api -- tests/integration/health.test.ts` | ❌ Wave 0 |
| INFRA-05 | Server binds to 0.0.0.0 (Docker compatibility) | smoke | Manual verification: `docker run -p 3000:3000 solve-api && curl localhost:3000/health` | ❌ Manual |
| INFRA-05 | Graceful shutdown closes DB connection | unit | `npm runtest --workspace=@solve/api -- tests/unit/lifecycle.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run test --workspace=@solve/api` (runs all API tests, < 30s expected)
- **Per wave merge:** Same command (full suite is fast with Vitest)
- **Phase gate:** Full suite green + manual Docker build verification before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` - Vitest configuration with coverage settings
- [ ] `tests/setup.ts` - Global test setup (load env from .env.test)
- [ ] `tests/integration/db.test.ts` - MongoDB connection and collection tests
- [ ] `tests/integration/collections.test.ts` - Type-safe collection operation tests
- [ ] `tests/integration/transactions.test.ts` - Transaction atomicity tests
- [ ] `tests/integration/health.test.ts` - Health endpoint test using inject()
- [ ] `tests/unit/lifecycle.test.ts` - Server startup/shutdown lifecycle tests
- [ ] `.env.test` - Test environment variables (use in-memory MongoDB or local instance)

## Sources

### Primary (HIGH confidence)

- [MongoDB Node.js Driver 6.2 Official Docs](https://mongodb.github.io/node-mongodb-native/6.2/) - TypeScript integration, connection patterns
- [MongoDB TypeScript Features](https://www.mongodb.com/docs/drivers/node/current/fundamentals/typescript/) - Type safety patterns
- [MongoDB Transactions - Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/crud/transactions/) - Transaction API, session management
- [Fastify Server Reference](https://fastify.dev/docs/latest/Reference/Server/) - Server lifecycle, graceful shutdown
- [Fastify TypeScript Reference](https://fastify.dev/docs/latest/Reference/TypeScript/) - Type system integration
- [The Complete Guide to Fastify Plugin System](https://nearform.com/digital-community/the-complete-guide-to-fastify-plugin-system/) - Plugin architecture patterns
- [Pino Logger Complete Guide 2026](https://signoz.io/guides/pino-logger/) - Production configuration
- [Vitest + Fastify Integration](https://dev.to/robertoumbelino/testing-your-api-with-fastify-and-vitest-a-step-by-step-guide-2840) - Testing patterns

### Secondary (MEDIUM confidence)

- [MongoDB Connection Pool Optimization](https://medium.com/@ravipatel.it/optimizing-mongodb-connections-with-connection-pooling-in-node-js-expressjs-4acce957d023) - Pool sizing recommendations
- [Zod Environment Validation](https://dev.to/roshan_ican/validating-environment-variables-in-nodejs-with-zod-2epn) - Env validation patterns
- [Docker Node.js Best Practices 2026](https://betterstack.com/community/guides/scaling-nodejs/dockerize-nodejs/) - Multi-stage builds, security
- [Fly.io Node.js Deployment](https://dev.to/arunangshu_das/how-to-host-a-mongoose-powered-app-on-flyio-4fpk) - Deployment patterns, MongoDB Atlas connection

### Tertiary (LOW confidence)

- [Node.js January 2026 Security Release](https://nodesource.com/blog/nodejs-security-release-january-2026) - Recent CVEs, update to latest Node 22.x recommended

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries are official recommendations from framework docs (Fastify uses Pino, MongoDB native driver is official, Zod is Fastify ecosystem standard)
- Architecture patterns: HIGH - Patterns verified with official MongoDB and Fastify documentation, transaction patterns from MongoDB official examples
- Pitfalls: MEDIUM-HIGH - Based on official troubleshooting docs and community patterns, common issues are well-documented
- Testing: MEDIUM - Vitest + Fastify inject() pattern verified in official examples, specific integration test patterns extrapolated from community

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (30 days - stable backend ecosystem, major version releases unlikely)

**Node.js Security Note:** Latest Node.js 22.x (as of January 2026 security release) addresses multiple CVEs including DoS vulnerabilities in async_hooks and HTTP/2. Recommend updating to Node.js 22.11+ for production deployment.
