---
name: update-packages
description: "This skill should be used when upgrading dependencies, bumping packages, resolving outdated dependencies, or performing dependency updates. It guides safe Bun-based package upgrades with breaking-change handling, runtime pin alignment, and grouped version coordination."
---

# Update Packages

## Operation Mode

Identify the operation mode before running any update command:

- Use **Advisory mode** to analyze, report, and propose changes only. Do not create a branch.
- Use **Execution mode** to apply version changes. Create a fresh update branch before the first package edit.

## References

Use these references during execution:

- `references/package-groups.md` — package groups that must be updated together
- `references/feature-adoption-tiers.md` — T0-T3 adoption rubric
- `references/report-formats.md` — release report and "What's New" output formats
- `references/testing-matrix.md` — required tests by update type
- `references/runtime-checklists.md` — Bun and Playwright update checklists

## Step 0: Prepare Session (Execution mode only)

Update skills and create a dedicated branch before touching packages.

```bash
# Update all skills from skills-lock.json (reads sources + skill names from lock)
bun run .agents/skills/update-packages/references/skills-update-local.ts

# Dry run to see what would be executed
bun run .agents/skills/update-packages/references/skills-update-local.ts --dry-run

# Create a fresh branch
git checkout -b chore/update-packages-$(date +%y%m%d-%H%M)
```

Apply these rules:

- Update skills first.
- Create a new update branch for execution work.
- Reuse no previous update branch.
- Place all update commits on the execution branch.

## Update Strategy

### Per Package Group Flow

Read `references/package-groups.md`. Execute steps 1-4 for each group before moving to the next group.

**Step 1 — Identify versions + release notes**

Run all three reports:

```bash
bun run .agents/skills/update-packages/references/check-outdated.ts
bun run .agents/skills/update-packages/references/check-outdated.ts --changelog
bun run .agents/skills/update-packages/references/report.ts --json
```

Use generated JSON files as session data:

| Script flag        | Saved to                                                            |
| ------------------ | ------------------------------------------------------------------- |
| `--json`           | `.agents/skills/update-packages/references/outdated.json`           |
| `--changelog`      | `.agents/skills/update-packages/references/outdated-changelog.json` |
| `report.ts --json` | `.agents/skills/update-packages/references/runtime-report.json`     |

Handle stale report files before analysis:

- Regenerate all three reports at session start.
- Delete old report files first if they contain data from a prior run or branch.
- Treat saved JSON files as disposable local artifacts. Do not commit them.

Handle catalog packages in one place:

- Find catalog versions in root `package.json` under `catalog` and `catalogs`.
- Check latest versions manually (`npm view <package> version`) when needed.
- Update catalog entries manually, then run `bun install`.

**Step 2 — Update + Adopt features IN PARALLEL**

| Track A: Apply Update                                 | Track B: Adopt features from release notes                                                               |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Apply version bumps via `bun upgrade` or catalog edit | Read `outdated-changelog.json` — each entry has `releases[]` with full release notes                     |
| `bun install` if catalog                              | Classify each new feature by tier (see `references/feature-adoption-tiers.md`)                           |
|                                                       | **T0/T1**: implement config-level changes (target files in `configFiles[]`), verify with `bun run check` |
|                                                       | **T2**: generate concrete diffs, include in report                                                       |
|                                                       | Search codebase for usages of changed/deprecated/new APIs                                                |

Delegate release-note research to a subagent/librarian when available. If delegation is unavailable, process package groups sequentially in the main agent with the same rubric.

Apply the T0-T3 rubric from `references/feature-adoption-tiers.md`.

**Step 3 — Check + Fix**

Run required tests from `references/testing-matrix.md`.
Run `bun run check` at minimum.
Fix failures using release-note context from `outdated-changelog.json`.

**Step 4 — Commit the group**

Use separate commits for version bumps and feature adoptions:

- `chore: update <package> to vX.Y.Z` — version bump only
- `feat: adopt <package> vX.Y improvements (<feature list>)` — config/code changes from new features

### Release Notes Report

Generate the release report using `references/report-formats.md`.
When using subagents, require each subagent to search for usages of changed/deprecated/new APIs.
When running sequentially, perform the same search directly.

### What's New Summary

Generate the "What's New" summary using `references/report-formats.md`.
Use `outdated-changelog.json` as the primary source.
Fetch missing release notes with a librarian only when needed.

## Special Cases

Apply Bun and Playwright update checklists from `references/runtime-checklists.md`.

## Testing Requirements

Use `references/testing-matrix.md` to choose required tests.

## Guardrails

- Do not update packages with `workspace:*`.
- Do not skip `@typescript/native-preview` updates.
- Do not use `bun outdated`; use `check-outdated.ts`.
- Run `bun clean:packages` then `bun install` if install fails.

## Definition of Done

- Confirm `check-outdated.ts` shows no remaining direct dependency updates.
- Confirm `bun run check` passes.
- Confirm all tests required by `references/testing-matrix.md` pass.
