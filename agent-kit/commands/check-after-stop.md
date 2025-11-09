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

1. Set required environment variables
2. Execute the check-after-stop hook script
3. Report results and any failures
4. Clean up edit tracking if successful

Please execute:

```bash
export CLAUDE_PROJECT_DIR="$(pwd)"
export CLAUDE_PLUGIN_ROOT="$(pwd)/agent-kit"
bash agent-kit/scripts/check-after-stop.sh
```

If no edits were tracked, you'll see: "No edits made in this session, skipping stop checks."

If the script doesn't exist or isn't configured, I'll guide you through setup.
