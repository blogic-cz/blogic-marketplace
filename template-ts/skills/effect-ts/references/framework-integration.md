# Framework Integration

## Managed Runtime Boundary

Use `ManagedRuntime.make(...)` once for app-level layer composition and run Effects at framework edges.

Typical boundaries:

- TRPC handlers
- HTTP route handlers
- Worker/cron entrypoints

```ts
const result = await runtime.runPromise(
  program.pipe(Effect.catchTag("DomainError", (e) => Effect.fail(mapToHttpError(e)))),
);
```

## Effect.fn Style

Preferred style in services:

```ts
const generate = Effect.fn("SlugService.generate")(function* (name: string) {
  // implementation
});
```

Use concise `function*` style unless explicit wrapping is needed.

## Provide Strategy

- Keep layer graph composition near runtime setup
- Avoid ad-hoc `provide` chains in domain functions
- Test code can compose dedicated test layers per spec

## Runtime Execution Rule

Avoid `Effect.runPromise` by default in production paths.

Use `runtime.runPromise` from the app's `ManagedRuntime` whenever possible so tracing/config/service layers stay active.

```ts
// Avoid by default: spans may be invisible, layers may be missing
const result = await Effect.runPromise(program.pipe(Effect.provide(someLocalLayer)));

// Preferred: preserve observability via AppLayer (SentryTracingLive, etc.)
import { runtime } from "@/infrastructure/effect-runtime";

const result = await runtime.runPromise(
  program.pipe(Effect.catchTag("DomainError", (e) => Effect.fail(mapToHttpError(e)))),
);
```

Use `Effect.runPromise` only when `runtime.runPromise` is not viable (for example circular dependency constraints, intentionally decoupled modules, tests, or one-off scripts/CLI where full tracing is unnecessary). When taking this path in production code, add required tracer/config layers explicitly:

```ts
import { SentryTracingLive } from "@/infrastructure/effect-sentry-tracing";

const result = await Effect.runPromise(
  program.pipe(
    Effect.provide(localServiceLayer),
    Effect.provide(SentryTracingLive), // Preserve Effect spans in Sentry
  ),
);
```

Preserve tracer layers so `Effect.fn("ServiceName.method")` spans are not silently dropped.

Allowed exceptions:

- Test files (`__tests__/`) — tests provide their own layers
- One-off scripts and CLI tools — may use `Effect.runPromise` if tracing is not needed

## Mapping Errors To Transport

- Keep domain errors typed inside Effect
- Convert to TRPC/HTTP errors only at adapter boundary

## Server Configuration (Effect DI)

Environment variables are managed via **Effect ServerConfig** — a `Context.Tag` + `Layer` dependency injection pattern.

Template convention (blogic-template-ts) key files:

| File                                                | Purpose                                                                     |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/web-app/src/env/server.ts`                    | `ServerConfig` Context.Tag + `ServerConfigLayer` (Effect Schema validation) |
| `apps/web-app/src/env/client.ts`                    | Client-side env (Effect Schema, `import.meta.env`)                          |
| `apps/web-app/src/infrastructure/effect-runtime.ts` | `AppLayer` includes `ServerConfigLayer`, re-exports `ServerConfig`          |

Usage in TRPC routers (preferred — via Effect DI):

```ts
import { Effect } from "effect";
import { runtime, ServerConfig } from "@/infrastructure/effect-runtime";

// Inside TRPC mutation/query handler:
return runtime.runPromise(
  Effect.gen(function* () {
    const config = yield* ServerConfig;
    // Use config.BASE_URL, config.ENCRYPTION_KEY, etc.
  }),
);
```

Usage in Effect services (Layer dependency):

```ts
import { ServerConfig } from "@/env/server"; // NOT from effect-runtime (avoid circular deps)

export const MyServiceLive = Layer.effect(
  MyService,
  Effect.gen(function* () {
    const config = yield* ServerConfig;
    // Build service using config values
  }),
);
// Then add Layer.provide(ServerConfigLayer) in effect-runtime.ts
```

Usage in utility functions (config as parameter):

```ts
import type { ServerEnv } from "@/env/server";

export function myUtil(param: string, config: ServerEnv) {
  // Use config.FIELD directly
}
// Caller passes config from ServerConfig yield
```

Template convention (blogic-template-ts) bootstrap exceptions (these files may import `env` directly):

- `apps/web-app/src/auth/auth.ts` — Better Auth needs sync env access at init
- `apps/web-app/src/infrastructure/db.ts` — DB pool created before Effect runtime
- `apps/web-app/src/infrastructure/effect-runtime.ts` — integrates ServerConfigLayer into AppLayer
- `apps/web-app/server.ts` — server entry point

Rules:

- Do not import `env` directly in TRPC routers or services; use `ServerConfig` DI
- Do not import `ServerConfig` from `@/env/server` in TRPC routers; use the `@/infrastructure/effect-runtime` re-export
- Import `ServerConfig` from `@/env/server` inside Effect Layer definitions to avoid circular dependencies
