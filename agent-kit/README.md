# agent-kit reference plugin

`agent-kit` is a working Claude Code plugin used here as a reference. It shows how plugin components fit together. Treat it as source material to adapt, not as a universal project setup.

## Map

| Component       | Path                                                       | Example                                             |
| --------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| Plugin manifest | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) | Metadata, MCP registration, and hook wiring         |
| MCP connection  | [`.mcp.json`](.mcp.json)                                   | Configuration for an external HTTP MCP server       |
| Hooks           | [`scripts/`](scripts/)                                     | Session, post-edit, stop, and notification handlers |
| Commands        | [`commands/`](commands/)                                   | User-invoked Markdown commands                      |
| Skills          | [`skills/`](skills/)                                       | Standalone and multi-file skill layouts             |

## Hook flow

The manifest registers four lifecycle events:

- `SessionStart` runs [`scripts/session-start-dynamic.sh`](scripts/session-start-dynamic.sh) through [`scripts/runner.js`](scripts/runner.js).
- `PostToolUse` marks edits and runs project checks after `Edit` or `Write`.
- `Stop` runs final checks only when edit tracking reports changes.
- `Notification` calls the approval notification script.

[`scripts/runner.js`](scripts/runner.js) keeps manifest commands portable by resolving scripts from `CLAUDE_PLUGIN_ROOT`. [`scripts/edit-tracker.sh`](scripts/edit-tracker.sh) demonstrates file-based state shared by multiple hooks.

Projects opt into checks through `.claude/check-after-edit.sh` and `.claude/check-after-stop.sh`. See the examples at the repository root.

## Skill layouts

- [`skills/andocs/SKILL.md`](skills/andocs/SKILL.md) is a single-file reference skill.
- [`skills/process-spec/`](skills/process-spec/) adds separate `examples/` and `references/` files.
- [`skills/skill-creator/`](skills/skill-creator/) adds references and executable helper scripts.

Claude Code exposes plugin skills under the plugin namespace, for example `/agent-kit:process-spec`.

## Commands

[`commands/`](commands/) contains examples for manual hook checks, requirements workflows, code review, skill scanning, and parallel execution. Commands are retained as examples of the legacy command layout. Prefer `skills/<name>/SKILL.md` for new reusable workflows.

## MCP

[`.mcp.json`](.mcp.json) configures a connection to an external HTTP MCP service. Claude Code connects to plugin-provided remote server configurations when the plugin is enabled. Check service ownership, authentication, and data handling before reusing this configuration.

## Test locally

```bash
claude --plugin-dir ./agent-kit
```

From Claude Code, run `/reload-plugins` after edits. Use marketplace installation only when testing marketplace behavior.
