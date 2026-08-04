# Client Data Boundaries

Load for remote reads, writes, cache behavior, or API failures. For TanStack and TRPC mechanics, load `tanstack-frontend` and `trpc-patterns`.

Server data belongs to query/cache ownership, not duplicated component state. Give each query a stable key that contains every input affecting its result. Use established query factories/helpers; do not hand-roll similar keys. Keep pagination, filter, sort, and route search values in one canonical input shape.

A mutation names affected resources before it runs. On success, update, invalidate, or reset every affected query using local key conventions; choose optimistic updates only when rollback and concurrency behavior are understood. Do not refetch unrelated data as a substitute for knowing dependency scope. Invalidate after authoritative success, not after a locally assumed success.

Map expected API failures into stable user behavior at one boundary. Distinguish validation, authentication/authorization, not-found, conflict, network, and unknown failures when product behavior differs. Never expose transport internals, credentials, or raw stack traces. Preserve retryability where safe; do not retry non-idempotent writes blindly.

Treat external response data as untrusted until typed/validated by established client contract. Handle stale, cancelled, and out-of-order responses through existing framework patterns rather than ad-hoc flags.

## Completion

- [ ] Query identity includes result-defining inputs.
- [ ] Mutation cache effects cover all known dependent views.
- [ ] Pending, error, conflict, and retry behavior is deliberate.
- [ ] No transport/internal details escape to UI.
