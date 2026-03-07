# Template File Categories

Categorization of `blogic-template-ts` files for sync decisions. Files marked **Infrastructure** should be adopted fully (with name substitution). Files marked **Business Logic** should NEVER be overwritten — only inspected for pattern changes.

## Root Config (Infrastructure — adopt fully)

| File | Purpose |
|------|---------|
| `package.json` | Workspace config, scripts, dependencies, packageManager |
| `tsconfig.json` | Root TypeScript config with project references |
| `tsconfig.base.json` | Shared compiler options |
| `vitest.config.ts` | Test runner config (PGlite, JUnit, retry) |
| `check.ts` | Code quality script (lint, typecheck, format) |
| `bunfig.toml` | Bun configuration |
| `.oxlintrc.json` | Lint rules (243+ rules, plugins) |
| `.oxfmtrc.jsonc` | Formatter config (import sorting, tailwind) |
| `.gitignore` | Git ignore patterns |
| `.dockerignore` | Docker ignore patterns |
| `.gitleaks.toml` | Secret detection config |
| `.cursorignore` | Cursor IDE ignore |
| `.ckignore` | CK ignore |
| `lefthook.yml` | Git hooks config |
| `docker-compose.yaml` | Local dev database |
| `dev.sh` | Development bootstrap script |
| `bun.lock` | Dependency lockfile |
| `skills-lock.json` | Marketplace skills manifest |
| `agent-tools.json5` | Agent tools configuration |
| `opencode.jsonc` | OpenCode permissions and config |
| `.mcp.json` | MCP server config |

## Agent & AI Config (Infrastructure — adopt fully)

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Development guidelines |
| `CLAUDE.md` | Symlink → AGENTS.md |
| `.claude/settings.json` | Claude Code hooks and config |
| `.opencode/oh-my-opencode.json` | OpenCode config |
| `.opencode/package.json` | OpenCode package |
| `.opencode/.gitignore` | OpenCode ignore |
| `.agents/skills/*/` | Installed marketplace skills |
| `opensrc/settings.json` | Open source debug repos config |
| `opensrc/sources.json` | Open source repo sources |

## CI/CD Workflows (Infrastructure — adopt with parameterization)

| Path | Purpose |
|------|---------|
| `.github/workflows/cicd.yml` | Main CI/CD pipeline |
| `.github/workflows/claude.yml` | Claude Code automation |
| `.github/workflows/claude-code-review.yml` | Claude PR review |
| `.github/workflows/opencode.yml` | OpenCode automation |
| `.github/prompts/code-review.md` | Code review prompt |

**Note**: CI workflows contain project-specific secrets, image names, namespaces. Apply name substitution but preserve project-specific secret names.

## Docker & Kubernetes (Infrastructure — adopt with parameterization)

| Path | Purpose |
|------|---------|
| `apps/web-app/Dockerfile` | Web app Docker build |
| `jobs/Dockerfile` | Jobs Docker build |
| `kubernetes/helm/web-app/` | Web app Helm chart |
| `kubernetes/helm/e2e-tests/` | E2E tests Helm chart |

**Note**: Helm values (`values.test.yaml`, `values.prod.yaml`) contain project-specific domains, namespaces, image names. Adopt chart templates, adapt values.

## Lint Plugins (Infrastructure — adopt fully)

| Path | Purpose |
|------|---------|
| `lint/plugins/enforce-props-type-name.ts` | Props type naming + no-console rules |
| `lint/plugins/max-file-lines.ts` | File size limits |

## Scripts (Infrastructure — adopt fully)

| Path | Purpose |
|------|---------|
| `scripts/clean-branches.ts` | Branch cleanup utility |
| `scripts/effect-diagnostics.ts` | Effect language service diagnostics |
| `scripts/opensrc-sync.ts` | Open source repo sync |
| `scripts/warmup-ck.ts` | CK warmup |

## Agent Tools (Infrastructure — adopt structure, customize tools)

| Path | Purpose |
|------|---------|
| `agent-tools/package.json` | Agent tools workspace package |
| `agent-tools/tsconfig.json` | Agent tools TypeScript config |
| `agent-tools/noop.ts` | Noop placeholder (template default) |

**Note**: The template ships with a noop placeholder. Projects add their own custom tools here.

## VSCode (Infrastructure — adopt fully)

| Path | Purpose |
|------|---------|
| `.vscode/settings.json` | Editor settings |
| `.vscode/extensions.json` | Recommended extensions |

## Changesets (Infrastructure — adopt config)

| Path | Purpose |
|------|---------|
| `.changeset/config.json` | Changesets configuration |

## App Infrastructure (Infrastructure — adopt patterns, preserve business logic)

These directories contain BOTH infrastructure AND business logic. Adopt the infrastructure layer; preserve project-specific business code.

| Path | Layer | Action |
|------|-------|--------|
| `apps/web-app/src/infrastructure/` | Infrastructure | **Adopt** — TRPC setup, middleware, DB client, Effect runtime |
| `apps/web-app/src/infrastructure/db/` | Infrastructure | **Adopt** — DB connection, tracing, migrations |
| `apps/web-app/src/infrastructure/trpc/` | Infrastructure | **Adopt** — TRPC context, middleware, procedures |
| `apps/web-app/src/infrastructure/middleware/` | Infrastructure | **Adopt** — Server middleware |
| `apps/web-app/src/infrastructure/components/` | Infrastructure | **Adopt** — Error boundaries, providers |
| `apps/web-app/src/infrastructure/lib/` | Infrastructure | **Adopt** — Utility libraries |
| `apps/web-app/src/env/` | Infrastructure | **Adopt** — Environment variable schemas |
| `apps/web-app/src/auth/` | Mixed | **Adopt infra** (auth setup, hooks) — preserve project-specific auth config |
| `apps/web-app/src/shared/ui/` | Infrastructure | **Adopt** — Shadcn/UI components |
| `apps/web-app/src/shared/layout/` | Infrastructure | **Adopt** — Layout components |
| `apps/web-app/src/shared/forms/` | Infrastructure | **Adopt** — Form utilities |
| `apps/web-app/src/shared/utils/` | Infrastructure | **Adopt** — Shared utilities |
| `apps/web-app/src/styles/` | Infrastructure | **Adopt** — CSS / Tailwind config |
| `apps/web-app/src/__tests__/` | Infrastructure | **Adopt** — Test setup and fixtures |
| `apps/web-app/src/hooks/` | Mixed | **Inspect** — adopt generic hooks, preserve project-specific |

## App Business Logic (DO NOT overwrite)

These directories are project-specific. Template changes here should only be inspected for pattern improvements.

| Path | Purpose |
|------|---------|
| `apps/web-app/src/routes/` | Page routes and loaders |
| `apps/web-app/src/admin/` | Admin module |
| `apps/web-app/src/contact/` | Contact module |
| `apps/web-app/src/dashboard/` | Dashboard module |
| `apps/web-app/src/organizations/` | Organizations module |
| `apps/web-app/src/projects/` | Projects module |
| `apps/web-app/src/project-permissions/` | Project permissions module |
| `apps/web-app/src/users/` | Users module |
| `apps/web-app/src/web/` | Public website / landing pages |
| `apps/web-app/src/og-templates/` | OG image templates |

## Packages (Mixed — adopt structure, preserve domain logic)

| Path | Layer | Action |
|------|-------|--------|
| `packages/common/` | Infrastructure | **Adopt** — shared types, branded IDs, access rights |
| `packages/db/src/schema/` | Business Logic | **DO NOT overwrite** — project-specific tables |
| `packages/db/src/index.ts` | Infrastructure | **Adopt** — DB client export |
| `packages/db/drizzle.config.ts` | Infrastructure | **Adopt** — migration config |
| `packages/db/package.json` | Infrastructure | **Adopt** — dependencies |
| `packages/logger/` | Infrastructure | **Adopt fully** |
| `packages/services/` | Mixed | **Adopt infra** (service patterns, Effect layers) — preserve project-specific services |

## Jobs (Infrastructure — adopt structure)

| Path | Purpose |
|------|---------|
| `jobs/pre-deployment/` | Pre-deployment migration scripts |
| `jobs/post-deployment/` | Post-deployment tasks |
| `jobs/Dockerfile` | Jobs Docker build |

## Documentation (Inspect only)

| Path | Purpose |
|------|---------|
| `README.md` | Project docs — adopt CI/CD sections, preserve project-specific content |
| `CHANGELOG.md` | Auto-generated — DO NOT sync |
| `docs/` | Documentation assets |

## Planning (DO NOT sync)

| Path | Purpose |
|------|---------|
| `.sisyphus/plans/` | Implementation plans (project-specific) |
| `requirements/` | Requirements documents (project-specific) |
