---
phase: 01-foundation-setup
plan: 01
subsystem: monorepo
tags: [infrastructure, npm, workspaces, legacy]
requires: []
provides:
  - npm-workspaces-foundation
  - legacy-code-preservation
  - node-version-pinning
affects:
  - root-package-json
  - workspace-structure
tech-stack:
  added:
    - npm-workspaces
  patterns:
    - git-mv-history-preservation
    - workspace-linking
key-files:
  created:
    - legacy/README.md
    - .nvmrc
    - package-lock.json
  modified:
    - package.json
decisions:
  - Import aliasing convention documented in package.json description
  - Legacy packages preserved at /legacy/ instead of deletion for reference
  - Node version pinned to 22 via .nvmrc for consistency
metrics:
  duration: 2
  completed: 2026-03-01
---

# Phase 01 Plan 01: npm Workspaces Foundation Summary

**One-liner:** Migrated from Yarn to npm workspaces, preserved legacy code at /legacy/, and established Node 22 as standard

## What Was Built

Established clean npm workspaces monorepo foundation by:
- Moving inactive legacy packages (server, client, presentation) from /packages/ to /legacy/ with git history preserved
- Converting root package.json from Yarn 3.2.0 to npm workspaces with proper scripts
- Removing all Yarn artifacts and verifying npm install works
- Pinning Node version to 22 via .nvmrc

## Implementation Details

### Task 1: Move Legacy Packages
- Created /legacy/ directory at repo root
- Used `git mv` to preserve Git blame/log history for:
  - packages/server → legacy/server
  - packages/client → legacy/client
  - packages/presentation → legacy/presentation
- Created legacy/README.md documenting preservation date (2026-03-01), original locations, and usage restrictions

### Task 2: Convert to npm Workspaces
- Removed `"packageManager": "yarn@3.2.0"` field
- Added `"engines": { "node": ">=22.0.0" }` requirement
- Updated scripts:
  - Replaced `yarn workspace @solve/*` with `npm run -w @solve/*` syntax
  - Removed dead scripts (client, server, presentation, build-web, docs, publish:stage)
  - Added new scripts: dev, build, lint, format, format:check (oxlint/oxfmt placeholders for plan 03)
- Removed outdated dependencies: localtunnel, surge, vercel
- Documented import aliasing convention in description: "Use descriptive aliases for non-descriptive library names (e.g., import { z as Schema } from 'zod')"
- Created .nvmrc with content `22` for nvm users

### Task 3: Remove Yarn Artifacts
- Removed yarn.lock (926KB)
- Removed .yarnrc.yml
- Removed .yarn/releases/yarn-3.2.0.cjs
- Cleaned node_modules directory for fresh start
- Ran `npm install` successfully
- Generated package-lock.json
- Verified workspace linking: @solve/common properly linked to ./packages/common

## Key Files

### Created
- **legacy/README.md** (1001 bytes) - Documentation for preserved legacy code
- **.nvmrc** (2 bytes) - Node version 22 pinning
- **package-lock.json** (544 bytes) - npm dependency lockfile

### Modified
- **package.json** - Converted from Yarn to npm workspaces, updated engines and scripts

### Moved (182 files)
- **legacy/server/** - Original Express.js backend (preserved for reference)
- **legacy/client/** - Original React Native app (preserved for reference)
- **legacy/presentation/** - Original Slidev presentation (preserved for reference)

### Deleted
- yarn.lock (926KB)
- .yarnrc.yml (65 bytes)
- .yarn/releases/yarn-3.2.0.cjs (2.1MB)

## Verification Results

All success criteria met:

1. ✅ Legacy code at /legacy/server, /legacy/client, /legacy/presentation with README
2. ✅ Root package.json: `workspaces: ["packages/*"]`, no packageManager field
3. ✅ .nvmrc contains "22"
4. ✅ yarn.lock and .yarnrc.yml do not exist
5. ✅ npm install succeeds and package-lock.json exists
6. ✅ npm ls shows @solve/common linked to ./packages/common

Command output:
```
solve@0.0.1 /Users/amilevski/Projects/solve
└── @solve/common@1.0.0 -> ./packages/common
```

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Import aliasing convention** - Documented directly in package.json description field rather than waiting for CLAUDE.md update. Convention: Use descriptive aliases for non-descriptive library names (e.g., `import { z as Schema } from 'zod'`).

2. **Git history preservation** - Used `git mv` instead of regular `mv` to maintain full Git blame and log history for legacy packages, enabling future reference to original development context.

3. **Clean node_modules** - Removed node_modules before npm install to ensure completely fresh dependency resolution without any yarn remnants.

## Dependencies

### Requires
- Git repository initialized
- Existing packages structure at /packages/

### Provides
- npm workspaces foundation for monorepo
- Legacy code preservation system
- Node version standardization (22)

### Affects
- All future package development (must use npm, not yarn)
- Developer environment setup (must use Node 22+)
- Workspace script invocations (npm run -w syntax)

## Commits

| Commit | Type | Description | Files |
|--------|------|-------------|-------|
| b22a4e6 | chore | Move legacy packages to /legacy/ directory | 183 files (182 renames + 1 create) |
| 82d815a | chore | Convert to npm workspaces | 2 files (package.json, .nvmrc) |
| c83309a | chore | Remove yarn artifacts and verify npm install | 4 files (3 deletions + 1 create) |

## Next Steps

Ready for Plan 02 (TypeScript configuration):
- Root tsconfig.json with strict mode
- Shared base config for all workspaces
- Path aliases for @solve/* packages
- Type checking scripts

## Self-Check: PASSED

All claimed files and commits verified:

**Files exist:**
```
FOUND: legacy/README.md
FOUND: .nvmrc
FOUND: package-lock.json
```

**Files removed:**
```
CONFIRMED: yarn.lock does not exist
CONFIRMED: .yarnrc.yml does not exist
CONFIRMED: .yarn/ directory does not exist
```

**Commits exist:**
```
FOUND: b22a4e6 chore(01-foundation-setup): move legacy packages to /legacy/ directory
FOUND: 82d815a chore(01-foundation-setup): convert to npm workspaces
FOUND: c83309a chore(01-foundation-setup): remove yarn artifacts and verify npm install
```

**Workspace linking verified:**
```
solve@0.0.1 /Users/amilevski/Projects/solve
└── @solve/common@1.0.0 -> ./packages/common
```
