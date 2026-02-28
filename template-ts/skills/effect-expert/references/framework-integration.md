# Framework Integration

## Managed Runtime Boundary

Use `ManagedRuntime.make(...)` once for app-level layer composition and run Effects at framework edges.

Typical boundaries:

- TRPC handlers
- HTTP route handlers
- Worker/cron entrypoints

```ts
const result = await runtime.runPromise(
  program.pipe(
    Effect.catchTag("DomainError", (e) =>
      Effect.fail(mapToHttpError(e))
    )
  )
);
```

## Effect.fn Style

Preferred style in services:

```ts
const generate = Effect.fn("SlugService.generate")(
  function* (name: string) {
    // implementation
  }
);
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
const result = await Effect.runPromise(
  program.pipe(Effect.provide(someLocalLayer))
);

// ✅ GOOD — full observability via AppLayer (SentryTracingLive, etc.)
import { runtime } from "@/infrastructure/effect-runtime";

const result = await runtime.runPromise(
  program.pipe(
    Effect.catchTag("DomainError", (e) =>
      Effect.fail(mapToHttpError(e))
    )
  )
);
```

**If `runtime.runPromise` is not possible** (e.g., circular dependency, or code must stay decoupled from the global runtime), add `SentryTracingLive` explicitly to the local layer chain:

```ts
import { SentryTracingLive } from "@/infrastructure/effect-sentry-tracing";

const result = await Effect.runPromise(
  program.pipe(
    Effect.provide(localServiceLayer),
    Effect.provide(SentryTracingLive) // Ensures Effect spans appear in Sentry
  )
);
```

**Why this matters:** Without a tracer layer, `Effect.fn("ServiceName.method")` spans are silently dropped. This was the root cause of missing Effect spans in Sentry traces (discovered Feb 2026).

**Allowed exceptions:**

- Test files (`__tests__/`) — tests provide their own layers
- One-off scripts and CLI tools — may use `Effect.runPromise` if tracing is not needed

## Mapping Errors To Transport

- Keep domain errors typed inside Effect
- Convert to TRPC/HTTP errors only at adapter boundary
