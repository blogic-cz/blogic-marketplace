# Sentry Integration Code Samples

Use these samples as implementation templates. Adapt paths, env names, and framework wrappers per project.

## Server SDK Init

```typescript
import * as Sentry from "@sentry/tanstackstart-react";

Sentry.init({
  ...(env.SENTRY_DSN && { dsn: env.SENTRY_DSN }),
  sendDefaultPii: true,
  environment: env.ENVIRONMENT,
  release: env.VERSION,
  dist: "server",
  spotlight: isDev,
  enableLogs: true,
  tracesSampleRate: isDev ? 1.0 : 0.001,
  profilesSampleRate: isDev ? 1.0 : 0.001,
  profileLifecycle: "trace",
  integrations: [Sentry.postgresIntegration(), Sentry.redisIntegration(), Sentry.httpIntegration()],
  ignoreTransactions: ["/api/alive", "/api/health"],
  beforeSend(event, hint) {
    const error = hint.originalException;

    if (error instanceof DOMException && error.name === "AbortError") {
      return null;
    }

    return markExpectedTRPCErrorInEvent(event, error);
  },
});
```

## Client SDK Init

```typescript
import * as Sentry from "@sentry/tanstackstart-react";

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
    Sentry.feedbackIntegration({ colorScheme: "system", autoInject: false }),
    ...(isDev ? [Sentry.spotlightBrowserIntegration()] : []),
  ],
  tracesSampleRate: isDev ? 1.0 : 0.001,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event, hint) {
    return markExpectedTRPCErrorInEvent(event, hint.originalException);
  },
});
```

## TRPC Middleware Wiring

```typescript
export const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

export const publicProcedure = t.procedure.use(debugMiddleware).use(sentryMiddleware);
export const protectedProcedure = t.procedure.use(authMiddleware).use(sentryMiddleware);
export const adminProcedure = protectedProcedure.use(adminMiddleware).use(sentryMiddleware);
```

## Server Function Span Wrapper

```typescript
export const sentryFunctionMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => next())
  .server(async ({ next, data, serverFnMeta }) => {
    const functionName = serverFnMeta?.name ?? "anonymous-server-function";

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
          span.setStatus({ code: 1 });
          return result;
        } catch (error) {
          captureException(error);
          span.setStatus({ code: 2 });
          throw error;
        }
      },
    );
  });
```

## Expected-Error Helpers

```typescript
const EXPECTED_TRPC_CODES = ["NOT_FOUND", "FORBIDDEN", "UNAUTHORIZED", "BAD_REQUEST"] as const;

export function captureException(error: unknown, captureContext?: Sentry.CaptureContext) {
  if (isExpectedTRPCError(error)) {
    Sentry.withScope((scope) => {
      scope.setLevel("warning");
      scope.setTag("error.expected", "true");
      Sentry.captureException(error, {
        mechanism: { type: "generic", handled: true },
      });
    });
    return;
  }

  Sentry.captureException(error, captureContext);
}

export function markExpectedTRPCErrorInEvent(event: Sentry.ErrorEvent, error: unknown) {
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

## Database Tracing: Manual

```typescript
export async function traced<T>(query: Promise<T>, sqlString: string): Promise<T> {
  return Sentry.startSpan(
    {
      op: "db.query",
      name: sqlString,
      attributes: { "db.system": "postgresql" },
    },
    () => query,
  );
}
```

## Database Tracing: Proxy

```typescript
export function createTracedDb(db: Db): Db {
  return new Proxy(db, {
    get(target, prop, receiver) {
      const originalMethod = Reflect.get(target, prop, receiver);

      if (typeof originalMethod !== "function") {
        return originalMethod;
      }

      if (["select", "insert", "update", "delete"].includes(String(prop))) {
        return (...args: unknown[]) => {
          const queryBuilder = originalMethod.apply(target, args);
          return createTracedQueryBuilder(queryBuilder, String(prop));
        };
      }

      return originalMethod.bind(target);
    },
  });
}
```

## User Context Hook

```typescript
export function useSetSentryContext(
  session: { user?: { id: string; email?: string; name?: string } } | null,
) {
  useLayoutEffect(() => {
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
        username: session.user.name,
      });
      return;
    }

    Sentry.setUser(null);
  }, [session]);
}
```

## Optional Advanced Module: Sentry API Service (Effect)

```typescript
export class SentryApiError extends Schema.TaggedError<SentryApiError>()("SentryApiError", {
  statusCode: Schema.Number,
  body: Schema.String,
  url: Schema.String,
}) {}

export class SentryRateLimitError extends Schema.TaggedError<SentryRateLimitError>()(
  "SentryRateLimitError",
  {
    retryAfter: Schema.Number,
    message: Schema.String,
  },
) {}

const retryPolicy = Schedule.exponential("500 millis").pipe(Schedule.compose(Schedule.recurs(2)));
```
