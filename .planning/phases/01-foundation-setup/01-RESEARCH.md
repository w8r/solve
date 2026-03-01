# Phase 1: Foundation & Setup - Research

**Researched:** 2026-03-01
**Domain:** Monorepo infrastructure, package management, TypeScript configuration, linting/formatting, CI/CD
**Confidence:** HIGH

## Summary

Phase 1 establishes a clean, modern monorepo foundation using npm workspaces, Node.js 22 LTS, TypeScript project references, oxlint/oxfmt for code quality, and GitHub Actions for CI/CD. The existing codebase already has a working packages/api with Fastify TypeScript code following good patterns, and packages/common with minimal setup. The migration from Yarn 3.2.0 to npm workspaces is straightforward with well-documented patterns.

The key challenge is preserving the quality Fastify code in packages/api while properly structuring the monorepo with shared types and configurations. Legacy packages (server, client, presentation) will be moved to /legacy for reference, not deleted. The phase focuses on developer experience through fast tooling (oxlint is 50-100x faster than ESLint, oxfmt is 30x faster than Prettier) and a robust CI pipeline.

**Primary recommendation:** Use npm workspaces with TypeScript project references for cross-package type safety, establish shared tsconfig.base.json with strict mode, configure oxlint with correctness+suspicious categories for balanced linting, use oxfmt defaults, and implement GitHub Actions CI with setup-node caching for fast builds.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Package manager | npm workspaces | Simpler, better compatibility, matches requirements |
| Node.js version | 22 LTS | Latest LTS with native test runner, fetch, better ESM support |
| packages/api handling | Keep and build on it | Existing TS code follows good patterns, add package.json |
| oxlint strictness | Balanced | Correctness + suspicious categories, catches real bugs without noise |
| Branch naming | Keep master | Avoid webhook/integration issues |
| @solve/common scope | Types + constants + algorithms | Full shared package from start |

### Current State Analysis

**Package Manager:**
- Current: Yarn 3.2.0 with yarn.lock
- Action: Remove yarn.lock, .yarnrc.yml, generate package-lock.json
- Root package.json: Update scripts from `yarn workspace` to `npm run -w`

**Node Version:**
- Current: 16.4.2 in engines field
- Action: Update all package.json engines to `"node": ">=22.0.0"`
- GitHub Actions: Use `node-version: '22'`

**packages/api:**
- Current: Has src/ with controllers, services, middleware, schemas (TypeScript)
- Missing: package.json, tsconfig.json
- Action: Create package.json for @solve/api, add to workspaces

**Legacy Code Movement:**
Move to `/legacy/` directory (outside packages):
- `packages/server/` → `legacy/server/`
- `packages/client/` → `legacy/client/`
- `packages/presentation/` → `legacy/presentation/`

Keep in place:
- `packages/api/` (keep and enhance)
- `packages/common/` (rebuild with new structure)

**GitHub Actions:**
- Current: deployment.yml deploys to Surge (dead) + Deta (dead)
- Action: Replace with CI workflow that runs on PR:
  - Lint with oxlint
  - Format check with oxfmt
  - Run tests (when added)
- Branch: Trigger on push to master and PRs

**Root tsconfig:**
- Current: Extends expo/tsconfig.base (client-specific)
- Action: Create shared base tsconfig.base.json with:
  - target: ES2022
  - module: NodeNext (for API) / ESNext (for client)
  - strict: true
  - Each package extends base with own settings

**oxlint Configuration:**
- Current: None
- Action: Create oxlint.json at root with balanced rules:
  - Enable: correctness, suspicious
  - Disable: pedantic, style (let oxfmt handle formatting)

**oxfmt Configuration:**
- Current: None
- Action: Use default oxfmt settings (no config file needed)
- Run via: `npx oxlint --format`

**@solve/common Structure:**
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

### Import Aliasing Convention

Per user requirement, libraries with non-descriptive names should be imported with aliases:

```typescript
// Examples of aliased imports
import { z as Schema } from 'zod';
import { ObjectId as MongoId } from 'mongodb';

// Clear names don't need aliasing
import fastify from 'fastify';
import { describe, it, expect } from 'vitest';
```
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | TypeScript Fastify server with structured error handling and logging | Existing packages/api has Fastify controllers/services; TypeScript project references ensure type safety across packages |
| INFRA-04 | Local development works with local MongoDB instance | npm workspaces hoisting, Node.js 22 native features, proper package.json setup |
| INFRA-06 | Shared TypeScript types across packages (@solve/common) | TypeScript project references with composite:true enable cross-package type checking |
| DX-01 | oxlint configured for all packages | oxlint.json at root with correctness+suspicious categories |
| DX-02 | oxfmt configured for all packages | oxfmt defaults, package.json scripts |
| DX-03 | Monorepo uses npm workspaces with shared configs | npm workspaces with hoisting, shared tsconfig.base.json |
| DX-04 | Shared tsconfig.json base across packages | tsconfig.base.json with strict mode, project references |
| DX-05 | Import aliasing convention enforced (descriptive names for libraries) | Document in CLAUDE.md, enforce in code reviews |
| DX-06 | CI runs lint, format check, and tests on PR | GitHub Actions workflow with oxlint, oxfmt --check, test jobs |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| npm | >=10 (Node 22) | Package manager with workspaces | Built-in to Node.js, native workspace support since v7, widely adopted |
| Node.js | 22 LTS | JavaScript runtime | Latest LTS (active until April 2027), built-in WebSocket, enhanced ESM support |
| TypeScript | ^5.7 | Type safety and tooling | Industry standard for large codebases, project references for monorepos |
| oxlint | latest | Linting | 50-100x faster than ESLint, 690+ rules, ESLint config compatibility |
| oxfmt | latest | Code formatting | 30x faster than Prettier, 100% Prettier conformance tests passed |

**Sources:**
- [Node.js 22 LTS](https://nodejs.org/en/blog/announcements/v22-release-announce)
- [oxlint documentation](https://oxc.rs/docs/guide/usage/linter.html)
- [oxfmt beta announcement](https://oxc.rs/blog/2026-02-24-oxfmt-beta)

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| GitHub Actions | N/A | CI/CD automation | All PRs and pushes to master |
| actions/setup-node | v4 | Node.js setup with caching | Every CI job |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| npm workspaces | pnpm workspaces | pnpm faster installs, smaller disk footprint, but adds complexity; user chose npm for simplicity |
| npm workspaces | Yarn 3.x (Berry) | Already in use, but user decided to switch for better compatibility |
| oxlint | ESLint | ESLint more configurable but 50-100x slower, not needed for this phase |
| oxfmt | Prettier | Prettier has more plugins, but oxfmt 30x faster and passes 100% conformance |

**Installation:**
```bash
# At root level
npm install -D typescript oxlint oxfmt

# In packages/api
npm install fastify @fastify/type-provider-zod zod pino

# In packages/common
npm install -D typescript
```

## Architecture Patterns

### Recommended Project Structure
```
/
├── package.json                 # Root workspace config
├── package-lock.json            # Lock file for all packages
├── tsconfig.base.json           # Shared TypeScript config
├── oxlint.json                  # Linting rules for all packages
├── .github/
│   └── workflows/
│       └── ci.yml               # Lint, format, test pipeline
├── packages/
│   ├── api/
│   │   ├── package.json         # @solve/api
│   │   ├── tsconfig.json        # Extends base, references common
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   └── schemas/
│   │   └── dist/
│   └── common/
│       ├── package.json         # @solve/common
│       ├── tsconfig.json        # Extends base, composite:true
│       ├── src/
│       │   ├── types/
│       │   ├── constants/
│       │   └── algorithms/
│       └── dist/
└── legacy/                      # Preserved old code
    ├── server/
    ├── client/
    └── presentation/
```

### Pattern 1: npm Workspaces Setup

**What:** Declare all packages in root package.json workspaces array, use `npm install -w <workspace>` to manage per-package dependencies

**When to use:** Always in monorepo with multiple related packages

**Example:**
```json
// Root package.json
{
  "name": "solve",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev -w @solve/api",
    "lint": "oxlint .",
    "format": "oxfmt .",
    "format:check": "oxfmt --check ."
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "oxlint": "latest",
    "oxfmt": "latest"
  }
}
```

**Source:** [npm workspaces documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces/)

### Pattern 2: TypeScript Project References

**What:** Use `references` array in tsconfig.json to declare dependencies on other packages, enable incremental builds

**When to use:** When one package imports types from another (e.g., api imports from common)

**Example:**
```json
// packages/api/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../common" }
  ],
  "include": ["src/**/*"]
}

// packages/common/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"]
}

// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Source:** [Everything You Need to Know About TypeScript Project References](https://nx.dev/blog/typescript-project-references)

### Pattern 3: oxlint Balanced Configuration

**What:** Enable correctness and suspicious categories for catching real bugs without pedantic noise

**When to use:** All packages in the monorepo

**Example:**
```json
// oxlint.json
{
  "categories": {
    "correctness": "error",
    "suspicious": "warn"
  },
  "rules": {}
}
```

**Source:** [oxlint configuration documentation](https://oxc.rs/docs/guide/usage/linter/config)

### Pattern 4: GitHub Actions with Caching

**What:** Use setup-node with cache: 'npm' to cache node_modules based on package-lock.json hash

**When to use:** All CI workflows

**Example:**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [master]
  pull_request:

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
```

**Source:** [GitHub Actions dependency caching](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)

### Anti-Patterns to Avoid

- **Installing global dependencies in workspaces:** Always install shared dev deps (TypeScript, linters) at root level
- **Using `npm install` instead of `npm ci` in CI:** `npm ci` only uses lock file, faster and more reliable
- **Forgetting composite:true for shared packages:** Without it, project references won't work for cross-package imports
- **Manual dependency version syncing:** Let workspace hoisting handle shared dependencies
- **Committing .env files:** Always use .env.example as template, never commit secrets

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Linting configuration | Custom ESLint rules from scratch | oxlint with balanced categories | 690+ rules built-in, ESLint compatibility, 50-100x faster |
| Code formatting | Custom Prettier config | oxfmt defaults | 100% Prettier conformance, 30x faster, no config needed |
| Package linking | Symlink scripts | npm workspaces | Native hoisting, automatic linking, dependency resolution |
| TypeScript build orchestration | Custom build scripts | TypeScript project references | Incremental builds, type checking across packages, official feature |
| CI dependency caching | Custom cache keys | setup-node cache: 'npm' | Automatic hash of package-lock.json, well-tested |

**Key insight:** Modern tooling (npm workspaces, TypeScript project references, oxlint/oxfmt) handles monorepo complexity better than custom solutions. The ecosystem has matured significantly in 2024-2026.

## Common Pitfalls

### Pitfall 1: Unclear Project Boundaries After Migration

**What goes wrong:** Moving legacy code without clear separation leads to confusion about what's active vs. archived, tempting developers to modify legacy code

**Why it happens:** Monorepo migrations often copy code without explicit ownership boundaries

**How to avoid:**
- Create `/legacy/` directory OUTSIDE `/packages/` to signal "reference only, do not modify"
- Add README.md in legacy/ explaining it's preserved for reference
- Update .gitignore to prevent accidental edits (optional: make read-only)

**Warning signs:** Pull requests modifying files in legacy/, developers asking "which version should I update?"

**Source:** [Common pitfalls when adopting a monorepo](https://graphite.com/guides/monorepo-pitfalls-guide)

### Pitfall 2: Phantom Dependencies from Hoisting

**What goes wrong:** Package imports library without declaring it in package.json, works locally because workspace hoisted it, breaks when published

**Why it happens:** npm/yarn hoist dependencies to root node_modules, making them accessible to all packages

**How to avoid:**
- Verify each package.json lists all imports in dependencies
- Use `npm ls <package>` to check dependency tree
- Run package builds in isolation before publishing

**Warning signs:** Import errors after publishing, "cannot find module" in consumer projects

**Source:** [Understanding NPM Workspaces](https://blog.faizahmed.in/npm-workspaces)

### Pitfall 3: Attempting All Changes at Once

**What goes wrong:** Trying to migrate package manager, update Node version, restructure all packages, and set up CI simultaneously causes paralysis and hard-to-debug failures

**Why it happens:** Migration seems like the right time to "fix everything"

**How to avoid:**
- Follow wave-based approach: Wave 0 (setup), Wave 1 (api package), Wave 2 (common package), Wave 3 (CI)
- Commit after each working state
- Test npm install and basic dev server after each wave

**Warning signs:** Hours debugging without a single successful commit, unclear which change broke what

**Source:** [Migrating to the monorepo](https://alexharri.com/blog/move-to-monorepo)

### Pitfall 4: Forgetting TypeScript composite:true

**What goes wrong:** Cross-package imports fail with type errors even though runtime code works, incremental builds don't work

**Why it happens:** TypeScript project references require `composite: true` in referenced packages to generate .d.ts declaration files

**How to avoid:**
- Always set `"composite": true` in tsconfig.json of packages imported by others (e.g., @solve/common)
- Set `"declaration": true` explicitly
- Verify dist/ contains .d.ts files after build

**Warning signs:** Type errors like "Cannot find module '@solve/common'", no .d.ts files in dist/

**Source:** [Boost your productivity with TypeScript project references](https://blog.logrocket.com/boost-your-productivity-with-typescript-project-references/)

### Pitfall 5: Wrong Node Version in CI

**What goes wrong:** CI uses Node 16 (from old config) instead of Node 22, missing features like native WebSocket, different behavior

**Why it happens:** Forgetting to update .github/workflows/ when changing Node requirements

**How to avoid:**
- Update all GitHub Actions to use `node-version: '22'`
- Add .nvmrc file at root with `22` for local development
- Document Node version in README.md

**Warning signs:** CI passing but local dev failing (or vice versa), unexpected runtime errors in CI

### Pitfall 6: Losing Git History on Legacy Code Move

**What goes wrong:** Simply copying legacy code to /legacy/ loses all Git blame, making it hard to understand why code was written

**Why it happens:** Using `mv` or `cp` instead of `git mv`

**How to avoid:**
- Use `git mv packages/server legacy/server` to preserve history
- Commit move separately from other changes
- Verify `git log --follow` shows history

**Warning signs:** `git blame` shows entire legacy/ directory committed in single commit

**Source:** [Keeping git history when converting multiple repos into a monorepo](https://medium.com/@chris_72272/keeping-git-history-when-converting-multiple-repos-into-a-monorepo-97641744d928)

## Code Examples

Verified patterns from official sources:

### Example 1: Import from Workspace Package

```typescript
// packages/api/src/services/graph.service.ts
import { IGraph, INode, IEdge } from '@solve/common';
import { OPERATION_TYPES } from '@solve/common/constants';

export class GraphService {
  async createGraph(data: Partial<IGraph>): Promise<IGraph> {
    // Type-safe thanks to project references
  }
}
```

**Source:** [Managing Multiple Packages with npm Workspaces](https://geekyants.com/blog/managing-multiple-packages-with-npm-workspaces-a-complete-guide)

### Example 2: Run Commands in Workspace

```bash
# Install dependency in specific workspace
npm install fastify -w @solve/api

# Run script in specific workspace
npm run dev -w @solve/api

# Run script in all workspaces
npm run test --workspaces

# Install all dependencies (from root)
npm install
```

**Source:** [npm workspaces documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces/)

### Example 3: Package.json for Shared Package

```json
// packages/common/package.json
{
  "name": "@solve/common",
  "version": "1.0.0",
  "description": "Shared types, constants, and algorithms",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

**Source:** [Setting up a TypeScript multi-package mono-repo](https://blog.frankdejonge.nl/setting-up-a-typescript-mono-repo-for-scoped-packages/)

### Example 4: Migration Script Pattern

```bash
#!/bin/bash
# migrate-to-npm.sh

set -e  # Exit on error

echo "Migrating from Yarn to npm workspaces..."

# 1. Remove Yarn files
rm -f yarn.lock
rm -f .yarnrc.yml
rm -rf .yarn

# 2. Generate package-lock.json
npm install

# 3. Update root scripts
# (Do this manually in package.json)

# 4. Verify workspace linking
npm ls @solve/common

echo "Migration complete! Test with: npm install && npm run dev -w @solve/api"
```

**Source:** [Migrating an Existing Codebase from Yarn to NPM](https://medium.com/@fahad.a.arsal/migrating-an-existing-codebase-from-yarn-package-manager-to-npm-4a3087c5714b)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ESLint 8 | oxlint | 2024-2025 | 50-100x faster linting, instant feedback |
| Prettier | oxfmt | 2026 (beta) | 30x faster formatting, 100% conformance |
| Lerna | npm workspaces | 2021 (npm 7) | Native solution, no extra tool |
| Yarn 1 | npm workspaces / pnpm | 2020-2021 | Better performance, native support |
| Node 16 | Node 22 LTS | 2024 (LTS 2024-10-29) | Built-in WebSocket, enhanced ESM |
| Manual tsconfig | Project references | 2019 (TS 3.0) | Incremental builds, cross-package types |

**Deprecated/outdated:**
- **Lerna:** No longer needed with npm workspaces; npm 7+ handles monorepo natively
- **TSLint:** Deprecated in 2019, replaced by ESLint, now oxlint is faster alternative
- **Yarn 1 Classic:** Replaced by Yarn 3 Berry or npm workspaces
- **Node 16:** EOL September 11, 2023; must upgrade to 18+ (22 LTS preferred)

**Sources:**
- [oxfmt beta announcement](https://oxc.rs/blog/2026-02-24-oxfmt-beta)
- [Node.js 22 LTS](https://nodejs.org/en/blog/announcements/v22-release-announce)
- [Node.js endoflife dates](https://endoflife.date/nodejs)

## Open Questions

1. **Should we add .nvmrc for Node version enforcement?**
   - What we know: Current system has no Node version pinning, package.json has outdated 16.4.2
   - What's unclear: Whether team uses nvm or other Node version managers
   - Recommendation: Add .nvmrc with `22` for documentation and nvm users, update package.json engines

2. **Test framework for Phase 1 or defer to Phase 2?**
   - What we know: No test config exists yet, requirements mention Vitest for API
   - What's unclear: Whether foundation tests are needed before API implementation
   - Recommendation: Defer to Phase 2 (Backend Infrastructure), focus Phase 1 on structure only

3. **Should legacy/ be git-ignored or tracked?**
   - What we know: Legacy code is reference material, not active development
   - What's unclear: Whether team wants Git history searchable or clean repo
   - Recommendation: Track in Git with clear README, preserves history with `git mv`

## Validation Architecture

> Phase 1 validation focuses on structural correctness and developer experience, not behavioral testing.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification (no automated tests in Phase 1) |
| Config file | N/A — deferred to Phase 2 (Vitest) |
| Quick run command | N/A |
| Full suite command | N/A |

**Rationale:** Phase 1 establishes tooling and structure without implemented features to test. Validation is through:
- Successful `npm install` completion
- TypeScript compilation without errors
- oxlint/oxfmt passing checks
- CI pipeline green status

### Phase Requirements → Validation Map

| Req ID | Behavior | Validation Type | Manual Verification | Automated Check |
|--------|----------|-----------------|---------------------|-----------------|
| INFRA-01 | TypeScript Fastify server with structured error handling and logging | Structural | packages/api has package.json, tsconfig compiles | CI: `npm run build -w @solve/api` |
| INFRA-04 | Local development works with local MongoDB instance | Integration | Developer runs `npm run dev -w @solve/api` successfully | Manual smoke test documented |
| INFRA-06 | Shared TypeScript types across packages (@solve/common) | Structural | packages/common exports types, api imports without error | CI: TypeScript compilation |
| DX-01 | oxlint configured for all packages | Structural | oxlint.json exists, runs without errors | CI: `npm run lint` |
| DX-02 | oxfmt configured for all packages | Structural | package.json has format scripts, runs without errors | CI: `npm run format:check` |
| DX-03 | Monorepo uses npm workspaces with shared configs | Structural | Root package.json has workspaces, npm install links packages | Manual: `npm ls` shows workspace structure |
| DX-04 | Shared tsconfig.json base across packages | Structural | tsconfig.base.json exists, packages extend it | CI: TypeScript compilation |
| DX-05 | Import aliasing convention enforced | Manual | Code review checks for `import { z as Schema }` pattern | Document in CLAUDE.md |
| DX-06 | CI runs lint, format check, and tests on PR | Structural | .github/workflows/ci.yml exists and runs | GitHub Actions badge green |

### Sampling Rate
- **Per task commit:** `npm install && npm run lint && npm run format:check`
- **Per wave merge:** Full validation script (see below)
- **Phase gate:** All structural checks green, manual smoke test passes

### Wave 0 Gaps

**Files to create:**
- [ ] `.nvmrc` — Node version 22 for nvm users
- [ ] `legacy/README.md` — Explain legacy code preservation
- [ ] Manual smoke test script: `scripts/validate-phase1.sh`

**Validation script structure:**
```bash
#!/bin/bash
# scripts/validate-phase1.sh

set -e

echo "=== Phase 1 Validation ==="

echo "1. Clean install..."
rm -rf node_modules packages/*/node_modules package-lock.json
npm install

echo "2. TypeScript compilation..."
npm run build -w @solve/api
npm run build -w @solve/common

echo "3. Linting..."
npm run lint

echo "4. Formatting check..."
npm run format:check

echo "5. Workspace structure..."
npm ls @solve/common @solve/api

echo "✓ All Phase 1 checks passed!"
```

If all checks pass, Phase 1 is structurally complete. Behavioral testing begins in Phase 2 with Vitest infrastructure.

## Sources

### Primary (HIGH confidence)
- [oxlint documentation](https://oxc.rs/docs/guide/usage/linter.html) - Configuration, categories, setup
- [oxlint config reference](https://oxc.rs/docs/guide/usage/linter/config) - JSON schema, options
- [oxfmt documentation](https://oxc.rs/docs/guide/usage/formatter) - Installation, usage, features
- [oxfmt beta announcement](https://oxc.rs/blog/2026-02-24-oxfmt-beta) - Performance benchmarks, 100% Prettier conformance
- [Node.js 22 LTS announcement](https://nodejs.org/en/blog/announcements/v22-release-announce) - Features, WebSocket, ESM support
- [Node.js 22 LTS details](https://nodesource.com/blog/Node.js-v22-Long-Term-Support-LTS) - LTS timeline, active until April 2027
- [TypeScript Project References](https://nx.dev/blog/typescript-project-references) - Composite flag, incremental builds
- [npm workspaces documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces/) - Official npm guide

### Secondary (MEDIUM confidence)
- [Setting up a monorepo using npm workspaces and TypeScript Project References](https://medium.com/@cecylia.borek/setting-up-a-monorepo-using-npm-workspaces-and-typescript-project-references-307841e0ba4a) - Comprehensive tutorial
- [TypeScript project references monorepo config](https://handbook.chaineapp.com/handbook/learning/coding/typescript/typescript-monorepo-config/) - Practical examples
- [GitHub Actions in 2026: Monorepo CI/CD Guide](https://dev.to/pockit_tools/github-actions-in-2026-the-complete-guide-to-monorepo-cicd-and-self-hosted-runners-1jop) - Path filtering, matrix builds, caching
- [How to Configure GitHub Actions for Monorepos](https://oneuptime.com/blog/post/2026-02-02-github-actions-monorepos/view) - Selective builds, workspace detection
- [Managing Multiple Packages with npm Workspaces](https://geekyants.com/blog/managing-multiple-packages-with-npm-workspaces-a-complete-guide) - Hoisting, scripts, examples
- [Understanding NPM Workspaces](https://blog.faizahmed.in/npm-workspaces) - Phantom dependencies, hoisting behavior
- [Migrating from Yarn to npm](https://medium.com/@fahad.a.arsal/migrating-an-existing-codebase-from-yarn-package-manager-to-npm-4a3087c5714b) - Script conversion, lockfile migration
- [Common pitfalls when adopting a monorepo](https://graphite.com/guides/monorepo-pitfalls-guide) - Project boundaries, scalability, tooling
- [Migrating to the monorepo](https://alexharri.com/blog/move-to-monorepo) - Incremental approach, avoiding all-at-once changes

### Tertiary (LOW confidence)
- None - all findings verified with official sources or multiple credible sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries have official documentation, well-established in 2026
- Architecture: HIGH - npm workspaces and TypeScript project references are mature, official features
- Pitfalls: MEDIUM-HIGH - Derived from community experience and migration guides, verified across multiple sources

**Research date:** 2026-03-01
**Valid until:** 2026-04-30 (30 days for stable tooling; oxfmt beta may have updates)
**Researcher notes:** Existing packages/api code quality is high (Fastify with proper TypeScript patterns), which reduces migration risk. Focus should be on preserving this quality while adding proper tooling infrastructure.
