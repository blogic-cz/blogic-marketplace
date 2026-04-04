---
name: testing-patterns
description: "This skill should be used when implementing or reviewing testing workflows in template-ts projects, especially for testing, Vitest, Playwright, integration test, and mocking scenarios."
compatibility: opencode
---

# Testing Patterns

Use this skill to choose the lightest effective test type and apply project-consistent patterns for Vitest unit tests, TRPC integration tests with PGlite, and Playwright E2E tests.

## Test Hierarchy (prefer simpler first)

1. **Unit tests** (preferred) - Cover pure functions, parsers, and Effect services.
2. **TRPC integration tests** - Cover full TRPC + database behavior.
3. **E2E tests** - Cover browser and full user flows.

## When to Use Each

| Situation                        | Test Type             | Action                  |
| -------------------------------- | --------------------- | ----------------------- |
| Pure function, parser, util      | Unit                  | Write immediately       |
| Effect service with dependencies | Unit with mock layers | Write immediately       |
| TRPC procedure (DB logic)        | TRPC integration      | Follow decision process |
| User-facing flow, UI behavior    | E2E                   | Follow decision process |

## Test File Locations

| Code Location                                       | Test Location                           |
| --------------------------------------------------- | --------------------------------------- |
| `packages/X/src/file.ts`                            | `packages/X/src/__tests__/file.test.ts` |
| `apps/web-app/src/infrastructure/trpc/routers/X.ts` | `apps/web-app/src/__tests__/X.test.ts`  |
| `apps/web-app/src/routes/**`                        | `apps/web-app/e2e/feature.e2e.ts`       |

---

## Decision Process (canonical)

Before writing any test, apply this sequence:

1. **Can this be unit tested?** Write a unit test immediately.
2. **Does this require DB behavior (joins, constraints, TRPC + persistence)?**
   - If the user explicitly requested an integration test, implement it directly.
   - Otherwise, ask a question like: "Would you like an integration test for this TRPC/database behavior?"
3. **Does this require browser/UI flow validation?**
   - If the user explicitly requested E2E coverage, implement it directly.
   - Otherwise, ask a question like: "Would you like an E2E test here? It is the most expensive test type to maintain."

Never re-ask for a test type that the user already requested explicitly.

## Unit Test Patterns

Use unit tests by default.

For concrete examples, see `references/examples.md`:

- Basic Vitest
- Effect tests with `@effect/vitest` and mock layers
- Service-layer tests using real service logic with mocked boundaries

Clarify terminology: "service-layer tests using real service logic with mocked boundaries" means testing the real service implementation while replacing external boundaries (for example HTTP, DB, or filesystem clients) with mocks.

---

## TRPC Integration Test Patterns

Follow the canonical decision process above for consent and escalation.

For concrete setup and seed-helper examples, see `references/examples.md`.

Use seed helpers from `@project/db/testing` to set up the minimum required state per case.

---

## E2E Test Patterns

Follow the canonical decision process above for consent and escalation.

For concrete E2E and auth-helper examples, see `references/examples.md`.

Warn about maintenance cost only when E2E was not explicitly requested.

---

## Commands

```bash
bun run test              # Run all unit + TRPC integration tests
bun run test:watch        # Watch mode
bun run test:coverage     # With coverage
bun run test:e2e          # Run E2E tests
bun run test:e2e:ui       # E2E with UI

# Run specific test file (FROM PROJECT ROOT, full path required)
bun run vitest run packages/common/src/__tests__/pagination.test.ts
bun run vitest run apps/web-app/src/__tests__/formatters.test.ts
```

Avoid these command patterns:

```bash
# These DO NOT work:
bun run test packages/common/src/__tests__/file.test.ts  # script doesn't accept path
cd packages/common && bun run vitest run src/__tests__/file.test.ts  # wrong cwd
```
