# Transactions, Locking, And Concurrent Writes

Load for writes whose correctness spans concurrent requests, records, or jobs.

Start by naming invariant and complete participant set, including candidate/new references. Database unique constraints arbitrate natural-unique creation; do not add a lock merely to decide uniqueness. Use transaction isolation, optimistic versioning, constraints, or distributed lock based on failure mode—not habit.

A pre-lock/pre-transaction read may discover keys but is not authoritative state. For cross-record invariant: derive deterministic complete lock set, acquire lock, reload/recheck authoritative state, mutate, persist, and hold protection through commit. Normalize multi-key ordering to avoid deadlock. Keep lock scope short; do not make external network calls while holding it unless invariant demands it.

HTTP/request paths may return contention as a stable conflict/unavailable outcome. Batch/jobs should handle lock-acquisition result per item/workflow. Do not add blanket retries around contention when lock provider already has bounded wait behavior. A lock supplements constraints/version checks; it does not replace them.

For optimistic concurrency, pass expected version/freshness on every relevant write, including no-op paths unless documented goal-state semantics permit authoritative success. Define conflict response and retry UX/API behavior.

## Completion

- [ ] Invariant and full participant set are explicit.
- [ ] Constraint, version, transaction, and lock choices fit failure mode.
- [ ] Authoritative recheck occurs under protection.
- [ ] Contention and stale-write outcome is deliberate.
