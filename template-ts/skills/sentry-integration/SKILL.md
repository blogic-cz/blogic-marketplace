---
name: sentry-integration
description: "ALWAYS LOAD THIS SKILL when user asks about: sentry, error tracking, tracing, span, monitoring, captureException, startSpan. Contains SDK config for server/client, TRPC middleware, expected error handling, DB tracing. Load BEFORE any Sentry implementation."
---

# Sentry Integration Patterns

## Overview

Implement error tracking and performance monitoring using Sentry following the project's established patterns for both client and server.

## When to Use This Skill

- Configuring Sentry SDK
- Adding error tracking to TRPC procedures
- Implementing custom spans/traces
- Setting up user context
- Working with Sentry API

## SDK Configuration

### Server-side

```typescript
// apps/web-app/src/server.ts
import * as Sentry from "@sentry/tanstackstart-react";

Sentry.init({
  ...(env.SENTRY_DSN && { dsn: env.SENTRY_DSN }),
  sendDefaultPii: true,
  environment: env.ENVIRONMENT,
  release: env.VERSION,
  dist: "server",
  spotlight: isDev, // Local dev debugging
  enableLogs: true,
  tracesSampleRate: isDev ? 1.0 : 0.001,
  profilesSampleRate: isDev ? 1.0 : 0.001,
  profileLifecycle: "trace",
  integrations: [
    Sentry.postgresIntegration(),
    Sentry.redisIntegration(),
    Sentry.httpIntegration(),
  ],
  ignoreTransactions: ["/api/alive", "/api/health"],
  beforeSend(event, hint) {
    // Filter AbortError completely
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      return null;
    }
    // Mark expected TRPC errors as handled
    return markExpectedTRPCErrorInEvent(event, error);
  },
});
```

### Client-side

```typescript
// apps/web-app/src/client.tsx
Sentry.init({
  ...(env.VITE_SENTRY_DSN && { dsn: env.VITE_SENTRY_DSN }),
  sendDefaultPii: true,
  environment: env.VITE_ENVIRONMENT,
  release: env.VITE_VERSION,
  dist: "client",
  spotlight: isDev,
  integrations: [
    Sentry.tanstackRouterBrowserTracingIntegration(router),
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: "system",
      autoInject: false,
    }),
    ...(isDev
      ? [Sentry.spotlightBrowserIntegration()]
      : []),
  ],
  tracesSampleRate: isDev ? 1.0 : 0.001,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event, hint) {
    return markExpectedTRPCErrorInEvent(
      event,
      hint.originalException
    );
  },
});
```

## TRPC Middleware

```typescript
// apps/web-app/src/infrastructure/trpc/init.ts
export const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  })
);

// Used in procedure chain
export const publicProcedure = t.procedure
  .use(debugMiddleware)
  .use(sentryMiddleware);
```

## Server Function Middleware

```typescript
// apps/web-app/src/infrastructure/middleware/sentry-function-middleware.ts
export const sentryFunctionMiddleware = createMiddleware({
  type: "function",
})
  .client(async ({ next, serverFnMeta }) => {
    // Client-side timing and error logging
  })
  .server(async ({ next, data, serverFnMeta }) => {
    return Sentry.startSpan(
      {
        op: "function.server",
        name: functionName,
        attributes: {
          hasData: data !== undefined,
          functionName,
        },
      },
      async (span) => {
        try {
          const result = await next();
          span.setStatus({ code: 1 }); // OK
          return result;
        } catch (error) {
          captureException(error);
          span.setStatus({ code: 2 }); // ERROR
          throw error;
        }
      }
    );
  });
```

## Error Capture Patterns

### Expected TRPC Error Codes

```typescript
// From apps/web-app/src/infrastructure/errors.ts
const EXPECTED_TRPC_CODES = [
  "NOT_FOUND",
  "FORBIDDEN",
  "UNAUTHORIZED",
  "BAD_REQUEST",
];
```

### Custom Capture Helper

```typescript
// apps/web-app/src/infrastructure/sentry-utils.ts
export function captureException(
  error: unknown,
  captureContext?: Sentry.CaptureContext
) {
  if (isExpectedTRPCError(error)) {
    Sentry.withScope((scope) => {
      scope.setLevel("warning");
      scope.setTag("error.expected", "true");
      Sentry.captureException(error, {
        mechanism: { type: "generic", handled: true },
      });
    });
  } else {
    Sentry.captureException(error, captureContext);
  }
}
```

### beforeSend Helper

```typescript
export function markExpectedTRPCErrorInEvent(
  event: Sentry.ErrorEvent,
  error: unknown
) {
  if (!isExpectedTRPCError(error)) return event;

  event.exception?.values?.forEach((exception) => {
    exception.mechanism = {
      type: "generic",
      handled: true,
    };
  });
  event.level = "warning";
  event.tags = { ...event.tags, "error.expected": "true" };
  return event;
}
```

## Database Query Tracing

### Manual Tracing

```typescript
// apps/web-app/src/infrastructure/db/tracing.ts
export async function traced<T>(
  query: DrizzleQuery,
  operationName?: string
): Promise<T> {
  return Sentry.startSpan(
    {
      op: "db.query",
      name: sqlString,
      attributes: { "db.system": "postgresql" },
    },
    () => query as Promise<T>
  );
}

// Usage:
const users = await traced(
  db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
);
```

### Automatic Proxy Tracing

```typescript
// apps/web-app/src/infrastructure/db/traced-db.ts
export function createTracedDb(db: Db): Db {
  return new Proxy(db, {
    get(target, prop) {
      if (
        ["select", "insert", "update", "delete"].includes(
          String(prop)
        )
      ) {
        return function (...args) {
          const queryBuilder = originalMethod.call(
            target,
            ...args
          );
          return createTracedQueryBuilder(
            queryBuilder,
            String(prop)
          );
        };
      }
      return originalMethod;
    },
  });
}
```

## User Context Hook

```typescript
// apps/web-app/src/hooks/use-set-sentry-context.ts
export function useSetSentryContext() {
  const { session } = Route.useRouteContext();

  useLayoutEffect(() => {
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
        username: session.user.name,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [session]);
}
```

## Sentry API Service (Effect-based)

### Error Types

```typescript
// packages/services/src/sentry/errors.ts
export class SentryApiError extends Schema.TaggedError<SentryApiError>()(
  "SentryApiError",
  {
    statusCode: Schema.Number,
    body: Schema.String,
    url: Schema.String,
  }
) {}

export class SentryRateLimitError extends Schema.TaggedError<SentryRateLimitError>()(
  "SentryRateLimitError",
  {
    retryAfter: Schema.Number,
    message: Schema.String,
  }
) {}
```

### Service Pattern

```typescript
// packages/services/src/sentry/sentry-issues.ts
export class SentryIssuesService extends Context.Tag(
  "@project/SentryIssuesService"
)<
  SentryIssuesService,
  {
    readonly getNewErrors: (
      params
    ) => Effect.Effect<SentryIssuesResponse, SentryError>;
    readonly getRegressions: (
      params
    ) => Effect.Effect<SentryIssuesResponse, SentryError>;
    readonly verifyToken: (
      params
    ) => Effect.Effect<SentryOrganization[], SentryError>;
    readonly listProjects: (
      params
    ) => Effect.Effect<SentryProject[], SentryError>;
  }
>() {
  static readonly layer = Layer.effect(
    SentryIssuesService,
    Effect.gen(function* () {
      const httpClient = yield* HttpClient.HttpClient;
      // ... service implementation
    })
  );
}

// Live layer
export const SentryIssuesServiceLive =
  SentryIssuesService.layer.pipe(
    Layer.provide(FetchHttpClient.layer)
  );
```

### API Client with Retry

```typescript
const retryPolicy = Schedule.exponential("500 millis").pipe(
  Schedule.compose(Schedule.recurs(2))
);

export const sentryRequest = <A, I>(
  httpClient: HttpClient.HttpClient,
  schema: Schema.Schema<A, I>,
  params: SentryRequestParams
): Effect.Effect<
  { data: A; nextCursor: string | null },
  SentryApiError | SentryRateLimitError
> =>
  Effect.fn("Sentry.request")(function* () {
    // Request with Bearer token auth
    // Rate limit handling (429 -> SentryRateLimitError)
    // Schema validation
    // Link header pagination parsing
  })();
```

## Key Rules

1. **Use beforeSend** to mark expected errors as handled
2. **Filter health check endpoints** from transactions
3. **Set user context** in layout effect for session changes
4. **Use startSpan** for custom instrumentation
5. **Handle rate limits** (429) with SentryRateLimitError
6. **Different sample rates** for dev vs production
7. **Include replays** for error sessions (100% on error)
