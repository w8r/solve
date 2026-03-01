# Solve

## What This Is

Solve is a visual problem-solving app for when text doesn't work. Users break down complex problems into graphs — nodes representing sub-problems, edges representing relationships — then solve them collaboratively through a GitHub-style workflow (fork, propose, merge). Built for solo thinkers and small teams (2-5 people), with a future vision of expert communities and a problem-solving marketplace.

## Core Value

Users can visually decompose any complex problem into manageable pieces and collaborate with others to solve it — fast, naturally, and beautifully.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**M1: Foundation (current focus)**
- [ ] Backend rewritten in TypeScript with proper types shared across packages
- [ ] Backend has comprehensive test coverage
- [ ] Backend deployed and working (Vercel or similar)
- [ ] Local development with local MongoDB works
- [ ] Client rebuilt with latest Expo + best practices
- [ ] Client uses Skia for graph rendering (replaces Three.js)
- [ ] Auth works (local email/password + Google OAuth)
- [ ] User can view their graphs
- [ ] User can create graphs (nodes + edges)
- [ ] User can save graphs to backend and load them back
- [ ] Architecture supports future real-time sync (WebSockets, CRDT-friendly data model)

### Out of Scope

- Facebook OAuth — low value, complexity not worth it
- Real-time sync — M3, design for it now but build later
- Forking/proposals/merging — M2
- Community/marketplace — M4
- Document attachments on nodes — M5
- Admin panel — M5
- Promo website — M5
- Paid expert solutions — post-MVP

## Context

### Existing Codebase
This is a brownfield project with ~3 years of existing code:

- **packages/server/** — Legacy JavaScript Express backend. Auth works (local + Google + Facebook). Graph CRUD works. PR merging and graph queries are messy. Types not shared.
- **packages/client/** — React Native + Expo frontend. Has rendering (Three.js), panning, zooming, CRUD, selection, forking, proposals, previews, merging. UI is terrible. Outdated.
- **packages/api/** — New TypeScript Fastify backend (partially implemented — auth controller exists)
- **packages/presentation/** — Slidev promo deck
- **packages/common/** — Shared types (incomplete)

### Current Graph Data Model
```
Graph → { nodes: [Vertex], edges: [Edge], user, tags, publicId, revisions }
Vertex → { id, data: {}, attributes: {} }
Edge → { id, source, target, data: {}, attributes: {} }
```
Embedded documents approach — works for small graphs, has scaling limits (16MB doc limit, can't query across graphs efficiently).

### Infrastructure
- MongoDB Atlas — alive, working
- Web deployment — dead (hosting company closed)
- No CI/CD currently

### Core Workflows (to be rebuilt)
1. **Create mode** — Fast, natural mind mapping. Classify problems, draw connections.
2. **Solve mode** — GitHub for graphs. Fork subgraph → work on it → submit PR → owner merges.
3. **Community mode** (future) — Post problems to community, experts pick up and solve, potentially paid.

## Constraints

- **Tech stack (backend)**: TypeScript, Fastify, MongoDB, Vitest — already decided per CLAUDE.md
- **Tech stack (frontend)**: React Native, Expo, Skia, TypeScript — Skia is non-negotiable for the feel
- **Deployment (web)**: Vercel + PWA
- **Deployment (mobile)**: EAS (Expo Application Services)
- **CI/CD**: GitHub Actions
- **Real-time architecture**: Must design for CRDTs and WebSockets from M1, even if not building sync yet

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Skia over Three.js | Animations and feel are core to product experience | — Pending |
| Fastify over Express | 3x performance, better TS support, plugin architecture | — Pending |
| EAS for mobile builds | Official Expo build service, handles signing | — Pending |
| CRDT-friendly data model | Enables real-time sync without rewrite | — Pending |
| Drop Facebook OAuth | Low value, adds complexity | — Pending |
| Embedded → hybrid graph model | Need to research efficient MongoDB graph patterns | — Pending |

---
*Last updated: 2026-03-01 after initialization*
