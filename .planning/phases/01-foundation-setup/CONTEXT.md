# Phase 1: Foundation & Setup — Context

## Decisions Captured

| Decision              | Choice                         | Rationale                                                            |
| --------------------- | ------------------------------ | -------------------------------------------------------------------- |
| Package manager       | npm workspaces                 | Simpler, better compatibility, matches requirements                  |
| Node.js version       | 22 LTS                         | Latest LTS with native test runner, fetch, better ESM support        |
| packages/api handling | Keep and build on it           | Existing TS code follows good patterns, add package.json             |
| oxlint strictness     | Balanced                       | Correctness + suspicious categories, catches real bugs without noise |
| Branch naming         | Keep master                    | Avoid webhook/integration issues                                     |
| @solve/common scope   | Types + constants + algorithms | Full shared package from start                                       |

## Current State Analysis

### Package Manager

- **Current**: Yarn 3.2.0 with yarn.lock
- **Action**: Remove yarn.lock, .yarnrc.yml, generate package-lock.json
- **Root package.json**: Update scripts from `yarn workspace` to `npm run -w`

### Node Version

- **Current**: 16.4.2 in engines field
- **Action**: Update all package.json engines to `"node": ">=22.0.0"`
- **GitHub Actions**: Use `node-version: '22'`

### packages/api

- **Current**: Has src/ with controllers, services, middleware, schemas (TypeScript)
- **Missing**: package.json, tsconfig.json
- **Action**: Create package.json for @solve/api, add to workspaces

### Legacy Code Movement

Move to `/legacy/` directory (outside packages):

- `packages/server/` → `legacy/server/`
- `packages/client/` → `legacy/client/`
- `packages/presentation/` → `legacy/presentation/`

Keep in place:

- `packages/api/` (keep and enhance)
- `packages/common/` (rebuild with new structure)

### GitHub Actions

- **Current**: deployment.yml deploys to Surge (dead) + Deta (dead)
- **Action**: Replace with CI workflow that runs on PR:
  - Lint with oxlint
  - Format check with oxfmt
  - Run tests (when added)
- **Branch**: Trigger on push to master and PRs

### Root tsconfig

- **Current**: Extends expo/tsconfig.base (client-specific)
- **Action**: Create shared base tsconfig.base.json with:
  - target: ES2022
  - module: NodeNext (for API) / ESNext (for client)
  - strict: true
  - Each package extends base with own settings

### oxlint Configuration

- **Current**: None
- **Action**: Create oxlint.json at root with balanced rules:
  - Enable: correctness, suspicious
  - Disable: pedantic, style (let oxfmt handle formatting)

### oxfmt Configuration

- **Current**: None
- **Action**: Use default oxfmt settings (no config file needed)
- Run via: `npx oxlint --format`

### @solve/common Structure

```
packages/common/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           # Re-exports all
│   ├── types/
│   │   ├── index.ts
│   │   ├── user.ts        # IUser, IUserProfile
│   │   ├── graph.ts       # IGraph, INode, IEdge
│   │   ├── operation.ts   # IOperation, OperationType
│   │   └── revision.ts    # IRevision, RevisionStatus
│   ├── constants/
│   │   ├── index.ts
│   │   ├── permissions.ts
│   │   ├── operations.ts
│   │   └── statuses.ts
│   └── algorithms/
│       ├── index.ts
│       ├── traversal.ts   # DFS, BFS
│       ├── validation.ts  # Graph validation
│       └── dependencies.ts # Dependency checking
└── dist/                  # Compiled output
```

## Import Aliasing Convention

Per user requirement, libraries with non-descriptive names should be imported with aliases:

```typescript
// Examples of aliased imports
import { z as Schema } from "zod";
import { ObjectId as MongoId } from "mongodb";

// Clear names don't need aliasing
import fastify from "fastify";
import { describe, it, expect } from "vitest";
```

## Code Style

- Do not ever use recursion in codebase (e.g. for graph traversal) — use iterative approaches with explicit stacks/queues instead to avoid call stack limits and improve readability.

## Success Criteria Mapping

| Criteria                      | How We'll Achieve It                                  |
| ----------------------------- | ----------------------------------------------------- |
| Legacy code moved to /legacy  | Move server/, client/, presentation/ out of packages/ |
| Monorepo with npm workspaces  | Convert from yarn, update root package.json           |
| npm install + local dev works | Create proper package.json for api, common            |
| GitHub Actions CI on PR       | New workflow with oxlint, oxfmt, test jobs            |
| oxlint + oxfmt consistent     | Single config at root, shared by all packages         |

## Files to Create

1. `package.json` (update root)
2. `packages/api/package.json`
3. `packages/common/package.json`
4. `packages/common/tsconfig.json`
5. `packages/api/tsconfig.json`
6. `tsconfig.base.json`
7. `oxlint.json`
8. `.github/workflows/ci.yml`

## Files to Move

1. `packages/server/` → `legacy/server/`
2. `packages/client/` → `legacy/client/`
3. `packages/presentation/` → `legacy/presentation/`

## Files to Remove

1. `yarn.lock`
2. `.yarnrc.yml` (if exists)
3. `.github/workflows/deployment.yml` (after new CI works)

---

_Context captured: 2026-03-01_
