---
name: code-review
description: "Effective-change-set review with repository baseline, mechanical and structural passes, validation, bounded fixes, and terminal result contract."
---

# Code Review

Use for local changes, PR changes, or review loops. Read [`references/repository.md`](references/repository.md) first, then changed-surface instructions. Reviewer lanes report findings only; change owner makes fixes.

## Review budget

Accept optional `max-turns=<positive integer>`; default to `10`. Reject missing, zero, negative, non-integer, or malformed values before first pass. There is no upper bound. Count each complete review pass against this budget; when exhausted without `RESULT: PASSED`, stop with current evidence and ask whether to start a new explicitly authorized run. Never extend automatically.

## 1. Select effective review scope

Review current intended change, not only `HEAD`:

1. identify base from explicit target, PR metadata, or repository default; ask if ambiguous;
2. compute committed range `base...HEAD`;
3. union staged (`git diff --cached`), unstaged (`git diff`), and intended untracked files;
4. recompute union before every pass and after every fix.

Unchanged code is evidence only when effective diff causes risk. Preserve unrelated working-tree changes.

## 2. Repository baseline

Read `AGENTS.md`, applicable contributor instructions, format/lint/test commands, architecture/domain docs, and changed-surface conventions. Repository rules define severity and required validation. Skip generated output unless generator inputs/templates/configuration changed.

## 3. Passes

### Mechanical pass

Read every changed file with context. Check correctness, security/privacy, data loss, authorization/validation, compatibility/contracts, error handling, concurrency, migrations/configuration, and behavior tests. See [`review.md`](references/review.md).

### Structural pass

Run only when explicitly requested or repository requires it. Apply [`structural-review.md`](references/structural-review.md): find material complexity, ownership, invariant, boundary, or duplicate-canonical-helper regressions. Do not block on cosmetics, line count, or speculative refactors.

### Validation pass

For runnable behavior, API/contract, permissions, jobs/events, migration, generated-client, or browser-visible changes, derive concrete happy, negative, permission, and boundary cases. Apply [`validation.md`](references/validation.md). Browser/live/worktree tools are conditional, never assumed.

## Finding bar

Report only material, actionable, diff-caused risks. Severity:

- **Critical:** likely security/privacy breach, data corruption/loss, public-contract break, or main-path outage.
- **Important:** material correctness, authorization, persistence, compatibility, coverage, architecture, or changed hot-path performance risk.
- **Summary:** concrete maintainability observation; never blocks unless material risk applies.

One finding per root cause, anchored to best changed `path:line`. State concrete risk, repository evidence/rule, and required action. Omit praise, preferences, stale/duplicate comments, and speculative cleanup.

## Bounded review loop

Use [`loop.md`](references/loop.md). Coordinator runs deterministic checks after owner fixes, then recomputes full effective scope and requests fresh findings-only review. Never clear finding by assumption. On remaining material finding, scope expansion, or budget exhaustion, stop with current evidence and request direction.

## Output contract

Reviewer returns findings only and does not edit, commit, push, or post. Every pass ends:

```text
CODE REVIEW
Scope: <base>...<head plus staged/unstaged/untracked intended overlay>
Depth: <standard|structural>
Findings: <none|severity summaries with path:line>
Checks: <not run|required commands and outcomes>
Residual risk: <none|summary>
RESULT: PASSED|FAILED
```

Terminal final non-empty line must be exactly `RESULT: PASSED` or `RESULT: FAILED`. Pass only when all material diff risks are classified, no unresolved Critical/Important finding remains, required selected validation is passed or clearly blocked, and current effective scope was freshly reviewed.
