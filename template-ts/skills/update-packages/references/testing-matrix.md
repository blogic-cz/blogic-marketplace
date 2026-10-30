# Testing Matrix

Run tests based on update type.

| Update Type            | Required Tests                                                             |
| ---------------------- | -------------------------------------------------------------------------- |
| UI/component packages  | `bun run check` + visual review                                            |
| TRPC / TanStack Router | `bun run check` + `bun run test`                                           |
| Drizzle ORM            | `bun run check` + `bun run test`                                           |
| Effect packages        | `bun run check` + `bun run test`                                           |
| Playwright             | `bun run check` + `(cd apps/web-app && bun run test:e2e)`                  |
| Bun runtime            | `bun run check` + `bun run test` + `(cd apps/web-app && bun run test:e2e)` |
| SDK major              | `bun run check` + `bun run test`                                           |
| All others             | `bun run check`                                                            |

For runtime, router, and SDK major updates, also build the production app and request `/` against that build. A healthy `/api/alive` response does not prove server rendering works.

After the change merges, verify that the `e2e-tests` job ran and passed on the merged commit. A skipped or cancelled job leaves end-to-end coverage unverified.
