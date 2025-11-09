---
description: Run post-stop checks manually
allowed-tools: Bash(bash:*)
---

# Check After Stop

Manually trigger the post-stop hook to run final quality checks.

## Task

I'll execute the check-after-stop hook script that normally runs automatically when a conversation ends.

This is useful for:
- Testing your hook configuration
- Running final checks before committing
- Verifying builds and tests pass

**Note**: This hook only runs if edits were made during the session. If no edits were detected, the hook will skip automatically.

## Process

1. Check if user script exists at `.claude/check-after-stop.sh`
2. Execute the user's check script
3. Report results and any failures
4. Clean up edit tracking if successful

Please execute:

```bash
if [ -f .claude/check-after-stop.sh ]; then
  export CLAUDE_PROJECT_DIR="$(pwd)"
  bash .claude/check-after-stop.sh
else
  echo "Error: .claude/check-after-stop.sh not found. Run agent-kit install script first."
  exit 1
fi
```

If no edits were tracked, you'll see: "No edits made in this session, skipping stop checks."

**Note**: The `CLAUDE_PLUGIN_ROOT` environment variable is automatically set by Claude Code when the agent-kit plugin is active.
