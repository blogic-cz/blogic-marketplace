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

## CRITICAL: Never Use `Effect.runPromise` in Production Code

**`Effect.runPromise` uses the default runtime which has NO layers** — no tracer, no config, no observability. Effect spans (`Effect.fn`, `Effect.withSpan`) will be invisible to Sentry/OpenTelemetry.

**Always use `runtime.runPromise`** from the app's `ManagedRuntime` (defined in `effect-runtime.ts`). This runtime includes `AppLayer` with all production layers (`SentryTracingLive`, `ServerConfigLayer`, service layers, etc.).

```ts
// ❌ BAD — spans invisible, no tracing, no layers
const result = await Effect.runPromise(program.pipe(Effect.provide(someLocalLayer)));

// ✅ GOOD — full observability via AppLayer (SentryTracingLive, etc.)
import { runtime } from "@/infrastructure/effect-runtime";

const result = await runtime.runPromise(
  program.pipe(Effect.catchTag("DomainError", (e) => Effect.fail(mapToHttpError(e)))),
);
```

**If `runtime.runPromise` is not possible** (e.g., circular dependency, or code must stay decoupled from the global runtime), add `SentryTracingLive` explicitly to the local layer chain:

```ts
import { SentryTracingLive } from "@/infrastructure/effect-sentry-tracing";

const result = await Effect.runPromise(
  program.pipe(
    Effect.provide(localServiceLayer),
    Effect.provide(SentryTracingLive), // Ensures Effect spans appear in Sentry
  ),
);
```

**Why this matters:** Without a tracer layer, `Effect.fn("ServiceName.method")` spans are silently dropped. This was the root cause of missing Effect spans in Sentry traces (discovered Feb 2026).

**Allowed exceptions:**

- Test files (`__tests__/`) — tests provide their own layers
- One-off scripts and CLI tools — may use `Effect.runPromise` if tracing is not needed

## Mapping Errors To Transport

- Keep domain errors typed inside Effect
- Convert to TRPC/HTTP errors only at adapter boundary

## Server Configuration (Effect DI)

Environment variables are managed via **Effect ServerConfig** — a `Context.Tag` + `Layer` dependency injection pattern.

**Key files:**

| File                                                | Purpose                                                                     |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/web-app/src/env/server.ts`                    | `ServerConfig` Context.Tag + `ServerConfigLayer` (Effect Schema validation) |
| `apps/web-app/src/env/client.ts`                    | Client-side env (Effect Schema, `import.meta.env`)                          |
| `apps/web-app/src/infrastructure/effect-runtime.ts` | `AppLayer` includes `ServerConfigLayer`, re-exports `ServerConfig`          |

**Usage in TRPC routers** (preferred — via Effect DI):

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

**Usage in Effect services** (Layer dependency):

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

**Usage in utility functions** (config as parameter):

```ts
import type { ServerEnv } from "@/env/server";

export function myUtil(param: string, config: ServerEnv) {
  // Use config.FIELD directly
}
// Caller passes config from ServerConfig yield
```

**Bootstrap exceptions** (these 4 files may import `env` directly):

- `apps/web-app/src/auth/auth.ts` — Better Auth needs sync env access at init
- `apps/web-app/src/infrastructure/db.ts` — DB pool created before Effect runtime
- `apps/web-app/src/infrastructure/effect-runtime.ts` — integrates ServerConfigLayer into AppLayer
- `apps/web-app/server.ts` — server entry point

**Rules:**

- ❌ NEVER import `env` directly in TRPC routers or services — use `ServerConfig` DI
- ❌ NEVER import `ServerConfig` from `@/env/server` in TRPC routers — use `@/infrastructure/effect-runtime` re-export
- ✅ DO import `ServerConfig` from `@/env/server` inside Effect Layer definitions (to avoid circular deps)
