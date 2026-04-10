---
name: tdd
description: "This skill should be used when a task explicitly asks for TDD, test-first development, or the Red-Green-Refactor cycle. It guides incremental implementation with concrete Red-Green-Refactor examples, including Effect service patterns with mock layers."
---

# Test-Driven Development (TDD)

Apply this skill to execute strict test-first development: write a failing test, implement the minimum code to pass, then refactor while keeping tests green.

## Decide when to use TDD

Use this decision table:

| Situation                     | Use this skill? | Default action                                                                                      |
| ----------------------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| New utility function          | **Yes**         | Run TDD cycle immediately                                                                           |
| New Effect service            | **Yes**         | Define behavior through tests first                                                                 |
| Complex business logic        | **Yes**         | Lock behavior with tests before implementation                                                      |
| Bug fix                       | **Yes**         | Reproduce bug with failing test first                                                               |
| UI styling/layout-only change | No              | Use standard implementation flow                                                                    |
| Exploratory prototyping       | No              | Prototype first, then switch to TDD once behavior stabilizes                                        |
| TRPC endpoint (simple CRUD)   | Usually no      | Use `testing-patterns` by default; use this skill only when user explicitly requests test-first/RGR |

---

## Execute Red-Green-Refactor

Follow one behavior at a time through three phases.

### 1. RED - Write Failing Test First

```typescript
import { describe, expect, it } from "vitest";
import { calculateDiscount } from "../calculate-discount";

describe("calculateDiscount", () => {
  it("applies 10% discount for orders over 100", () => {
    // This test fails first: function does not exist yet
    expect(calculateDiscount(150)).toBe(135);
  });
});
```

**Run test to see it fail:**

```bash
bun run vitest run packages/common/src/__tests__/calculate-discount.test.ts
```

### 2. GREEN - Implement Minimum Code

Write the **minimum code** to make the test pass:

```typescript
// packages/common/src/calculate-discount.ts
export function calculateDiscount(amount: number): number {
  if (amount > 100) {
    return amount * 0.9;
  }
  return amount;
}
```

**Run test to see it pass:**

```bash
bun run vitest run packages/common/src/__tests__/calculate-discount.test.ts
```

### 3. REFACTOR - Improve Without Breaking Behavior

Improve code quality while keeping tests green:

```typescript
const DISCOUNT_THRESHOLD = 100;
const DISCOUNT_RATE = 0.1;

export function calculateDiscount(amount: number): number {
  if (amount <= DISCOUNT_THRESHOLD) {
    return amount;
  }
  return amount * (1 - DISCOUNT_RATE);
}
```

**Run tests again to verify refactoring didn't break anything.**

For extended examples, failure diagnostics, and iterative expansions, read `references/red-green-refactor.md`.

---

## Keep test scope lean

Prefer lighter tests first and escalate only when needed:

1. **Unit tests** (preferred) - Pure functions and Effect services with mock layers.
2. **TRPC integration tests** - Full TRPC + persistence behavior.
3. **E2E tests** - Browser-level flows and user journeys.

| Situation                        | Test Type             | Action                                     |
| -------------------------------- | --------------------- | ------------------------------------------ |
| Pure function, parser, util      | Unit                  | Write immediately                          |
| Effect service with dependencies | Unit with mock layers | Write immediately                          |
| TRPC procedure (DB logic)        | TRPC integration      | Follow `testing-patterns` decision process |
| User-facing flow, UI behavior    | E2E                   | Follow `testing-patterns` decision process |

---

## Apply Effect-specific TDD patterns

Use test-first service design with explicit layers.

1. **Define interface via test** - Make behavior explicit before implementation.
2. **Create mock layer** - Isolate dependencies and keep tests deterministic.
3. **Implement service** - Satisfy the tests with the minimal behavior.
4. **Refactor** - Improve readability and structure while preserving behavior.

```typescript
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";

describe("PricingService", () => {
  // 1. Define what the service should do via tests
  it.effect("calculates base price without discount", () =>
    Effect.gen(function* () {
      const service = yield* PricingService;
      const result = yield* service.calculatePrice({
        itemId: "item-1",
        quantity: 2,
      });
      expect(result.total).toBe(200);
    }).pipe(Effect.provide(testLayer)),
  );

  it.effect("applies bulk discount for quantity > 10", () =>
    Effect.gen(function* () {
      const service = yield* PricingService;
      const result = yield* service.calculatePrice({
        itemId: "item-1",
        quantity: 15,
      });
      expect(result.total).toBe(1350); // 15% discount
    }).pipe(Effect.provide(testLayer)),
  );
});
```

### Mock Layer Factory Pattern

```typescript
// Create parameterized mock layers for different test scenarios
const createMockInventoryLayer = (inventory: Map<string, number>) =>
  Layer.succeed(InventoryService, {
    getStock: (itemId) => Effect.succeed(inventory.get(itemId) ?? 0),
    reserveStock: (itemId, qty) => Effect.succeed(void 0),
  });

// Use in tests
const testLayer = PricingService.layer.pipe(
  Layer.provide(createMockInventoryLayer(new Map([["item-1", 100]]))),
);
```

For deeper guidance (error-path testing, layer composition, anti-`vi.mock()` rationale), read `references/effect-tdd-patterns.md`.

---

## Use project-convention test locations (examples)

Treat these paths as project conventions/examples; adapt if a repository uses different test layout.

| Code Location                                       | Test Location                           |
| --------------------------------------------------- | --------------------------------------- |
| `packages/X/src/file.ts`                            | `packages/X/src/__tests__/file.test.ts` |
| `apps/web-app/src/infrastructure/trpc/routers/X.ts` | `apps/web-app/src/__tests__/X.test.ts`  |
| `apps/web-app/src/routes/**`                        | `apps/web-app/e2e/feature.e2e.ts`       |

---

## Use supporting references for depth

Load targeted references instead of expanding this file during execution:

- Use `references/commands.md` for runnable command patterns.
- Use `references/anti-patterns.md` for failure-mode walkthroughs and corrections.

## Resources

### references/

- `red-green-refactor.md` - Detailed TDD cycle workflow with examples
- `effect-tdd-patterns.md` - Effect service testing, mock layers, error cases
- `test-first-examples.md` - Step-by-step TDD examples for this codebase
- `commands.md` - Command catalog and correct/incorrect invocation patterns
- `anti-patterns.md` - Detailed TDD anti-pattern walkthroughs with fixes

### Related Skills

- `testing-patterns` - Test syntax, TRPC integration tests, E2E patterns
- `effect-ts` - Effect service design, layers, error handling
