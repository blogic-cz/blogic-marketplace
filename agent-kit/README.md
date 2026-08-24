# agent-kit examples

`agent-kit` is a reference collection of skills, commands, MCP configuration, and lifecycle automation from an earlier Claude Code plugin.

The plugin and marketplace manifests have been removed. Default plugin component directories are nested under `examples/`, so Claude Code does not discover this directory as a plugin. Read and adapt individual examples for Claude Code or another coding agent.

## Map

| Component      | Path                                       | Example                                               |
| -------------- | ------------------------------------------ | ----------------------------------------------------- |
| MCP connection | [`examples/.mcp.json`](examples/.mcp.json) | Configuration for an external HTTP MCP service        |
| Hook handlers  | [`examples/scripts/`](examples/scripts/)   | Session, post-edit, stop, and notification automation |
| Commands       | [`examples/commands/`](examples/commands/) | User-invoked Markdown workflows                       |
| Skills         | [`examples/skills/`](examples/skills/)     | Single-file and multi-file skill layouts              |

## Hook flow

The scripts preserve handlers for four Claude Code lifecycle events:

- `SessionStart` uses [`examples/scripts/session-start-dynamic.sh`](examples/scripts/session-start-dynamic.sh) to discover skills.
- `PostToolUse` uses [`examples/scripts/check-after-edit.sh`](examples/scripts/check-after-edit.sh) to track edits and run project checks.
- `Stop` uses [`examples/scripts/check-after-stop.sh`](examples/scripts/check-after-stop.sh) to run final checks after edited sessions.
- `Notification` uses [`examples/scripts/notify-approval.sh`](examples/scripts/notify-approval.sh) for approval notifications.

[`examples/scripts/runner.js`](examples/scripts/runner.js) demonstrates cross-platform dispatch from an agent lifecycle event to a shell script. [`examples/scripts/edit-tracker.sh`](examples/scripts/edit-tracker.sh) demonstrates file-based state shared by multiple handlers.

These scripts still use Claude Code environment variables such as `CLAUDE_PLUGIN_ROOT` and `CLAUDE_PROJECT_DIR`. Replace them or provide equivalent values when adapting the scripts to another agent.

## Skill layouts

- [`examples/skills/andocs/SKILL.md`](examples/skills/andocs/SKILL.md) is a single-file reference skill.
- [`examples/skills/process-spec/`](examples/skills/process-spec/) adds separate `examples/` and `references/` files.
- [`examples/skills/skill-creator/`](examples/skills/skill-creator/) adds references and executable helper scripts.

The `SKILL.md` layout follows the Agent Skills convention. Copy a chosen skill directory out of `examples/` into the location expected by the target agent.

## Commands

[`examples/commands/`](examples/commands/) contains examples for manual checks, requirements workflows, code review, skill scanning, and parallel execution. Some commands refer to Claude Code paths and tools. Treat them as workflow examples rather than drop-in commands for every agent.

## MCP

[`examples/.mcp.json`](examples/.mcp.json) configures a connection to an external HTTP MCP service. Check whether the target agent supports the same MCP configuration shape, then review service ownership, authentication, and data handling before reuse.
