# Jobs, Queues, And Async Work

Load for background work, consumers, schedules, imports, and batches.

A job may run late, twice, concurrently, or after partial failure. Define idempotency key/deduplication and check it around state-changing effects. Make each unit of work bounded and checkpoint progress so cancellation, restart, and retry do not repeat unbounded work. Use per-item failure handling for batches when one bad item should not discard successful work.

Honor cancellation and deadlines. Retry only transient, idempotent operations; bound attempts and backoff, preserve final failure, and avoid blanket retries that amplify contention or duplicate messages. Jobs and message handlers choose explicit success, retry, dead-letter/manual-repair, or skip disposition.

Use established queue, scheduling, telemetry, and lock facilities. Log job/correlation identifier, attempt, safe subject identifier, stage, and outcome. Never log credentials or full sensitive payloads. Schedule recurrence with overlap policy: allow, prevent, or make concurrent runs safe; do not leave it implicit.

## Completion

- [ ] Duplicate delivery and partial failure behavior is defined.
- [ ] Cancellation, timeout, retry, and final failure behavior is defined.
- [ ] Batch work is bounded/checkpointed where needed.
- [ ] Diagnostic context is logged without secrets.
