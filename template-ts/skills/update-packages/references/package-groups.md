# Package Groups (Update Together)

Update each group as a unit. Check every member for version skew, deprecation, or a replacement that the outdated report may miss.

| Group               | Packages                                                                                                                                                | Replaced by                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **tanstack-router** | `@tanstack/react-router`, `@tanstack/router-devtools`, `@tanstack/router-plugin`, `@tanstack/react-start`, `@tanstack/react-router-ssr-query`           | `@tanstack/react-router-with-query` → `@tanstack/react-router-ssr-query` |
| **tanstack-query**  | `@tanstack/react-query`, `@tanstack/react-query-devtools`, `@tanstack/query-core`                                                                       |                                                                          |
| **trpc**            | `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@trpc/tanstack-react-query`                                                                       |                                                                          |
| **effect**          | `effect`, `@effect/platform-bun`, `@effect/platform-node-shared`, `@effect/vitest`, `@effect/opentelemetry`, `@effect/language-service`, `@effect/tsgo` |                                                                          |
| **drizzle**         | `drizzle-orm`, `drizzle-kit`, `drizzle-zod`                                                                                                             |                                                                          |
| **pino**            | `pino`, `pino-pretty`, `@types/pino`                                                                                                                    |                                                                          |
| **playwright**      | `@playwright/test`, `playwright`                                                                                                                        |                                                                          |

Update each listed package together. Keep the Effect packages on one exact release family and verify that the lockfile contains one `effect@` entry after installation.
