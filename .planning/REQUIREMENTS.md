# Requirements: Solve

**Defined:** 2026-03-01
**Core Value:** Users can visually decompose complex problems and collaborate to solve them

## v1 Requirements

Requirements for M1: Foundation. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: TypeScript Fastify server with structured error handling and logging
- [ ] **INFRA-02**: MongoDB connection with hybrid storage pattern (metadata embedded, nodes/edges in separate collections)
- [ ] **INFRA-03**: Operation-based data model designed for future CRDT compatibility
- [ ] **INFRA-04**: Local development works with local MongoDB instance
- [ ] **INFRA-05**: Deployment to Vercel (or similar) working
- [ ] **INFRA-06**: Shared TypeScript types across packages (@solve/common)

### Authentication

- [ ] **AUTH-01**: User can register with email and password
- [ ] **AUTH-02**: User can log in with email and password
- [ ] **AUTH-03**: User can log in with Google OAuth
- [ ] **AUTH-04**: JWT access + refresh token flow works correctly
- [ ] **AUTH-05**: User can view and update their profile
- [ ] **AUTH-06**: User session persists across app restarts

### Graph API

- [ ] **GAPI-01**: User can create a new graph
- [ ] **GAPI-02**: User can retrieve their graphs (list)
- [ ] **GAPI-03**: User can retrieve a single graph with all nodes and edges
- [ ] **GAPI-04**: User can update graph metadata (name, tags)
- [ ] **GAPI-05**: User can delete a graph
- [ ] **GAPI-06**: User can create nodes within a graph
- [ ] **GAPI-07**: User can update node data and position
- [ ] **GAPI-08**: User can delete nodes (cascades to connected edges)
- [ ] **GAPI-09**: User can create edges between nodes
- [ ] **GAPI-10**: User can delete edges
- [ ] **GAPI-11**: Graph validation prevents orphan edges and invalid references

### Client Foundation

- [ ] **CLNT-01**: Expo SDK 55 + React Native project with latest best practices
- [ ] **CLNT-02**: Navigation structure (auth flow, main app, graph editor)
- [ ] **CLNT-03**: Login screen with email/password and Google OAuth
- [ ] **CLNT-04**: Registration screen with email/password
- [ ] **CLNT-05**: Profile screen with user info
- [ ] **CLNT-06**: Graph list screen showing user's graphs
- [ ] **CLNT-07**: User journey tests with Jest + React Native Testing Library

### Graph Rendering (Skia)

- [ ] **RNDR-01**: Skia canvas renders nodes and edges
- [ ] **RNDR-02**: Infinite canvas with transform matrix (not moving individual items)
- [ ] **RNDR-03**: Pan gesture moves viewport smoothly (60fps)
- [ ] **RNDR-04**: Pinch-to-zoom works smoothly (60fps)
- [ ] **RNDR-05**: Viewport culling only renders visible nodes/edges
- [ ] **RNDR-06**: Spatial indexing with d3-quadtree for viewport culling
- [ ] **RNDR-07**: Hit testing uses spatial index for tap detection
- [ ] **RNDR-08**: Edge snapping uses spatial index for nearest-node queries

### Graph Editing

- [ ] **EDIT-01**: User can create a node by tapping on canvas
- [ ] **EDIT-02**: User can select a node by tapping on it
- [ ] **EDIT-03**: User can move selected node by dragging
- [ ] **EDIT-04**: User can create an edge by dragging from one node to another
- [ ] **EDIT-05**: User can delete selected node (with confirmation)
- [ ] **EDIT-06**: User can delete selected edge
- [ ] **EDIT-07**: Per-user undo stack tracks operations
- [ ] **EDIT-08**: User can undo last operation
- [ ] **EDIT-09**: User can redo undone operation
- [ ] **EDIT-10**: Changes persist to backend on save

### Developer Experience

- [ ] **DX-01**: oxlint configured for all packages
- [ ] **DX-02**: oxfmt configured for all packages
- [ ] **DX-03**: Monorepo uses npm workspaces with shared configs
- [ ] **DX-04**: Shared tsconfig.json base across packages
- [ ] **DX-05**: Import aliasing convention enforced (descriptive names for libraries)
- [ ] **DX-06**: CI runs lint, format check, and tests on PR

## v2 Requirements

Deferred to future milestones. Tracked but not in M1 roadmap.

### Background Jobs (M2)

- **JOBS-01**: Redis + BullMQ infrastructure
- **JOBS-02**: Auto-save queues graph changes periodically
- **JOBS-03**: Snapshot creation for graph history

### Collaboration (M2)

- **COLLAB-01**: User can fork a graph
- **COLLAB-02**: User can fork a subgraph (selected nodes)
- **COLLAB-03**: User can create a proposal (PR) from forked graph
- **COLLAB-04**: Owner can view proposals on their graph
- **COLLAB-05**: Owner can merge a proposal
- **COLLAB-06**: Visual diff shows changes between graphs

### Real-time Sync (M3)

- **SYNC-01**: WebSocket connection established on graph open
- **SYNC-02**: Multiple users see each other's cursors
- **SYNC-03**: Changes sync in real-time via CRDT (Yjs)
- **SYNC-04**: Offline changes sync when connection restored
- **SYNC-05**: Conflict resolution handles concurrent edits

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Facebook OAuth | Low value, adds complexity |
| Real-time sync | M3 — design for it in M1, build later |
| Community/marketplace | M4 — need core product first |
| Document attachments | M5 — images/files on nodes deferred |
| Admin panel | M5 — after core features stable |
| Promo website | M5 — marketing after product works |
| Mobile push notifications | Post-MVP |
| Paid expert solutions | Post-MVP |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (To be filled by roadmapper) | | |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 0
- Unmapped: 43 ⚠️

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after initial definition*
