---
name: issue-flow
description: This skill guides portable issue delivery from a concrete reproduction through a smallest verified fix, review, Git and CI lifecycle, final evidence, and session reflection.
compatibility: opencode
---

# Issue Flow

Use to deliver a reported defect or narrowly scoped change. Keep each stage evidence-led and delegate specialized work to its owner.

## Delivery Flow

1. State concrete reproduction: inputs or steps, observed result, expected result, and scope.
2. Trace relevant code and callers; identify root cause before changing behavior. When available, use the narrowest read-only CI, PR, log, trace, metric, database, or session tool to gather evidence before guessing.
3. Make smallest fix that resolves reproduced behavior without unrelated refactoring.
4. Run smallest relevant checks and tests; use `testing-patterns` for test design.
5. Run bounded changed-scope review with `code-review`; address material findings and recheck affected scope.
6. Follow `git-workflow` for branch, commit, pull request, CI, and review-feedback lifecycle when those actions are requested or required by repository policy.
7. Record final evidence: reproduction result, changed behavior, checks run, and known limits.
8. Run `reflect` as final required workflow step. Put reusable agent-infrastructure lessons in separate follow-up work, not this issue change.

`/whats-next` is optional and user-invoked; it is not a required delivery step.

## Scope

Use specialist skills only when relevant: `frontend-standards`, `backend-standards`, `trpc-patterns`, `drizzle-database`, `testing-patterns`, `performance-optimization`, and the repository's tool router for CI or live-data debugging.
