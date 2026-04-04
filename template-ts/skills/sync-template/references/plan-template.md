# Sync Template Plan Template

Use this canonical plan format for `.sisyphus/plans/YYMMDDHHMM-sync-template-vX.Y.Z.md`.

## 1) TL;DR

- Summarize template gap (`from -> to`).
- List primary deliverables.
- Estimate effort (`Small | Medium | Large`).
- State whether tasks run in parallel or sequential fallback.

## 2) Context

- Record baseline version discovery source (`.template-version`, `package.json`, commit history, or user input).
- Record upstream evidence (releases, commits, PR count).
- Record categorized change counts (`Infrastructure`, `Dependencies`, `Patterns`, `Features`, `Fixes`).

## 3) Name Substitution Matrix

Copy the resolved matrix from `references/substitution-rules.md` and project discovery.

## 4) Work Objectives

- Define core objective.
- Define concrete deliverables.
- Define Definition of Done checks.
- Define `Must Have` and `Must NOT Have` scope boundaries.

## 5) Execution Strategy

- Build wave plan with dependencies (`Wave 0`, `Wave 1`, ... `Wave FINAL`).
- Define which tasks can run in parallel.
- Define sequential fallback when delegation is unavailable.

## 6) TODO Items

For each TODO include:

- **Task**: exact action.
- **Must NOT Do**: guardrails for this task.
- **Execution Mode**: `delegated` (preferred) or `direct` fallback.
- **Parallelization**: `can run with`, `blocks`, `blocked by`.
- **References**: template source files and project target files.
- **Acceptance Criteria**: verifiable outcomes.
- **QA Scenario**: exact command(s) and expected result.
- **Commit Group**: intended commit bucket.

## 7) Plan Summary for Approval

Present this summary before implementation:

```md
## Sync Template v<old> -> v<new>

**Changes**: N commits, M PRs, K releases
**Waves**: W (+ verification)
**Tasks**: T total
**Estimated effort**: [Small/Medium/Large]

Approve to start execution?
```

## Delegation Prompt Template

Use this prompt when delegation is available:

```text
TASK: [from plan]
EXPECTED OUTCOME: [acceptance criteria]
REQUIRED TOOLS: [from plan]
MUST DO:
- Apply substitution matrix from references/substitution-rules.md
- Use template source path: $TPL
- [task-specific requirements]
MUST NOT DO:
- Overwrite project-specific business logic
- Leave forbidden template strings outside approved exceptions
- [task-specific guardrails]
CONTEXT:
- Template source: $TPL/<file>
- Project target: <file>
- [additional context]
```

If delegation is unavailable, execute the same task directly in the main agent and preserve acceptance criteria plus commit grouping.
