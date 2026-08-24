# Blogic Marketplace

Reference repository for reusable skills and automation patterns for coding agents.

The repository is a collection of working material from Blogic projects. Browse it, copy the parts you need, and adapt them to your agent and project. It is not an installable plugin or a supported one-click product.

## What to explore

| Area                      | Path                                         | What it demonstrates                                                               |
| ------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| Agent automation examples | [`agent-kit/`](agent-kit/)                   | Skills, commands, lifecycle hook scripts, and MCP configuration                    |
| Shared skills             | [`template-ts/skills/`](template-ts/skills/) | Standalone skills with focused `SKILL.md` files and optional references or scripts |
| Repository checks         | [`check.ts`](check.ts)                       | Running format, lint, and TypeScript checks together                               |

## agent-kit examples

[`agent-kit/`](agent-kit/) preserves examples from an earlier Claude Code plugin. The installable plugin and marketplace manifests have been removed. The remaining files demonstrate:

- lifecycle hook handlers for session start, edits, stop, and approval notifications;
- commands for manual checks, code review, requirements, and parallel work;
- skills ranging from a single file to layouts with references, examples, and scripts;
- an HTTP MCP connection configuration;
- a Node runner for dispatching shell-based hook handlers.

See [`agent-kit/README.md`](agent-kit/README.md) for a guided tour and the assumptions that need adaptation.

## template-ts skill library

[`template-ts/skills/`](template-ts/skills/) contains reusable development workflows for TypeScript applications. The examples cover review loops, Git workflows, frontend and backend conventions, testing, databases, and operations.

These skills follow the portable Agent Skills directory format. They can be inspected directly or installed selectively with a compatible skills client. See [`template-ts/README.md`](template-ts/README.md).

## Use the examples

There is no repository-wide installation step.

1. Choose a skill, command, hook, or configuration relevant to your agent.
2. Read the file and any linked references.
3. Copy it into the location expected by your agent.
4. Replace Blogic-specific paths, tools, services, and environment variables.
5. Test it in the target project.

The `agent-kit` examples use Claude Code names such as `CLAUDE_PLUGIN_ROOT` because that is where they originated. Other agents need equivalent paths and lifecycle wiring.

Install standalone `template-ts` skills with the Agent Skills CLI when appropriate:

```bash
npx skills add blogic-cz/blogic-marketplace/template-ts
```

## Validate repository changes

```bash
bun install
bun run check
```

## Related repository

Gemini CLI examples live in [`blogic-cz/agent-kit-gemini`](https://github.com/blogic-cz/agent-kit-gemini).

## License

MIT
