---
name: update-packages
description: "LOAD THIS SKILL when: updating npm packages, user mentions 'update packages', 'update-packages', 'outdated', 'dependency updates'. Covers autonomous npm package updates with breaking change handling, Bun updates, Playwright Docker sync, and package group coordination."
---

# Update Packages

## Step 0: Update Skills + Create Branch (MANDATORY)

Before touching any packages, update skills and create a dedicated branch.

```bash
# Restore/update all skills from skills-lock.json
bunx skills@latest experimental_install -y

# Create a fresh branch
git checkout -b chore/update-packages-$(date +%y%m%d-%H%M)
```

If `experimental_install` is unavailable, fall back to `bunx skills@latest update -y`.

**Rules:**
- Always update skills first — they may contain updated instructions for this workflow
- Never reuse an existing update-packages branch
- All package update commits go to this branch

## Package Groups (Update Together)

These packages must always be updated as a group — mismatched versions cause type errors or runtime failures:

| Group | Packages |
|-------|----------|
| **tanstack-router** | `@tanstack/react-router`, `@tanstack/router-devtools`, `@tanstack/router-plugin`, `@tanstack/start` |
| **tanstack-query** | `@tanstack/react-query`, `@tanstack/react-query-devtools`, `@tanstack/query-core` |
| **trpc** | `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@trpc/tanstack-react-query` |
| **effect** | `effect`, `@effect/schema`, `@effect/platform`, `@effect/language-service` |
| **drizzle** | `drizzle-orm`, `drizzle-kit`, `drizzle-zod` |
| **pino** | `pino`, `pino-pretty`, `@types/pino` |
| **playwright** | `@playwright/test`, `playwright` (+ Docker image sync — see Special Cases) |

## Update Strategy

### Per Package Group Flow

For each group, execute steps 1–4 before moving to the next:

**Step 1 — Identify versions (old → new)**
- Run `bun upgrade` interactively, note minor/major bumps
- For catalog packages: `npm view <package> version`

**Step 2 — Update + Analyze release notes IN PARALLEL**

| Track A: Apply Update | Track B: Analyze Release Notes (background) |
|---|---|
| Apply version bumps via `bun upgrade` or catalog edit | `npm view <pkg> repository.url` → `gh release view <tag> --repo <owner/repo>` |
| `bun install` if catalog | **Major**: breaking changes, migration guides, removed APIs |
| | **Minor**: new APIs, deprecations, opt-in improvements |
| | Search codebase for usages of changed/deprecated/new APIs |

Each package group shares one background subagent. Standalone packages get one subagent each.

**Step 3 — Check + Fix**
- Run `bun run check`
- If it fails: use release notes from Step 2 for context-aware fixes

**Step 4 — Commit the group**

### Release Notes Report

After all groups are updated, output a unified summary:

```
| Package | Type | Old → New | Changes | Impact |
|---------|------|-----------|---------|--------|
```

**Rules:**
- Each subagent MUST search the codebase for usages of changed/deprecated/new APIs
- For breaking changes: list affected files with line numbers + migration snippets
- For new features: suggest where they could be adopted (diffs only, don't apply)
- Skip patch-only updates in the report

## Special Cases

### Bun Runtime Updates

1. Update `packageManager` in root `package.json`: `"bun@X.Y.Z"`
2. Update `ARG BUN_VERSION=X.Y.Z` in all Dockerfiles
3. Update `BUN_VERSION` in CI pipeline files
4. `bun run check` → commit: `chore: update bun to vX.Y.Z`

### Playwright Updates

1. Docker image version **must match** npm package version exactly
2. Update all references to `mcr.microsoft.com/playwright:vX.Y.Z-noble` across Dockerfiles, CI, and Helm values
3. `bun run test:e2e` → commit: `chore: update playwright to vX.Y.Z`

### Catalog Packages

Packages in Bun's catalog need manual version checks: `npm view <package> version`. Update entries in `package.json` manually.

## Testing Requirements

| Update Type | Required Tests |
|-------------|----------------|
| UI/component packages | `bun run check` + visual review |
| TRPC / TanStack Router | `bun run check` + `bun run test` |
| Drizzle ORM | `bun run check` + `bun run test` |
| Effect packages | `bun run check` + `bun run test` |
| Playwright | `bun run check` + `bun run test:e2e` |
| Bun runtime | `bun run check` + `bun run test` + `bun run test:e2e` |
| All others | `bun run check` |

## Guardrails

- **DO NOT** update packages with `workspace:*` — these are internal monorepo packages
- **DO NOT** skip `@typescript/native-preview` updates — affects TypeScript LSP performance
- **DO NOT** use `bun outdated` — misses catalog packages; use `bun upgrade` interactively
- If packages fail to install: `bun clean:packages && bun install`

## Definition of Done

- `bun upgrade` shows all packages at latest versions
- All checks pass (`bun run check`)
- All relevant tests pass

<!-- KISS v2 — 2026-03-04 -->
