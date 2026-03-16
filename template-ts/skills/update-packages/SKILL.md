---
name: update-packages
description: "LOAD THIS SKILL when: updating npm packages, user mentions 'update packages', 'update-packages', 'outdated', 'dependency updates'. Covers autonomous npm package updates with breaking change handling, Bun updates, Playwright Docker sync, and package group coordination."
---

# Update Packages

## Step 0: Update Skills + Create Branch (MANDATORY)

Before touching any packages, update skills and create a dedicated branch.

```bash
# Update all skills from skills-lock.json (reads sources + skill names from lock)
bun run .agents/skills/update-packages/references/skills-update-local.ts

# Dry run to see what would be executed
bun run .agents/skills/update-packages/references/skills-update-local.ts --dry-run

# Create a fresh branch
git checkout -b chore/update-packages-$(date +%y%m%d-%H%M)
```

**Rules:**

- Always update skills first — they may contain updated instructions for this workflow
- Never reuse an existing update-packages branch
- All package update commits go to this branch

## Package Groups (Update Together)

These packages must always be updated as a group — mismatched versions cause type errors or runtime failures:

| Group               | Packages                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| **tanstack-router** | `@tanstack/react-router`, `@tanstack/router-devtools`, `@tanstack/router-plugin`, `@tanstack/start` |
| **tanstack-query**  | `@tanstack/react-query`, `@tanstack/react-query-devtools`, `@tanstack/query-core`                   |
| **trpc**            | `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@trpc/tanstack-react-query`                   |
| **effect**          | `effect`, `@effect/schema`, `@effect/platform`, `@effect/language-service`                          |
| **drizzle**         | `drizzle-orm`, `drizzle-kit`, `drizzle-zod`                                                         |
| **pino**            | `pino`, `pino-pretty`, `@types/pino`                                                                |
| **playwright**      | `@playwright/test`, `playwright` (+ Docker image sync — see Special Cases)                          |

## Update Strategy

### Per Package Group Flow

For each group, execute steps 1–4 before moving to the next:

**Step 1 — Identify versions + release notes**

Run all three reports to get outdated packages, runtime drift, and release notes:

```bash
bun run .agents/skills/update-packages/references/check-outdated.ts
bun run .agents/skills/update-packages/references/check-outdated.ts --changelog
bun run .agents/skills/update-packages/references/report.ts --json
```

- `check-outdated.ts` — scans all workspace `package.json` files (incl. catalog/catalogs), skips `workspace:*` and `catalog:` refs, outputs a grouped list with `[MAJOR]`/`[minor]` tags
- `check-outdated.ts --changelog` — same scan + fetches GitHub release notes for each minor/major update. Also detects config files for each package. Output is JSON with `releases[]` and `configFiles[]` per entry. Requires `GITHUB_TOKEN` or `GH_TOKEN` env var for authenticated GitHub API access (5000 req/hour vs 60 unauthenticated).
- `report.ts --json` — checks pinned runtime versions (Bun, Playwright, Node) across workflows, Dockerfiles, and package manifests for drift

**Reports are auto-saved to files** — use these files throughout the update session instead of re-running scripts or holding output in context:

| Script flag          | Saved to                                                     |
| -------------------- | ------------------------------------------------------------ |
| `--json`             | `.agents/skills/update-packages/references/outdated.json`          |
| `--changelog`        | `.agents/skills/update-packages/references/outdated-changelog.json` |
| `report.ts --json`   | `.agents/skills/update-packages/references/runtime-report.json`    |

These files are `.gitignore`d — they are session-local working data, not committed.

For catalog packages, version pins are in the root `package.json` under `"catalog"` / `"catalogs"` — update them manually.

**Step 2 — Update + Adopt features IN PARALLEL**

| Track A: Apply Update                                 | Track B: Adopt features from release notes                                              |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Apply version bumps via `bun upgrade` or catalog edit | Read `outdated-changelog.json` — each entry has `releases[]` with full release notes    |
| `bun install` if catalog                              | Classify each new feature by tier (see below)                                           |
|                                                       | **T0/T1**: implement config-level changes (target files in `configFiles[]`), verify with `bun run check` |
|                                                       | **T2**: generate concrete diffs, include in report                                      |
|                                                       | Search codebase for usages of changed/deprecated/new APIs                               |

Each package group shares one background subagent. Standalone packages get one subagent each.

#### Feature Adoption Tiers

| Tier | Type                     | Action                                           | Example                                     |
| ---- | ------------------------ | ------------------------------------------------ | ------------------------------------------- |
| T0   | Config addition (zero-risk, additive) | **Auto-implement** + verify with `bun run check` | Add `detectAsyncLeaks: true` to vitest config |
| T1   | Config addition (behavioral)          | **Auto-implement** + verify with `bun run check` | Add new reporters to vitest CI config        |
| T2   | Code-level adoption                   | **Suggest with concrete diffs** (don't apply)    | Add `{ tags: ["unit"] }` to `describe()` calls |
| T3   | Breaking change / migration           | **Fix during Step 3** (check + fix)              | API rename, config schema change             |

A feature is T0/T1 when ALL of these are true:
- It modifies a config file (not source code)
- It's additive (doesn't change existing behavior)
- It can be verified with `bun run check`
- The `configFiles[]` field in the changelog report points to the target file

**Step 3 — Check + Fix**

- Run `bun run check`
- If it fails: use release notes from the `--changelog` output for context-aware fixes

**Step 4 — Commit the group**

Use separate commits for version bumps and feature adoptions:
- `chore: update <package> to vX.Y.Z` — version bump only
- `feat: adopt <package> vX.Y improvements (<feature list>)` — config/code changes from new features

### Release Notes Report

After all groups are updated, output a unified summary:

```
| Package | Type | Old → New | Changes | Impact |
|---------|------|-----------|---------|--------|
```

**Rules:**

- Each subagent MUST search the codebase for usages of changed/deprecated/new APIs
- For breaking changes: list affected files with line numbers + migration snippets
- For T0/T1 features: implement them, list what was adopted
- For T2 features: generate concrete diffs with file paths and before/after snippets, prefix with `ADOPTABLE:`
- Skip patch-only updates in the report (the `--changelog` output already excludes them)

### What's New Summary

After the Release Notes Report, generate a user-facing **What's New** summary. This highlights notable features and improvements from the updates — not version numbers, but what the team can now use.

**How to gather data:**

1. Read the saved `outdated-changelog.json` — each entry has `releases[]` with full release notes
2. For packages where `releases[]` is empty, use a librarian agent to fetch release notes from GitHub
3. Focus on minor+ updates only — skip patches unless they contain notable features

**Output format** (use this exact structure, one section per package with notable changes):

```markdown
## What's New from Package Updates

### <Package Name> <version range> — <one-line summary>
- **<Feature name>** — <what it does and why it matters>
- **<Feature name>** — <what it does and why it matters>

### <Package Name> <version range> — <one-line summary>
- **<Feature name>** — <what it does and why it matters>
```

**Rules:**

- Skip packages where only bug fixes happened (no new features worth mentioning)
- Mark breaking changes with a warning emoji and explain what needs to change
- Keep each bullet to one line — concise, actionable
- Group related packages (e.g., "Sentry 10.43" covers both `@sentry/opentelemetry` and `@sentry/tanstackstart-react`)
- Write in the language the user uses (if they speak Czech/Slovak, write in Czech/Slovak)

**Example:**

```markdown
## What's New from Package Updates

### TRPC 11.13 — OpenAPI generation
- **OpenAPI JSON spec** — generate OpenAPI specs directly from your appRouter
- **`streamHeader`** option on `httpBatchStreamLink` — inject custom headers into streaming responses

### shadcn v4 (MAJOR) — monorepo + new colors
- **Monorepo support** — `--monorepo` flag for init, supports TanStack Start workspaces
- **New base colors**: `mauve`, `olive`, `mist`, `taupe`
- **New CLI commands**: `shadcn docs`, `--preset`, `--dry-run`/`--diff`

### @base-ui/react 1.3 — Drawer stable
- **`Drawer` is now stable** (preview → production)
- **`Toast.closeAll()`** — close all toasts at once
```

## Special Cases

### Bun Runtime Updates

1. Update `packageManager` in root `package.json`: `"bun@X.Y.Z"`
2. Update every Bun runtime pin in Dockerfiles, including `ARG BUN_VERSION=X.Y.Z` and any `FROM oven/bun:X.Y.Z-*` base images
3. Update Bun versions in CI workflow and pipeline files, e.g. `bun-version: X.Y.Z` in GitHub Actions and `BUN_VERSION="X.Y.Z"` in Azure pipelines
4. `bun run check` → commit: `chore: update bun to vX.Y.Z`

If the report shows drift, fix all Bun pins before finishing. The report covers:

- `packageManager`
- `@types/bun`
- `bun-version:` in workflows
- `BUN_VERSION=` / `ARG BUN_VERSION=` in scripts and Dockerfiles
- `FROM oven/bun:...` Docker base images
- `node-version:` in workflows
- Playwright package/image version alignment

Manual search fallback:

```bash
grep -R "bun-version:\|BUN_VERSION=\|bun@1\.\|oven/bun:1\." .
```

### Playwright Updates

1. Docker image version **must match** npm package version exactly
2. Update all references to `mcr.microsoft.com/playwright:vX.Y.Z-noble` across Dockerfiles, CI, and Helm values
3. `bun run test:e2e` → commit: `chore: update playwright to vX.Y.Z`

### Catalog Packages

Packages in Bun's catalog need manual version checks: `npm view <package> version`. Update entries in `package.json` manually.

## Testing Requirements

| Update Type            | Required Tests                                        |
| ---------------------- | ----------------------------------------------------- |
| UI/component packages  | `bun run check` + visual review                       |
| TRPC / TanStack Router | `bun run check` + `bun run test`                      |
| Drizzle ORM            | `bun run check` + `bun run test`                      |
| Effect packages        | `bun run check` + `bun run test`                      |
| Playwright             | `bun run check` + `bun run test:e2e`                  |
| Bun runtime            | `bun run check` + `bun run test` + `bun run test:e2e` |
| All others             | `bun run check`                                       |

## Guardrails

- **DO NOT** update packages with `workspace:*` — these are internal monorepo packages
- **DO NOT** skip `@typescript/native-preview` updates — affects TypeScript LSP performance
- **DO NOT** use `bun outdated` — hangs and misses catalog packages; use `check-outdated.ts` instead
- If packages fail to install: `bun clean:packages && bun install`

## Definition of Done

- `check-outdated.ts` shows no remaining direct dependency updates
- All checks pass (`bun run check`)
- All relevant tests pass
