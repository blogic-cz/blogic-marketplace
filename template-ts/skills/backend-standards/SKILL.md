---
name: backend-standards
description: Guides portable backend architecture, domain, boundary, job, integration, concurrency, query, and module-contract standards while routing TypeScript implementation details to specialist skills.
compatibility: opencode
---

# Backend Standards

Use for backend application changes. Inspect nearest comparable module, boundary, and test before designing. Keep framework, ORM, Effect, TRPC, and test mechanics in specialist skills; these references own portable behavior and completion rules.

## Load by Change

| Change                                                     | Read                                                     | Completion                                              |
| ---------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| Every backend change                                       | [references/architecture.md](references/architecture.md) | Layer and module ownership are explicit.                |
| Domain state, business operation, invariant, typed failure | [references/domain.md](references/domain.md)             | Invalid state is rejected at owner.                     |
| HTTP/RPC/message API or client-facing error                | [references/boundaries.md](references/boundaries.md)     | Trust and error boundary holds.                         |
| External provider, webhook, import, or outbound call       | [references/integrations.md](references/integrations.md) | External data, retries, and observability are safe.     |
| Job, queue consumer, timer, or batch                       | [references/async-work.md](references/async-work.md)     | Cancellation, idempotence, and checkpoints hold.        |
| Concurrent cross-record write                              | [references/concurrency.md](references/concurrency.md)   | Invariant and locking/transaction tradeoff is explicit. |
| Read list, pagination, or data access                      | [references/queries.md](references/queries.md)           | Ordering, bounds, and query count are stable.           |

## Specialist Routing

- TRPC schemas, procedure selection, middleware, and error helpers: `trpc-patterns`.
- Drizzle schema, migrations, query syntax, and indexes: `drizzle-database`.
- Effect services, layers, typed errors, and runtime boundaries: `effect-ts`.
- Test choice and implementation: `testing-patterns`.

## Completion

Account for affected references, run smallest relevant check, and state contract, migration, operational, or concurrency impact. Do not introduce a new framework abstraction for one caller.
