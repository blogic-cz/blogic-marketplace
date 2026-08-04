---
name: backend-standards
description: This skill guides portable TypeScript backend changes when defining request boundaries, validation, errors, dependencies, and asynchronous work without choosing a framework or database.
compatibility: opencode
---

# Backend Standards

Use for backend application code that crosses an HTTP, RPC, job, or message boundary. Keep framework and database choices in their dedicated skills.

## Workflow

1. Inspect nearby code and use its established boundary and error conventions.
2. Keep transport parsing, authorization, and input validation at entrypoints; pass typed values to application logic.
3. Make dependencies explicit and keep domain logic independent of transport clients where practical.
4. Return or map expected failures deliberately; do not leak secrets or internal details.
5. Validate changed behavior with the smallest relevant check.

Read detail only when needed:

- [references/boundaries.md](references/boundaries.md) — boundary, validation, authorization, and errors
- [references/async-work.md](references/async-work.md) — cancellation, retries, idempotency, and observability

## Scope

Delegate framework procedure conventions to `trpc-patterns`, persistence and migrations to `drizzle-database`, and test design to `testing-patterns`.
