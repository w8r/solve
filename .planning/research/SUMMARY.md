# Project Research Summary

**Project:** Solve - Collaborative Visual Graph Editor for Problem Decomposition
**Domain:** Visual collaboration / Graph-based problem solving
**Researched:** 2026-03-01
**Confidence:** HIGH

## Executive Summary

Solve is a collaborative visual graph editor focused on problem decomposition with GitHub-style version control - a novel combination that makes it "GitHub for ideas and problems." Research shows this product sits at the intersection of three mature domains: collaborative whiteboards (Miro, Figma), mind mapping tools (Whimsical, MindNode), and version control systems (Git, GitHub). The key insight is that while real-time collaboration and canvas interactions are now table stakes (2026 baseline expectations), the fork/propose/merge workflow for visual graphs is genuinely unique and Solve's primary differentiator.

The recommended technical approach is high-performance mobile-first architecture: React Native + Expo SDK 55 (with New Architecture), Skia for GPU-accelerated rendering, Fastify backend (3x faster than Express), and MongoDB with a hybrid storage model. The critical architectural decision is designing for CRDT-based real-time collaboration from day one, even though implementation comes in M3. This means using operation-based state management from M1, storing graphs as operation logs rather than simple embedded documents, and implementing per-user undo stacks that work in collaborative contexts.

The biggest risks are (1) naive canvas rendering causing performance collapse at 500+ nodes, (2) trying to add CRDT support after designing for single-user CRUD (requires full rewrite), and (3) MongoDB's 16MB document limit causing production crashes with large graphs. All three are preventable by following established patterns from the start: viewport culling + dirty flags for rendering, operation-based data model for collaboration readiness, and hybrid storage (separate collections for nodes/edges/operations) for scalability. Research confidence is high across all areas - the stack, features, architecture, and pitfalls are all well-documented with production examples from 2026.

## Key Findings

### Recommended Stack

Solve should use React Native/Expo for cross-platform mobile + web, with Skia for 60 FPS GPU-accelerated graph rendering. Skia communicates directly with the GPU via JSI (no bridge, no serialization), delivering 50% faster animations on iOS and 200% on Android versus traditional approaches. The backend uses Fastify (not Express) for 3x better performance and superior TypeScript support, critical for real-time graph operations. Real-time collaboration uses Socket.io with room-based broadcasting, with architecture designed for Yjs CRDT integration in M3. MongoDB provides the database with a hybrid storage model (metadata embedded, nodes/edges/operations in separate collections) to avoid the 16MB document limit while keeping query performance acceptable.

**Core technologies:**

- **React Native 0.83 + Expo SDK 55**: Cross-platform mobile/web with New Architecture, mature build/deployment via EAS
- **Skia + Reanimated + Gesture Handler**: GPU-accelerated 2D rendering at 60 FPS, direct C++ integration via JSI, production-proven
- **Fastify 5.6**: 3x faster than Express, native TypeScript support, plugin architecture, built-in validation with Zod
- **Zustand 5.0**: Lightweight state management (1KB vs Redux 20KB), hook-based API, no boilerplate, React Native + web compatible
- **MongoDB Native Driver 7.1**: 2x faster than Mongoose, hybrid storage pattern (separate collections avoid 16MB limit)
- **Socket.io + Redis**: Room-based real-time sync, BullMQ job queue for background tasks (auto-save every 5 min)
- **Yjs 13.6 (M3)**: Industry-standard CRDT framework for conflict-free collaborative editing, modular architecture

**Critical version notes:**

- Expo SDK 55 includes React 19.2 and RN 0.83, always runs on New Architecture (no opt-in needed)
- Reanimated 3.17 integrates directly with Skia without `createAnimatedComponent` wrapper
- MongoDB 6.0+ required for transactions, aggregation pipeline optimizations
- All versions verified via npm registry 2026-03-01

### Expected Features

Research reveals clear patterns across visual collaboration tools: real-time editing, infinite canvas, keyboard shortcuts, multi-format export, and granular permissions are baseline expectations in 2026. Users expect tools to feel instant (optimistic updates), support mobile gestures, and provide comment threads with @mentions. What differentiates products is intelligent features (AI-assisted generation), novel workflows (GitHub-style forking for graphs), and seamless integrations.

**Must have (table stakes):**

- Real-time collaboration with live cursors and conflict-free editing (Miro, Figma, Notion all have this)
- Infinite canvas with zoom/pan (pinch, space+drag, smooth transforms at 60 FPS)
- Keyboard shortcuts for power users (Tab for child, Enter for sibling, Delete, Undo/Redo)
- Multi-format export (PNG, SVG, PDF, JSON) - universal across all visual tools
- Comments with @mentions and threaded conversations
- Sharing with permissions (view/comment/edit roles at graph level)
- Search and filter (by text, tags, author, type, date)
- Visual customization (colors, shapes, edge types without relying on color alone for accessibility)

**Should have (competitive differentiators):**

- GitHub-style fork/propose/merge workflow - UNIQUE TO SOLVE, no competitor offers this for graphs
- Visual diff for merge proposals - show added/removed/modified nodes side-by-side (Figma has this for designs)
- Subgraph selection and forking - extract part of problem to work independently
- Problem decomposition as first-class workflow - explicit affordances vs generic mind mapping
- Dependency tracking - show which sub-problems block others (critical path visualization)
- Task status tracking - mark nodes as open/in-progress/solved/verified with color coding
- Activity timeline - Git-log-style history of forks, merges, proposals

**Defer (v2+):**

- AI-assisted node generation - nice to have but not core (defer to M4+)
- Template library - wait for usage patterns to emerge
- Integration with external tools (Notion, Jira, GitHub) - post-PMF
- Video/audio attachments - scope creep, storage costs
- Built-in video chat - already solved by Zoom/Meet, use integration instead
- Advanced diagramming shapes - don't compete with Lucidchart
- Marketplace for solutions - requires community first

### Architecture Approach

The recommended architecture uses layered separation: presentation (React Native + Skia), state (Zustand stores for graphs/viewport/user), sync (WebSocket operation queue with offline support), and persistence (MongoDB + Redis). The critical pattern is operation-based architecture - every change becomes a discrete operation (not state snapshot), enabling CRDT compatibility, offline merge, and audit trails. Frontend uses infinite canvas with viewport transforms (single matrix for pan/zoom, not per-item positioning), viewport culling to render only visible nodes, and optimistic updates with rollback on server rejection. Backend uses Fastify plugin architecture with Socket.io rooms (one room per graph), structured logging with Pino, and BullMQ for background jobs like auto-save and snapshots.

**Major components:**

1. **Skia Canvas Layer** - GPU-accelerated rendering with viewport culling, dirty flag system, gesture handling, only draws visible nodes + buffer zone
2. **Graph Store (Zustand)** - Operation-based state management, optimistic updates, operation queue for offline-first sync, per-user undo stacks
3. **WebSocket Sync Layer** - Socket.io rooms for per-graph collaboration, operation broadcasting, presence tracking, reconnection with gap detection
4. **Graph Service (Fastify)** - Business logic for graph CRUD, validation with Zod schemas, conflict detection (simple LWW → CRDT in M3)
5. **MongoDB Hybrid Storage** - Separate collections for graphs (metadata), nodes, edges, operations to avoid 16MB limit, indexes for common queries
6. **Background Jobs (BullMQ)** - Auto-save every 5 min, periodic snapshots, future notifications, exponential backoff retries

**Key architectural patterns:**

- Infinite canvas with single transform matrix (hardware accelerated, scales to 1000s of nodes)
- Operation-based sync (represent changes as discrete ops, not snapshots - smaller bandwidth, enables CRDT)
- Room-based presence (Socket.io room per graph, auto-cleanup on disconnect)
- Viewport culling (only render nodes within visible bounds + 100px buffer)
- Per-user undo stacks (each user undos only their operations, works in collaborative mode)
- Optimistic updates with rollback (apply changes locally immediately, rollback if server rejects)

### Critical Pitfalls

Research identified pitfalls that cause rewrites (CRDT as afterthought), performance collapse (naive canvas rendering), and production crashes (MongoDB 16MB limit). These are all preventable with correct initial design.

1. **Naive Canvas Rendering** - Redrawing entire scene on every change causes frame rate collapse at 500+ nodes. Must implement viewport culling + dirty flag system from day one or face M2 rewrite. Detection: profiler shows full scene traversal on minor interactions, FPS < 30 with < 100 nodes.

2. **CRDT Architecture as Afterthought** - Designing for single-user CRUD then adding CRDT later requires complete rewrite. Embedded document model cannot track per-node operations needed for conflict resolution. Prevention: use operation-based data model from M1, store operation log in separate collection, assign operation IDs even before collaboration exists.

3. **MongoDB 16MB Document Limit** - Storing graph as embedded `{nodes: [...], edges: [...]}` hits hard 16MB limit at ~10,000 nodes. App crashes with "document too large" errors. Prevention: hybrid storage from M1 - separate collections for nodes/edges/operations, graph doc contains only metadata.

4. **Local Undo Not Designed for Collaboration** - Global undo stack works for single-user, completely breaks in collaborative mode (users undo others' work). Prevention: implement per-user undo stacks from M1 where each user only undos their own operations.

5. **Tombstone Memory Bloat in CRDTs** - Naive CRDT implementations accumulate deletion markers forever, causing 2-5x memory bloat after months. Prevention: implement tombstone compaction with version vectors, use bitmap optimization, set retention policies (compact tombstones > 30 days old after full sync).

**Phase-specific warnings:**

- M1: Must implement viewport culling, operation-based data model, hybrid storage, per-user undo from start - these cannot be retrofitted
- M2: MongoDB `$graphLookup` too slow for deep graph traversal - add depth limits, pre-compute common queries, use client-side BFS/DFS
- M3: Fastify WebSocket errors don't trigger standard error handlers - wrap all message handlers in try/catch with custom logging
- M3: Offline sync with Last-Write-Wins causes silent data loss - implement conflict detection UI with field-level CRDT merging

## Implications for Roadmap

Based on research findings, Solve should be built in three major phases with a foundation-first approach that front-loads architectural decisions critical for later features. The research makes clear that certain patterns (operation-based state, hybrid storage, viewport culling) are expensive to retrofit but cheap to implement from the start.

### Phase 1: Foundation (M1)

**Rationale:** Must establish operation-based architecture, GPU rendering with performance patterns, and auth before any collaborative features. Research shows CRDT-compatible data model must exist before implementing CRDT, not after. Embedded document model would cause M3 rewrite.

**Delivers:** Single-user graph editor with infinite canvas, basic CRUD, optimistic updates, export to PNG/SVG/PDF

**Core features from FEATURES.md:**

- Infinite canvas with zoom/pan (pinch, space+drag)
- Node/edge creation, editing, deletion
- Selection and multi-select (shift-click, drag-box)
- Keyboard shortcuts (Tab, Enter, Delete, Undo/Redo)
- Visual customization (colors, shapes, edge types)
- Multi-format export (PNG, SVG, PDF, JSON)
- Auth (email + Google OAuth)

**Architecture from ARCHITECTURE.md:**

- Skia canvas with viewport culling (only render visible nodes + buffer)
- Dirty flag system (track which nodes changed, partial redraws)
- Zustand stores with operation-based state (every mutation = operation log entry)
- MongoDB hybrid storage (separate collections: graphs, nodes, edges, operations)
- Per-user undo stacks (prepare for collaboration even though single-user)
- Fastify backend with Zod validation, structured Pino logging

**Avoids pitfalls from PITFALLS.md:**

- Pitfall 1: Viewport culling + dirty flags prevent performance collapse at scale
- Pitfall 2: Operation-based model from start avoids CRDT rewrite
- Pitfall 3: Hybrid storage avoids 16MB document limit
- Pitfall 4: Per-user undo stacks work in future collaborative mode
- Pitfall 11: High-DPI canvas scaling prevents blurriness on Retina displays
- Pitfall 12: Shape + color encoding (not color-only) for accessibility

**Stack elements from STACK.md:**

- React Native 0.83 + Expo SDK 55
- Skia + Reanimated + Gesture Handler for rendering
- Zustand for state management
- Fastify + Zod for backend
- MongoDB Native Driver with hybrid model
- JWT auth with @fastify/jwt

### Phase 2: Forking & Merge Workflow (M2)

**Rationale:** The GitHub-style fork/propose/merge workflow is Solve's unique differentiator. Research shows no competitor offers this for graphs. Must implement before real-time collaboration (simpler to build fork/merge for single-user first, then add real-time in M3).

**Delivers:** Version control for graphs - fork entire graph or subgraph, work independently, submit merge proposal with visual diff, review and merge changes

**Core features from FEATURES.md:**

- Graph forking (create independent copy with parent relationship)
- Subgraph selection and extraction (select nodes/edges, fork as new graph)
- Merge proposal creation (propose changes from fork to parent)
- Visual diff (side-by-side view showing added/removed/modified nodes)
- Proposal review workflow (approve/request changes/merge with comments)
- Activity timeline (history of forks, proposals, merges)

**Architecture from ARCHITECTURE.md:**

- Graph extraction algorithm (select subgraph, maintain edge integrity)
- Three-way merge for graphs (base, fork, proposal)
- Conflict detection (both users edited same node in different forks)
- Diff computation (identify added/removed/modified nodes/edges)
- Permissions system (graph owner/editor/viewer roles)

**Avoids pitfalls from PITFALLS.md:**

- Pitfall 8: MongoDB `$graphLookup` too slow for deep traversal - implement depth limits, use client-side BFS/DFS for loaded graphs
- No CRDT conflicts because forking is asynchronous (no real-time yet)

**Stack elements from STACK.md:**

- Same core stack as M1
- No new dependencies (uses existing MongoDB, Fastify, Zustand)

### Phase 3: Real-time Collaboration (M3)

**Rationale:** Real-time sync is table stakes per research but architecturally complex. Building on top of M1's operation-based model and M2's merge logic makes CRDT integration feasible. Research shows Yjs is the mature choice for 2026, with modular architecture and good React Native support via y-op-sqlite.

**Delivers:** Live collaborative editing with conflict-free sync, presence awareness, per-user undo in real-time mode, offline editing with sync on reconnect

**Core features from FEATURES.md:**

- Real-time collaboration (multiple users editing same graph simultaneously)
- Live cursors and presence awareness (see who's editing what)
- Conflict-free editing (CRDTs via Yjs)
- User avatars with color-coded presence
- Comments and annotations with @mentions
- Offline editing with sync on reconnect

**Architecture from ARCHITECTURE.md:**

- Socket.io WebSocket plugin for Fastify
- Socket.io rooms (one room per graph, join on open, leave on close)
- Yjs CRDT integration (Y.Map for nodes, Y.Array for edges)
- y-mongodb-provider for server persistence
- y-op-sqlite for React Native local persistence (offline-first)
- Presence service using Redis (active users expire after 30s)
- Operation broadcasting (send ops to all room members except sender)
- Reconnection with gap detection (fetch missing operations by version)

**Avoids pitfalls from PITFALLS.md:**

- Pitfall 2: Already using operation-based model from M1, CRDT integration is incremental not rewrite
- Pitfall 4: Per-user undo stacks from M1 work correctly in collaborative mode
- Pitfall 5: Tombstone compaction with version vectors, bitmap optimization for deletion markers
- Pitfall 7: Conflict detection UI (not blind Last-Write-Wins), show "your version" vs "server version"
- Pitfall 9: Custom WebSocket error handlers (Fastify WS errors don't trigger standard handlers)

**Stack elements from STACK.md:**

- Socket.io (fastify-socket.io plugin)
- Redis for presence state and pub/sub
- Yjs 13.6 + y-mongodb-provider + y-op-sqlite
- BullMQ for background jobs (auto-save, snapshots)

### Phase 4: Advanced Features (M4+)

**Rationale:** AI-assisted features, dependency tracking, and integrations are valuable but not essential for launch. Defer until core workflow (edit → fork → collaborate) is validated with users.

**Potential features:**

- AI-assisted node generation ("expand this problem" → LLM suggests sub-problems)
- Dependency tracking (show critical path, detect cycles)
- Task status tracking (open/in-progress/solved/verified)
- Template library (problem decomposition patterns)
- Integration with external tools (Notion, Jira, GitHub)

### Phase Ordering Rationale

**Why M1 → M2 → M3 order (not M1 → M3 → M2):**

1. **Architecture dependencies**: CRDT (M3) requires operation-based model, which M1 establishes. Forking (M2) benefits from operation log but doesn't require CRDT. Building forking before CRDT is simpler because merge conflicts are asynchronous (no real-time race conditions).

2. **Feature validation**: Fork/merge workflow is Solve's unique value. Validating this in single-user mode (M2) before adding real-time complexity (M3) reduces risk. If fork/merge doesn't resonate with users, pivot is cheaper before investing in CRDT infrastructure.

3. **Complexity management**: Each phase adds one major complexity - M1 adds GPU rendering + infinite canvas, M2 adds graph merge algorithms, M3 adds real-time sync + CRDTs. Spreading complexity across phases prevents "too much at once" paralysis.

4. **Pitfall avoidance**: Research shows the critical pitfalls are in foundational decisions (viewport culling, operation-based state, hybrid storage, per-user undo). M1 addresses all of these. M2 and M3 build on solid foundation without requiring rewrites.

**Why hybrid storage from M1 (not "start simple, optimize later"):**

MongoDB's 16MB limit is a hard constraint. Research shows migrating from embedded to referenced model under production pressure is high-risk (data migration, downtime, potential data loss). Starting with hybrid pattern costs minimal extra complexity in M1 but eliminates entire class of scaling issues.

**Why operation-based state from M1 (before collaboration exists):**

Retrofitting operation log to mutation-based state requires rewriting all state management code plus database schema migration. Research confirms this is a "rewrite-level mistake." Cost of operation-based approach from start is small (write operations to log even for single-user), benefit is huge (CRDT integration in M3 is incremental not rewrite).

### Research Flags

**Phases needing deeper research during planning:**

- **M2 (Forking/Merging):** Graph merge algorithms - three-way merge for graph structures is less documented than text-based merge. May need `/gsd:research-phase` for conflict resolution strategies, semantic conflict detection (e.g., both users add different children to same node).

- **M3 (Real-time Sync):** CRDT library integration - while Yjs is well-documented, integrating with React Native + MongoDB + Socket.io needs validation. Specifically: tombstone GC strategy, offline sync with long partitions (> 1 week offline), conflict UI patterns for visual graphs.

**Phases with standard patterns (skip research-phase):**

- **M1 (Foundation):** Skia rendering, Zustand state, Fastify REST API, JWT auth, MongoDB CRUD - all have established patterns with 2026 documentation. No novel integration challenges.

- **M4 (AI Features):** OpenAI API integration is well-documented. Can defer research until phase planning (likely several months out).

**Open questions for phase planning:**

1. **M1:** Which graph layout algorithm (force-directed vs hierarchical vs manual-only)? Research focused on rendering performance, not layout algorithms. Suggest starting with manual layout + basic auto-arrange, add sophisticated layout in M2 if users request it.

2. **M2:** At what graph size does subgraph extraction become slow? Research suggests client-side BFS/DFS works for loaded graphs, but extraction algorithm complexity needs profiling with real data.

3. **M3:** Mobile battery impact of persistent WebSocket connection? Limited research on battery drain. May need device testing in M3 to tune reconnection strategy (stay connected vs periodic poll).

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                                                                                                                                                                                  |
| ------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack        | HIGH       | All versions verified via npm registry, official documentation for Expo SDK 55, Fastify, MongoDB, Skia. Production examples from 2026.                                                                                                                                 |
| Features     | HIGH       | Verified across multiple tools (Miro, Figma, Notion, MindNode, Whimsical), official docs, consistent patterns. Fork/merge uniqueness confirmed by absence in competitors.                                                                                              |
| Architecture | HIGH       | Fastify patterns from official docs, Socket.io rooms from documentation, Skia rendering from Shopify docs, MongoDB hybrid model from official guides. CRDT integration medium confidence (Yjs docs confirm graph support but integration complexity needs validation). |
| Pitfalls     | HIGH       | Canvas rendering pitfalls from multiple graph visualization sources, CRDT undo/redo from academic research, MongoDB limits from official documentation, Fastify WebSocket from official docs.                                                                          |

**Overall confidence:** HIGH

### Gaps to Address

**Areas where research was inconclusive or needs validation during implementation:**

- **Graph merge algorithms for M2:** Three-way merge for arbitrary graphs (not trees, not simple diffs) has limited documentation. Text-based merge is well-understood, but semantic conflicts in graph structures (e.g., circular dependencies created by merge) need domain-specific solutions. Recommendation: implement simple merge in M2 (accept/reject changes per node), add sophisticated conflict resolution in M2.1 if needed.

- **Scale limits for real-time collaboration (M3):** Most CRDT sources focus on documents with hundreds of operations, not graphs with thousands of nodes. Research didn't find clear answers for "at what node count does Yjs CRDT become too slow?" Recommendation: start with soft warning at 500 nodes per graph, hard limit at 5000, load test in M3 to validate.

- **Mobile-first vs desktop-first UX (M1):** Research shows most visual collaboration tools are desktop-first with mobile support. Solve uses React Native (mobile-first stack) but target users' primary device is unknown. Recommendation: build for both (React Native supports web), prioritize touch interactions but don't break mouse/keyboard. User research in M1 will validate.

- **Skia on web (CanvasKit) performance (M1):** Research focused on React Native mobile (iOS/Android). Web PWA performance with Skia via CanvasKit needs validation - bundle size, load time, rendering performance compared to native Canvas API. Recommendation: benchmark in M1, consider Canvas API fallback for web if Skia bundle too large.

- **Graph layout algorithm performance (M1):** Research covered rendering optimization (viewport culling, dirty flags) but not layout algorithms (force-directed, hierarchical, circular). Force-directed can be O(n²) or worse, may cause lag with large graphs. Recommendation: start with manual layout (users position nodes), add auto-layout as opt-in feature with performance testing.

## Sources

### Primary (HIGH confidence)

**Stack Research:**

- Expo SDK 55 Changelog (official) - New Architecture, React 19.2, build improvements
- Fastify TypeScript Reference (official) - Type providers, plugin architecture, WebSocket
- React Native Skia (Shopify official) - GPU rendering, JSI integration, performance benchmarks
- MongoDB Data Modeling (official) - Embedding vs references, 16MB limit, aggregation optimization
- BullMQ Official Site - Job queue features, production metrics, Redis integration
- Yjs GitHub Repository - CRDT framework, Y.Map/Y.Array for graphs, network providers

**Features Research:**

- Miro Review 2026, Figma branching guide, MindNode features (official product docs)
- Notion real-time collaboration, Whimsical AI-assisted mind mapping (official docs)
- Eclipse GLSP real-time collaboration patterns (technical blog, architecture details)
- Git fork/pull request workflow (Atlassian official tutorial)

**Architecture Research:**

- Socket.io Rooms Documentation (official)
- Fastify WebSocket Plugin (official GitHub)
- MongoDB aggregation pipeline optimization (OneUptime 2026-01 blog post)
- Zod with Fastify type provider (turkerdev GitHub, official Fastify pattern)
- Building infinite canvas with Skia (robcost.com technical article)

**Pitfalls Research:**

- MongoDB Limits and Thresholds (official documentation)
- CRDT Undo/Redo (academic paper: Yu et al. DAIS 2015)
- Canvas rendering optimization (MDN official, ag-grid blog)
- Expo troubleshooting build errors (official documentation)
- Fastify WebSocket error handling (GitHub official repo, BetterStack guide)

### Secondary (MEDIUM confidence)

**Stack Research:**

- State Management in 2026: Redux vs Zustand (Medium article) - Zustand performance claims
- MongoDB Native Driver vs Mongoose benchmarks (Jscrambler 2024) - Performance comparisons
- React Native Gesture Handler with Skia (Shopify docs, integration guide)

**Features Research:**

- Best mind mapping software compared (Atlas Workspace AI 2026, Zapier, Creately)
- Collaborative presence features (Flexum.io, Yjs awareness docs)
- Task decomposition for AI agents (OneUptime blog, mbrenndoerfer.com)

**Architecture Research:**

- Building real-time collaboration: WebRTC, WebSockets, conflict resolution (Medium article)
- Operational Transform vs CRDT (Tiny.cloud blog, comparison)
- Zustand vs Redux performance (dev.to community article)
- TypeScript monorepo with npm workspaces (YieldCode blog)

**Pitfalls Research:**

- CRDT tombstone management (decomposition.al technical blog)
- Offline sync patterns and trade-offs (Sachith.co.uk architecture guide)
- Graph visualization UX best practices (Cambridge Intelligence, UX Matters)
- React Native virtualization optimization (official React Native docs)

### Tertiary (LOW confidence - noted but not relied upon)

None - all findings verified with multiple sources or official documentation. Single-source findings were flagged as gaps requiring validation.

---

_Research completed: 2026-03-01_
_Ready for roadmap: yes_
