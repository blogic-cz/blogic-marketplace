# Backend Boundaries

Apply at every HTTP, RPC, job, message, webhook, or CLI entrypoint.

1. Parse and validate untrusted input before use; bound sizes, lists, pagination, and resource consumption.
2. Authenticate and authorize before protected reads or writes. UI checks are not authorization.
3. Convert expected domain failures into stable boundary errors in one place. Keep messages useful without leaking stack traces, topology, credentials, tokens, or sensitive data.
4. Pass typed values and explicit dependencies into application logic; do not let transport request objects spread inward.
5. Return stable contract shapes and intentional status/error semantics. Make cancellation propagate from caller where platform supports it.

Validation is not one layer only: validate shape at trust boundary, invariants at domain owner, and constraints at durable storage. Do not use generic catch-and-return-success handling. Log correlation/context needed to diagnose failures, redacting secrets and sensitive payloads.

Reuse local identity, validation, and error helpers before adding another boundary convention. For TRPC mechanics load `trpc-patterns`; for Effect runtime mapping load `effect-ts`.

## Completion

- [ ] Input, authorization, and limits happen before use.
- [ ] Expected vs unexpected failures map separately.
- [ ] Transport details do not leak inward or to clients.
- [ ] Logs have diagnostic context without secrets.
