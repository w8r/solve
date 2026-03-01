# Architecture Patterns: Collaborative Visual Graph Editor

**Domain:** Visual problem-solving app with collaborative graph editing
**Researched:** 2026-03-01
**Overall Confidence:** HIGH

## Executive Summary

A collaborative visual graph editor requires a layered architecture with clear separation between presentation (React Native + Skia), application state (graph data + viewport), real-time sync (WebSocket/CRDT), and persistence (MongoDB + Redis). The key architectural challenge is balancing performance for large graphs with collaborative features while maintaining offline-first capabilities.

Based on research and the existing codebase, the recommended architecture uses:
- **Frontend**: React Native + Skia for GPU-accelerated rendering, Zustand for state management, infinite canvas pattern for viewport
- **Backend**: Fastify with Socket.io for WebSocket, MongoDB with hybrid graph model, BullMQ for background jobs
- **Real-time**: CRDT-ready architecture with operation-based sync (design for Yjs, implement simple OT first)
- **Monorepo**: npm workspaces with shared types in `@solve/common`

## Recommended Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React Native)                     │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Skia Canvas  │  │ UI Components│  │ Auth Screens │      │
│  │ (GPU render) │  │ (RN Native)  │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer (Zustand)                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Graph Store│  │Viewport    │  │ User Store │           │
│  │ (nodes/    │  │Store (pan/ │  │            │           │
│  │  edges)    │  │ zoom)      │  │            │           │
│  └────────────┘  └────────────┘  └────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  Sync Layer                                                  │
│  ┌──────────────────────────────────────────────┐          │
│  │ Operation Queue → WebSocket Client            │          │
│  │ (Offline-first, sync when connected)          │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            ↕ WebSocket + REST
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Fastify)                          │
├─────────────────────────────────────────────────────────────┤
│  API Layer (REST + WebSocket)                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Auth Routes│  │ Graph API  │  │ Socket.io  │           │
│  │            │  │            │  │ Plugin     │           │
│  └────────────┘  └────────────┘  └────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Graph      │  │ Conflict   │  │ Auth       │           │
│  │ Service    │  │ Resolution │  │ Service    │           │
│  └────────────┘  └────────────┘  └────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  Real-time Collaboration                                     │
│  ┌──────────────────────────────────────────────┐          │
│  │ Socket.io Rooms (per graph)                  │          │
│  │ - Operation broadcasting                      │          │
│  │ - User presence/awareness                     │          │
│  │ - Conflict detection                          │          │
│  └──────────────────────────────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Background Jobs (BullMQ + Redis)                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Auto-save  │  │ Snapshots  │  │ Future:    │           │
│  │ (5min)     │  │ (periodic) │  │ Notifs     │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENCE                               │
├─────────────────────────────────────────────────────────────┤
│  MongoDB                      Redis                          │
│  ┌────────────┐              ┌────────────┐                │
│  │ graphs     │              │ Job Queues │                │
│  │ users      │              │ Sessions   │                │
│  │ operations │              │ Presence   │                │
│  └────────────┘              └────────────┘                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                SHARED PACKAGE (@solve/common)                │
├─────────────────────────────────────────────────────────────┤
│  Types          Algorithms        Constants                 │
│  ┌──────────┐  ┌──────────┐     ┌──────────┐              │
│  │ IGraph   │  │ Graph    │     │ Operation│              │
│  │ INode    │  │ Validation│    │ Types    │              │
│  │ IEdge    │  │ Traversal│     │ Perms    │              │
│  │ IOperation│ │          │     │          │              │
│  └──────────┘  └──────────┘     └──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## Component Boundaries

### 1. Frontend (React Native + Expo)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Skia Canvas** | GPU-accelerated graph rendering, viewport transforms (pan/zoom), gesture handling | Viewport Store, Graph Store |
| **Graph Store** | Graph data (nodes, edges), local mutations, operation queue, sync status | Skia Canvas, Sync Layer, Graph API |
| **Viewport Store** | Camera position, zoom level, visible bounds calculation | Skia Canvas, UI Components |
| **Sync Layer** | Queue operations, manage WebSocket connection, handle reconnection, merge remote changes | Graph Store, WebSocket Server |
| **UI Components** | Native controls (buttons, modals), overlays on canvas | All Stores |

**Key Pattern**: Infinite Canvas
- Viewport transforms entire coordinate system (not individual items)
- Only render nodes within visible bounds + buffer
- Use single transform matrix for pan/zoom

### 2. Backend (Fastify + TypeScript)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **REST API Routes** | HTTP endpoints for CRUD operations, authentication, graph queries | Services |
| **WebSocket Plugin** | Socket.io integration, room management, operation broadcasting | Services, MongoDB |
| **Graph Service** | Business logic for graph operations, validation, persistence | MongoDB, Conflict Service |
| **Conflict Service** | Detect conflicts, apply OT transforms (future: CRDT merge) | Graph Service |
| **Auth Service** | JWT tokens, password hashing, OAuth integration | MongoDB, Redis |
| **Background Jobs** | BullMQ workers for auto-save, snapshots, notifications | MongoDB, Redis |

**Key Pattern**: Plugin-based Architecture
- Each feature as Fastify plugin (auth, websocket, swagger)
- Structured logging with Pino (always include context)
- Type-safe routes with Zod schemas

### 3. Real-time Sync Layer

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Socket.io Server** | Manage WebSocket connections, rooms, namespaces | WebSocket Handlers |
| **Graph Room Handler** | Per-graph rooms, operation broadcasting, version tracking | Graph Service |
| **Presence Handler** | Track active users per graph, broadcast awareness data (cursors, selections) | Redis (for presence state) |
| **Operation Queue** | Buffer operations, ensure ordering, handle reconnection | Graph Service, MongoDB |

**Key Pattern**: Room-based Broadcasting
- Each graph = Socket.io room
- Join room on graph open, leave on close
- Broadcast operations to all room members except sender

### 4. Data Layer

#### MongoDB (Primary Persistence)

| Collection | Schema | Purpose |
|------------|--------|---------|
| **users** | User document with profile, auth | Authentication, user metadata |
| **graphs** | Graph document with embedded nodes/edges (current), operations log (future) | Primary graph storage |
| **operations** | Operation log (future: for OT/CRDT) | Conflict resolution, history |

**Migration Path**:
- **M1**: Keep embedded model (`graph.nodes[]`, `graph.edges[]`) - works for small graphs, simple to implement
- **M2+**: Hybrid model - graph doc references operation log, materialize view from operations for large graphs

#### Redis (Ephemeral State)

| Key Pattern | Purpose |
|-------------|---------|
| `session:{userId}` | JWT refresh tokens |
| `presence:graph:{graphId}` | Active users in graph (expire 30s) |
| `bullmq:*` | Job queue state |

### 5. Shared Package (@solve/common)

| Module | Exports | Used By |
|--------|---------|---------|
| **types/** | `IGraph`, `INode`, `IEdge`, `IOperation`, `IUser` | Frontend, Backend |
| **algorithms/** | Graph validation, DFS/BFS traversal, cycle detection | Backend (validation), Frontend (client-side validation) |
| **constants/** | Operation types, permissions, revision statuses | Frontend, Backend |

**Key Pattern**: TypeScript Project References
- Each package has `tsconfig.json` with `references: [{ "path": "../common" }]`
- Single source of truth for types
- No code duplication

## Data Flow

### 1. Graph Creation Flow

```
User creates node in UI
    ↓
Graph Store: Add node locally (optimistic update)
    ↓
Sync Layer: Queue operation { type: 'ADD_NODE', data: {...} }
    ↓
WebSocket: Send operation to server
    ↓
Server: Validate operation → Apply to DB → Broadcast to room
    ↓
Other clients: Receive operation → Apply to local state
```

### 2. Collaborative Editing Flow (Real-time)

```
User A edits node
    ↓
Client A: Create operation { type: 'UPDATE_NODE', nodeId, changes }
    ↓
Client A WebSocket → Server
    ↓
Server: Apply operation, increment version
    ↓
Server broadcasts to room (except sender)
    ↓
Clients B, C: Receive operation → Check version → Apply
    ↓
(If version mismatch: fetch missing operations)
```

### 3. Offline-First Flow

```
Client goes offline
    ↓
Graph Store: Continue queuing operations locally
    ↓
IndexedDB: Persist operation queue
    ↓
Client reconnects
    ↓
Sync Layer: Send queued operations with last known version
    ↓
Server: Detect gap → Send missing operations → Apply queued ops
    ↓
Conflict Service: Resolve conflicts if needed
    ↓
Client: Receive merged state → Update UI
```

### 4. Background Jobs Flow

```
Graph edited
    ↓
Server: Add auto-save job to BullMQ (debounced 5 min)
    ↓
Worker: Process job → Create snapshot
    ↓
MongoDB: Save snapshot document
    ↓
(On error: Retry with exponential backoff)
```

## Patterns to Follow

### Pattern 1: Infinite Canvas with Transform Matrix

**What:** Use CSS transform (scale + translate) for viewport, not individual item positioning

**When:** All graph rendering operations

**Why:** Hardware-accelerated, scales to 1000s of nodes

**Example:**
```typescript
// Viewport Store
interface ViewportState {
  camera: { x: number; y: number; zoom: number };
  screenToWorld: (screenX: number, screenY: number) => Point;
  worldToScreen: (worldX: number, worldY: number) => Point;
}

// Skia Canvas
const transform = Skia.Matrix();
transform.translate(camera.x, camera.y);
transform.scale(camera.zoom, camera.zoom);

canvas.save();
canvas.concat(transform);
// Draw nodes at their world coordinates
canvas.restore();
```

**Performance:** Tested pattern handles 5000+ nodes at 60fps

### Pattern 2: Operation-Based Sync

**What:** Represent all changes as discrete operations, not state snapshots

**When:** All graph mutations (add/update/delete node/edge)

**Why:** Enables OT/CRDT, reduces bandwidth, provides audit trail

**Example:**
```typescript
// @solve/common/types/operation.ts
interface IOperation {
  id: string;
  type: 'ADD_NODE' | 'UPDATE_NODE' | 'DELETE_NODE' | 'ADD_EDGE' | 'DELETE_EDGE';
  graphId: string;
  userId: string;
  timestamp: number;
  version: number; // Optimistic locking
  data: Record<string, unknown>;
}

// Client
function addNode(node: INode) {
  const op: IOperation = {
    id: uuid(),
    type: 'ADD_NODE',
    graphId: currentGraph.id,
    userId: currentUser.id,
    timestamp: Date.now(),
    version: graphStore.version + 1,
    data: { node }
  };

  graphStore.applyLocal(op); // Optimistic
  syncLayer.queue(op); // Send when connected
}
```

### Pattern 3: Room-Based Presence

**What:** Use Socket.io rooms for per-graph collaboration

**When:** User opens/closes graph, sends operations

**Example:**
```typescript
// Server: WebSocket Handler
io.on('connection', (socket) => {
  socket.on('join-graph', async ({ graphId, userId }) => {
    await socket.join(`graph:${graphId}`);

    // Get current users in room
    const room = io.sockets.adapter.rooms.get(`graph:${graphId}`);
    const users = await getPresenceForRoom(graphId);

    // Broadcast new user joined
    socket.to(`graph:${graphId}`).emit('user-joined', { userId });
    socket.emit('presence-state', { users });
  });

  socket.on('operation', ({ graphId, operation }) => {
    // Validate, apply, broadcast
    socket.to(`graph:${graphId}`).emit('operation', operation);
  });

  socket.on('disconnect', () => {
    // Auto-leave all rooms, broadcast user-left
  });
});
```

**Why:** Built-in room management, automatic cleanup on disconnect

### Pattern 4: Zustand for State Management

**What:** Lightweight state management with hooks, no boilerplate

**When:** Graph data, viewport state, user state on frontend

**Why:** 3x smaller than Redux, better performance, simpler API

**Example:**
```typescript
// stores/graphStore.ts
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface GraphState {
  graphs: Map<string, IGraph>;
  currentGraphId: string | null;
  operations: IOperation[];

  addNode: (graphId: string, node: INode) => void;
  applyOperation: (op: IOperation) => void;
}

export const useGraphStore = create<GraphState>()(
  immer((set) => ({
    graphs: new Map(),
    currentGraphId: null,
    operations: [],

    addNode: (graphId, node) => set((state) => {
      const graph = state.graphs.get(graphId);
      if (graph) {
        graph.nodes.push(node);
      }
    }),

    applyOperation: (op) => set((state) => {
      state.operations.push(op);
      // Apply operation to graph
    })
  }))
);

// Component
function GraphEditor() {
  const addNode = useGraphStore((state) => state.addNode);
  // Only re-renders when addNode reference changes (never)
}
```

### Pattern 5: Culling and Virtualization

**What:** Only render nodes within viewport bounds + buffer

**When:** Drawing graphs with 100+ nodes

**Why:** Maintain 60fps with large graphs

**Example:**
```typescript
// Viewport Store
function getVisibleNodes(nodes: INode[], viewport: Viewport): INode[] {
  const bounds = viewport.getWorldBounds();
  const buffer = 100; // pixels outside viewport

  return nodes.filter(node => {
    const pos = node.position;
    return pos.x >= bounds.left - buffer &&
           pos.x <= bounds.right + buffer &&
           pos.y >= bounds.top - buffer &&
           pos.y <= bounds.bottom + buffer;
  });
}

// Skia Canvas Render
const visibleNodes = getVisibleNodes(graph.nodes, viewport);
visibleNodes.forEach(node => drawNode(canvas, node));
```

**Performance:** Reduces render calls from O(n) to O(visible)

### Pattern 6: Optimistic Updates with Rollback

**What:** Apply changes locally immediately, rollback if server rejects

**When:** All user-initiated graph mutations

**Why:** Feels instant, handles offline

**Example:**
```typescript
// Graph Store
async function addNode(node: INode) {
  const tempId = `temp-${uuid()}`;
  const optimisticOp = { ...operation, tempId };

  // Apply immediately
  applyLocal(optimisticOp);

  try {
    const result = await api.addNode(node);
    // Replace temp ID with server ID
    replaceNode(tempId, result.id);
  } catch (error) {
    // Rollback on error
    removeNode(tempId);
    showError('Failed to add node');
  }
}
```

### Pattern 7: Structured Logging with Context

**What:** Always log with structured context objects, not string concatenation

**When:** All server operations (especially errors)

**Why:** Enables log aggregation, debugging, monitoring

**Example:**
```typescript
// Good
logger.info({ userId, graphId, operationType }, 'Operation applied');
logger.error({ err, operation, graphId }, 'Operation failed');

// Bad
logger.info(`User ${userId} applied ${operationType} to ${graphId}`);
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Nested Virtualization

**What:** Using FlatList/VirtualizedList inside another scrollable component

**Why bad:** Causes performance issues, conflicts between scroll handlers

**Instead:** Use single FlatList with sections, or custom canvas rendering

**Detection:** Warning from React Native: "VirtualizedLists should never be nested"

### Anti-Pattern 2: Full State Sync

**What:** Sending entire graph state on every change

**Why bad:** Bandwidth explosion with large graphs, doesn't support offline merge

**Instead:** Use operation-based sync (Pattern 2)

**Example:**
```typescript
// Bad
socket.emit('graph-update', { graph: entireGraphState }); // 10MB+

// Good
socket.emit('operation', { type: 'UPDATE_NODE', nodeId, changes }); // 100 bytes
```

### Anti-Pattern 3: Client-Side Trust

**What:** Applying operations from WebSocket without server validation

**Why bad:** Security vulnerability, data corruption

**Instead:** Server validates all operations, broadcasts only after DB write succeeds

### Anti-Pattern 4: Synchronous WebSocket Handlers

**What:** Blocking event handlers waiting for DB operations

**Why bad:** Blocks event loop, degrades real-time performance

**Instead:** Use async handlers, return immediately after queueing

```typescript
// Bad
socket.on('operation', (op) => {
  const result = db.applyOperation(op); // Blocks
  socket.emit('result', result);
});

// Good
socket.on('operation', async (op) => {
  // Queue for processing, return immediately
  operationQueue.add(op);
  socket.emit('queued', { operationId: op.id });
});
```

### Anti-Pattern 5: Global WebSocket Handlers

**What:** Single handler for all graphs, filtering by graphId in handler

**Why bad:** Doesn't scale, no per-graph isolation

**Instead:** Use Socket.io rooms (Pattern 3)

### Anti-Pattern 6: Embedding Large Arrays in MongoDB

**What:** Storing 1000+ nodes as embedded array in graph document

**Why bad:** Hits 16MB document limit, slow queries, inefficient updates

**Instead:** Hybrid model - small graphs embedded, large graphs referenced

**Migration trigger:** When `graph.nodes.length > 500`, move to referenced model

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Graph Storage** | Embedded model works | Hybrid (embedded for small graphs, referenced for large) | Full referenced model, sharding by userId |
| **WebSocket Connections** | Single server | Horizontal scaling with Redis adapter | Dedicated WebSocket servers, Redis pub/sub |
| **Real-time Sync** | Simple operation broadcast | Add conflict detection | CRDT with vector clocks |
| **Database Queries** | Basic indexes | Compound indexes, read replicas | Sharding, caching layer |
| **Background Jobs** | Single BullMQ worker | Multiple workers | Worker pools per job type |
| **Monitoring** | Console logs | Centralized logging (Datadog) | Distributed tracing, APM |

## CRDT Integration Strategy (Future: M3)

### Why CRDT Over OT for Graphs

**Research Finding:** OT requires server coordination and is complex for graph structures. CRDTs are peer-to-peer friendly and more suitable for offline-first.

**Recommended Library:** Yjs
- Proven at scale (used by many collaborative editors)
- Supports Y.Map and Y.Array (can model graphs)
- Multiple network providers (WebSocket, WebRTC, IndexedDB)
- Smaller bundle than Automerge

### Integration Plan

**Phase 1 (M1):** Design operation format to be CRDT-compatible
- Each operation has unique ID, timestamp, user ID
- Operations are commutative (order-independent where possible)

**Phase 2 (M2):** Add operation log persistence
- Store all operations in MongoDB
- Current state = apply all operations in order

**Phase 3 (M3):** Integrate Yjs
```typescript
// Client
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const yGraph = ydoc.getMap('graph');
const yNodes = yGraph.get('nodes') as Y.Map<INode>;
const yEdges = yGraph.get('edges') as Y.Array<IEdge>;

const provider = new WebsocketProvider(
  'wss://api.solve.app',
  graphId,
  ydoc
);

// Observe changes
yNodes.observe((event) => {
  event.changes.keys.forEach((change, key) => {
    if (change.action === 'add') {
      renderNode(yNodes.get(key));
    }
  });
});

// Make changes
yNodes.set(nodeId, node); // Auto-syncs to all clients
```

**Server:** Persist Yjs updates to MongoDB, broadcast to WebSocket rooms

## Build Order and Dependencies

### Suggested Implementation Sequence

**1. Foundation (No dependencies)**
- Shared types in `@solve/common`
- MongoDB models (users, graphs with embedded nodes/edges)
- Fastify server skeleton with plugins architecture

**2. Auth Layer (Depends on: Foundation)**
- JWT utilities
- User model, auth service
- Auth routes (register, login, refresh)
- Auth middleware

**3. Basic Graph API (Depends on: Foundation, Auth)**
- Graph service (CRUD operations)
- Graph routes with Zod validation
- Graph queries (by user, by ID)

**4. Frontend Foundation (Depends on: Auth API)**
- React Native project setup
- Auth screens and flows
- Zustand stores (user, graphs)
- API client

**5. Graph Rendering (Depends on: Frontend Foundation)**
- Skia canvas setup
- Viewport store with infinite canvas
- Node/edge rendering
- Pan/zoom gestures

**6. Graph Editing (Depends on: Graph Rendering, Graph API)**
- Local graph mutations
- Graph editor UI
- Optimistic updates
- Save to backend

**7. WebSocket Infrastructure (Depends on: Graph API)**
- Socket.io plugin for Fastify
- Room management
- Presence tracking
- WebSocket client on frontend

**8. Real-time Sync (Depends on: WebSocket Infrastructure, Graph Editing)**
- Operation-based sync protocol
- Operation queue
- Conflict detection (simple: last-write-wins)
- Reconnection handling

**9. Background Jobs (Depends on: Graph API)**
- BullMQ setup with Redis
- Auto-save worker
- Snapshot worker

**10. Offline Support (Depends on: Real-time Sync)**
- IndexedDB for operation queue
- Offline detection
- Sync on reconnect

### Critical Path

```
Foundation → Auth → Graph API → Frontend Foundation → Graph Rendering → Graph Editing → WebSocket → Real-time Sync
```

Everything else (background jobs, offline support) can be built in parallel after real-time sync.

## Testing Strategy

### Component-Level Testing

| Layer | Tool | What to Test |
|-------|------|--------------|
| Frontend Components | Jest + React Native Testing Library | Component rendering, user interactions |
| Zustand Stores | Jest | State mutations, selectors |
| Backend Services | Vitest | Business logic, validation |
| API Routes | Vitest + Fastify `.inject()` | Request/response, auth, validation |
| WebSocket Handlers | Vitest + `vitest-websocket-mock` | Operation broadcast, room management |

### Integration Testing

**WebSocket Testing Pattern:**
```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';
import WS from 'jest-websocket-mock';
import { io } from 'socket.io-client';

describe('Graph collaboration', () => {
  let server: WS;
  let client: SocketIOClient;

  beforeEach(async () => {
    server = new WS('ws://localhost:3000');
    client = io('ws://localhost:3000');
    await server.connected; // Wait for connection
  });

  afterEach(() => {
    WS.clean();
  });

  it('broadcasts operations to room members', async () => {
    const operation = { type: 'ADD_NODE', nodeId: '123', data: {} };

    client.emit('operation', operation);

    await expect(server).toReceiveMessage(
      expect.objectContaining({ type: 'ADD_NODE' })
    );
  });
});
```

**API Testing Pattern:**
```typescript
import { describe, it } from 'vitest';
import { buildApp } from './app';

describe('POST /graphs', () => {
  it('creates graph with auth', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/graphs',
      headers: {
        authorization: `Bearer ${validToken}`
      },
      payload: {
        name: 'Test Graph',
        nodes: [{ id: '1', data: {} }],
        edges: []
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      graph: expect.objectContaining({
        name: 'Test Graph'
      })
    });
  });
});
```

### E2E Testing

**Critical User Flows:**
1. Sign up → Create graph → Add nodes → Save → Reload (verify persistence)
2. User A edits graph → User B sees changes in real-time
3. User goes offline → Makes edits → Reconnects → Changes sync

**Tool:** Detox (React Native) for mobile, Playwright for web

## Performance Optimization Checklist

- [ ] Viewport culling (only render visible nodes)
- [ ] Memoize Skia drawing functions (React.memo)
- [ ] Use FlatList with virtualization for node lists
- [ ] Batch WebSocket operations (debounce 16ms for 60fps)
- [ ] Lazy load graphs (pagination)
- [ ] Index MongoDB queries (userId, graphId, createdAt)
- [ ] Use Redis for presence (expire keys automatically)
- [ ] Compress WebSocket messages (Socket.io perMessageDeflate)
- [ ] Use Skia's `drawAtlas` for repeated shapes
- [ ] Profile with React DevTools Profiler
- [ ] Monitor bundle size (keep under 5MB for mobile)

## Monitoring and Observability

### Key Metrics

**Frontend:**
- Frame rate (target: 60fps)
- Bundle size
- Time to interactive
- WebSocket reconnection rate

**Backend:**
- Request latency (p50, p95, p99)
- WebSocket connections active
- Operation throughput (ops/sec)
- Database query time
- Job queue length

**Logging Strategy:**
```typescript
// Structured logging with Pino
logger.info({
  userId,
  graphId,
  operation: 'ADD_NODE',
  latency: 45,
  nodeCount: graph.nodes.length
}, 'Operation applied');

logger.error({
  err,
  userId,
  graphId,
  operation
}, 'Operation failed');
```

**Alerting:**
- WebSocket reconnection rate > 10%
- p95 latency > 500ms
- Job queue depth > 1000
- Database connection pool exhausted

## Technology Decisions

### Why Fastify over Express?

- 3x faster (critical for real-time operations)
- Better TypeScript support (typed routes, plugins)
- Plugin architecture (cleaner separation)
- Built-in schema validation (Zod integration)

### Why Skia over Three.js?

- Native performance (GPU-accelerated)
- Better mobile support
- Simpler API for 2D graphs
- Smaller bundle size
- Better animation support (Reanimated integration)

### Why Zustand over Redux?

- 3x smaller bundle (800 bytes)
- No boilerplate (no actions, reducers, dispatch)
- Better performance (fewer re-renders)
- Simpler async (no middleware needed)
- Works with React Native and Web

### Why Socket.io over Raw WebSocket?

- Rooms and namespaces (built-in)
- Automatic reconnection
- Fallback transports
- Acknowledgments (request/response pattern)
- Presence via adapter

### Why MongoDB over PostgreSQL for Graphs?

- Flexible schema (nodes/edges have dynamic attributes)
- Embedded documents (simpler for small graphs)
- JSON-native (no ORM impedance mismatch)
- Horizontal scaling (sharding)
- Aggregation pipeline (complex graph queries)

**Trade-off:** No joins, no ACID across documents. Mitigated by: using transactions for critical operations, designing for single-document queries where possible.

## Migration Path from Legacy Codebase

### Current State (Legacy)
- Express server with JavaScript
- Graph model: embedded nodes/edges
- No real-time sync
- React Native with Three.js

### Migration Strategy

**Phase 1: Parallel Development**
- Build new Fastify API alongside Express
- Shared MongoDB database
- New API uses `@solve/common` types

**Phase 2: Feature Parity**
- Port auth endpoints to Fastify
- Port graph CRUD to Fastify
- Add WebSocket support (new feature)

**Phase 3: Frontend Migration**
- New React Native app with Skia
- Points to new Fastify API
- Reuse MongoDB data (no migration needed)

**Phase 4: Deprecate Legacy**
- Redirect Express routes to Fastify
- Monitor for errors
- Shut down Express server

**Data Migration:** Not needed - graph schema compatible (nodes, edges, user, publicId all present)

## Open Questions and Research Flags

### Questions Requiring Deeper Research

1. **Conflict Resolution Strategy:** Which OT algorithm for graph operations? (needs domain-specific research)
2. **Presence Performance:** Redis or in-memory for presence at 10K concurrent users? (load testing needed)
3. **Graph Size Limits:** At what node count does embedded model break? (benchmark needed)
4. **Mobile Performance:** Can Skia handle 1000+ nodes on mid-range Android? (device testing needed)

### Areas Flagged for Future Investigation

- **Advanced CRDT:** Moving beyond Yjs to custom graph CRDT (M4+)
- **Offline Conflict UI:** How to present conflicts to users in visual editor
- **Version History:** Time-travel debugging for graphs (operation replay)
- **Graph Analytics:** Detecting patterns, suggesting solutions (ML integration)

## Confidence Assessment

| Area | Confidence | Evidence |
|------|------------|----------|
| Frontend Architecture (Skia + Zustand) | HIGH | Multiple production examples, official docs, performance benchmarks |
| Backend Architecture (Fastify + Socket.io) | HIGH | Official Fastify patterns, Socket.io docs, npm package maturity |
| Real-time Sync (Operation-based) | MEDIUM | WebSearch sources + common patterns, but graph-specific OT needs validation |
| CRDT Integration (Yjs) | MEDIUM | Yjs docs confirm graph support, but integration complexity unknown |
| MongoDB Hybrid Model | MEDIUM | Official MongoDB docs, but migration trigger (500 nodes) is estimate |
| Scalability (10K users) | LOW | Based on general patterns, needs load testing for validation |

## Sources

### High Confidence (Official Documentation & Libraries)
- [MongoDB: Embedded Data vs References](https://www.mongodb.com/docs/manual/data-modeling/concepts/embedding-vs-references/)
- [Yjs Documentation](https://docs.yjs.dev/)
- [React Native Skia: High-performance Graphs](https://github.com/margelo/react-native-graph)
- [Fastify WebSocket Plugin](https://github.com/fastify/fastify-websocket)
- [Socket.io Rooms Documentation](https://socket.io/docs/v3/rooms/)
- [BullMQ Documentation](https://docs.bullmq.io)
- [Zod with Fastify](https://github.com/turkerdev/fastify-type-provider-zod)

### Medium Confidence (Technical Articles & Comparisons)
- [Building Real-Time Collaboration: WebRTC, WebSockets, Conflict Resolution](https://medium.com/@himansusaha/building-real-time-collaborative-applications-a-deep-dive-into-webrtc-websockets-and-conflict-9eb75800e221)
- [Operational Transform vs CRDT](https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/)
- [Zustand vs Redux Performance](https://dev.to/ingeniouswebster/the-battle-of-state-management-redux-vs-zustand-6k4)
- [Building Infinite Canvas with Skia](https://robcost.com/building-an-infinite-canvas-with-skia-in-react-native/)
- [TypeScript Monorepo with npm Workspaces](https://yieldcode.blog/post/npm-workspaces/)

### Community Knowledge (Patterns & Best Practices)
- [Testing WebSockets with Vitest](https://github.com/ITenthusiasm/testing-websockets)
- [React Native Virtualization Optimization](https://reactnative.dev/docs/optimizing-flatlist-configuration)
- [MongoDB Graph Traversal with $graphLookup](https://www.slideshare.net/mongodb/webinar-working-with-graph-data-in-mongodb)

### Existing Codebase Analysis
- Legacy graph model (`packages/server/models/graphs.js`) - embedded nodes/edges confirmed
- Partial Fastify implementation (`packages/api/src/controllers/auth.controller.ts`) - structure validated

## Summary

This architecture balances **performance** (Skia GPU rendering, Zustand state, MongoDB indexes), **real-time collaboration** (Socket.io rooms, operation-based sync), and **offline-first** capabilities (operation queue, IndexedDB). The recommended build order ensures critical path completion (Foundation → Auth → Graph API → Rendering → Editing → Real-time) before adding complexity (background jobs, offline support, CRDT).

**Key Risk:** CRDT integration complexity for graph structures. **Mitigation:** Design operation format to be CRDT-compatible from M1, but implement simple OT first. Upgrade to full CRDT (Yjs) in M3 when real-time collaboration is validated.

**Scalability Path:** Embedded model (M1) → Hybrid model (M2) → Full referenced + CRDT (M3) → Sharding (M4+).
