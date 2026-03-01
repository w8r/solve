# Roadmap: Solve

## Overview

Solve rebuilds from a clean foundation to become a high-performance visual problem-solving app. This roadmap delivers M1 Foundation: a mobile-first collaborative graph editor with GitHub-style workflows. Eight phases transform 43 requirements into a shipped product - moving legacy code to safety, establishing operation-based architecture for future CRDT compatibility, building authentication and graph CRUD APIs, setting up a universal design system with Tamagui, creating a React Native client that runs on iOS/Android/web, adding GPU-accelerated Skia rendering with web support, and enabling natural graph editing with per-user undo stacks. Every architectural decision prepares for M2 forking/merging and M3 real-time collaboration without requiring rewrites.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Setup** - Project scaffolding, legacy preservation, CI/CD, monorepo
- [ ] **Phase 2: Backend Infrastructure** - Fastify server, MongoDB hybrid storage, operation model
- [ ] **Phase 3: Authentication** - Local + Google OAuth, JWT tokens, user profiles
- [ ] **Phase 4: Graph API** - Complete graph CRUD with validation and operation tracking
- [ ] **Phase 5: Design System** - Tamagui setup, design tokens, color palette, typography, base components
- [ ] **Phase 6: Client Foundation** - Expo SDK 55 app with iOS/Android/web support, navigation, auth screens
- [ ] **Phase 7: Skia Rendering** - GPU canvas with viewport culling, spatial indexing, web CanvasKit support
- [ ] **Phase 8: Graph Editing** - Interactive editing, per-user undo, backend persistence

## Phase Details

### Phase 1: Foundation & Setup
**Goal**: Clean project foundation with modern tooling, CI/CD, and legacy code preserved
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-04, INFRA-06, DX-01, DX-02, DX-03, DX-04, DX-05, DX-06
**Success Criteria** (what must be TRUE):
  1. Legacy code from packages/server, packages/client, packages/api moved to /legacy directory
  2. Monorepo structure works with npm workspaces and shared @solve/common package
  3. Developer can run npm install and start local development with local MongoDB
  4. GitHub Actions CI runs lint, format check, and tests on every PR
  5. All packages use oxlint and oxfmt with consistent formatting
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Backend Infrastructure
**Goal**: TypeScript Fastify server with hybrid MongoDB storage and operation-based data model
**Depends on**: Phase 1
**Requirements**: INFRA-02, INFRA-03, INFRA-05
**Success Criteria** (what must be TRUE):
  1. Fastify server starts and responds to health check endpoint
  2. MongoDB connection works with separate collections for graphs, nodes, edges, operations
  3. Structured logging with Pino captures context objects for all requests
  4. Backend deployed to Vercel and accessible via HTTPS
  5. All graph mutations create operation log entries for future CRDT compatibility
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Authentication
**Goal**: Users can register and authenticate with email/password or Google OAuth
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. User can register new account with email and password
  2. User can log in with existing email/password credentials
  3. User can log in with Google OAuth (redirects to Google, returns with token)
  4. JWT access and refresh tokens work correctly with automatic renewal
  5. User can view and update their profile information
  6. User session persists across app restarts
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Graph API
**Goal**: Complete backend API for graph creation, retrieval, and modification with validation
**Depends on**: Phase 3
**Requirements**: GAPI-01, GAPI-02, GAPI-03, GAPI-04, GAPI-05, GAPI-06, GAPI-07, GAPI-08, GAPI-09, GAPI-10, GAPI-11
**Success Criteria** (what must be TRUE):
  1. User can create a new graph and retrieve it by ID
  2. User can list all their graphs with pagination
  3. User can update graph metadata (name, tags) and delete graphs they own
  4. User can create, update, move, and delete nodes within their graphs
  5. User can create and delete edges between nodes
  6. Graph validation prevents orphan edges and invalid node references
  7. All mutations are tracked as operations in the operations collection
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Design System
**Goal**: Universal design system with Tamagui providing consistent styling across iOS, Android, and web
**Depends on**: Phase 4
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05
**Success Criteria** (what must be TRUE):
  1. Tamagui configured and working for React Native and web targets
  2. Color palette defined with light/dark theme support (primary, secondary, accent, neutrals)
  3. Typography scale established with font families and sizes
  4. Design tokens created for spacing, radii, shadows, and breakpoints
  5. Base component library includes styled buttons, inputs, and cards that work on all platforms
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Client Foundation
**Goal**: React Native Expo app with navigation and authentication screens running on iOS, Android, and web
**Depends on**: Phase 5
**Requirements**: CLNT-01, CLNT-02, CLNT-03, CLNT-04, CLNT-05, CLNT-06, CLNT-07
**Success Criteria** (what must be TRUE):
  1. Expo SDK 55 project builds and runs on iOS, Android, and web (PWA)
  2. Navigation flows correctly between auth screens (login, register) and main app
  3. Login screen works with email/password and Google OAuth button
  4. Registration screen creates new accounts
  5. Profile screen displays user info and allows edits
  6. Graph list screen shows user's graphs from backend API
  7. Jest tests cover user journeys (register, login, view graphs)
  8. All screens use design system components from Phase 5
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Skia Rendering
**Goal**: GPU-accelerated infinite canvas with viewport culling, spatial indexing, and web browser support
**Depends on**: Phase 6
**Requirements**: RNDR-01, RNDR-02, RNDR-03, RNDR-04, RNDR-05, RNDR-06, RNDR-07, RNDR-08
**Success Criteria** (what must be TRUE):
  1. Skia canvas renders nodes as circles and edges as lines at 60 FPS on mobile
  2. Pan gesture moves viewport smoothly using transform matrix (not repositioning items)
  3. Pinch-to-zoom works smoothly with scale constraints (min 0.1x, max 10x)
  4. Viewport culling only renders nodes/edges visible in current viewport plus buffer
  5. d3-quadtree spatial index enables fast hit testing for taps
  6. Edge snapping uses spatial index to find nearest node during drag
  7. Canvas handles 500+ nodes without frame drops
  8. Skia CanvasKit works in browser with 60fps performance for pan/zoom on web
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: Graph Editing
**Goal**: Full interactive graph editing with undo/redo and backend persistence
**Depends on**: Phase 7
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, EDIT-06, EDIT-07, EDIT-08, EDIT-09, EDIT-10
**Success Criteria** (what must be TRUE):
  1. User can tap empty canvas area to create a new node
  2. User can tap a node to select it (shows selection highlight)
  3. User can drag selected node to move it to new position
  4. User can drag from one node to another to create an edge
  5. User can delete selected node or edge with confirmation dialog
  6. User can undo their last operation (per-user undo stack)
  7. User can redo an undone operation
  8. Changes persist to backend on save and reload correctly on app restart
  9. All editing operations create entries in the operations log
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD
- [ ] 08-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Setup | 0/? | Not started | - |
| 2. Backend Infrastructure | 0/? | Not started | - |
| 3. Authentication | 0/? | Not started | - |
| 4. Graph API | 0/? | Not started | - |
| 5. Design System | 0/? | Not started | - |
| 6. Client Foundation | 0/? | Not started | - |
| 7. Skia Rendering | 0/? | Not started | - |
| 8. Graph Editing | 0/? | Not started | - |

---
*Roadmap created: 2026-03-01*
*Last updated: 2026-03-01*
