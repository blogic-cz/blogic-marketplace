# TDD Anti-Patterns and Corrections

Use these examples to identify and fix common TDD failure modes.

## 1) Writing implementation first

```typescript
// BAD: implementation before test
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
```

Correction: write a failing test first, then implement the minimum behavior.

## 2) Skipping the RED phase

```typescript
// BAD: test cannot prove anything and passes immediately
it("returns true", () => {
  expect(true).toBe(true);
});
```

Correction: write assertions that fail before implementation exists.

## 3) Writing too many failing tests at once

```typescript
// BAD: many failures at once, unclear next move
describe("UserService", () => {
  it("creates user", () => {
    /* ... */
  });
  it("updates user", () => {
    /* ... */
  });
  it("deletes user", () => {
    /* ... */
  });
  it("lists users", () => {
    /* ... */
  });
  it("validates email", () => {
    /* ... */
  });
});
```

Correction: run one cycle at a time: RED → GREEN → REFACTOR → next behavior.

## 4) Skipping REFACTOR after GREEN

```typescript
// BAD: passing test, but code remains brittle
export function calc(a: number, b: number, c: string): number {
  if (c === "add") return a + b;
  if (c === "sub") return a - b;
  if (c === "mul") return a * b;
  return 0;
}

// BETTER: refactor behavior-preserving design
type Operation = "add" | "subtract" | "multiply";

const operations: Record<Operation, (a: number, b: number) => number> = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
};

export function calculate(a: number, b: number, op: Operation): number {
  return operations[op](a, b);
}
```

Correction: always perform a refactor pass once behavior is green.
