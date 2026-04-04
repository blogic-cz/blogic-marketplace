---
name: performance-optimization
description: "This skill should be used when analyzing performance bottlenecks, implementing batch operations, fixing N+1 query patterns, parallelizing independent operations, or adding database indexes in template-ts style projects."
compatibility: opencode
metadata:
  source: https://effect.website/docs/concurrency
---

# Performance Optimization Skill

Analyze and implement performance optimizations for API calls, database queries, and data processing patterns.

## When to Use

- Analyzing codebase for performance bottlenecks
- Implementing batch operations
- Optimizing N+1 query patterns
- Parallelizing independent operations
- Adding database indexes

## Project Scope Rules

- Scope code search to the current repository first.
- Scope runtime performance investigation to the current repository's active observability project first.
- Expand to other projects or repositories only when explicitly requested.

## Real Data Sources for Evidence-Driven Refactors

Verify real hotspots from observability data before proposing deep refactors or broad architectural changes.

Skip Sentry project discovery for small local optimizations that are already proven by local profiling, tests, or clear static N+1/sequential patterns.

### Sentry MCP (Primary Runtime Source)

Use Sentry MCP to inspect slow transactions, slow spans, and high-percentile latency after project discovery.

- Run discovery when runtime behavior is uncertain, cross-service latency is suspected, or a deep refactor is being considered.
- Prefer evidence from recent windows and aggregate views before proposing code changes.

### agent-tools Skill (Optional Operational Ground Truth)

Load `agent-tools` when infra/log/database context is needed to validate bottlenecks with real data:

- `bun run logs-tool ...` for application log timing patterns
- `bun run db-tool ...` for SQL checks and row/cardinality checks
- `bun run k8s-tool ...` for pod CPU/memory throttling and runtime pressure

Use these tools to confirm whether the bottleneck is application logic, database behavior, or infrastructure limits.

If `agent-tools` is unavailable in the current agent/runtime, use fallback signals:

- Use repository-local logs and debug instrumentation
- Use test fixtures and reproducible benchmark scripts
- Use database query plans and timing output (`EXPLAIN (ANALYZE, BUFFERS)` where available)
- Note uncertainty explicitly when infrastructure-level data cannot be collected

## Analysis Workflow

### 1. Identify Bottlenecks

Search for these high-impact patterns in the codebase:

- N+1 loops with API/DB calls
- Sequential independent calls that can run in parallel
- Individual inserts/updates/deletes inside loops
- Repeated read-then-write flows that can become upserts

### 2. Apply Optimizations

- Batch reads with `inArray` and lookup maps
- Batch writes (`insert(values[])`, `update ... where inArray`, `delete ... where inArray`)
- Consolidate multi-query flows with joins/subqueries where it improves cardinality and latency
- Parallelize independent work with `Effect.all` / `Effect.forEach(..., { concurrency })` and `Promise.all`
- Use upsert patterns to avoid read-before-write round trips

Keep full code examples in references to reduce SKILL.md size and keep cross-agent portability.

## Database Index Guidelines

### When to Add Indexes

1. **Single-column queries**: If filtering by one column frequently
2. **Composite queries**: If filtering by multiple columns together
3. **ORDER BY columns**: If sorting by a column frequently
4. **Foreign keys**: PostgreSQL does **not** auto-index foreign key columns; create indexes explicitly when FK columns are used in joins, filters, or delete/update cascades

## Validation and Measurement Workflow

### 1. Establish Baseline

- Capture p50/p95 latency, query counts, and throughput for the target path.
- Capture memory and error-rate signals where applicable.
- Record the baseline window and workload assumptions.

### 2. Implement the Smallest High-Impact Change

- Change one hotspot class at a time (N+1, sequential independent calls, non-batched writes, missing indexes).
- Preserve functional behavior and existing error semantics.

### 3. Validate Correctness

- Run checks (`bun run check`) and related tests.
- Verify error handling and logging remain appropriate.
- Verify concurrency limits for external APIs.

### 4. Re-measure Under Comparable Load

- Compare p50/p95 latency, query counts, throughput, and resource usage against baseline.
- Confirm improvements are statistically meaningful and not noise.

### 5. Guard Against Regressions

- Keep benchmarks or trace evidence with the change.
- Add targeted tests for critical optimized paths when behavior could regress.
- Document any remaining bottleneck that requires infra-level validation.

## References

- See `references/effect-parallel-patterns.md` for Effect parallelization patterns and concurrency guidance.
- See `references/drizzle-batch-patterns.md` for Drizzle batch operations, joins, pre-fetch maps, and upsert patterns.
