# MCP Kit for Gemini CLI

This extension provides enterprise-grade MCP (Model Context Protocol) server integrations for Gemini CLI, giving you access to powerful development tools, error tracking, and extended API capabilities.

## Available MCP Servers

### 1. Chrome DevTools (`chrome-dev-tools`)

Browser automation and inspection via Chrome DevTools Protocol.

**Use cases:**
- Take screenshots of web pages
- Navigate and interact with web applications
- Inspect page structure and content
- Execute JavaScript in browser context
- Debug web applications

**Example tools:**
- `mcp__chrome-dev-tools__navigate_page` - Navigate to a URL
- `mcp__chrome-dev-tools__take_screenshot` - Capture page screenshots
- `mcp__chrome-dev-tools__take_snapshot` - Get page accessibility tree
- `mcp__chrome-dev-tools__click` - Click elements on the page
- `mcp__chrome-dev-tools__fill` - Fill form inputs

### 2. Sentry Spotlight (`sentry-spotlight`)

Local error debugging with Sentry Spotlight integration.

**Use cases:**
- Retrieve application errors from local development
- Debug frontend and backend errors
- View error traces with full context
- Analyze performance issues
- Access request/response data for failed operations

**Example tools:**
- `mcp__sentry-spotlight__get_local_errors` - Fetch recent errors
- `mcp__sentry-spotlight__get_local_logs` - Retrieve application logs
- `mcp__sentry-spotlight__get_local_traces` - Get performance traces
- `mcp__sentry-spotlight__get_events_for_trace` - Detailed trace analysis

**When to use:**
- Debugging "error", "broken", "not working" issues
- Before/after making code changes to verify no regressions
- Investigating unexpected behavior

### 3. Sentry Cloud (`sentry`)

Cloud-based error tracking and monitoring via Sentry.io.

**Use cases:**
- Access production error data
- Query error trends across deployments
- Investigate user-reported issues
- Monitor application health
- Track error resolution status

**Setup required:** Configure Sentry API credentials via environment variables.

### 4. Agentsfera (`agentsfera`)

Extended API capabilities and integrations.

**Use cases:**
- Access additional external APIs
- Extended workflow automation
- Integration with third-party services

**Setup required:** Configure Agentsfera API credentials via environment variables.

## Usage Guidelines

### When to Use These Tools

**Chrome DevTools:**
- User mentions "browser", "webpage", "screenshot", "navigate"
- Testing web applications
- Visual verification needed

**Sentry Spotlight:**
- **CRITICAL:** Call immediately when user says "error", "broken", "failing", "crash"
- Before and after code changes to verify no regressions
- Investigating performance problems
- Get actual runtime failures instead of analyzing code

**Sentry Cloud:**
- Production error investigation
- Cross-deployment analysis
- User-reported issues from production

**Agentsfera:**
- Extended API needs beyond built-in capabilities

### Best Practices

1. **Error Investigation:** Always check Sentry Spotlight first when debugging issues
2. **Browser Testing:** Use Chrome DevTools for visual validation and interaction testing
3. **Context Matters:** Use the right tool for the environment (local vs. production)
4. **Environment Setup:** Ensure required credentials are configured for HTTP-based servers

## Relationship to Claude Code Version

This extension is the Gemini CLI equivalent of the `agent-kit` plugin for Claude Code.

**Key differences:**
- **Gemini CLI (this extension):** MCP servers only
- **Claude Code agent-kit:** MCP servers + automated hooks for quality gates

The Claude Code version includes PostToolUse and Stop hooks that automatically run linting, formatting, builds, and tests. Gemini CLI does not support hooks, so this version focuses solely on providing MCP server access.

## Installation

```bash
# Install from local path
gemini extensions install --path=/path/to/blogic-marketplace/mcp-kit-gemini

# Or install from GitHub (when published)
gemini extensions install https://github.com/your-org/blogic-marketplace/mcp-kit-gemini
```

## Requirements

- Gemini CLI 0.4.0 or higher
- Node.js (for npx-based MCP servers)
- Chrome/Chromium (for Chrome DevTools MCP server)
- Sentry Spotlight running locally (for local error debugging)
- API credentials (for Sentry Cloud and Agentsfera HTTP servers)

## Support

For issues or questions about this extension, visit the [blogic-marketplace repository](https://github.com/your-org/blogic-marketplace).
