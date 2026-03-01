---
phase: 01-foundation-setup
plan: 03
subsystem: developer-experience
tags:
  - infrastructure
  - linting
  - ci-cd
  - monorepo
dependency_graph:
  requires:
    - 01-02
  provides:
    - ci-pipeline
    - lint-config
    - api-package-structure
  affects:
    - all-packages
tech_stack:
  added:
    - oxlint
    - oxfmt
    - github-actions
  patterns:
    - ci-cd
    - automated-quality-checks
key_files:
  created:
    - oxlint.json
    - .eslintignore
    - .github/workflows/ci.yml
    - scripts/validate-phase1.sh
    - packages/api/package.json
    - packages/api/tsconfig.json
    - .npmrc
  modified:
    - package.json
    - package-lock.json
decisions:
  - Use oxlint/oxfmt for fast linting and formatting
  - Configure correctness:error, suspicious:warn for balanced linting
  - Create .npmrc to use public npm registry (fix Linkurious registry issue)
  - Use fastify-type-provider-zod (not @fastify/type-provider-zod)
  - Update to zod@^4.1.5 for fastify-type-provider-zod@6.x compatibility
  - Create stub services/schemas to make @solve/api compile
  - Ignore legacy, dist, scripts, docs, .planning in lint config
metrics:
  duration_minutes: 12
  tasks_completed: 3
  files_created: 11
  files_modified: 4
  commits: 4
  completed_date: "2026-03-01"
---

# Phase 01 Plan 03: Developer Experience Setup - API Package, Linting, and CI

**One-liner:** Configured oxlint/oxfmt for fast code quality checks, created @solve/api package with Fastify dependencies, and established GitHub Actions CI pipeline with automated builds and linting.

## Objective

Set up @solve/api package, configure linting/formatting with oxlint/oxfmt, and create GitHub Actions CI to complete the developer experience setup for Phase 1.

## Execution Summary

Successfully completed all 3 tasks:

1. Created @solve/api package with Fastify dependencies and TypeScript project references
2. Configured oxlint/oxfmt with balanced rules and automated all project files
3. Created GitHub Actions CI workflow and Phase 1 validation script

All builds pass, lint/format checks succeed, and CI is ready for PRs.

## Tasks Completed

### Task 1: Create @solve/api Package Configuration

**Status:** ✅ Complete
**Commit:** 1bffcc0

Created packages/api/package.json with:
- Fastify 5.x and core plugins (@fastify/cors, @fastify/websocket)
- fastify-type-provider-zod for type-safe routes
- MongoDB, bcrypt, jsonwebtoken for auth
- Pino for structured logging
- Vitest for testing
- tsx for development

Created packages/api/tsconfig.json with:
- Project reference to ../common for shared types
- ESM configuration matching tsconfig.base.json

**Key files:**
- packages/api/package.json
- packages/api/tsconfig.json
- .npmrc (fix blocking npm registry issue)

### Task 2: Configure oxlint and oxfmt

**Status:** ✅ Complete
**Commits:** 4155fe5, 226a562

Created oxlint.json with balanced configuration:
- `correctness: error` - catches real bugs
- `suspicious: warn` - likely bugs
- Ignore legacy, dist, scripts, docs, .planning

Created .eslintignore for oxlint compatibility.

Installed oxlint and oxfmt as root devDependencies.

Ran oxfmt to auto-format all 177 files across project.

**Key files:**
- oxlint.json
- .eslintignore
- package.json (scripts already existed)

**Verification:**
- `npm run lint` - 0 errors, 0 warnings on 15 files
- `npm run format:check` - all files correctly formatted

### Task 3: Create GitHub Actions CI and Validation Script

**Status:** ✅ Complete
**Commit:** 81288b7

Created .github/workflows/ci.yml:
- Triggers on push to master and all PRs
- Node 22 with npm caching
- Builds @solve/common and @solve/api
- Runs lint and format:check
- Test job ready but commented out for Phase 2+

Deleted old deployment.yml (deployed to deprecated Surge/Deta services).

Created scripts/validate-phase1.sh:
- Validates all Phase 1 requirements
- Checks directory structure, npm workspace, Node version
- Builds both packages
- Runs lint and format checks
- Verifies CI workflow exists

Added stub files to make @solve/api compile:
- src/schemas/auth.schema.ts (placeholder interfaces)
- src/services/auth.service.ts (placeholder service class)
- src/types/fastify.d.ts (augment FastifyRequest with user property)
- Fixed import paths to use .js extensions for ESM

**Key files:**
- .github/workflows/ci.yml
- scripts/validate-phase1.sh
- packages/api/src/schemas/auth.schema.ts
- packages/api/src/services/auth.service.ts
- packages/api/src/types/fastify.d.ts

**Verification:**
- `npm run build -w @solve/common` - succeeds
- `npm run build -w @solve/api` - succeeds
- CI workflow ready for GitHub Actions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created .npmrc to use public npm registry**
- **Found during:** Task 1
- **Issue:** Global .npmrc pointed to Linkurious private registry, which didn't have @fastify packages
- **Fix:** Created local .npmrc with `registry=https://registry.npmjs.org/`
- **Files modified:** .npmrc (created)
- **Commit:** 1bffcc0

**2. [Rule 3 - Blocking] Fixed package name for fastify-type-provider-zod**
- **Found during:** Task 1
- **Issue:** Plan specified `@fastify/type-provider-zod@^4.0.0` which doesn't exist. Actual package is `fastify-type-provider-zod` (no @fastify scope)
- **Fix:** Changed to `fastify-type-provider-zod@^6.0.0`
- **Files modified:** packages/api/package.json
- **Commit:** 1bffcc0

**3. [Rule 3 - Blocking] Updated zod to 4.x for compatibility**
- **Found during:** Task 1
- **Issue:** fastify-type-provider-zod@6.x requires zod@>=4.1.5, plan specified ^3.24.0
- **Fix:** Updated to `zod@^4.1.5`
- **Files modified:** packages/api/package.json
- **Commit:** 1bffcc0

**4. [Rule 3 - Blocking] Created stub files to make @solve/api compile**
- **Found during:** Task 3
- **Issue:** auth.controller.ts referenced non-existent services, schemas, and types
- **Fix:** Created placeholder files with minimal interfaces/classes
- **Files created:**
  - packages/api/src/schemas/auth.schema.ts
  - packages/api/src/services/auth.service.ts
  - packages/api/src/types/fastify.d.ts
- **Commit:** 81288b7

**5. [Rule 3 - Blocking] Fixed imports to use .js extensions**
- **Found during:** Task 3
- **Issue:** TypeScript with NodeNext module resolution requires .js extensions in imports
- **Fix:** Updated imports in auth.controller.ts and auth.service.ts to use .js extensions
- **Files modified:**
  - packages/api/src/controllers/auth.controller.ts
  - packages/api/src/services/auth.service.ts
- **Commit:** 81288b7

**6. [Rule 3 - Blocking] Enhanced .eslintignore patterns**
- **Found during:** Task 2
- **Issue:** oxlint found 6000+ warnings in legacy code, dist folders, and docs (build artifacts)
- **Fix:** Created .eslintignore with patterns for legacy, dist, scripts, docs, .planning
- **Files created:** .eslintignore
- **Commit:** 4155fe5

## Verification Results

All success criteria met:

1. ✅ packages/api/package.json has @solve/common as dependency and proper scripts
2. ✅ packages/api/tsconfig.json has references to ../common
3. ✅ oxlint.json exists with correctness:error, suspicious:warn
4. ✅ npm run lint passes on packages/ code (0 errors, 0 warnings)
5. ✅ npm run format:check passes (all files correctly formatted)
6. ✅ .github/workflows/ci.yml exists and triggers on master/PR
7. ✅ .github/workflows/deployment.yml is deleted
8. ✅ scripts/validate-phase1.sh exists and is executable
9. ✅ `npm run build -w @solve/common && npm run build -w @solve/api` succeeds

## Dependencies

**Requires:**
- 01-02 (shared TypeScript configuration and @solve/common package)

**Provides:**
- ci-pipeline - GitHub Actions workflow for automated quality checks
- lint-config - oxlint/oxfmt configuration for all packages
- api-package-structure - @solve/api package ready for implementation

**Affects:**
- all-packages - lint/format rules apply project-wide

## Impact on Roadmap

Phase 1 foundation complete:
- Monorepo structure ✅
- Shared TypeScript configuration ✅
- @solve/common with types, constants, algorithms ✅
- @solve/api package structure ✅
- Linting and formatting automation ✅
- CI/CD pipeline ✅

Ready for Phase 2: Core infrastructure (MongoDB, Redis, Fastify server, auth).

## Next Steps

1. Run `./scripts/validate-phase1.sh` to confirm all Phase 1 requirements
2. Push to GitHub to trigger CI workflow
3. Begin Phase 2: Core Infrastructure Setup
   - Set up MongoDB connection and models
   - Configure Redis for background jobs
   - Implement Fastify server with plugins
   - Build authentication system with JWT

## Commits

- 1bffcc0: feat(01-03): create @solve/api package configuration
- 4155fe5: feat(01-03): configure oxlint and oxfmt
- 226a562: chore(01-03): apply oxfmt formatting to all files
- 81288b7: feat(01-03): create GitHub Actions CI and validation script

---

## Self-Check: PASSED

**Created Files:**
✅ oxlint.json
✅ .eslintignore
✅ .github/workflows/ci.yml
✅ scripts/validate-phase1.sh
✅ packages/api/package.json
✅ packages/api/tsconfig.json
✅ .npmrc
✅ packages/api/src/schemas/auth.schema.ts
✅ packages/api/src/services/auth.service.ts
✅ packages/api/src/types/fastify.d.ts

**Commits:**
✅ 1bffcc0: feat(01-03): create @solve/api package configuration
✅ 4155fe5: feat(01-03): configure oxlint and oxfmt
✅ 226a562: chore(01-03): apply oxfmt formatting to all files
✅ 81288b7: feat(01-03): create GitHub Actions CI and validation script

All claimed files and commits verified.

---

**Duration:** 12 minutes
**Completed:** 2026-03-01
