---
name: code-review
description: This skill performs findings-only change review or a bounded review loop when evaluating a current diff against its target branch before merge.
compatibility: opencode
---

# Code Review

Use for a pre-merge review of a current branch or an explicitly supplied diff. Reviewer identifies material findings; change owner fixes them.

## Start

1. Identify target branch from user or repository convention; ask if ambiguous.
2. Review current changes with `git diff <target>...HEAD` plus uncommitted changes when in scope.
3. Inspect changed context and relevant tests. Do not substitute recent commit history for target-branch diff.

## Modes

- **One-shot** — report findings only. Include severity, `file:line`, impact, and concise remediation. Do not edit code.
- **Review loop** — review one pass, hand findings to change owner, then recompute target diff after every fix. Re-review only changed scope until no material findings remain.

Run repository-required checks before a pass can succeed. Pass only when checks pass and no material findings remain. Use [references/review-method.md](references/review-method.md) for evidence, severity, and loop boundaries.

Load framework, database, testing, or security skills only when changed code needs that specialist guidance.
