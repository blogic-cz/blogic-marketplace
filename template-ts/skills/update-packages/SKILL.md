---
name: update-packages
description: "LOAD THIS SKILL when: updating npm packages, user mentions 'update packages', 'update-packages', 'outdated', 'dependency updates'. Covers autonomous npm package updates with breaking change handling, Bun updates, Playwright Docker sync, and package group coordination."
---

# Update Packages

## First Step: Update Skills + Create Branch (MANDATORY)

Before touching any packages, update the skills themselves and create a dedicated branch.

**How to update skills:**
1. Read `skills-lock.json` in the project root
2. Group skills by unique `source` field (e.g. `blogic-cz/blogic-marketplace`, `blogic-cz/agent-tools`, etc.)
3. Run `npx skills add <source> --all -g -y` **in parallel** — one command per unique source repo, all running simultaneously with `&` + `wait`
4. Do NOT use `npx skills update` — it clones the repo separately for each skill and is extremely slow

Then create a dedicated branch:

```bash
but branch new chore/update-packages-$(date +%y%m%d-%H%M)
```

**Rules:**
- Always update skills first — skills may contain updated instructions for this very workflow
- Group by source and run in parallel — each clone installs all skills from that source at once
- Never reuse an existing update-packages branch
- Always create a fresh branch with the current timestamp
- All package update commits go to this branch

## Definition of Done

- `bun upgrade` shows all packages at latest versions
- No packages remain to select or update
- All checks pass (`bun run check`)
- All relevant tests pass

## If Bun Updates

When the Bun runtime itself has a new version:

1. Update `packageManager` field in root `package.json`:
   ```json
   "packageManager": "bun@X.Y.Z"
   ```

2. Update all Dockerfiles that reference `BUN_VERSION`:
   ```dockerfile
   ARG BUN_VERSION=X.Y.Z
   ```

3. Update CI pipeline `BUN_VERSION` environment variable in all relevant pipeline files.

4. Run checks to confirm nothing broke:
   ```bash
   bun run check
   ```

5. Commit message format:
   ```
   chore: update bun to vX.Y.Z
   ```

## If Playwright Updates

When `@playwright/test` or `playwright` npm version changes:

1. The Docker image version **must match** the npm package version exactly.

2. Find all references to the Playwright Docker image across:
   - `Dockerfile` files
   - CI/CD pipeline YAML files
   - Kubernetes Helm values files
   - Any other infrastructure files

3. Update all references to use the matching image tag:
   ```
   mcr.microsoft.com/playwright:vX.Y.Z-noble
   ```

4. Run E2E tests to confirm compatibility:
   ```bash
   bun run test:e2e
   ```

5. Commit message format:
   ```
   chore: update playwright to vX.Y.Z
   ```

## Catalog Packages

Some packages are managed via Bun's catalog and require manual version checking:

```bash
# Check latest version of a catalog package
npm view <package-name> version

# Check all versions available
npm view <package-name> versions --json
```

Update catalog entries in `package.json` or `bun.lockb` manually after confirming the latest version.

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
| **playwright** | `@playwright/test`, `playwright` (+ Docker image sync — see above) |

## Update Strategy

### Core Principle: Update + Analyze in Parallel

Release notes analysis happens **simultaneously** with each package group update — not after. When `bun run check` fails, you already have migration guides and know exactly what changed.

### Per Package Group Flow

For each package group (see Package Groups table above), execute steps 1-4 before moving to the next group:

**Step 1 — Identify versions (old → new)**
- Run `bun upgrade` interactively, note which packages have minor/major bumps
- For catalog packages: `npm view <package> version` to find latest

**Step 2 — Update + Analyze release notes IN PARALLEL**

Do both at the same time:

| Track A: Apply Update | Track B: Analyze Release Notes (background subagents) |
|---|---|
| Apply version bumps (`bun upgrade` selection or catalog edit) | For each minor/major bump: `npm view <package> repository.url` → `gh release view <tag> --repo <owner/repo>` (fallback: `CHANGELOG.md`) |
| `bun install` if catalog | **Major**: breaking changes, migration guides, removed APIs |
| | **Minor**: new APIs, deprecations, opt-in improvements |
| | Search project codebase for usages of changed/deprecated/new APIs |

Parallelization: packages from the same ecosystem (per Package Groups table) share one background subagent. Standalone packages get one subagent each. Each subagent reads release notes AND searches the codebase for affected usages.

**Step 3 — Check + Fix with context**
- Run `bun run check`
- If check fails: consult the release notes analysis from Step 2 — you know what changed, have migration guides, and can fix with full context instead of blind trial-and-error
- Fix any breaking changes using the migration info

**Step 4 — Commit the group**
- Commit the update with appropriate message before moving to next group

### Release Notes Report

After all groups are updated, output a unified summary table:

```
| Package | Type | Old → New | Changes | Impact & Suggestions |
|---------|------|-----------|---------|----------------------|
| effect | MAJOR | 3.x → 4.0 | `Layer` API redesigned | ⚠️ 12 files use `Layer.succeed` → must change to `Layer.sync`. Files: src/services/Auth.ts:14, src/services/Db.ts:8, ... See migration: https://... |
| drizzle-orm | MINOR | 0.38 → 0.39 | `.having()` support | ❌ No aggregate queries in project |
| @tanstack/react-router | MINOR | 1.90 → 1.91 | `beforeLoad` abort signal | ✅ src/routes/dashboard.tsx:23 has slow loader — add `abortSignal` to cancel stale fetches. Suggested diff: `beforeLoad: ({ abortController }) => ...` |
```

Skip patch-only updates in this report.

### Release Notes Rules

- Each subagent MUST search the codebase for usages of changed/deprecated/new APIs
- For breaking changes: list all affected files with line numbers and provide migration snippets
- For new features: identify where in the project they could be adopted and show suggested code changes
- Do NOT apply adoption suggestions — provide diffs/suggestions only, user decides
- Packages with no releases/changelog → "no release notes available", move on
## Testing Requirements

| Update Type | Required Tests |
|-------------|----------------|
| UI/component packages (`@base-ui/react`, etc.) | `bun run check` + visual review in browser |
| TRPC / TanStack Router | `bun run check` + `bun run test` |
| Drizzle ORM | `bun run check` + `bun run test` |
| Effect packages | `bun run check` + `bun run test` |
| Playwright | `bun run check` + `bun run test:e2e` |
| Bun runtime | `bun run check` + `bun run test` + `bun run test:e2e` |
| All others | `bun run check` |

## Cache Recovery (Bun)

If packages fail to install or you see stale cache errors after updating:

```bash
bun clean:packages && bun install
```

This clears the local package cache and performs a fresh install.

## Common Breaking Changes

| Package | Common Issue | Fix |
|---------|-------------|-----|
| `@effect/language-service` | Version must match `effect` core exactly | Always update together with `effect` |
| `@types/react` | React 19 types changed significantly; some third-party types conflict | Check peer deps, may need `--legacy-peer-deps` workaround or type overrides |
| `@base-ui/react` | API surface changes frequently in pre-stable releases | Review changelog, update component usage accordingly |

## Guardrails

- **DO NOT** update packages with `workspace:*` version specifiers — these are internal monorepo packages managed separately
- **DO NOT** skip `@typescript/native-preview` updates — this package affects TypeScript LSP performance and should stay current
- **DO NOT** use `bun outdated` to check for updates — it misses packages that are in the catalog or have non-standard version specifiers; use `bun upgrade` interactively instead
