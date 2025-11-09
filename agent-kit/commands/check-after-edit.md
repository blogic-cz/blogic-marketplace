---
description: Run post-edit checks manually
allowed-tools: Bash(bash:*)
---

# Check After Edit

Manually trigger the post-edit hook to run linting, formatting, and other checks.

## Task

I'll execute the check-after-edit hook script that normally runs automatically after file edits.

This is useful for:
- Testing your hook configuration
- Running checks on-demand without making edits
- Verifying that checks pass before committing

## Process

1. Check if user script exists at `.claude/check-after-edit.sh`
2. Execute the user's check script
3. Report results and any failures

Please execute:

```bash
if [ -f .claude/check-after-edit.sh ]; then
  export CLAUDE_PROJECT_DIR="$(pwd)"
  bash .claude/check-after-edit.sh
else
  echo "Error: .claude/check-after-edit.sh not found. Run agent-kit install script first."
  exit 1
fi
```

**Note**: The `CLAUDE_PLUGIN_ROOT` environment variable is automatically set by Claude Code when the agent-kit plugin is active.
