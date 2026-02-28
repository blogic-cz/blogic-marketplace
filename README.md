# Blogic Marketplace

Agent skills and plugins for Blogic TypeScript fullstack projects.

## template-ts Skills

Shared skills for all apps built on [blogic-template-ts](https://github.com/blogic-cz/blogic-template-ts). Works with Claude Code, OpenCode, Cursor, Cline, Copilot, Windsurf, and other agents.

### Install all skills

```bash
npx skills add blogic-cz/blogic-marketplace --all
```

### Install specific skills

```bash
npx skills add blogic-cz/blogic-marketplace --skill drizzle-database --skill trpc-patterns --skill tanstack-frontend
```

### Interactive selection

```bash
npx skills add blogic-cz/blogic-marketplace
```

### Update

```bash
npx skills update
```

### Available skills

| Skill | Description |
|---|---|
| `better-auth` | Authentication and authorization with Better Auth |
| `code-review` | Pre-PR code review checklist |
| `debugging-with-opensrc` | Debug libraries by reading their source code |
| `drizzle-database` | Database schemas, queries, and migrations with Drizzle ORM |
| `effect-expert` | Effect TypeScript services, layers, and error handling |
| `frontend-design` | UI components, styling, and layouts |
| `git-workflow` | PR lifecycle, branch management, and CI monitoring |
| `kubernetes-helm` | Kubernetes deployments with Helm charts |
| `marketing-expert` | Marketing copy and landing pages |
| `performance-optimization` | N+1 fixes, batch operations, and query optimization |
| `process-db-report` | PostgreSQL performance report analysis |
| `production-troubleshooting` | Debug production/test performance issues |
| `react-doctor` | React codebase health diagnostics |
| `requirements` | Structured 5-phase requirements gathering |
| `scan-effect-solutions` | Effect TypeScript compliance audit |
| `sentry-integration` | Error tracking and tracing with Sentry |
| `tanstack-frontend` | TanStack Router routes, TRPC prefetching, and forms |
| `tdd` | Test-driven development with Red-Green-Refactor |
| `testing-patterns` | Unit tests, TRPC integration tests, and E2E tests |
| `trpc-patterns` | TRPC routers, procedures, and middleware |
| `update-packages` | npm package updates with breaking change handling |

## agent-kit Plugin

Plugin with MCP servers, hooks, and commands for Claude Code.

### Install

```bash
claude
/plugin marketplace add https://github.com/blogic-cz/blogic-marketplace
/plugin install agent-kit@blogic-marketplace
```

### Gemini CLI

Available in a separate repository:

```bash
gemini extensions install https://github.com/blogic-cz/agent-kit-gemini --auto-update
```

### What's included

- **MCP Servers**: Chrome DevTools, Sentry Spotlight, Sentry Cloud, Agentsfera
- **Automated Hooks**: Post-edit checks, post-stop quality gates
- **Skills**: andocs rendering, skill-creator

## License

MIT
