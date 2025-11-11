---
description: Scan available skills and inject them into context
allowed-tools: Bash
---

# Skill Scan

Scan all available skills from plugin and project directories and inject them into conversation context.

## Purpose

This command is useful when:
- You need a reminder of available skills during a session
- Skills were added after session start
- You want Claude to check for relevant skills before starting work
- You're debugging skill availability

## What It Does

1. Scans plugin skills from `${CLAUDE_PLUGIN_ROOT}/skills/`
2. Scans project skills from `.claude/skills/` (if present)
3. Parses SKILL.md frontmatter (name and description)
4. Displays formatted list with skill counts
5. Injects reminder to use Skill tool when applicable

## Task

Execute the skill scanner script to refresh the available skills list in context.

Run:
```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/list-skills.sh"
```

This will output a JSON context injection that Claude will automatically incorporate.
