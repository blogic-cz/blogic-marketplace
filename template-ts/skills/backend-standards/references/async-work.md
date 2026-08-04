# Async Work

Use this checklist for external calls and background work:

- Set a timeout or honor the caller's cancellation mechanism.
- Retry only transient, idempotent operations; bound retries and keep failure visible.
- Give state-changing jobs an idempotency key or equivalent deduplication when duplicate delivery is possible.
- Log enough context to diagnose failure, excluding credentials and sensitive payloads.
- Prefer existing queue, retry, and telemetry facilities in the repository.

Do not introduce queues, retry libraries, or tracing infrastructure for a one-off operation unless its failure mode requires it.
