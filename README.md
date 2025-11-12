# Blogic Marketplace

Dual-platform marketplace for Claude Code and Gemini CLI extensions.

## Quick Install

### Claude Code

```bash
claude
/plugin marketplace add https://github.com/blogic-cz/blogic-marketplace
/plugin install agent-kit@blogic-marketplace
```

**→ Full documentation:** [agent-kit/README.md](./agent-kit/)

### Gemini CLI

```bash
npm install -g @google/gemini-cli@latest
gemini extensions install https://github.com/blogic-cz/blogic-marketplace/agent-kit-gemini
```

**→ Full documentation:** [agent-kit-gemini/README.md](./agent-kit-gemini/README.md)

## What's Included

| Platform | Extension | Features |
|----------|-----------|----------|
| **Claude Code** | `agent-kit` | MCP servers + automated hooks + slash commands |
| **Gemini CLI** | `agent-kit` | MCP servers only |

Both versions include:
- **Chrome DevTools** - Browser automation
- **Sentry Spotlight** - Local error debugging
- **Sentry Cloud** - Production error tracking
- **Agentsfera** - Extended APIs

## Repository Structure

```
blogic-marketplace/
├── agent-kit/           # Claude Code plugin (full features)
└── agent-kit-gemini/    # Gemini CLI extension (MCP servers only)
```

## License

MIT

## Author

Blogic - https://github.com/blogic-cz
