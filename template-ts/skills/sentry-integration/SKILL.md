---
name: sentry-integration
description: "This skill should be used when implementing or debugging Sentry error tracking, instrumentation, distributed tracing, performance issues, or capture-errors flows. It provides a portable workflow for SDK setup, middleware wiring, expected-error classification, and verification."
---

# Sentry Integration

Implement Sentry integration with a fixed operational sequence and explicit decision rules. Keep project-specific details in references so the skill remains cross-agent portable.

## Trigger Conditions

Load this skill when requests involve any of the following:

- Sentry SDK setup or migration
- Error tracking, exception capture, or expected-error classification
- Instrumentation and span design
- Performance issues, slow requests, trace analysis, or sampling strategy
- Middleware wiring for TRPC, HTTP handlers, or server functions
- Sentry API usage for issues/projects/alerts

## Operational Workflow (Mandatory Order)

1. Configure SDKs (server first, client second).
2. Wire middleware at framework boundaries.
3. Classify expected errors before capture and beforeSend.
4. Add tracing only where default integrations are insufficient.
5. Verify events, spans, tags, and noise filtering in non-production first.

Execute steps in this order to avoid noisy telemetry and broken trace context.

## 1) Configure SDK

Define environment, release, and sampling explicitly. Keep health checks and synthetic traffic out of traces.

Use the server/client initialization examples in `references/sentry-code-samples.md`.

## 2) Wire Middleware

Attach Sentry middleware at shared boundaries, not only one procedure export.

Apply the same middleware rule to all procedure chains:

- `publicProcedure`
- authenticated/protected procedures
- admin or org-scoped procedures
- custom composed chains

Use the TRPC and server-function examples in `references/sentry-code-samples.md`.

## 3) Classify Expected Errors

Mark expected business errors as handled to reduce alert noise while preserving observability.

Classify expected errors in two places:

- custom `captureException` wrapper
- SDK `beforeSend`

In `beforeSend`, always read the throwable from `hint.originalException` (or equivalent helper). Do not reference an undefined `error` variable.

Use the fixed `beforeSend` example and helper functions in `references/sentry-code-samples.md`.

## 4) Add Tracing

Prefer built-in integrations first, then add manual tracing only for uncovered paths.

### Database Tracing Decision Rule

- Use `postgresIntegration` when using supported PostgreSQL drivers and standard query paths.
- Use manual/proxy tracing when queries bypass supported integrations, when wrapping Drizzle/custom builders, or when operation-level naming is required.
- Avoid running both strategies on the same query path to prevent duplicate spans.

Use the manual and proxy tracing examples in `references/sentry-code-samples.md`.

## 5) Verify

Verify each integration change with a short checklist:

1. Trigger one expected error and confirm warning-level handled event.
2. Trigger one unexpected error and confirm error-level alerting path.
3. Execute one instrumented request and confirm trace continuity.
4. Confirm health-check routes are excluded.
5. Confirm no duplicated DB spans.

## Sentry API Service Scope

Treat Sentry API service work (issues/projects/token verification) as an optional advanced module. Keep it in the same skill only when implementation remains within Sentry integration boundaries; otherwise split into a dedicated operational skill.

Use Effect-oriented API service examples in `references/sentry-code-samples.md`.

## Core Rules

1. Follow workflow order: configure SDK → wire middleware → classify expected errors → add tracing → verify.
2. Keep expected errors observable but marked handled.
3. Keep middleware coverage consistent across all procedure chains.
4. Prefer built-in DB integration before manual/proxy tracing.
5. Validate integration behavior in non-production before rollout.
6. Keep large code samples in references files; keep decision rules in SKILL.md.
