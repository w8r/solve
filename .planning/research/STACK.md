# Technology Stack

**Project:** Solve - Collaborative Visual Graph Editor
**Researched:** 2026-03-01
**Overall Confidence:** HIGH

## Recommended Stack

### Core Frontend Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React Native** | 0.83+ | Cross-platform mobile & web | Required by Expo SDK 55, supports New Architecture |
| **Expo SDK** | ^55.0.0 | Development framework & build tooling | Official React Native framework, handles iOS/Android/web builds, EAS integration for CI/CD |
| **TypeScript** | ^5.0.0 | Type safety | Strict mode required, shared types across packages |

**Rationale:** Expo SDK 55 (released Feb 2026) includes React Native 0.83 and React 19.2, runs entirely on the New Architecture (always enabled), and provides production-grade deployment via EAS. The /src folder structure (introduced in SDK 55) better separates app code from configuration.

**Confidence:** HIGH - Official Expo documentation, verified with npm registry

### Graphics & Animation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@shopify/react-native-skia** | ^1.12.0 | GPU-accelerated graph rendering | Direct GPU rendering via Skia C++ engine through JSI (no bridge), 60 FPS animations, pixel-perfect control. Production-ready for 2D graphics, used by Shopify in production |
| **react-native-reanimated** | ^3.17.0 | UI thread animations | Runs animations on UI thread via worklets, integrates directly with Skia (no createAnimatedComponent needed), supports declarative APIs. Version 4.x compatible but 3.x is stable |
| **react-native-gesture-handler** | ^2.25.0 | Touch & gesture detection | Official recommendation for Skia interactions, handles pan/zoom/pinch at native frame rates, no JS thread blocking during gestures |

**Rationale:** Skia communicates with C++ engine through JSI (JavaScript Interface) - synchronous, direct C++ function calls with no serialization, no async bridge, no JSON encoding. This architecture delivers 50% faster animations on iOS, 200% faster on Android vs traditional approaches. Reanimated v3+ allows direct usage of shared/derived values as Skia properties. Gesture Handler provides translationX/Y and velocity for decay animations with configurable boundaries.

**Performance Notes:**
- Animation time performance: 50% faster on iOS, ~200% faster on Android
- Time to first animation frame: ~200% improvement on both platforms
- Works best with React Native 0.79+ and React 19+ (SDK 55 exceeds this)

**Confidence:** HIGH - Official Shopify Skia documentation, verified versions, extensive production use

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Zustand** | ^5.0.0 | Global state management | 1KB minified, no provider needed, hook-based API, supports middleware/persistence/multi-store. Default choice for senior React Native developers in 2026 |

**Rationale:** Zustand provides minimal bundle size (~1KB gzipped), simple hook-based API (learnable in <15 minutes), and no provider component requirement. Components subscribe only to state they need. Supports advanced patterns like middleware and persistence without Redux complexity.

**Confidence:** HIGH - Multiple 2026 sources, npm verified

### Backend Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Fastify** | ^5.6.0 | HTTP server & routing | 3x performance vs Express, native TypeScript support, plugin architecture, built-in schema validation, structured logging with Pino |
| **@fastify/websocket** | ^11.2.0 | WebSocket connections | Official Fastify plugin, uses ws library, TypeScript types built-in, route-based approach integrates with Fastify routing |
| **fastify-socket.io** | ^5.1.0 | Real-time collaboration (alternative) | Socket.io integration for advanced features (broadcasting, namespaces, rooms), heavier but more opinionated than @fastify/websocket |

**Rationale:** Fastify chosen over Express for 3x better performance (critical for real-time graph operations), superior TypeScript support with type providers, JSON Schema validation with automatic serialization optimization, and plugin architecture for encapsulated features. Use @fastify/websocket for lightweight real-time or fastify-socket.io for advanced collaboration features (rooms, namespaces).

**Production Setup:** Transpile TypeScript to JavaScript (`tsc`), run with `node build/index.js` (not ts-node in production). Use `--watch` mode for development.

**Confidence:** HIGH - Official Fastify documentation, npm verified

### Validation & Type Providers

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Zod** | ^4.3.6 | Runtime validation & type inference | TypeScript-first schema validation, infers types from schemas (single source of truth), integrates with Fastify type providers |
| **fastify-type-provider-zod** | ^6.1.0 | Fastify-Zod integration | Enables type-safe routes with Zod schemas, automatic request/response validation, better than @fastify/type-provider-typebox for TS-first workflows |

**Rationale:** Zod provides single source of truth for both runtime validation and TypeScript types. Use `app.setValidatorCompiler(validatorCompiler)`, `app.setSerializerCompiler(serializerCompiler)`, then `app.withTypeProvider<ZodTypeProvider>()` for full type safety. Fastify recommends TypeBox, but Zod is more TypeScript-first (define types, infer schemas vs define schemas, infer types).

**Setup Pattern:**
```typescript
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
const typedApp = app.withTypeProvider<ZodTypeProvider>();
```

**Confidence:** HIGH - Official Fastify type provider docs, community best practices 2026

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@fastify/jwt** | ^10.0.0 | JWT signing & verification | Official Fastify plugin, uses fast-jwt internally, high performance, TypeScript types included |
| **@fastify/passport** | ^3.0.2 | OAuth strategies | Adapted Passport for Fastify, compatible with most Passport strategies, supports multiple strategies per route |

**Rationale:** @fastify/jwt provides fast, secure JWT operations with Fastify-native API. @fastify/passport enables Google OAuth with familiar Passport strategies. Can combine both: use Passport for OAuth flow, then issue JWT for session management.

**Decorator Conflicts:** If both plugins used, rename decorators to avoid conflicts (both may use same decorator name).

**Confidence:** MEDIUM - Official Fastify plugins, but limited 2026-specific sources

### Database & Storage

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **MongoDB Native Driver** | ^7.1.0 | Database operations | 2x faster than Mongoose, lower overhead, better for performance-critical graph queries. Use native driver for high-frequency operations |
| **MongoDB** | 6.0+ | Document database | Existing infrastructure (Atlas), supports both embedded and referenced documents, aggregation pipeline for graph queries |
| **Redis** | 7.0+ | Caching & job queue backend | Required for BullMQ, supports pub/sub for real-time features, fast key-value storage for sessions/cache |

**Rationale:** Native MongoDB driver chosen over Mongoose for 2x performance improvement. Mongoose adds abstraction layer overhead; for high-frequency, low-latency graph operations, native driver is essential. Many projects use both - Mongoose for feature-rich endpoints, native driver for performance-critical sections.

**Data Modeling Strategy:**
- **Embedded documents:** Faster reads, simpler queries, use when data accessed together (graphs <16MB)
- **Referenced documents:** Better for frequently changing data, large datasets, independent access patterns
- **Hybrid approach:** Start with embedding (MongoDB optimized for document-based access), add references as requirements become clear. Consider read/write ratio - embedding favors reads, referencing favors writes.

**MongoDB Document Size Limit:** 16 mebibytes - critical constraint for embedded graph approach

**Aggregation Pipeline Performance:**
- Filter early with $match (reduce documents flowing through pipeline)
- $sort uses indexes only when immediately after $match or first stage
- $sort after $group cannot use indexes (documents transformed)
- Enable `allowDiskUse: true` for large datasets (100MB+ per stage) - sacrifices latency for capacity
- Stage ordering matters more than developers realize - reorganizing can turn multi-second queries into sub-second

**Confidence:** HIGH - Official MongoDB docs, performance benchmarks, npm verified

### Background Jobs

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **BullMQ** | ^5.64.0 | Job queue & scheduling | Queues 250k+ jobs/second (with DragonflyDB), delayed jobs, cron scheduling, automatic retries with exponential backoff, job flows for parent-child hierarchies |
| **Redis** | 7.0+ | Queue backend | BullMQ requires Redis-compatible store (Redis, Valkey, DragonflyDB, AWS ElastiCache, Upstash) |

**Rationale:** BullMQ is production-grade (powers billions of jobs daily since 2011), handles auto-save revisions (every 5 minutes), periodic snapshots, future notifications/emails. Features: millisecond-precision delayed jobs, cron expressions, dead letter queue, horizontal scaling, real-time monitoring via Taskforce.sh. SOC 2 Type II and GDPR compliant. MIT license (no artificial limitations).

**Integration:** Use Fastify template (railwayapp-templates/fastify-bullmq) for reference. Bull-board provides Fastify adapter for monitoring dashboard.

**Confidence:** HIGH - Official BullMQ docs, production metrics, npm verified

### Logging

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Pino** | ^10.3.1 | Structured logging | Fastify's default logger, 5x faster than alternatives, JSON structured output, async (non-blocking), serializers for transforming sensitive data |

**Rationale:** Pino runs asynchronously (accumulates logs if destination busy, sends when available), outputs JSON (industry standard for structured logging), enables centralized logging ingestion for monitoring. Serializers transform properties before writing (e.g., redact sensitive fields). Fastify uses Pino by default with 'info' level.

**Best Practice:** Always log with context objects:
```typescript
logger.info({ userId, documentId }, 'Document created');
logger.error({ err, operation }, 'Operation failed');
```

**Confidence:** HIGH - Official Fastify documentation, Pino docs

### Real-time Collaboration (Future - Design Now)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Yjs** | ^13.6.0 | CRDT framework | Most mature CRDT library for collaborative editing, modular (integrates with editors, protocols, databases), no central source of truth required, better for distributed systems than OT |
| **y-mongodb-provider** | Latest | MongoDB persistence for Yjs | Persistent storage for Yjs updates, works with y-websocket provider |
| **y-op-sqlite** | Latest | React Native local persistence | Fastest SQLite library for React Native, enables offline-first CRDT sync |

**Rationale:** Yjs is the default CRDT library in 2026 for collaborative editing. Provides efficient real-time synchronization and conflict resolution with eventual consistency. Supports React via plugins (Lexical from Meta for rich text). For React Native, y-op-sqlite enables local persistence. For server, y-mongodb-provider stores updates in MongoDB.

**Architecture:** Design data model now for CRDT compatibility (operation-based updates, version vectors, no destructive overwrites). Build WebSocket infrastructure in M1, add Yjs CRDT logic in M3.

**Note:** WebSearch found React implementations but limited React Native-specific 2026 resources. Yjs itself is platform-agnostic (works with React Native).

**Confidence:** MEDIUM-HIGH - Official Yjs repo, community recommendations, but limited React Native 2026 sources

### Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vitest** | ^4.0.0 | Backend testing | Vite-powered testing framework, faster than Jest, compatible with Jest API, built-in TypeScript support |
| **Jest** | Latest | Frontend testing | React Native ecosystem standard, used with Expo, React Native Testing Library integration |

**Rationale:** Vitest for backend (faster, Vite-based, modern tooling), Jest for frontend (Expo standard, ecosystem compatibility). Vitest supports mocking using Jest idioms for easy migration.

**Fastify Testing Patterns:**
- **HTTP Injection:** Use `app.inject({ method, url })` to test routes without starting server (Fastify's light-my-way library)
- **Live Server:** Call `listen()` without params for auto port selection, access via `server.address().port`
- **Setup:** Wrap Fastify server in function (not script body) for test imports

**Coverage Target:** 80%+

**Confidence:** HIGH - Official Vitest/Fastify docs, npm verified

### Security & Environment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **expo-secure-store** | ^55.0.0 | Sensitive data storage | Uses Keychain (iOS) / Encrypted Shared Preferences (Android) for tokens, encryption keys, passwords |
| **expo-constants** | ^55.0.0 | Environment variables | Access .env variables in Expo apps, use with dotenv for development config |

**Rationale:** Never store sensitive tokens/keys in app code or AsyncStorage. Use expo-secure-store for runtime sensitive data (auth tokens, encryption keys). Use expo-constants + dotenv only for development, non-sensitive config. Follow 12 Factor App methodology - separate config from code. Add `.env*` to `.gitignore` immediately.

**Security Layers:**
- Development non-sensitive: dotenv + expo-constants
- Runtime sensitive: expo-secure-store (Keychain/Keystore)
- Banking/encryption secrets: Never store in app - retrieve at runtime, keep in memory only

**Confidence:** HIGH - Official Expo docs, security best practices 2026

### Deployment & CI/CD

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **EAS Build** | Latest | Cloud builds for iOS/Android | Official Expo build service, handles app signing credentials, cloud infrastructure (GCP for Android, macOS cloud for iOS), TestFlight & store submission automation |
| **EAS Submit** | Latest | App store submission | Automates binary uploads to Google/Apple, reduces manual errors |
| **EAS Update** | Latest | Over-the-air updates | Deploy updates without app store review when builds don't change |
| **Vercel** | Latest | Backend deployment | Fastify-compatible, serverless functions, edge network, matches existing infrastructure choice |
| **GitHub Actions** | Latest | CI/CD pipeline | Industry standard, integrates with EAS, free for public repos |

**Rationale:** EAS provides production-grade mobile deployment pipeline (Feb 2026 - mature, battle-tested). Handles cloud builds, credentials management, store submission, OTA updates. Three build profiles: development, preview, production. Automated workflow: detect if new builds needed → submit to stores; otherwise → send OTA update.

**Backend Deployment:** Vercel for Fastify API (constraint per PROJECT.md), supports serverless functions, edge deployment.

**Confidence:** HIGH - Official Expo EAS documentation, production-ready

## Installation

### Root Package.json (Workspace)
```bash
# Install workspace dependencies
npm install

# TypeScript (workspace-level)
npm install -D typescript@^5.0.0
```

### Frontend Package (@solve/client)
```bash
# Core Expo & React Native (SDK 55)
npm install expo@^55.0.0 react-native@0.83.0

# Graphics & Animation
npm install @shopify/react-native-skia@^1.12.0
npm install react-native-reanimated@^3.17.0
npm install react-native-gesture-handler@^2.25.0

# State Management
npm install zustand@^5.0.0

# Security & Config
npm install expo-secure-store@^55.0.0
npm install expo-constants@^55.0.0

# Testing
npm install -D jest@latest @testing-library/react-native@latest
```

### Backend Package (@solve/api)
```bash
# Core Fastify
npm install fastify@^5.6.0

# WebSocket & Real-time
npm install @fastify/websocket@^11.2.0
npm install fastify-socket.io@^5.1.0

# Validation & Types
npm install zod@^4.3.6
npm install fastify-type-provider-zod@^6.1.0

# Authentication
npm install @fastify/jwt@^10.0.0
npm install @fastify/passport@^3.0.2
npm install passport-google-oauth20@latest

# Database & Jobs
npm install mongodb@^7.1.0
npm install bullmq@^5.64.0
npm install redis@latest

# Logging
npm install pino@^10.3.1

# Real-time Collaboration (Future - M3)
npm install yjs@^13.6.0
npm install y-mongodb-provider@latest

# Testing
npm install -D vitest@^4.0.0

# TypeScript
npm install -D @types/node@latest
```

### Common Package (@solve/common)
```bash
# Shared types and algorithms
# No external dependencies - pure TypeScript
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Graphics | React Native Skia | Three.js | Three.js for 3D (overkill), Skia 2D GPU rendering is optimal for graph visualization. Skia has better React Native integration, smaller bundle, better performance |
| Backend Framework | Fastify | Express | Express slower (3x), weaker TypeScript support, no built-in validation. Fastify's plugin architecture better for modular features |
| Validation | Zod | TypeBox | TypeBox is Fastify's official recommendation but Zod is more TypeScript-first (define types → infer schemas). Better DX for TS projects |
| State Management | Zustand | Redux Toolkit | Redux too heavy (boilerplate, providers, actions, reducers). Zustand 1KB vs Redux ~20KB, simpler API, no providers |
| Database Driver | Native MongoDB | Mongoose | Mongoose 2x slower due to abstraction layer. For performance-critical graph queries, native driver essential. Can use both (Mongoose for CRUD, native for queries) |
| WebSocket | @fastify/websocket | fastify-socket.io | Use @fastify/websocket for lightweight real-time, fastify-socket.io for advanced features (rooms, namespaces). Socket.io heavier but powerful for complex collaboration |
| CRDT | Yjs | Automerge | Yjs more mature (11+ years), larger ecosystem, better docs, modular architecture. Automerge good but Yjs is industry standard |
| Mobile Testing | Jest | Vitest | Jest is React Native ecosystem standard, better Expo integration. Vitest for backend only |
| Backend Testing | Vitest | Jest | Vitest faster (Vite-based), modern tooling, native TypeScript support. Backend doesn't need Jest's React features |

## Anti-Patterns to Avoid

### Frontend
- **Don't use react-native-web for Skia** - Skia for web requires specific setup (Expo simplifies). Verify web compatibility early
- **Don't create animated components for Skia** - Reanimated 3+ passes shared values directly to Skia properties (no `createAnimatedComponent` or `useAnimatedProps` needed)
- **Don't run animations on JS thread** - Use Reanimated worklets + `useSharedValue`/`useDerivedValue` for UI thread animations
- **Don't use AsyncStorage for sensitive data** - Use expo-secure-store (Keychain/Keystore) for tokens, passwords, encryption keys
- **Don't commit .env files** - Add `.env*` to `.gitignore` immediately

### Backend
- **Don't use ts-node in production** - Transpile TypeScript to JavaScript (`tsc`), run with `node build/index.js`
- **Don't use Mongoose for performance-critical queries** - Native driver is 2x faster. Use Mongoose for CRUD, native for graph aggregations
- **Don't skip $match early in aggregation pipelines** - Filter documents as early as possible. Every document consumes CPU/memory
- **Don't use $sort after $group** - Cannot use indexes (documents transformed). Place $sort immediately after $match
- **Don't exceed 100MB per aggregation stage** - Enable `allowDiskUse: true` for large datasets, accept latency trade-off
- **Don't use --no-verify or skip hooks** - Defeats purpose of linting/validation
- **Don't log without context** - Always include structured context objects: `logger.info({ userId, operation }, 'Message')`

### Database Design
- **Don't embed everything** - Respect 16MB document limit. Use hybrid approach (embed small frequently-accessed data, reference large/changing data)
- **Don't reference everything** - Embedding is faster for data accessed together. Start embedded, add references when needed
- **Don't ignore read/write ratio** - Embedding favors reads, referencing favors writes

### Real-time Collaboration
- **Don't design for destructive overwrites** - CRDTs require operation-based updates, version vectors. Design data model in M1 for M3 CRDT compatibility
- **Don't skip offline-first design** - Use y-op-sqlite for React Native local persistence, sync when online

## Migration Notes (Brownfield Context)

### From Existing Codebase
- **Three.js → Skia:** Complete rewrite of rendering layer. Skia uses declarative JSX components vs imperative Three.js scene graph. Budget 2-3 weeks for migration
- **Express → Fastify:** Plugin architecture different from Express middleware. Use fastify-express-plugin for gradual migration if needed (not recommended - full rewrite cleaner)
- **Embedded documents:** Current model works for small graphs. Add referenced model for large graphs (>1000 nodes) or frequently changing subgraphs

### Data Model Evolution
1. **M1:** Keep embedded model for small graphs (<1000 nodes, <5MB), add indexes for common queries
2. **M2:** Introduce referenced model for large graphs, hybrid approach (embed frequently accessed, reference historical/large data)
3. **M3:** CRDT-compatible schema with operation logs, version vectors, tombstones for deletions

## Version Verification

All versions verified via npm registry (2026-03-01):
- ✅ @shopify/react-native-skia: 1.12.3
- ✅ Fastify: 5.6.2
- ✅ Yjs: 13.6.29
- ✅ BullMQ: 5.64.1
- ✅ Expo SDK: 55.0.4
- ✅ react-native-reanimated: 3.17.3
- ✅ react-native-gesture-handler: 2.25.0
- ✅ Zustand: 5.0.11
- ✅ MongoDB: 7.1.0
- ✅ Vitest: 4.0.18
- ✅ Zod: 4.3.6
- ✅ Pino: 10.3.1

## Sources

### Official Documentation
- [React Native Skia - Shopify](https://shopify.github.io/react-native-skia/)
- [Fastify TypeScript Reference](https://fastify.dev/docs/latest/Reference/TypeScript/)
- [Expo SDK 55 Changelog](https://expo.dev/changelog/sdk-55)
- [MongoDB Data Modeling - Embedding vs References](https://www.mongodb.com/docs/manual/data-modeling/concepts/embedding-vs-references/)
- [BullMQ Official Site](https://bullmq.io/)
- [Yjs GitHub Repository](https://github.com/yjs/yjs)

### Performance & Best Practices
- [Using React Native Skia for Web Graphics with Expo 2026](https://dev.to/sherry_walker_bba406fb339/using-react-native-skia-for-web-graphics-with-expo-2026-3chj)
- [Skia: Game Changer for React Native in 2026](https://medium.com/@expertappdevs/skia-game-changer-for-react-native-in-2026-f23cb9b85841)
- [MongoDB Aggregation Pipeline Optimization](https://oneuptime.com/blog/post/2026-01-30-mongodb-aggregation-optimization/view)
- [MongoDB Native Driver vs Mongoose Performance](https://jscrambler.com/blog/mongodb-native-driver-vs-mongoose-performance-benchmarks)
- [How to Build a Job Queue in Node.js with BullMQ and Redis (Jan 2026)](https://oneuptime.com/blog/post/2026-01-06-nodejs-job-queue-bullmq-redis/view)

### Integration Guides
- [Testing Your API with Fastify and Vitest](https://dev.to/robertoumbelino/testing-your-api-with-fastify-and-vitest-a-step-by-step-guide-2840)
- [React Native Gesture Handler with Skia](https://shopify.github.io/react-native-skia/docs/animations/gestures/)
- [State Management in 2026: Redux vs Zustand vs Context API](https://medium.com/@abdurrehman1/state-management-in-2026-redux-vs-zustand-vs-context-api-ad5760bfab0b)
- [How to Securely Store Environment Variables in React Native Expo](https://www.codegenes.net/blog/react-native-expo-environment-variables/)
- [Pino Logging in Node.js - Complete Guide](https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/)

### Deployment
- [Deploy to Production with EAS Workflows](https://docs.expo.dev/eas/workflows/examples/deploy-to-production/)
- [From Build to App Store: Deploying React Native Apps with EAS in 2026](https://reactnativerelay.com/article/from-build-to-app-store-complete-guide-deploying-react-native-apps-eas-2026)

All versions verified via npm registry on 2026-03-01.
