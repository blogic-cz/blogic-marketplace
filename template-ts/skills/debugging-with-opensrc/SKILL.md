---
name: debugging-with-opensrc
description: "Load this skill when debugging behavior in external libraries by reading local OpenSrc mirrors (Effect, TanStack, TRPC, Drizzle, Better Auth, Sentry, Pino), or when docs conflict with runtime behavior and source-level verification is required."
---

# Debugging with OpenSrc

## Overview

Debug external library behavior by reading source first.

Treat OpenSrc mirrors as the source of truth for installed versions.

## When to Use This Skill

- Investigate an integration issue where application code depends on third-party library internals.
- Resolve a mismatch between documentation and observed runtime behavior.
- Confirm expected function signatures, defaults, error paths, or edge-case handling in an installed dependency.

## OpenSrc Commands

```bash
# Sync all repos (run after git clone)
bun run opensrc:sync

# Fetch new package
bun run opensrc:use <package>        # npm package
bun run opensrc:use owner/repo       # GitHub repo
```

## Available Repos (opensrc/repos/github.com/)

| Library             | Path                                                | What to look for                   |
| ------------------- | --------------------------------------------------- | ---------------------------------- |
| **Effect**          | `Effect-TS/effect/packages/effect/src/`             | Schema, Effect.gen, Layer, Context |
| **TanStack Router** | `TanStack/router/packages/react-router/src/`        | createFileRoute, loader, useParams |
| **TanStack Query**  | `TanStack/query/packages/react-query/src/`          | useSuspenseQuery, queryOptions     |
| **TanStack Form**   | `TanStack/form/packages/react-form/src/`            | useForm, validation                |
| **TanStack Start**  | `TanStack/router/packages/start/src/`               | SSR, server functions              |
| **TRPC**            | `trpc/trpc/packages/server/src/`                    | procedures, middleware, routers    |
| **Drizzle ORM**     | `drizzle-team/drizzle-orm/drizzle-orm/src/`         | pgTable, relations, queries        |
| **Better Auth**     | `better-auth/better-auth/packages/better-auth/src/` | auth config, plugins, sessions     |
| **OpenCode**        | `sst/opencode/packages/opencode/src/`               | skills, commands, plugins          |
| **Pino**            | `pinojs/pino/lib/`                                  | logger, transports                 |
| **Sentry**          | `getsentry/sentry-javascript/packages/`             | SDK, integrations, tracing         |

## Debugging Workflow

1. Define the failing behavior in one sentence (input, observed output, expected output).
2. Identify the exact dependency and package area involved.
3. Locate relevant source files in `opensrc/repos/github.com/` using available project search tools.
4. Read implementation and related types before changing app code.
5. Trace call flow from public API to internal helpers.
6. Extract concrete expectations:
   - Function signatures and return types
   - Required wrappers/builders/options
   - Defaults and optional parameter behavior
   - Error handling and edge cases
7. Apply the fix in app code based on verified behavior.
8. Validate with targeted tests or reproduction steps.

## Common Debugging Scenarios

### Scenario: TanStack Form Validation Not Working

1. Read `opensrc/repos/github.com/TanStack/form/packages/react-form/src/useForm.ts`.
2. Inspect validator interface and expected return type.
3. Verify how Standard Schema integration is wired in the installed version.
4. Fix application code from verified behavior.

### Scenario: TRPC Procedure Not Receiving Context

1. Read `opensrc/repos/github.com/trpc/trpc/packages/server/src/core/middleware.ts`.
2. Trace how context flows through middleware chain.
3. Verify middleware returns and `opts.next()` behavior in the active version.

### Scenario: Effect Layer Not Providing Service

1. Read `opensrc/repos/github.com/Effect-TS/effect/packages/effect/src/Layer.ts`.
2. Compare `Layer.effect` and `Layer.succeed` behavior.
3. Verify `Context.Tag` usage against library patterns.

### Scenario: Better Auth Session Not Persisting

1. Read `opensrc/repos/github.com/better-auth/better-auth/packages/better-auth/src/`.
2. Trace session handling and persistence flow.
3. Verify cookie/storage expectations in the installed code.

## Key Principle

**Source code is the truth.**

- Documentation can be outdated
- Stack Overflow answers may not apply to your version
- Blog posts may use different configurations
- Only the source code shows exactly what happens

## Example: Full Debugging Session

Problem: `useSuspenseQuery` returns `undefined` despite cached data.

1. Read `opensrc/repos/github.com/TanStack/query/packages/react-query/src/useSuspenseQuery.ts` and nearby type definitions.
2. Verify what input shape is expected in the installed version.
3. Confirm successful usage patterns in project code.
4. Apply a fix that matches verified expectations.

Note: A previous investigation in one version found that wrapping inputs via `queryOptions()` solved the issue. Treat this as an example finding, not a universal rule.

## OpenCode-Specific Internals

Use `references/opencode-skill-testing.md` when debugging OpenCode skill loading or autoload testing internals.

## Remember

1. **Read source FIRST** - before asking, before web searching
2. **Exact version matters** - opensrc has YOUR installed version
3. **Follow the code path** - trace from entry point to implementation
4. **Check types** - TypeScript types often reveal expected usage
5. **Look at tests** - library tests show correct usage patterns
