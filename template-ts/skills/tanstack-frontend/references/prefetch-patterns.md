# Performance Optimization and Prefetch Strategies

Comprehensive guide to prefetch patterns and performance optimization for TanStack Router loaders.

## Understanding prefetchQuery vs fetchQuery

### prefetchQuery

**Characteristics:**

- Returns `void` (no return value)
- Loads data into cache silently
- Errors are silent (logged but not thrown)
- Use when you don't need the data immediately in loader

**When to use:**

```typescript
loader: async ({ context, params }) => {
  // Cache for components to use
  await context.queryClient.prefetchQuery(
    context.trpc.organization.getById.queryOptions({ id: params.id })
  );
  // No return value, but data is in cache
},
```

### fetchQuery

**Characteristics:**

- Returns the data
- Loads data into cache AND returns it
- Errors are thrown
- Use when you need the data for logic or to return from loader

**When to use:**

```typescript
loader: async ({ context }) => {
  // Need data for logic or return value
  const orgs = await context.queryClient.fetchQuery(
    context.trpc.organization.list.queryOptions()
  );

  // Can use data here
  if (orgs.length === 0) {
    throw redirect({ to: "/onboarding" });
  }

  return { orgs };
},
```

## Performance Hierarchy

From fastest to slowest:

### 1. void prefetchQuery (Fastest)

Fire-and-forget, loader doesn't wait. Component may suspend briefly.

```typescript
loader: async ({ context, params }) => {
  // Primary content - wait for it
  await context.queryClient.prefetchQuery(
    context.trpc.organization.getById.queryOptions({ id: params.id })
  );

  // Secondary content - don't wait
  void context.queryClient.prefetchQuery(
    context.trpc.organization.getStats.queryOptions({ id: params.id })
  );
  void context.queryClient.prefetchQuery(
    context.trpc.integrations.getAll.queryOptions({ orgId: params.id })
  );

  // Loader finishes immediately after first query
},
```

**Performance:** If first query takes 200ms, loader finishes in 200ms. Secondary queries load in background.

**Tradeoff:** Component using `useSuspenseQuery` for secondary data will suspend until that data loads.

### 2. await Promise.all (Good)

Waits for all queries in parallel. All queries finish before loader completes.

```typescript
loader: async ({ context, params }) => {
  // All queries are critical, fetch in parallel
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

  // Loader waits for all queries to complete
},
```

**Performance:** If queries take 200ms, 150ms, and 100ms respectively, loader finishes in 200ms (slowest query).

**Benefit:** All critical data available immediately when component renders. No suspend after initial load.

### 3. await Sequential (Slowest - Avoid)

Waits for each query one by one. Cumulative time.

```typescript
loader: async ({ context, params }) => {
  // ❌ BAD - Sequential waits
  await context.queryClient.prefetchQuery(
    context.trpc.organization.getById.queryOptions({ id: params.id })
  ); // 200ms

  await context.queryClient.prefetchQuery(
    context.trpc.members.getByOrgId.queryOptions({ orgId: params.id })
  ); // 150ms

  await context.queryClient.prefetchQuery(
    context.trpc.permissions.getAll.queryOptions({ orgId: params.id })
  ); // 100ms

  // Total: 450ms (200 + 150 + 100)
},
```

**Performance:** Cumulative time of all queries.

**Why avoid:** Much slower than `Promise.all`. Use `Promise.all` instead.

## Decision Tree: Which Pattern to Use

```
Is data critical for initial render?
│
├─ YES (used in first paint)
│   │
│   ├─ Single query?
│   │   └─ Use: await prefetchQuery
│   │
│   └─ Multiple queries?
│       └─ Use: await Promise.all([prefetchQuery, prefetchQuery, ...])
│
└─ NO (secondary/optional data)
    │
    ├─ Used shortly after render? (breadcrumbs, analytics)
    │   └─ Use: void prefetchQuery (fire and forget)
    │
    └─ Not used or rarely used?
        └─ Use: Don't prefetch, let component fetch on demand
```

## Common Patterns

### Pattern 1: Single Critical Query

**Use case:** Simple detail page with one main data source.

```typescript
loader: async ({ context, params }) => {
  // Main content - await to prevent empty page
  await context.queryClient.prefetchQuery(
    context.trpc.organization.getById.queryOptions({ id: params.id })
  );

  // Analytics - loads in background
  void context.queryClient.prefetchQuery(
    context.trpc.analytics.getOrgStats.queryOptions({ id: params.id })
  );
},
```

**Why this works:**

- User sees organization details immediately
- Analytics loads in background without blocking
- Page feels fast

### Pattern 2: Multiple Critical Queries

**Use case:** Complex page that needs multiple data sources (e.g., members table with permissions).

```typescript
loader: async ({ context, params }) => {
  // All critical - fetch in parallel
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

  // Breadcrumb data - not critical
  void context.queryClient.prefetchQuery(
    context.trpc.organization.getBreadcrumbs.queryOptions({ id: params.id })
  );
},
```

**Why this works:**

- All table data ready immediately
- Faster than sequential await
- Breadcrumbs load without blocking

### Pattern 3: Conditional Fetching

**Use case:** Different data based on search params or conditions.

```typescript
loader: async ({ context, params, search }) => {
  // Always fetch organization
  await context.queryClient.prefetchQuery(
    context.trpc.organization.getById.queryOptions({ id: params.id })
  );

  // Conditional fetch based on tab
  if (search.tab === "members") {
    await context.queryClient.prefetchQuery(
      context.trpc.members.getByOrgId.queryOptions({ orgId: params.id })
    );
  } else if (search.tab === "projects") {
    await context.queryClient.prefetchQuery(
      context.trpc.projects.list.queryOptions({ orgId: params.id })
    );
  }
},
```

### Pattern 4: Optimistic All Critical

**Use case:** Dashboard with multiple widgets, all important.

```typescript
loader: async ({ context, params }) => {
  // Everything is critical for dashboard
  await Promise.all([
    context.queryClient.prefetchQuery(
      context.trpc.organization.getById.queryOptions({ id: params.id })
    ),
    context.queryClient.prefetchQuery(
      context.trpc.projects.list.queryOptions({ orgId: params.id })
    ),
    context.queryClient.prefetchQuery(
      context.trpc.members.count.queryOptions({ orgId: params.id })
    ),
    context.queryClient.prefetchQuery(
      context.trpc.integrations.list.queryOptions({ orgId: params.id })
    ),
    context.queryClient.prefetchQuery(
      context.trpc.activity.recent.queryOptions({ orgId: params.id })
    ),
  ]);
},
```

**Performance consideration:** If one query is slow (500ms) while others are fast (100ms), entire loader waits 500ms. Consider moving slow queries to `void` if not immediately visible.

### Pattern 5: Progressive Loading

**Use case:** Large page with above-the-fold and below-the-fold content.

```typescript
loader: async ({ context, params }) => {
  // Above the fold - critical
  await Promise.all([
    context.queryClient.prefetchQuery(
      context.trpc.organization.getById.queryOptions({ id: params.id })
    ),
    context.queryClient.prefetchQuery(
      context.trpc.projects.featured.queryOptions({ orgId: params.id })
    ),
  ]);

  // Below the fold - load in background
  void context.queryClient.prefetchQuery(
    context.trpc.projects.all.queryOptions({ orgId: params.id })
  );
  void context.queryClient.prefetchQuery(
    context.trpc.activity.full.queryOptions({ orgId: params.id })
  );
  void context.queryClient.prefetchQuery(
    context.trpc.analytics.detailed.queryOptions({ orgId: params.id })
  );
},
```

**Why this works:**

- Fast initial render with featured content
- Full content loads as user scrolls
- Perceived performance improvement

## Common Mistakes

### Mistake 1: Awaiting Everything

```typescript
// ❌ BAD - Unnecessarily slow
loader: async ({ context, params }) => {
  await context.queryClient.prefetchQuery(...);  // 200ms
  await context.queryClient.prefetchQuery(...);  // 150ms
  await context.queryClient.prefetchQuery(...);  // 100ms
  await context.queryClient.prefetchQuery(...);  // 120ms
  // Total: 570ms
},

// ✅ GOOD - Use Promise.all for critical
loader: async ({ context, params }) => {
  await Promise.all([
    context.queryClient.prefetchQuery(...),  // \
    context.queryClient.prefetchQuery(...),  //  > All in parallel
    context.queryClient.prefetchQuery(...),  // /
  ]); // Total: 200ms (slowest query)

  void context.queryClient.prefetchQuery(...); // Background
},
```

### Mistake 2: Using fetchQuery When prefetchQuery Suffices

```typescript
// ❌ BAD - Wasting memory by keeping unused result
loader: async ({ context }) => {
  const [org, members, _] = await Promise.all([
    context.queryClient.fetchQuery(...),  // ✅ Need result
    context.queryClient.fetchQuery(...),  // ✅ Need result
    context.queryClient.fetchQuery(...),  // ❌ Discarding result
  ]);
  return { org, members };
},

// ✅ GOOD - Use prefetchQuery for discarded results
loader: async ({ context }) => {
  const [org, members] = await Promise.all([
    context.queryClient.fetchQuery(...),  // Need result
    context.queryClient.fetchQuery(...),  // Need result
    context.queryClient.prefetchQuery(...), // Don't need result
  ]);
  return { org, members };
},
```

### Mistake 3: void When Data Is Critical

```typescript
// ❌ BAD - Critical data not awaited
loader: async ({ context, params }) => {
  void context.queryClient.prefetchQuery(
    context.trpc.members.getByOrgId.queryOptions({ orgId: params.id })
  );
  // Loader finishes immediately, component suspends
},

function Component() {
  const { id } = Route.useParams();
  const trpc = useTRPC();

  // This will suspend! Data not loaded yet
  const { data: members } = useSuspenseQuery(
    trpc.members.getByOrgId.queryOptions({ orgId: id })
  );

  return <MembersTable members={members} />;
}

// ✅ GOOD - Await critical data
loader: async ({ context, params }) => {
  await context.queryClient.prefetchQuery(
    context.trpc.members.getByOrgId.queryOptions({ orgId: params.id })
  );
  // Data ready when component renders
},
```

### Mistake 4: Not Considering Query Dependencies

```typescript
// ❌ BAD - Fetching user before checking if they exist
loader: async ({ context, params }) => {
  await Promise.all([
    context.queryClient.prefetchQuery(
      context.trpc.user.getById.queryOptions({ id: params.userId })
    ),
    context.queryClient.prefetchQuery(
      context.trpc.user.getPosts.queryOptions({ userId: params.userId })
    ),
  ]);
  // What if user doesn't exist? Both queries might error
},

// ✅ GOOD - Check user exists first
loader: async ({ context, params }) => {
  // First check if user exists
  const user = await context.queryClient.fetchQuery(
    context.trpc.user.getById.queryOptions({ id: params.userId })
  );

  if (!user) {
    throw redirect({ to: "/users" });
  }

  // Now fetch posts
  void context.queryClient.prefetchQuery(
    context.trpc.user.getPosts.queryOptions({ userId: params.userId })
  );
},
```

### Mistake 5: Missing Suspense Boundary for void-prefetched Data

**This is a critical mistake that causes hydration errors!**

```typescript
// ❌ BAD - No Suspense boundary for void-prefetched data
loader: async ({ context }) => {
  // Fire-and-forget - data may not be in cache when component renders
  void context.queryClient.prefetchQuery(
    context.trpc.invitations.getPending.queryOptions()
  );
},

function DashboardPage() {
  return (
    <div>
      <MainContent />
      {/* HYDRATION ERROR: $R[88] is not a function */}
      <PendingInvitationModal />
    </div>
  );
}

// Inside PendingInvitationModal:
function PendingInvitationModal() {
  const trpc = useTRPC();
  // This suspends because data wasn't awaited in loader!
  const { data } = useSuspenseQuery(
    trpc.invitations.getPending.queryOptions()
  );
  // ...
}

// ✅ GOOD - Wrap in Suspense boundary
function DashboardPage() {
  return (
    <div>
      <MainContent />
      <Suspense fallback={null}>
        <PendingInvitationModal />
      </Suspense>
    </div>
  );
}
```

**Why this happens:**

1. `void prefetchQuery()` starts fetching but doesn't wait
2. Loader completes, page starts rendering
3. `useSuspenseQuery()` in component finds no data in cache
4. Component tries to suspend, but there's no Suspense boundary
5. React throws hydration error

**Rule:** If loader uses `void prefetchQuery()`, the component using that data MUST be wrapped in `<Suspense>`.

**Decision Table:**

| Loader Pattern          | Data in cache? | Suspense needed? |
| ----------------------- | -------------- | ---------------- |
| `await prefetchQuery()` | ✅ Always      | ❌ No            |
| `await fetchQuery()`    | ✅ Always      | ❌ No            |
| `void prefetchQuery()`  | ⚠️ Maybe       | ✅ **YES**       |

## Performance Monitoring

### Measuring Loader Performance

```typescript
loader: async ({ context, params }) => {
  const start = performance.now();

  await Promise.all([
    context.queryClient.prefetchQuery(...),
    context.queryClient.prefetchQuery(...),
  ]);

  const duration = performance.now() - start;
  console.log(`Loader took ${duration}ms`);

  // Log to analytics if slow
  if (duration > 500) {
    analytics.track("slow_loader", { duration, route: "org_members" });
  }
},
```

### Identifying Slow Queries

```typescript
loader: async ({ context, params }) => {
  const timings: Record<string, number> = {};

  const measureQuery = async (name: string, query: Promise<any>) => {
    const start = performance.now();
    await query;
    timings[name] = performance.now() - start;
  };

  await Promise.all([
    measureQuery(
      "organization",
      context.queryClient.prefetchQuery(
        context.trpc.organization.getById.queryOptions({ id: params.id })
      )
    ),
    measureQuery(
      "members",
      context.queryClient.prefetchQuery(
        context.trpc.members.getByOrgId.queryOptions({ orgId: params.id })
      )
    ),
  ]);

  console.log("Query timings:", timings);
  // Example output: { organization: 150, members: 300 }
},
```
