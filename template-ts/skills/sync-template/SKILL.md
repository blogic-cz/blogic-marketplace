---
name: sync-template
description: "LOAD THIS SKILL when: syncing project with blogic-template-ts upstream, user mentions 'sync template', 'template update', 'sync-template', 'what changed in template', 'template diff'. Covers discovery of template changes via commits/PRs/releases, package update proposal, deep diff, phased migration plan generation, and execution."
---

# Sync Template

Synchronize a downstream project (generated from `blogic-template-ts`) with the latest template version.

**Source of truth**: `blogic-cz/blogic-template-ts` cloned via opensrc into `opensrc/repos/github.com/blogic-cz/blogic-template-ts/`.

## Prerequisites

- `gh` CLI authenticated
- `agent-tools` installed (for `gh-tool release list/view`)
- `debugging-with-opensrc` skill loaded (for opensrc commands)

## Phase 0: Discovery — What Changed in the Template

### Step 0: Clone the template repo via opensrc

The template repo MUST be available locally for diffing. Use opensrc to clone it:

```bash
# Clone blogic-template-ts into opensrc/repos/
bun run opensrc:use blogic-cz/blogic-template-ts

# Verify it's there
ls opensrc/repos/github.com/blogic-cz/blogic-template-ts/
```

All subsequent references use the path: `opensrc/repos/github.com/blogic-cz/blogic-template-ts/`

Abbreviated as `$TPL` in this document for readability. The actual commands MUST use the full relative path.

### Step 1: Find the project's current template version

Look for a template version marker in the project:

```bash
# Check package.json for templateVersion field
grep -i 'templateVersion\|template-version\|synced-from' package.json

# Check for a .template-version file
cat .template-version 2>/dev/null

# Check git log for last sync commit
git log --oneline --grep='sync-template\|template sync\|update from template' -5

# Check CHANGELOG.md for template sync entries
grep -i 'template\|sync' CHANGELOG.md | head -10
```

If no marker found, ask the user: "What template version was this project generated from? (e.g., v0.3.0)"

### Step 2: Enumerate template changes since last sync

Use the opensrc clone and GitHub API to find everything that changed:

```bash
# List all template releases after the project's version
agent-tools-gh release list --repo blogic-cz/blogic-template-ts

# View specific release notes for each version
agent-tools-gh release view <tag> --repo blogic-cz/blogic-template-ts

# Get commit log between versions (using the opensrc clone)
git -C opensrc/repos/github.com/blogic-cz/blogic-template-ts log --oneline <old-tag>..<new-tag>

# Get full diff between versions
git -C opensrc/repos/github.com/blogic-cz/blogic-template-ts diff <old-tag>..<new-tag> --stat

# List PRs merged between versions
gh pr list --repo blogic-cz/blogic-template-ts --state merged --search "merged:>YYYY-MM-DD" --limit 50
```

### Step 3: Categorize changes

Classify each change into one of:

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

Before applying any template changes, bring packages up to date. Outdated packages cause merge conflicts and false failures.

### Step 1: Compare package versions

Compare the project's dependencies against the template's current versions:

```bash
# Read template's package.json(s) from opensrc clone
cat opensrc/repos/github.com/blogic-cz/blogic-template-ts/package.json
cat opensrc/repos/github.com/blogic-cz/blogic-template-ts/apps/web-app/package.json
cat opensrc/repos/github.com/blogic-cz/blogic-template-ts/packages/*/package.json

# Read project's package.json(s)
cat package.json
cat apps/web-app/package.json
cat packages/*/package.json
```

Build a comparison table:

```
| Package | Project Version | Template Version | Gap |
|---------|----------------|-----------------|-----|
```

### Step 2: Delegate to update-packages skill

If packages are behind:

1. Load the `update-packages` skill
2. Create a branch: `chore/sync-template-packages-$(date +%y%m%d-%H%M)`
3. Follow the `update-packages` workflow to bring ALL packages to template version or newer
4. Commit package updates separately BEFORE template sync changes
5. Verify: `bun run check && bun run test`

**Rules:**

- Package updates MUST be committed before any template changes
- Use the `update-packages` skill's group coordination (tanstack, trpc, effect, drizzle groups)
- DO NOT add packages the project doesn't use — only update existing ones

---

## Phase 2: Deep Scan & Diff

Compare the project against the template file by file to find all divergences.

### Step 1: Identify template infrastructure files

Load `references/template-files.md` for the categorized file list.

For each infrastructure file in the template:

1. Check if the file exists in the project
2. If it exists, diff it against the template version
3. If it doesn't exist, flag it as "missing from project"

```bash
# Diff a specific file between template (opensrc) and project
diff opensrc/repos/github.com/blogic-cz/blogic-template-ts/<file> <file>

# Or use git diff for better output
git diff --no-index opensrc/repos/github.com/blogic-cz/blogic-template-ts/<file> <file>
```

### Step 2: Build the name substitution matrix

Every file copied from the template MUST apply name substitution. Build the matrix from the project:

```bash
# Detect project name from package.json
grep '"name"' package.json | head -1

# Detect org scope
grep '"@' package.json | head -5
```

Build substitution table:

| Template Value       | Project Value          |
| -------------------- | ---------------------- |
| `@blogic-template/`  | `@<project-scope>/`    |
| `blogic-template-ts` | `<project-name>`       |
| `blogic-template`    | `<project-short-name>` |

### Step 3: Identify project-specific divergences to preserve

Some files WILL differ intentionally — the project has its own business logic. Flag these:

- `apps/web-app/src/routes/` — project-specific routes
- `packages/services/src/` — project-specific services
- `packages/db/src/schema/` — project-specific schema (beyond template defaults)
- Environment-specific configs (Helm values, CI secrets)

**Rules:**

- NEVER overwrite project-specific business logic with template defaults
- Template infrastructure files (lint, tooling, CI) should be adopted fully
- When a file has BOTH infrastructure changes AND project-specific content, merge selectively

---

## Phase 3: Triage & Plan

Generate a phased implementation plan in `.sisyphus/plans/` format.

### Step 1: Create the plan file

```bash
mkdir -p .sisyphus/plans
```

Name: `.sisyphus/plans/YYMMDDHHMM-sync-template-vX.Y.Z.md`

### Step 2: Plan structure

Follow the andocs-backport plan format. Include:

1. **TL;DR** — Quick summary, deliverables, effort estimate, parallel execution note
2. **Context** — Template version gap (from → to), number of changes, categories
3. **Name Substitution Matrix** — All template→project name mappings
4. **Work Objectives** — Core objective, concrete deliverables, definition of done, must have, must NOT have
5. **Execution Strategy** — Parallel waves with dependency matrix
6. **TODOs** — Each task with:
   - What to do (detailed steps)
   - Must NOT do (guardrails)
   - Recommended agent profile (category + skills)
   - Parallelization (can run in parallel, blocks, blocked by)
   - References (template files from opensrc clone, project files to update)
   - Acceptance criteria (verifiable conditions)
   - QA scenarios (bash commands with assertions)
   - Commit grouping

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

Output the plan summary and ask for approval before execution:

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

Execute the plan wave by wave, using task delegation.

### Per-task execution flow

For each task in the plan:

1. Mark TODO `in_progress`
2. Delegate to appropriate agent with category + skills from the plan
3. Verify acceptance criteria
4. Run QA scenario
5. Mark TODO `completed`
6. Commit as specified in plan

### Delegation prompt template

```
TASK: [from plan]
EXPECTED OUTCOME: [from acceptance criteria]
REQUIRED TOOLS: [from plan]
MUST DO:
- Apply name substitution matrix: [matrix from plan]
- Reference template files from: opensrc/repos/github.com/blogic-cz/blogic-template-ts/
- [task-specific requirements]
MUST NOT DO:
- Overwrite project-specific business logic
- Leave template names (blogic-template) in project files
- [task-specific guardrails]
CONTEXT:
- Template source: opensrc/repos/github.com/blogic-cz/blogic-template-ts/<file>
- Project target: <file>
- [additional context]
```

### After each wave

```bash
bun run check
bun run test
```

Fix any failures before proceeding to the next wave.

---

## Phase 5: Verification & Stamp

### Step 1: Run final checks

```bash
bun run check && bun run test
```

### Step 2: Verify no template names leaked

```bash
# Search for template-specific strings that should have been substituted
grep -r '@blogic-template/' . --include='*.ts' --include='*.json' --include='*.yml' --include='*.yaml' | grep -v node_modules | grep -v .git | grep -v .sisyphus | grep -v opensrc
grep -r 'blogic-template-ts' . --include='*.ts' --include='*.json' --include='*.yml' --include='*.yaml' | grep -v node_modules | grep -v .git | grep -v .sisyphus | grep -v CHANGELOG | grep -v skills-lock | grep -v opensrc
```

### Step 3: Update the template version marker

```bash
# Update .template-version (create if missing)
echo "<new-template-version>" > .template-version

# Or update package.json templateVersion field
```

### Step 4: Final commit

```bash
git add .template-version
git commit -m "chore: sync with blogic-template-ts <new-version>"
```

---

## Guardrails

- **NEVER** overwrite project-specific business logic (routes, services, schema beyond defaults)
- **NEVER** leave `@blogic-template/` or `blogic-template-ts` strings in project files (except opensrc clone)
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
- No `@blogic-template/` or `blogic-template-ts` strings in project files (except .template-version, CHANGELOG, opensrc/)
- `.template-version` file updated to new version
- All plan tasks marked completed
- Plan file exists in `.sisyphus/plans/`
