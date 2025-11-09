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

1. Set required environment variables
2. Execute the check-after-edit hook script
3. Report results and any failures

Please execute:

```bash
export CLAUDE_PROJECT_DIR="$(pwd)"
export CLAUDE_PLUGIN_ROOT="$(pwd)/agent-kit"
bash agent-kit/scripts/check-after-edit.sh
```

If the script doesn't exist or isn't configured, I'll guide you through setup.
