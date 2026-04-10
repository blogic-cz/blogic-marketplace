---
name: tanstack-frontend
description: "This skill should be used when implementing TanStack Router routes, TRPC data loading/prefetching, and frontend typing/form patterns. In this project, 'TanStack Form' means the app wrapper (`useAppForm` + shared form components), not raw TanStack Form hooks."
compatibility: opencode
---

# TanStack Frontend Patterns

## Overview

Implement TanStack Router routes with project-standard TRPC integration, loader strategy, typed inference, and form handling. Follow this document for decision rules, then use `references/` for full examples.

## Core Patterns

### 1) Define routes with loader-driven data strategy

- Define each route with `createFileRoute(...)` and a loader that preloads critical data.
- Read params/search from route APIs (`Route.useParams()`, `Route.useSearch()`) in components.
- Keep examples in `references/router-loader-examples.md`.

### 2) Choose loader prefetch strategy intentionally

- Use `await prefetchQuery(...)` for data required in first paint.
- Use `await Promise.all([...])` for multiple critical queries.
- Use `void prefetchQuery(...)` only for secondary data.
- Use `fetchQuery(...)` when loader logic needs returned data.
- Apply the `void` rule together with the Suspense rule below.

See full decision trees and performance tradeoffs in `references/prefetch-patterns.md`.

### 3) Enforce Suspense boundaries for void-prefetched data

- Wrap every component that consumes `void prefetchQuery(...)` data via `useSuspenseQuery(...)` in `<Suspense>`.
- Treat missing boundaries as correctness bugs (hydration risk), not optional optimization.
- Cross-check any `void` decision against this requirement before finalizing the route.

See examples and the loader-pattern decision table in `references/prefetch-patterns.md`.

### 4) Apply TRPC v11 TanStack Query pattern

Use one rule block consistently:

- Use TanStack Query hooks (`useQuery`, `useSuspenseQuery`, `useMutation`) with TRPC factory methods.
- Use `.queryOptions(...)` for queries/prefetch and `.mutationOptions(...)` for mutations.
- Use `.queryKey(...)` for cache invalidation.
- Do not call `.useQuery()` or `.useMutation()` on TRPC procedures.

See concise do/don't examples in `references/trpc-v11-query-pattern.md`.

### 5) Prefer RouterInputs/RouterOutputs for inference

- Prefer `RouterInputs`/`RouterOutputs` for input/response typing across route components and helpers.
- Allow explicit local types when they represent UI-only view models, external library contracts, or deliberate narrowing/aggregation that does not mirror server payloads.
- Avoid duplicating raw TRPC response shapes as hand-written app types.

See practical inference patterns in `references/type-inference.md`.

### 6) Use the project form wrapper (not raw TanStack Form)

- Treat "TanStack Form" in this template as `useAppForm` + `@/shared/forms/*` field components.
- Compose forms with shared form components and pass `form`/`field` explicitly.
- Avoid raw TanStack Form hooks in feature code unless updating the shared form infrastructure itself.

See complete form patterns in `references/form-patterns.md`.

### 7) Follow frontend conventions

- Prefer `type Props = ...` naming for component props.
- Use absolute imports (`@/...`).
- Import shared cross-package types from `@project/common`.
- Invalidate TRPC cache through `queryKey(...)` helpers.

## Resources

### references/

- `router-loader-examples.md` - Complete route definition examples
- `prefetch-patterns.md` - Performance optimization and prefetch strategies
- `trpc-v11-query-pattern.md` - Compact TRPC v11 query/mutation/invalidation rules
- `form-patterns.md` - Form handling with validation examples
- `type-inference.md` - TRPC type inference patterns and examples
