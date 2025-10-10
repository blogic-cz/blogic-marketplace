# Blogic Marketplace

A Claude Code plugin marketplace containing enterprise-grade plugins developed by Blogic.

## Available Plugins

### Agent Kit

Base plugin providing essential development tools and MCP server integrations.

**Features:**

- Requirements management commands
- Integrated MCP servers for enhanced functionality
- Development workflow automation

**Included MCP Servers:**

- **npm-sentinel-mcp** - NPM package analysis and security scanning
- **chrome-dev-tools** - Chrome DevTools automation and debugging
- **sentry-spotlight** - Local error debugging with Spotlight
- **sentry** - Sentry error tracking and monitoring integration
- **agentsfera** - Agentsfera API integration for extended capabilities

## Installation

### Add the Marketplace

```bash
claude plugin marketplace add https://github.com/blogic-cz/blogic-marketplace
```

Or for local development:

```bash
claude plugin marketplace add /path/to/blogic-marketplace
```

### Install a Plugin

Once the marketplace is added, you can install plugins directly:

```bash
claude plugin install agent-kit@blogic-marketplace
```

## Plugin Structure

```
blogic-marketplace/
├── .claude-plugin/
│   └── marketplace.json     # Marketplace configuration
├── agent-kit/
│   ├── .claude-plugin/
│   │   └── plugin.json      # Plugin manifest
│   ├── .mcp.json            # MCP server configurations
│   └── commands/            # Slash commands
│       ├── requirements-start.md
│       ├── requirements-end.md
│       ├── requirements-list.md
│       ├── requirements-status.md
│       ├── requirements-current.md
│       └── requirements-remind.md
└── README.md
```

## Requirements Management

The agent-kit plugin includes a comprehensive requirements management system:

- `/requirements-start` - Start tracking a new requirement
- `/requirements-end` - Mark a requirement as completed
- `/requirements-list` - View all requirements
- `/requirements-status` - Check status of specific requirements
- `/requirements-current` - Show currently active requirements
- `/requirements-remind` - Get reminders about pending requirements

## Development

### Adding New Plugins

1. Create a new directory in the marketplace root
2. Add `.claude-plugin/plugin.json` with plugin metadata
3. Add your commands, agents, hooks, or MCP servers
4. Update this README

### Testing Locally

Add your local marketplace:

```bash
claude plugin marketplace add /path/to/blogic-marketplace
```

Then install and test your plugin:

```bash
claude plugin install agent-kit@blogic-marketplace
```

After making changes, uninstall and reinstall to test updates:

```bash
claude plugin uninstall agent-kit@blogic-marketplace
claude plugin install agent-kit@blogic-marketplace
```

## License

MIT

## Author

Blogic - https://github.com/blogic-cz
