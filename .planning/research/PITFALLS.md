# Domain Pitfalls

**Domain:** Visual graph editor with collaborative editing
**Researched:** 2026-03-01
**Overall Confidence:** HIGH

## Critical Pitfalls

These mistakes cause rewrites, major performance issues, or fundamental product failures.

---

### Pitfall 1: Naive Canvas Rendering (Redraw Everything on Every Change)

**What goes wrong:** The naive approach of redrawing the entire canvas on every change causes catastrophic performance degradation with graphs over 100 nodes. Apps become unusable at 500+ nodes (< 10 FPS).

**Why it happens:** Developers treat canvas like a simple drawing surface without implementing dirty flag systems. Every pan, zoom, or node edit triggers complete scene graph traversal and full re-render.

**Consequences:**
- Frame rate drops below 30 FPS with 1,000+ elements
- Mobile devices become completely unusable
- Battery drain from continuous GPU/CPU usage
- Users abandon the product ("too slow to be useful")

**Prevention:**
1. **Implement dirty flag system from Day 1** - Track which nodes/edges changed, only redraw modified elements
2. **Viewport culling** - Don't render anything outside the visible viewport
3. **Layer caching** - Use offscreen canvas for static elements, only composite layers that changed
4. **Progressive rendering** - Load visible elements first, defer background layout computation

**Detection (warning signs):**
- Profiler shows full scene traversal on minor interactions
- Frame time > 16ms (60 FPS threshold) with < 100 nodes
- `requestAnimationFrame` callback taking > 10ms
- CPU pegged during panning/zooming

**Which phase:** M1 Foundation - Skia rendering implementation must include viewport culling and dirty flags from the start, or M2 will require a rewrite.

**Confidence:** HIGH - Multiple sources confirm this is the #1 performance killer in canvas-based graph editors.

---

### Pitfall 2: CRDT Architecture as Afterthought

**What goes wrong:** Designing data structures for basic CRUD, then trying to add CRDT support later requires complete data model rewrite. Operations that worked fine with single-user editing create unsolvable conflicts in collaborative mode.

**Why it happens:** Teams postpone "complex" real-time sync work to "later phases" without realizing their fundamental data structures (embedded documents, direct mutations, lacking operation IDs) are incompatible with CRDTs.

**Consequences:**
- Embedded document model in MongoDB cannot track per-node operations needed for CRDT
- Direct field mutations lack the operation history required for conflict resolution
- Undo/redo breaks completely in collaborative mode
- Rewrite required: migrate from embedded docs → referenced collections with operation logs
- 3-6 month delay minimum

**Prevention:**
1. **Operation-based data model from M1:**
   ```typescript
   // WRONG (embedded, mutation-based)
   { nodes: [{ id, data }], edges: [...] }

   // RIGHT (operation log, CRDT-ready)
   {
     operations: [
       { type: 'node.create', nodeId, timestamp, userId, ... },
       { type: 'node.update', nodeId, field, value, version, ... }
     ]
   }
   ```

2. **Every mutation becomes an operation** - Even in M1 (non-collaborative), write operations to a log
3. **Use hybrid storage pattern** - Operation log in separate collection, computed state for queries
4. **Assign operation IDs (Lamport timestamps or vector clocks)** - Required for CRDT merge

**Detection (warning signs):**
- Data model uses MongoDB embedded documents with direct field updates
- No operation history or audit trail
- Graph state cannot be reconstructed from operations
- Undo implemented as simple stack (won't work collaboratively)

**Which phase:** M1 Foundation - Data model MUST be CRDT-compatible even though M3 adds real-time sync. Otherwise M3 = full rewrite.

**Confidence:** HIGH - Research confirms this is a rewrite-level mistake. CRDTs require operation-based architecture from the start.

---

### Pitfall 3: MongoDB Embedded Documents for Growing Graphs

**What goes wrong:** Storing entire graph as embedded `{nodes: [...], edges: [...]}` hits MongoDB's 16MB document limit. Apps crash when users create graphs with ~10,000 nodes or when operation history accumulates over months.

**Why it happens:** Embedded documents are simple and work great for small graphs. Developers don't realize limits until production graphs exceed thresholds.

**Consequences:**
- Hard 16MB limit - app crashes with "document too large" errors
- Query performance degrades exponentially as document grows (every graph query loads entire graph)
- Cannot query across graphs efficiently (e.g., "find all graphs containing node type X")
- Index efficiency drops as document size increases
- Requires migration to referenced collections under time pressure

**Prevention:**
1. **Hybrid storage pattern from M1:**
   ```typescript
   // Graph metadata (embedded doc, small)
   GraphDoc { id, userId, title, tags, createdAt }

   // Nodes (separate collection, referenced)
   NodeDoc { id, graphId, type, data, position, createdAt }

   // Edges (separate collection, referenced)
   EdgeDoc { id, graphId, sourceId, targetId, type, createdAt }

   // Operations (separate collection for CRDT)
   OperationDoc { id, graphId, type, payload, timestamp, userId }
   ```

2. **Set growth limits early** - If using embedded docs temporarily, enforce 1,000 node limit with clear migration warning
3. **Plan for sharding** - Reference pattern enables horizontal scaling when needed

**Detection (warning signs):**
- GraphDoc size > 1MB (you're at 6% of limit)
- Query time increases linearly with graph size
- MongoDB warnings about large documents
- Memory usage spikes when loading graphs

**Which phase:** M1 Foundation - Implement hybrid pattern from start. Migrating later = data migration hell with production users.

**Confidence:** HIGH - MongoDB documentation explicitly warns about embedded document limits for graph-like data.

---

### Pitfall 4: Tombstone Memory Bloat in CRDTs

**What goes wrong:** Naive CRDT implementations use tombstones (deletion markers) that accumulate forever. Apps using CRDTs for months see 2-5x memory bloat from deleted nodes never being garbage collected. Mobile apps crash from out-of-memory errors.

**Why it happens:** Basic CRDT tutorials show tombstone approach without explaining garbage collection complexity. Developers implement simple 2P-Set (add set + remove set) and ship it.

**Consequences:**
- Memory usage doubles after heavy edit sessions (many deletes)
- Mobile devices run out of memory with long-lived documents
- Sync payload size grows exponentially (sending all tombstones)
- Database storage costs increase 3-5x unnecessarily

**Prevention:**
1. **Use bitmap optimization for tombstones** - Represent removal set as bitmap corresponding to add set entries, use bitwise OR for merges
2. **Implement tombstone compaction** - After all clients acknowledge a version (via version vector), compact tombstones
3. **Prefer operation-based CRDTs over state-based** - Op-based avoid tombstones since concurrent add/remove operations are commutative
4. **Set retention policies** - E.g., compact tombstones older than 30 days after full sync
5. **Monitor tombstone ratio** - Alert when tombstones > 20% of active data

**Detection (warning signs):**
- Memory usage grows unbounded over document lifetime
- Sync payload size increases even without real changes
- Database shows many documents with `isDeleted: true`
- Tombstone count > active element count

**Which phase:** M3 Real-time Sync - When implementing CRDT, must include tombstone GC from Day 1 or face production memory issues.

**Confidence:** MEDIUM - Research confirms tombstone bloat is real, but solutions (bitmap optimization, compaction) are well-documented.

---

### Pitfall 5: Local Undo/Redo Not Designed for Collaboration

**What goes wrong:** Implementing undo/redo as simple stack works perfectly for single-user, then completely breaks in collaborative mode. Users undo others' edits, causing confusion and data loss.

**Why it happens:** Undo seems like a "basic feature" teams implement early without considering collaborative semantics. Standard undo stack (push operation, pop on undo) doesn't track authorship or handle concurrent edits.

**Consequences:**
- Users undo collaborators' work by accident
- Undo in collaborative session causes conflicts
- Redo breaks after concurrent edits
- User trust erodes ("I lost work when someone else edited")

**Prevention:**
1. **Implement per-user undo stacks from M1** - Each user's undo only affects their operations
   ```typescript
   // WRONG (global undo)
   undoStack: Operation[]

   // RIGHT (per-user undo)
   undoStacks: Map<userId, Operation[]>
   ```

2. **Operation-based undo semantics** - Undo by inverting specific operation, not rewinding global state
3. **Handle concurrent undo** - User A undoes their op while User B's concurrent op depends on it
4. **Test undo with concurrent edits** - Unit test: User A adds node, User B connects edge, User A undoes - edge should remain

**Detection (warning signs):**
- Undo implemented as single global stack
- Undo doesn't check operation authorship
- No tests for "undo during concurrent editing"
- Undo breaks after merge/sync

**Which phase:** M1 Foundation - Implement per-user undo stacks even before collaboration. Retrofitting = architectural change to operation tracking.

**Confidence:** HIGH - Research explicitly states "almost all collaboration software uses local undo" and global undo "often does not meet expectations."

---

## Moderate Pitfalls

These cause significant issues but are fixable without rewrites.

---

### Pitfall 6: Three.js → Skia Migration Performance Assumptions

**What goes wrong:** Assuming Skia automatically gives better performance than Three.js without profiling. Teams rewrite rendering layer, then discover performance regressions due to improper Skia usage (too many re-renders, non-memoized components).

**Why it happens:** Marketing claims "GPU rendering = faster" without context. Developers don't benchmark before/after or don't optimize for Skia's render model.

**Consequences:**
- Performance worse than Three.js implementation
- Wasted migration effort (2-4 weeks)
- Need to add memoization and optimization post-migration
- User complaints about "new version is slower"

**Prevention:**
1. **Benchmark current Three.js implementation** - Record FPS, memory usage, interaction latency with 100, 500, 1000 node graphs
2. **Create Skia prototype with real data** - Don't trust synthetic benchmarks
3. **Memoize Skia components from start** - Use `React.memo()` for graph elements
4. **Simplify complex paths/shaders** - Skia performance issues stem from overly complex drawings
5. **Profile on target devices** - Test on actual mid-range Android phones, not just dev machines

**Detection (warning signs):**
- Skia implementation slower than Three.js on same graph
- React DevTools shows many re-renders of graph components
- Draw calls per frame higher than expected
- Mobile FPS < 30 on graphs that worked in Three.js

**Which phase:** M1 Foundation - Run benchmarks before committing to Skia migration. If Three.js performs well enough, consider deferring.

**Confidence:** MEDIUM - Skia generally provides better performance, but improper usage can negate benefits. Requires profiling.

---

### Pitfall 7: Offline-First Sync Without Conflict Metadata

**What goes wrong:** Implementing offline-first with automatic Last-Write-Wins conflict resolution. Works fine until users report "my changes disappeared" when syncing after offline editing.

**Why it happens:** Last-Write-Wins is simplest to implement. Developers don't surface conflicts to users or implement custom merge strategies.

**Consequences:**
- Silent data loss during offline sync
- User confusion ("where did my edits go?")
- Trust erosion in offline capabilities
- Support burden from conflict reports

**Prevention:**
1. **Detect conflicts, don't auto-resolve blindly:**
   ```typescript
   // WRONG
   if (remoteTimestamp > localTimestamp) applyRemote()

   // RIGHT
   if (detectConflict(local, remote)) {
     showConflictUI({ local, remote, mergeOptions })
   }
   ```

2. **Surface conflict metadata to users** - Show "Your version" vs "Server version" with merge UI
3. **Implement field-level CRDTs** - Auto-merge non-conflicting fields, only surface genuine conflicts
4. **State snapshots for long partitions** - After prolonged offline (> 1 week), offer "pull fresh baseline then apply your changes"

**Detection (warning signs):**
- User reports of lost changes after sync
- No conflict UI or conflict logs
- All conflicts resolved with LWW
- No testing of "offline for 3 days then sync" scenarios

**Which phase:** M3 Real-time Sync - Must implement conflict detection/UI from start of sync feature.

**Confidence:** MEDIUM - Offline-first architecture guides confirm this pattern. Severity depends on usage (solo users vs teams).

---

### Pitfall 8: MongoDB Graph Traversal Performance

**What goes wrong:** Using MongoDB's `$graphLookup` for multi-level graph traversal (e.g., "find all descendants of node X"). Performance acceptable for depth 2-3, becomes unusable at depth 5+ or with large graphs.

**Why it happens:** `$graphLookup` seems like the right tool for graph queries. Documentation doesn't emphasize performance limitations compared to native graph databases.

**Consequences:**
- Query timeout errors for deep traversals
- UI hangs when loading subgraph views
- Cannot support features like "expand all children recursively"
- Eventual need to add Redis cache or migrate to Neo4j for graph queries

**Prevention:**
1. **Limit traversal depth** - UI enforces max depth 3-4 for expansion
2. **Pre-compute common traversals** - Store materialized paths or adjacency lists for frequent queries
3. **Use client-side traversal for loaded graphs** - Once graph is in memory, traverse locally with BFS/DFS
4. **Set query timeouts** - Fail fast with "graph too complex" rather than hang
5. **Monitor query performance** - Alert when graph queries > 500ms

**Detection (warning signs):**
- `$graphLookup` queries > 1 second
- Query time increases exponentially with depth
- MongoDB CPU spikes during graph operations
- Users report "loading forever" on graph expansion

**Which phase:** M2 Forking/Merging - When implementing subgraph operations, test with real-world graph sizes. Add depth limits if needed.

**Confidence:** HIGH - Research explicitly states MongoDB "lacks the optimizations for graph operations" compared to native graph databases.

---

### Pitfall 9: Fastify WebSocket Error Handling Gaps

**What goes wrong:** Fastify's `@fastify/websocket` plugin doesn't trigger standard error handlers (`onError` hook, `setErrorHandler`) for WebSocket errors. Unhandled exceptions in message handlers crash the server or leave connections in broken state.

**Why it happens:** Developers assume Fastify's error handling works uniformly across HTTP and WebSocket. Documentation warns about this but easy to miss.

**Consequences:**
- Server crashes on WebSocket errors
- Zombie connections remain open, consuming resources
- No error logging for sync failures
- Difficult to debug production sync issues

**Prevention:**
1. **Wrap all WebSocket handlers in try/catch:**
   ```typescript
   connection.socket.on('message', async (data) => {
     try {
       await handleMessage(data)
     } catch (err) {
       logger.error({ err, data }, 'WebSocket message error')
       connection.socket.send(JSON.stringify({ error: 'Internal error' }))
     }
   })
   ```

2. **Implement WebSocket-specific error handler** - Centralize error handling for all WS routes
3. **Add connection health checks** - Ping/pong to detect dead connections
4. **Monitor WebSocket connection count** - Alert on connection leaks

**Detection (warning signs):**
- Server crashes with WebSocket-related errors
- Errors in WebSocket handlers not appearing in logs
- WebSocket connection count grows unbounded
- Users report "stuck loading" in real-time features

**Which phase:** M3 Real-time Sync - When implementing WebSocket support, must add custom error handling from Day 1.

**Confidence:** HIGH - Official Fastify documentation explicitly states this limitation.

---

### Pitfall 10: Expo/EAS Build Environment Mismatches

**What goes wrong:** App works perfectly in development and `expo start`, then crashes immediately on production build (EAS Build). Errors don't appear in dev mode because production enables minification, strips dev checks, and uses different bundler config.

**Why it happens:** Teams don't test production builds locally before EAS Build. Environment variables, native module configurations, or runtime checks behave differently in production.

**Consequences:**
- Failed app store submissions
- Users download broken builds
- Long debug cycles (EAS build takes 10-20 minutes vs instant local dev)
- Missed launch deadlines

**Prevention:**
1. **Test production builds locally before EAS:**
   ```bash
   npx expo start --no-dev --minify
   npx expo run:ios --configuration Release
   npx expo run:android --variant release
   ```

2. **Match environment variables** - Ensure EAS Build has same env vars as local `.env`
3. **Fresh clone test** - Periodically `git clone` to new directory and verify build works without your local config
4. **Automated build checks** - CI runs production build validation before merge
5. **Let EAS manage credentials** - Auto-managed credentials eliminate signing issues

**Detection (warning signs):**
- App crashes on splash screen in production build
- "Works on my machine" but not in EAS Build
- Environment variable undefined errors in production
- OTA updates cause crashes (native/JS version mismatch)

**Which phase:** M1 Foundation - Set up production build testing in CI from start. Don't wait until first app store submission.

**Confidence:** HIGH - Official Expo documentation emphasizes this pattern. Common pitfall.

---

## Minor Pitfalls

These cause annoyance or require workarounds but are easily addressed.

---

### Pitfall 11: High-DPI Display Canvas Blurriness

**What goes wrong:** Canvas-rendered graphs look blurry on Retina/high-DPI displays. Text and edges appear pixelated.

**Why it happens:** Canvas defaults to 1:1 pixel ratio. Must manually scale for device pixel ratio.

**Prevention:**
```typescript
const dpr = window.devicePixelRatio || 1
canvas.width = logicalWidth * dpr
canvas.height = logicalHeight * dpr
canvas.style.width = `${logicalWidth}px`
canvas.style.height = `${logicalHeight}px`
ctx.scale(dpr, dpr)
```

**Which phase:** M1 Foundation - Add during initial Skia rendering implementation.

**Confidence:** HIGH - Well-documented canvas rendering requirement.

---

### Pitfall 12: Color-Only Graph Encoding

**What goes wrong:** Using only color to distinguish node types or edge relationships. ~8% of users (color blind) cannot use the product.

**Why it happens:** Color is easy and looks good in demos. Teams forget accessibility.

**Prevention:**
- Add shapes (circle, square, triangle) for node types
- Add patterns (solid, dashed, dotted) for edge types
- Include text labels
- Test with color blindness simulator

**Which phase:** M1 Foundation - Design graph visualization with shape + color from start.

**Confidence:** HIGH - Standard accessibility requirement, confirmed by UX research.

---

### Pitfall 13: Overlapping Node Labels

**What goes wrong:** As graph density increases, node labels overlap and become unreadable. Users zoom in/out constantly trying to read text.

**Prevention:**
- Smart label truncation with tooltips on hover
- Hide labels at low zoom levels, show on zoom-in
- Label collision detection with auto-repositioning
- Semantic zoom (show more detail at higher zoom)

**Which phase:** M1 Foundation - Implement label truncation and tooltips from start. Collision detection can be M2.

**Confidence:** MEDIUM - Common UX issue in graph visualization, multiple sources confirm.

---

### Pitfall 14: Unfamiliar Interaction Patterns

**What goes wrong:** Implementing custom gestures that conflict with platform conventions (e.g., pinch-to-zoom does something unexpected). Users struggle to navigate graph.

**Prevention:**
- Follow platform conventions: pinch-zoom, pan-drag, double-tap-zoom
- Add onboarding tooltip overlay on first use
- Include help/tutorial accessible from settings
- User test with people unfamiliar with graph editors

**Which phase:** M1 Foundation - Use standard gesture library (Skia gesture handlers). Add onboarding in M2.

**Confidence:** MEDIUM - UX best practice from graph visualization research.

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation Strategy |
|-------|-------|---------------|---------------------|
| M1 Foundation | Skia Rendering | Naive full-canvas redraws | Implement viewport culling + dirty flags from Day 1 |
| M1 Foundation | Data Model | Embedded documents hit 16MB limit | Use hybrid pattern: metadata embedded, nodes/edges/operations in separate collections |
| M1 Foundation | Architecture | Direct mutations incompatible with future CRDT | Design operation-based data model now, even before collaboration |
| M1 Foundation | Undo/Redo | Global undo stack breaks in collaboration | Implement per-user undo stacks from start |
| M1 Foundation | Production Builds | App works in dev, crashes in production | Test `--no-dev --minify` builds locally before EAS |
| M2 Forking/Merge | Graph Traversal | MongoDB `$graphLookup` too slow for deep graphs | Add depth limits, pre-compute common queries, use client-side traversal |
| M3 Real-time Sync | CRDT Implementation | Tombstone memory bloat after months of use | Implement tombstone compaction with version vectors |
| M3 Real-time Sync | WebSocket Errors | Fastify WS errors don't trigger standard handlers | Wrap all message handlers in try/catch with custom error handling |
| M3 Real-time Sync | Offline Sync | Last-Write-Wins causes silent data loss | Implement conflict detection UI + field-level CRDT merging |
| M3 Real-time Sync | Latency Handling | Network jitter breaks real-time collaboration UX | Target < 200ms sync latency, implement optimistic updates, show presence indicators |

---

## Research Methodology & Confidence

### Sources Used

**High Confidence (Official Documentation & Research Papers):**
- MongoDB official limits documentation - Document size, embedded vs referenced patterns
- Expo official troubleshooting documentation - Production build failures
- Fastify WebSocket plugin documentation - Error handling limitations
- Academic research on CRDT undo/redo semantics

**Medium Confidence (Industry Best Practices 2026):**
- Multiple graph visualization performance articles (yFiles, PixiJS, Cambridge Intelligence)
- Real-time collaboration architecture guides
- React Native Skia performance analysis
- Offline-first sync pattern documentation

**Low Confidence (Single Source or Unverified):**
- None - all findings verified with multiple sources or official documentation

### Verification Approach

Each pitfall required:
1. Confirmation from official documentation OR
2. Agreement across 3+ independent sources OR
3. Direct relevance to your tech stack (Fastify, Expo, MongoDB, Skia)

### Gaps to Address

Areas where research was inconclusive or needs phase-specific investigation:

1. **Specific graph layout algorithm performance** - Research focused on rendering, not layout algorithms (force-directed, hierarchical). May need M1 research on layout performance.

2. **Mobile battery impact of WebSocket connections** - Limited research on battery drain from persistent WS connections. May need M3 testing on real devices.

3. **CRDT library selection** - Research covered CRDT concepts, not specific library comparisons (Yjs, Automerge, custom). M3 may need deeper comparison research.

4. **Skia on web (CanvasKit) performance** - Research focused on mobile. Web/PWA performance with Skia needs M1 verification.

---

## Sources

**Canvas Rendering & Performance:**
- [Optimising HTML5 Canvas Rendering: Best Practices and Techniques](https://blog.ag-grid.com/optimising-html5-canvas-rendering-best-practices-and-techniques/)
- [Comparing Rendering Performance of Common Web Technologies for Large Graphs](https://imld.de/cnt/uploads/Horak-2018-Graph-Performance.pdf)
- [Graph visualization efficiency of popular web-based libraries](https://pmc.ncbi.nlm.nih.gov/articles/PMC12061801/)
- [Optimizing canvas - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)

**CRDT & Collaborative Editing:**
- [Building real-time collaboration applications: OT vs CRDT](https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/)
- [Real Differences between OT and CRDT for Co-Editors](https://arxiv.org/pdf/1810.02137)
- [Conflict Resolution in Real-Time Collaborative Editing](https://tryhoverify.com/blog/conflict-resolution-in-real-time-collaborative-editing/)
- [How CRDTs make multiplayer text editing part of Zed's DNA](https://zed.dev/blog/crdts)

**CRDT Undo/Redo:**
- [A CRDT Supporting Selective Undo for Collaborative Text Editing](https://members.loria.fr/CIgnat/files/pdf/YuDAIS15.pdf)
- [Undo and Redo Support for Replicated Registers](https://arxiv.org/html/2404.11308v1)

**CRDT Tombstone Management:**
- [Implementing a Garbage-Collected Graph CRDT](https://decomposition.al/CMPS290S-2018-09/2018/11/12/implementing-a-garbage-collected-graph-crdt-part-1-of-2.html)
- [Conflict-free replicated data type - Wikipedia](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)

**React Native Skia:**
- [React Native Skia: GPU-Powered Graphics for Mobile Apps](https://variantsystems.io/blog/react-native-skia)
- [Using React Native Skia to Build a 60 FPS Free-hand Drawing App](https://blog.notesnook.com/drawing-app-with-react-native-skia/)
- [Create high-performance graphics with React Native Skia](https://blog.logrocket.com/create-high-performance-graphics-react-native-skia/)

**MongoDB Graph Storage:**
- [Cost Optimization with Optimal Document Size - MongoDB](https://www.mongodb.com/company/blog/technical/cost-optimization-with-optimal-document-size)
- [MongoDB Limits and Thresholds](https://www.mongodb.com/docs/manual/reference/limits/)
- [Using MongoDB As Graph Database: Use Cases](https://www.mongodb.com/resources/basics/databases/mongodb-graph-database)
- [The MongoDB Dilemma: Embedded Documents vs. Referenced Collections](https://medium.com/@dasbabai2017/the-mongodb-dilemma-embedded-documents-vs-referenced-collections-plus-when-redis-saves-the-day-295e9b2e0e8c)

**MongoDB vs Neo4j Graph Performance:**
- [MongoDB vs Neo4j: Key Differences Explained](https://www.puppygraph.com/blog/mongodb-vs-neo4j)
- [Neo4J vs MongoDB for GraphRAG](https://prism14.com/neo4j-vs-mongodb-for-graphrag-what-you-need-to-know/)

**Three.js Migration:**
- [100 Three.js Tips That Actually Improve Performance (2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
- [What Changed in Three.js 2026? WebGPU, Vibe Coding & Beyond](https://www.utsubo.com/blog/threejs-2026-what-changed)

**Offline-First Sync:**
- [Offline sync & conflict resolution patterns — Architecture & Trade-offs](https://www.sachith.co.uk/offline-sync-conflict-resolution-patterns-architecture-trade%E2%80%91offs-practical-guide-feb-19-2026/)
- [5 critical components for implementing a successful offline-first strategy in mobile applications](https://medium.com/@therahulpahuja/5-critical-components-for-implementing-a-successful-offline-first-strategy-in-mobile-applications-849a6e1c5d57)
- [Advanced Syncing Algorithms for Collaborative Mobile Apps in 2026](https://dev.to/devin-rosario/advanced-syncing-algorithms-for-collaborative-mobile-apps-in-2026-1a60)

**Expo Production Issues:**
- [Troubleshoot build errors and crashes - Expo Documentation](https://docs.expo.dev/build-reference/troubleshooting/)
- [Common development errors - Expo Documentation](https://docs.expo.dev/workflow/common-development-errors/)
- [From Build to App Store: Deploying React Native Apps with EAS in 2026](https://reactnativerelay.com/article/from-build-to-app-store-complete-guide-deploying-react-native-apps-eas-2026)

**Fastify WebSocket:**
- [Getting Started with Fastify WebSockets](https://betterstack.com/community/guides/scaling-nodejs/fastify-websockets/)
- [Using WebSockets with Fastify](https://blog.logrocket.com/using-websockets-with-fastify/)
- [GitHub - fastify/fastify-websocket](https://github.com/fastify/fastify-websocket)

**Real-Time Latency & Jitter:**
- [Building Real-Time Collaborative Applications: A Deep Dive into WebRTC, WebSockets, and Conflict Resolution](https://medium.com/@himansusaha/building-real-time-collaborative-applications-a-deep-dive-into-webrtc-websockets-and-conflict-9eb75800e221)
- [Jitter vs Latency: Key Differences to Know in 2026?](https://www.galactis.ai/resources/blog/jitter-vs-latency-key-differences-to-know-in-2026)

**Viewport Culling & Large Graphs:**
- [Performance recommendation: use canvas renderer on low zoom for better performance on graphs with 100+ nodes](https://github.com/xyflow/xyflow/issues/5442)
- [Lesson 8 - Optimize performance - An infinite canvas tutorial](https://infinitecanvas.cc/guide/lesson-008)

**Graph Visualization UX:**
- [Graph visualization UX: Designing intuitive data experiences](https://cambridge-intelligence.com/graph-visualization-ux-how-to-avoid-wrecking-your-graph-visualization/)
- [Bad Data Visualization Examples (and How to Fix Them)](https://www.eleken.co/blog-posts/bad-data-visualization-examples)
- [The Intersection of Data Visualization and UX Design](https://www.uxmatters.com/mt/archives/2023/03/the-intersection-of-data-visualization-and-ux-design.php)
