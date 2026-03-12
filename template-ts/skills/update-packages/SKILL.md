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

**Step 1 — Identify versions (old → new)**

Run both reports to get a full list of package updates and toolchain/runtime drift:

```bash
bun run .agents/skills/update-packages/references/check-outdated.ts
bun run .agents/skills/update-packages/references/report.ts
```

This scans all workspace `package.json` files (incl. catalog/catalogs), skips `workspace:*` and `catalog:` refs, and outputs a grouped list with `[MAJOR]`/`[minor]` tags.
The runtime report also checks pinned versions in workflows, pipelines, Dockerfiles, and package manifests.
For catalog packages, version pins are in the root `package.json` under `"catalog"` / `"catalogs"` — update them manually.

**Step 2 — Update + Analyze release notes IN PARALLEL**

| Track A: Apply Update                                 | Track B: Analyze Release Notes (background)                                   |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| Apply version bumps via `bun upgrade` or catalog edit | `npm view <pkg> repository.url` → `gh release view <tag> --repo <owner/repo>` |
| `bun install` if catalog                              | **Major**: breaking changes, migration guides, removed APIs                   |
|                                                       | **Minor**: new APIs, deprecations, opt-in improvements                        |
|                                                       | Search codebase for usages of changed/deprecated/new APIs                     |

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
