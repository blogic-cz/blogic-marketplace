# Blogic Marketplace

Reference repository for Claude Code plugins and reusable agent skills used in Blogic projects.

This repository is primarily a collection of working examples. Read, copy, and adapt the parts you need. The examples are maintained for Blogic workflows and are not a supported, one-click product for every project.

## What to explore

| Area                 | Path                                                                 | What it demonstrates                                                               |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Claude Code plugin   | [`agent-kit/`](agent-kit/)                                           | Plugin manifest, lifecycle hooks, commands, skills, scripts, and an MCP server     |
| Shared skills        | [`template-ts/skills/`](template-ts/skills/)                         | Standalone skills with focused `SKILL.md` files and optional references or scripts |
| Marketplace manifest | [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) | Publishing a local plugin through a Claude Code marketplace                        |
| Repository checks    | [`check.ts`](check.ts)                                               | Running format, lint, and TypeScript checks together                               |

## agent-kit reference plugin

[`agent-kit/`](agent-kit/) is a complete Claude Code plugin example. It includes:

- lifecycle hooks for session start, edits, stop, and approval notifications;
- commands for manual checks, code review, requirements, and parallel work;
- skills ranging from a small standalone skill to skills with references, examples, and scripts;
- an HTTP MCP server configuration;
- a Node runner that dispatches hook scripts from the plugin manifest.

See [`agent-kit/README.md`](agent-kit/README.md) for a guided tour.

## template-ts skill library

[`template-ts/skills/`](template-ts/skills/) contains reusable development workflows for TypeScript applications. The examples cover small reference skills, multi-file skills, review loops, Git workflows, frontend and backend conventions, testing, databases, and operations.

See [`template-ts/README.md`](template-ts/README.md) for usage and structure.

## Try the examples locally

You do not need to install the marketplace to inspect or adapt anything in this repository.

Load the plugin directly while developing:

```bash
claude --plugin-dir ./agent-kit
```

Install it through the marketplace only when you want to test that flow:

```text
/plugin marketplace add https://github.com/blogic-cz/blogic-marketplace
/plugin install agent-kit@blogic-marketplace
```

Install standalone `template-ts` skills with the Agent Skills CLI:

```bash
npx skills add blogic-cz/blogic-marketplace/template-ts
```

These examples may assume Blogic project conventions, local tools, or external services. Review each file before copying it into another project.

## Validate changes

```bash
bun install
bun run check
```

## Related repository

Gemini CLI examples live in [`blogic-cz/agent-kit-gemini`](https://github.com/blogic-cz/agent-kit-gemini).

## License

MIT
