---
description: Show git status and uncommitted changes
allowed-tools: Bash(git:*)
---

# Check Changes

Show current git status and uncommitted changes in the repository.

## Task

I'll show you:
1. Current branch and tracking status
2. All modified, added, and deleted files
3. Brief diff summary if requested

## Process

1. Run `git status` to show repository state
2. Display file changes with clear formatting
3. Show brief diff summary if $ARGUMENTS contains "diff" or "details"

Please execute:

```bash
git status
```

If showing details, also run:
```bash
git diff --stat
```
