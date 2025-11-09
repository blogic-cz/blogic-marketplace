---
description: Run post-edit checks manually
allowed-tools: Read, Bash
---

# Check After Edit

Run the checks configured in `.claude/check-after-edit.sh`.

## Task

I'll read your `.claude/check-after-edit.sh` configuration file, extract the actual check commands (ignoring comments and wrapper functions), and run them directly.

This is useful for:
- Testing your check configuration
- Running checks on-demand without making edits
- Verifying that checks pass before committing

## Process

1. Read `.claude/check-after-edit.sh` to see what checks are configured
2. Find the actual commands to run (e.g., `bun run check`)
3. Execute those commands directly
4. Report results and any failures

Please:
1. First, read `.claude/check-after-edit.sh`
2. Look for uncommented commands (usually in `run_check_hook` calls)
3. Extract the actual command (first parameter)
4. Run that command directly

This approach bypasses wrapper scripts and runs your checks directly.
