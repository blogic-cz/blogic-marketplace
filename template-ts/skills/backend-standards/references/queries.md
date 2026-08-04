# Queries, Pagination, And Data Access

Load for list/read paths or persistence access. Use `drizzle-database` for query syntax and migrations.

Define query contract first: authorization scope, projection, filter semantics, stable ordering, page bounds, and empty/not-found behavior. Always use deterministic ordering for paginated results; include a unique tie-breaker. Cursor tokens encode/validate ordering position and filter scope; do not trust client cursor contents. Offset pagination is acceptable only when drift/cost is acceptable for product behavior.

Select only fields required by caller. Inspect generated query count and relation loading for list paths; avoid N+1 by composing/batching reads using local repository conventions. Do not hide repeated database calls behind per-row helpers. Add index/constraint only with query/write evidence and verify migration effect.

Enforce maximum page size, filter complexity, and traversal depth at boundary. Authorization must constrain query itself, not filter results after sensitive rows are loaded. Make consistency expectations explicit when reads race writes.

## Completion

- [ ] Pagination has stable order, bounded size, and valid cursor/offset semantics.
- [ ] Query projection and relation loading avoid known N+1 path.
- [ ] Authorization scopes data before exposure.
- [ ] Migration/index impact is deliberate when schema changes.
