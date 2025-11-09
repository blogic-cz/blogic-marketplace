---
description: Run post-stop checks manually
allowed-tools: Read, Bash
---

# Check After Stop

Run the checks configured in `.claude/check-after-stop.sh`.

## Task

I'll read your `.claude/check-after-stop.sh` configuration file, extract the actual check commands (ignoring comments and wrapper functions), and run them directly.

This is useful for:
- Testing your final check configuration
- Running builds/tests before committing
- Verifying everything passes

## Process

1. Read `.claude/check-after-stop.sh` to see what checks are configured
2. Find the actual commands to run (e.g., `bun run check:ci`, `dotnet build`)
3. Execute those commands directly
4. Report results and any failures

Please:
1. First, read `.claude/check-after-stop.sh`
2. Look for uncommented commands (usually in `run_check_hook` calls)
3. Extract the actual command (first parameter)
4. Run that command directly

This approach bypasses wrapper scripts and runs your checks directly.
