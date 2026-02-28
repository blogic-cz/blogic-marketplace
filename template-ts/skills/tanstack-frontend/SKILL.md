---
name: tanstack-frontend
description: "LOAD THIS SKILL when: creating TanStack Router routes, implementing TRPC data prefetching, building forms with TanStack Form, or optimizing route loading performance."
compatibility: opencode
---

# TanStack Frontend Patterns

## Overview

Implement TanStack Router routes with proper TRPC integration, query prefetching, type inference, and form handling following the project's frontend architecture patterns.

## When to Use This Skill

Use this skill when:

- Creating new routes with TanStack Router
- Implementing data prefetching in loaders
- Optimizing route loading performance
- Building forms with TanStack Form and TRPC
- Need type-safe TRPC patterns

## Core Patterns

### 1. Route Definition with Loader

Standard pattern for route creation with TRPC data prefetching.

**Pattern:**

```typescript
export const Route = createFileRoute(
  "/app/organization/$id/members"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    // Prefetch data for SSR
    await context.queryClient.prefetchQuery(
      context.trpc.organization.getById.queryOptions({
        id: params.id,
      })
    );
  },
});

function RouteComponent() {
  const { id } = Route.useParams(); // Extract route parameters
  const trpc = useTRPC();

  // Query with Suspense
  const { data, refetch } = useSuspenseQuery(
    trpc.organization.getById.queryOptions({ id })
  );

  // Mutations
  const updateOrg = useMutation(
    trpc.organization.update.mutationOptions({
      onSuccess: () => refetch(),
      onError: (error) => console.error(error),
    })
  );

  return <div>{/* Component JSX */}</div>;
}
```

**Rules:**

- ✅ Extract params with `Route.useParams()`
- ✅ Use `useSuspenseQuery` with `.queryOptions()`
- ✅ Use `useMutation` with `.mutationOptions()`
- ❌ Never use `.useQuery` or `.useMutation` directly from TRPC

See `references/router-loader-examples.md` for complete route examples.

### 2. Prefetch Patterns & UX Optimization

**Critical Rule:** Use `await` in loader ONLY for main content that renders immediately. Use `void` for secondary/optimization data.

#### Understanding `prefetchQuery` vs `fetchQuery`

- **`prefetchQuery`**: Loads data into cache, returns `void`, silent errors. Use when you don't need the data immediately in the loader.
- **`fetchQuery`**: Loads data into cache AND returns it, throws errors. Use when you need the data for logic or to return from loader.

#### Performance Hierarchy (fastest to slowest)

1. **`void prefetchQuery`** - Fire-and-forget, loader doesn't wait (fastest, but component may suspend)
2. **`await Promise.all`** - Waits for slowest query in parallel (good when all queries are critical)
3. **`await` sequential** - Waits for each query one by one (slowest, avoid)

**Pattern - Single Critical Query:**

```typescript
loader: async ({ context, params }) => {
  // Critical: Main content - await to prevent empty page
  await context.queryClient.prefetchQuery(
    context.trpc.organization.getById.queryOptions({ id: params.id })
  );

  // Secondary: Can load later - void for best performance
  void context.queryClient.prefetchQuery(
    context.trpc.organization.getStats.queryOptions({ id: params.id })
  );
  void context.queryClient.prefetchQuery(
    context.trpc.integrations.getAll.queryOptions({ orgId: params.id })
  );
},
```

**Pattern - Multiple Critical Queries:**

```typescript
loader: async ({ context, params }) => {
  // All queries critical for initial render
  // Using Promise.all to fetch in parallel
  await Promise.all([
    context.queryClient.prefetchQuery(
      context.trpc.organization.getById.queryOptions({ id: params.id })
    ),
    context.queryClient.prefetchQuery(
      context.trpc.members.getByOrgId.queryOptions({ orgId: params.id })
    ),
    context.queryClient.prefetchQuery(
      context.trpc.permissions.getAll.queryOptions({ orgId: params.id })
    ),
  ]);

  // Secondary data - void for optimization
  void context.queryClient.prefetchQuery(
    context.trpc.analytics.getOrgStats.queryOptions({ id: params.id })
  );
},
```

**Pattern - Using fetchQuery:**

```typescript
loader: async ({ context }) => {
  // Need data in loader for logic or return value
  const orgsWithProjects = await context.queryClient.fetchQuery(
    context.trpc.organization.getOrganizationsDetails.queryOptions()
  );

  return { orgsWithProjects };
},
```

**When to use `await` vs `void` vs `Promise.all`:**

- **`await` single query**: 1 critical query needed for main content
- **`await Promise.all`**: Multiple critical queries needed for main content (faster than sequential)
- **`void`**: Secondary/optional data (breadcrumbs, stats, analytics) - fastest but component may suspend

**When to use `prefetchQuery` vs `fetchQuery`:**

- **`prefetchQuery`**: Cache data for components, don't need result in loader (most common)
- **`fetchQuery`**: Need data in loader for logic/return value

See `references/prefetch-patterns.md` for comprehensive prefetch examples and performance analysis.

### ⚠️ CRITICAL: Suspense Boundary Requirements

**When using `void prefetchQuery()` in loader + `useSuspenseQuery()` in component, the component MUST be wrapped in `<Suspense>`!**

**Why?** `void prefetchQuery()` is fire-and-forget - the loader doesn't wait for the data. If the data isn't in cache when the component renders, `useSuspenseQuery()` will suspend. Without a `<Suspense>` boundary, this causes hydration errors like `$R[88] is not a function`.

**Pattern - Component using void-prefetched data:**

```typescript
// In loader:
loader: async ({ context }) => {
  // Fire-and-forget - data may not be ready
  void context.queryClient.prefetchQuery(
    context.trpc.invitations.getPending.queryOptions()
  );
},

// In component - MUST wrap in Suspense:
function ParentComponent() {
  return (
    <div>
      <MainContent />
      {/* ✅ CORRECT - Suspense boundary for void-prefetched data */}
      <Suspense fallback={null}>
        <PendingInvitationsModal />
      </Suspense>
    </div>
  );
}

// ❌ WRONG - No Suspense boundary
function ParentComponent() {
  return (
    <div>
      <MainContent />
      <PendingInvitationsModal /> {/* Will cause hydration error! */}
    </div>
  );
}
```

**Decision Table:**

| Loader Pattern          | Data in cache? | Suspense needed? |
| ----------------------- | -------------- | ---------------- |
| `await prefetchQuery()` | ✅ Always      | ❌ No            |
| `await fetchQuery()`    | ✅ Always      | ❌ No            |
| `void prefetchQuery()`  | ⚠️ Maybe       | ✅ **YES**       |

**Rule:** If you use `void` prefix on prefetch, always wrap the consuming component in `<Suspense>`.

### 3. TRPC v11 Query Pattern (Critical)

**IMPORTANT:** This template uses TRPC v11's new TanStack Query integration pattern. This is a fundamental pattern change from older TRPC versions.

#### The Pattern

TRPC v11 provides factory methods (`.queryOptions()`, `.mutationOptions()`) that return configuration objects for TanStack Query's native hooks:

```typescript
import { useTRPC } from "@/infrastructure/trpc/react";
import {
  useQuery,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";

function MyComponent() {
  const trpc = useTRPC();

  // ✅ CORRECT - v11 pattern with factory methods
  const { data } = useQuery(
    trpc.organization.getById.queryOptions({ id: "123" })
  );

  const { data: suspenseData } = useSuspenseQuery(
    trpc.organization.getById.queryOptions({ id: "123" })
  );

  const updateOrg = useMutation(
    trpc.organization.update.mutationOptions({
      onSuccess: () => console.log("Success"),
    })
  );

  // ❌ WRONG - Old pattern (doesn't exist in v11)
  const { data } = trpc.organization.getById.useQuery({
    id: "123",
  });
  const updateOrg = trpc.organization.update.useMutation();
}
```

#### Why This Pattern?

**Benefits:**

1. **Better Type Safety** - Factory methods ensure TypeScript can properly infer all types
2. **TanStack Query Alignment** - Uses native TanStack hooks, making docs and community solutions directly applicable
3. **More Flexible** - Can use any TanStack Query hook (useQuery, useSuspenseQuery, useInfiniteQuery, etc.)
4. **Prefetching Support** - Same `.queryOptions()` works in loaders and components
5. **Easier Migration** - Aligns with TanStack Query's evolution

**Factory Methods Available:**

- `.queryOptions(input)` - Returns query configuration for useQuery/useSuspenseQuery/prefetchQuery
- `.mutationOptions(options)` - Returns mutation configuration for useMutation
- `.queryKey(input?)` - Returns query key for cache invalidation

#### Common Patterns

**Basic Query:**

```typescript
const { data, isLoading, error } = useQuery(
  trpc.project.getById.queryOptions({ projectId: "123" })
);
```

**Suspense Query:**

```typescript
const { data } = useSuspenseQuery(
  trpc.project.getById.queryOptions({ projectId: "123" })
);
```

**Mutation with Options:**

```typescript
const createProject = useMutation(
  trpc.project.create.mutationOptions({
    onSuccess: (data) => {
      toast.success("Project created!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  })
);
```

**Prefetch in Loader:**

```typescript
loader: async ({ context, params }) => {
  await context.queryClient.prefetchQuery(
    context.trpc.project.getById.queryOptions({ projectId: params.id })
  );
},
```

**Cache Invalidation:**

```typescript
const queryClient = useQueryClient();

// Invalidate all queries for a router
await queryClient.invalidateQueries({
  queryKey: trpc.organization.queryKey(),
});

// Invalidate specific procedure
await queryClient.invalidateQueries({
  queryKey: trpc.organization.getById.queryKey({
    id: "123",
  }),
});
```

#### Rules

- ✅ Use `useQuery()` from `@tanstack/react-query` with `.queryOptions()`
- ✅ Use `useSuspenseQuery()` from `@tanstack/react-query` with `.queryOptions()`
- ✅ Use `useMutation()` from `@tanstack/react-query` with `.mutationOptions()`
- ✅ Use same `.queryOptions()` in loaders and components
- ❌ Never try to call `.useQuery()` or `.useMutation()` directly on TRPC procedures (they don't exist in v11)
- ❌ Don't use old TRPC v10 patterns from outdated examples

### 4. Type Inference from TRPC

Always use `RouterInputs` and `RouterOutputs` for type inference instead of creating manual types.

**Pattern:**

```typescript
import type {
  RouterOutputs,
  RouterInputs,
} from "@/infrastructure/trpc/router";

type SessionData =
  RouterOutputs["adminAuthSessions"]["listTokens"]["sessions"][0];
type CreateUserInput = RouterInputs["users"]["create"];

function MyComponent() {
  const [session, setSession] =
    useState<SessionData | null>(null);
  // Implementation
}
```

**Rules:**

- ✅ Use `RouterOutputs["routerName"]["procedureName"]` for response types
- ✅ Use `RouterInputs["routerName"]["procedureName"]` for input types
- ✅ Import common types from `@project/common`
- ✅ Use branded session types (`AuthSessionId`, `McpSessionId`, `ClientSessionId`)
- ❌ Never create manual types that duplicate TRPC response structure

### 5. Form Handling

Always use `useAppForm` from `@/shared/forms/form-context` instead of raw TanStack Form.

**Pattern:**

```typescript
import { useAppForm } from "@/shared/forms/form-context";
import {
  FormInput,
  FormTextarea,
  FormCheckbox,
} from "@/shared/forms";

type Props = {
  onSubmit: (data: FormData) => void;
};

export function MyForm({ onSubmit }: Props) {
  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      subscribe: false,
    },
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <FormInput field="name" label="Name" form={form} />
      <FormInput
        field="email"
        label="Email"
        type="email"
        form={form}
      />
      <FormCheckbox
        field="subscribe"
        label="Subscribe"
        form={form}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Rules:**

- ✅ Use `useAppForm` from `@/shared/forms/form-context`
- ✅ Use form components (`FormInput`, `FormTextarea`, `FormCheckbox`)
- ✅ Pass `form` and `field` props to form components
- ❌ Don't use raw TanStack Form hooks

See `references/form-patterns.md` for complete form examples with validation.

### 6. Component Best Practices

**Props Naming:**

```typescript
// ✅ Good - Standard Props naming
type Props = {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
};

export function DeleteMemberModal({
  isOpen,
  onClose,
  userName,
}: Props) {
  // Implementation
}

// ❌ Bad - Component-specific props naming
type DeleteMemberModalProps = {
  /* ... */
};
```

**Import Rules:**

- ✅ Always use absolute imports (`@/path/to/module`)
- ✅ Use `type` instead of `interface` unless extending
- ✅ Import types from `@project/common` for shared types

**TRPC Cache Invalidation:**

```typescript
const queryClient = useQueryClient();

// ✅ Good - Using queryKey helper
await queryClient.invalidateQueries({
  queryKey: trpc.organization.queryKey(),
});

// Also valid - specific procedure
await queryClient.invalidateQueries({
  queryKey: trpc.organization.getById.queryKey(),
});
```

## Resources

### references/

- `router-loader-examples.md` - Complete route definition examples
- `prefetch-patterns.md` - Performance optimization and prefetch strategies
- `form-patterns.md` - Form handling with validation examples
- `type-inference.md` - TRPC type inference patterns and examples
