---
name: sync-template
description: "This skill should be used when synchronizing a project generated from blogic-template-ts with upstream template changes, or when requests mention template sync, template update, template diff, or template version drift. It covers discovery, package-first alignment, phased planning, execution, and verification."
---

# Sync Template

Synchronize a downstream project generated from `blogic-template-ts` with the latest upstream template state.

Use `blogic-cz/blogic-template-ts` as source of truth.

Prefer this local path when available:

`opensrc/repos/github.com/blogic-cz/blogic-template-ts/`

Reference that path as `$TPL` in commands.

## Prerequisites

- Use `gh` CLI authenticated when available.
- Load `debugging-with-opensrc` skill when available; otherwise run equivalent `opensrc` / `git` commands directly.
- Use `agent-tools` (`gh-tool release list/view`) when available; otherwise use native `gh release list/view`.
- Clone template with `opensrc` when available; otherwise clone `https://github.com/blogic-cz/blogic-template-ts` into a temporary local directory and use that path as `$TPL`.

## Phase 0: Discovery — What Changed in the Template

### Step 0: Materialize template source locally

Materialize the template repo before diffing:

```bash
bun run opensrc:use blogic-cz/blogic-template-ts
ls opensrc/repos/github.com/blogic-cz/blogic-template-ts/
```

If `opensrc` is unavailable, clone with `git clone` and set `$TPL` to that clone path.

### Step 1: Detect current template version in project

Detect the current template version marker:

- `package.json` (`templateVersion`, `template-version`, `synced-from`)
- `.template-version`
- Git history for sync commits
- `CHANGELOG.md` sync entries

If no baseline exists, request the baseline version from the user before continuing.

### Step 2: Enumerate upstream changes since baseline

Enumerate changes with releases, commits, and PR metadata:

```bash
gh-tool release list --repo blogic-cz/blogic-template-ts
gh-tool release view <tag> --repo blogic-cz/blogic-template-ts
gh pr list --repo blogic-cz/blogic-template-ts --state merged --search "merged:>YYYY-MM-DD" --limit 50
```

When `gh-tool` is unavailable, replace `gh-tool` commands with `gh release ...` commands.

### Step 3: Categorize changes for adoption strategy

Classify each change into one category:

| Category           | Description                            | Action                                  |
| ------------------ | -------------------------------------- | --------------------------------------- |
| **Infrastructure** | CI/CD, Docker, Helm, configs, tooling  | Adopt directly (with name substitution) |
| **Dependencies**   | Package version bumps, new deps        | Delegate to `update-packages` skill     |
| **Patterns**       | Code patterns, conventions, lint rules | Adopt with adaptation                   |
| **Features**       | New app features, routes, services     | Evaluate — may not apply                |
| **Fixes**          | Bug fixes in shared code               | Adopt if the bug exists in project      |

Output a summary table:

```
| # | Category | Change | Template Files | Effort | Priority |
|---|----------|--------|---------------|--------|----------|
```

---

## Phase 1: Package Updates First (MANDATORY)

Align package versions before applying template file sync.

### Step 1: Compare project and template package versions

Read package manifests in both trees and build a version-gap table.

Build a comparison table:

```
| Package | Project Version | Template Version | Gap |
|---------|----------------|-----------------|-----|
```

### Step 2: Execute package updates

If packages are behind, prefer `update-packages` skill. If that skill is unavailable, run equivalent manual updates with the same constraints.

Apply this sequence:

1. Create branch: `chore/sync-template-packages-$(date +%y%m%d-%H%M)`
2. Update only already-used packages to template version or newer.
3. Commit package updates separately before template file sync commits.
4. Verify with project checks before continuing.

Apply these rules:

- Package updates MUST be committed before any template changes
- Preserve package-group coordination (tanstack, trpc, effect, drizzle)
- DO NOT add packages the project doesn't use — only update existing ones

---

## Phase 2: Deep Scan & Diff

Compare the project against the template file by file to find all divergences.

### Step 1: Identify infrastructure files to adopt

Load `references/template-files.md` for the categorized file list.

For each infrastructure file:

1. Check if the file exists in the project
2. If it exists, diff it against the template version
3. If it doesn't exist, flag it as "missing from project"

```bash
git diff --no-index $TPL/<file> <file>
```

### Step 2: Build the name substitution matrix

Build substitution matrix per `references/substitution-rules.md`.

### Step 3: Identify project-specific divergences to preserve

Flag intentional business-logic divergences and preserve them:

- `apps/web-app/src/routes/` — project-specific routes
- `packages/services/src/` — project-specific services
- `packages/db/src/schema/` — project-specific schema (beyond template defaults)
- Environment-specific configs (Helm values, CI secrets)

Apply these rules:

- NEVER overwrite project-specific business logic with template defaults
- Template infrastructure files (lint, tooling, CI) should be adopted fully
- When a file has BOTH infrastructure changes AND project-specific content, merge selectively

---

## Phase 3: Triage & Plan

Generate a phased implementation plan in `.sisyphus/plans/`.

### Step 1: Create the plan file

```bash
mkdir -p .sisyphus/plans
```

Name: `.sisyphus/plans/YYMMDDHHMM-sync-template-vX.Y.Z.md`

### Step 2: Apply canonical plan format

Load and apply `references/plan-template.md`.

### Step 3: Wave organization

Standard wave pattern for template sync:

```
Wave 0 (Sequential — foundation):
└── Package updates (if not done in Phase 1)

Wave 1 (Parallel — infrastructure):
├── Skills & tooling updates
├── Lint & formatter config
├── CI/CD pipeline updates
├── Docker & Helm updates
└── Config file updates (tsconfig, vitest, etc.)

Wave 2 (After Wave 1 — code changes):
├── Fix lint violations from new rules
├── Apply code pattern updates
└── Update docs (AGENTS.md, README)

Wave 3 (After Wave 2 — cleanup):
└── Final cleanup + verification

Wave FINAL (After ALL — verification):
├── Plan compliance audit
├── Code quality review
└── Scope fidelity check
```

### Step 4: Present plan to user

Present summary and wait for explicit approval before execution:

```
## Sync Template v<old> → v<new>

**Changes**: N commits, M PRs, K releases
**Waves**: 4 (+ verification)
**Tasks**: N total
**Estimated effort**: [Small/Medium/Large]

Approve to start execution?
```

---

## Phase 4: Execution

Execute the plan wave by wave.

Prefer task delegation when subagents are available.

Fallback when subagents are unavailable: execute tasks sequentially in the main agent, keep the same acceptance criteria, and preserve planned commit grouping.

### Per-task execution flow

For each task in the plan:

1. Mark TODO `in_progress`
2. Execute task (delegate when available; otherwise run directly)
3. Verify acceptance criteria
4. Run QA scenario
5. Mark TODO `completed`
6. Commit as specified in plan

### Delegation prompt template

Use the delegation prompt from `references/plan-template.md`.

### After each wave

```bash
bun run check
bun run test
```

Resolve failures before the next wave.

---

## Phase 5: Verification & Stamp

Run verification recipes from `references/verification-recipes.md`.

Apply substitution policy from `references/substitution-rules.md`.

---

## Guardrails

- **NEVER** overwrite project-specific business logic (routes, services, schema beyond defaults)
- **NEVER** leave `@blogic-template/` or `blogic-template-ts` strings in synced project files, except approved exceptions in `references/substitution-rules.md`
- **ALWAYS** clone the template via `bun run opensrc:use blogic-cz/blogic-template-ts` first
- **ALWAYS** apply the name substitution matrix to every file copied from the template
- **ALWAYS** update packages FIRST before applying infrastructure changes
- **ALWAYS** run `bun run check && bun run test` after each wave
- **ALWAYS** preserve project-specific configurations (Sentry project, Helm namespaces, CI secrets)
- **DO NOT** add template-only dependencies the project doesn't need
- **DO NOT** apply template features the project hasn't opted into
- **DO NOT** use hardcoded absolute paths — always use relative `opensrc/repos/github.com/blogic-cz/blogic-template-ts/`

## Definition of Done

- `bun run check` passes (0 errors)
- `bun run test` passes
- No `@blogic-template/` or `blogic-template-ts` strings in synced project files, except approved exceptions in `references/substitution-rules.md`
- `.template-version` file updated to new version
- All plan tasks marked completed
- Plan file exists in `.sisyphus/plans/`
