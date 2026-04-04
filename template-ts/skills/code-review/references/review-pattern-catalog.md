# Template-ts Review Pattern Catalog

Apply this catalog while executing Step 2 from `SKILL.md`.

## 1) TRPC Patterns

Check deeper procedure details against `trpc-patterns` when needed.

Verify critical patterns:

```typescript
// ✅ Correct - Using RouterOutputs/RouterInputs
type SessionData = RouterOutputs["adminAuthSessions"]["listTokens"]["sessions"][0];

// ❌ Wrong - Manual type definitions
type SessionData = { sessionId: string; ... };
```

```typescript
// ✅ Correct - Using error helpers
throw notFoundError("Project not found");

// ❌ Wrong - Manual TRPCError
throw new TRPCError({ code: "NOT_FOUND", message: "..." });
```

```typescript
// ✅ Correct - protectedMemberAccessProcedure for org-scoped routes
export const router = {
  getOrgData: protectedMemberAccessProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(...),
};

// ❌ Wrong - Manual membership check inside protectedProcedure
```

```typescript
// ✅ Correct - Inline simple schemas with shared enums
role: z.enum([OrganizationRoles.Owner, OrganizationRoles.Admin]);

// ❌ Wrong - Hardcoded enum values
role: z.enum(["owner", "admin"]);
```

### SQL Query Optimization

```typescript
// ✅ Correct - Single query with JOINs
const result = await db
  .select({ ... })
  .from(membersTable)
  .innerJoin(organizationsTable, eq(...))
  .leftJoin(projectsTable, eq(...));

// ❌ Wrong - Multiple separate queries (N+1)
const orgs = await db.select().from(organizationsTable);
const members = await db.select().from(membersTable);
```

## 2) TanStack Router and Query Patterns

Check deeper route/query details against `tanstack-frontend` when needed.

Verify critical patterns:

```typescript
// ✅ Correct - TRPC v11 pattern with .queryOptions()
const { data } = useSuspenseQuery(trpc.organization.getById.queryOptions({ id }));

// ❌ Wrong - Old pattern (does not exist in v11)
const { data } = trpc.organization.getById.useQuery({ id });
```

```typescript
// ✅ Correct - Await critical data prefetch
loader: async ({ context, params }) => {
  await context.queryClient.prefetchQuery(
    context.trpc.organization.getById.queryOptions({ id: params.id })
  );

  // Secondary data - void for optimization
  void context.queryClient.prefetchQuery(
    context.trpc.analytics.getStats.queryOptions({ id: params.id })
  );
};

// ❌ Wrong - Sequential await for all requests (slow)
await context.queryClient.prefetchQuery(...);
await context.queryClient.prefetchQuery(...);
await context.queryClient.prefetchQuery(...);

// ❌ Wrong - Void critical data (component will suspend)
void context.queryClient.prefetchQuery(...);
```

```typescript
// ✅ Correct - Generic props type naming
type Props = { isOpen: boolean; onClose: () => void };

// ❌ Wrong - Over-specific local props naming
type DeleteMemberModalProps = { ... };
```

```typescript
// ✅ Correct - Cache invalidation
await queryClient.invalidateQueries({
  queryKey: trpc.organization.queryKey(),
});
```

## 3) Code Deduplication (DRY)

Identify duplicate or near-duplicate code:

- Same logic implemented in multiple files with different approaches
- Copy-pasted functions with minor variations
- Repeated patterns that could be extracted to shared utilities

Extract shared logic when:

- The same logic appears in 2+ locations
- Functions differ only in minor details (parameterize instead)
- The utility is general enough to be reused

Place shared code in:

- `packages/services/src/` for cross-service utilities
- `packages/common/src/` for cross-package shared types/utilities
- Same-directory `utils.ts` for local module utilities

## 4) Code Quality and Style

Check template-ts conventions:

- Imports: Keep absolute imports in `apps/web-app/src` (`@/path` or `@project/*`)
- Nullish coalescing: Prefer `??` over `||` for defaults
- Bun APIs: Prefer `Bun.file()` and `Bun.spawn()` over Node polyfills when applicable
- File naming: Use kebab-case (`contact-form.tsx`, not `ContactForm.tsx`)
- Types: Prefer `type` over `interface` unless extension semantics are required
- Logger: Use `@project/logger` for backend; `console.log/error` is acceptable in frontend React components
- Barrel files: Avoid `index.ts` files that only re-export symbols

Do not report these as issues:

- `packages/*/src/index.ts` with `export *` for package entry points
- Relative imports inside `packages/` directories
- `console.log/error` inside frontend React components

## 5) Security

Check critical risks:

- Hardcoded secrets/API keys (`api[_-]?key|password|secret|token`)
- SQL injection via string interpolation
- Missing auth middleware (`protectedProcedure` / `protectedMemberAccessProcedure`)
- Sensitive data in logs
- Missing input validation

Prefer standardized error helpers from `@/infrastructure/errors`:

- `badRequestError()`
- `unauthorizedError()`
- `forbiddenError()`
- `notFoundError()`

## 6) Performance

Inspect database behavior:

- N+1 query patterns
- Missing indexes on frequently filtered or joined columns
- Sequential API calls that should use `Promise.all()`

Inspect frontend behavior:

- Missing prefetch in route loaders
- Sequential loader awaits that can be parallelized
- `fetchQuery` usage where `prefetchQuery` is sufficient

## 7) Testing

Check coverage expectations:

- New TRPC endpoints should include tests in `packages/services/src/__tests__/`
- New components should include appropriate tests
- Critical user flows may require E2E coverage

## 8) Effect Patterns (when Effect code is in scope)

Check deeper guidance against `effect-ts`.

Apply to files in `packages/services/`, `effect-runtime.ts`, and files using `Effect.gen` or `Context.Tag`.

```typescript
// ✅ Correct - Service with @project namespace
export class MyService extends Context.Tag("@project/MyService")<...>() {}

// ❌ Wrong - Missing namespace
export class MyService extends Context.Tag("MyService")<...>() {}
```

```typescript
// ✅ Correct - Effect.fn for tracing
const doSomething = Effect.fn("MyService.doSomething")(function* (params) {
  ...
});

// ❌ Wrong - No tracing wrapper
const doSomething = (params) => Effect.gen(function* () { ... });
```

```typescript
// ✅ Correct - Schema.TaggedError
export class MyError extends Schema.TaggedError<MyError>()("MyError", { ... }) {}

// ❌ Wrong - Data.TaggedError for schema-centric domains
export class MyError extends Data.TaggedError("MyError")<{ ... }> {}
```

```typescript
// ✅ Correct - ManagedRuntime for TRPC
import { runtime } from "@/infrastructure/effect-runtime";
await runtime.runPromise(Effect.gen(function* () { ... }));

// ❌ Wrong - Inline provide per request
await Effect.runPromise(effect.pipe(Effect.provide(ServiceLive)));
```

Run `/scan-effect-solutions` for comprehensive Effect compliance analysis.
