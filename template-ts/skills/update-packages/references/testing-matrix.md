# Testing Matrix

Run tests based on update type.

| Update Type            | Required Tests                                        |
| ---------------------- | ----------------------------------------------------- |
| UI/component packages  | `bun run check` + visual review                       |
| TRPC / TanStack Router | `bun run check` + `bun run test`                      |
| Drizzle ORM            | `bun run check` + `bun run test`                      |
| Effect packages        | `bun run check` + `bun run test`                      |
| Playwright             | `bun run check` + `bun run test:e2e`                  |
| Bun runtime            | `bun run check` + `bun run test` + `bun run test:e2e` |
| All others             | `bun run check`                                       |
