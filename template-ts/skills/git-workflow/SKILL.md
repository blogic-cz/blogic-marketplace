---
name: git-workflow
description: This skill guides local Git branch, commit, synchronization, and pull-request lifecycle work when preparing or maintaining a change for review.
compatibility: opencode
---

# Git Workflow

Use for ordinary change lifecycle work. Respect user instructions and repository contribution rules before any branch, commit, push, or pull-request action.

## Lifecycle

1. Inspect status, target branch, and repository guidance; preserve unrelated changes.
2. Make focused changes and run relevant checks before creating a commit.
3. Use a concise commit message that describes changed behavior.
4. Push or open/update a pull request only when user or repository workflow requests it.
5. After CI or review feedback, make one focused fix, rerun relevant checks, and refresh status before next action.

Read detail only when needed:

- [references/branch-and-sync.md](references/branch-and-sync.md) — safe branch creation and synchronization
- [references/pull-request-lifecycle.md](references/pull-request-lifecycle.md) — review and CI follow-up

Never force-push, rewrite history, discard work, or resolve ambiguous conflicts without explicit approval.
