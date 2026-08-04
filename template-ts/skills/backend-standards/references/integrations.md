# Integrations And Untrusted External Data

Load for providers, webhooks, imports, SDKs, and outbound calls.

External systems are unreliable and their payloads are untrusted. Validate schema, authenticate signatures where applicable, bound input/work, normalize data at adapter boundary, and retain source identifiers needed for reconciliation. Do not let vendor DTOs, error types, or naming become domain contracts unless source identity is deliberate domain data.

Set timeout and propagate cancellation. Retry only transient failures and only where operation is idempotent or protected by idempotency key/deduplication; use bounded attempts and visible final failure. Honor provider rate limits and pagination. Do not retry validation, authorization, or deterministic business failures.

Outbound state changes need explicit idempotence and failure recovery. Prefer established outbox/queue/retry facilities. Record correlation ID, external operation ID, safe diagnostic context, and outcome; never log credentials, authorization headers, raw tokens, or unnecessary personal data.

Reconciliation converts an external goal state into explicit local operations. Keep its source-specific diff/orchestration outside generic domain mutation methods. Handle missing, duplicate, partial, delayed, and reordered deliveries deliberately.

## Completion

- [ ] External payload is validated and bounded.
- [ ] Timeout, cancellation, transient retry, and idempotence rules are explicit.
- [ ] Provider implementation remains at adapter boundary.
- [ ] Logs are actionable and secret-safe.
