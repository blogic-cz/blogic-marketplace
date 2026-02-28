# Red-Green-Refactor Workflow

Detailed guide to the TDD cycle with practical examples.

## The Three Phases

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────┐      ┌─────────┐      ┌───────────┐          │
│   │   RED   │ ───▶ │  GREEN  │ ───▶ │ REFACTOR  │ ───┐     │
│   │  Fail   │      │  Pass   │      │  Improve  │    │     │
│   └─────────┘      └─────────┘      └───────────┘    │     │
│        ▲                                              │     │
│        └──────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: RED - Write Failing Test

### Purpose

- Define expected behavior before implementation
- Ensure the test CAN fail (validates test correctness)
- Force thinking about interface design

### Rules

1. **Write ONE test at a time** - Don't batch multiple tests
2. **Be specific** - Test one behavior per test
3. **Run the test** - Verify it fails for the RIGHT reason
4. **Descriptive names** - Test name should explain the behavior

### Example

```typescript
// packages/common/src/__tests__/format-currency.test.ts
import { describe, expect, it } from "vitest";
import { formatCurrency } from "../format-currency";

describe("formatCurrency", () => {
  it("formats USD with dollar sign and two decimals", () => {
    // This will fail - function doesn't exist yet
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
  });
});
```

**Run to verify failure:**

```bash
bun run vitest run packages/common/src/__tests__/format-currency.test.ts
```

Expected output:

```
FAIL  packages/common/src/__tests__/format-currency.test.ts
  formatCurrency
    ✕ formats USD with dollar sign and two decimals
    Error: Cannot find module '../format-currency'
```

### Common Mistakes in RED Phase

| Mistake                        | Problem                     | Fix                                   |
| ------------------------------ | --------------------------- | ------------------------------------- |
| Test passes immediately        | Didn't verify test can fail | Write assertion BEFORE implementation |
| Multiple behaviors in one test | Hard to debug failures      | One assertion per behavior            |
| Vague test name                | Unclear what's being tested | Name describes expected behavior      |
| Not running the test           | Don't know if test works    | Always run to see failure             |

---

## Phase 2: GREEN - Minimal Implementation

### Purpose

- Make the test pass with minimum code
- Don't over-engineer or optimize
- Focus on correctness, not elegance

### Rules

1. **Minimum viable code** - Just enough to pass
2. **No premature optimization** - That's for REFACTOR phase
3. **Hardcoding is OK** - If it makes the test pass
4. **Run test immediately** - Verify it passes

### Example

```typescript
// packages/common/src/format-currency.ts
export function formatCurrency(
  amount: number,
  currency: string
): string {
  // Minimum implementation to pass the test
  if (currency === "USD") {
    return (
      "$" +
      amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  return String(amount);
}
```

**Run to verify pass:**

```bash
bun run vitest run packages/common/src/__tests__/format-currency.test.ts
```

Expected output:

```
✓ packages/common/src/__tests__/format-currency.test.ts
  formatCurrency
    ✓ formats USD with dollar sign and two decimals
```

### When GREEN Phase is "Ugly"

It's OK if your first implementation is ugly. Examples:

```typescript
// This is FINE in GREEN phase
export function isEven(n: number): boolean {
  if (n === 2) return true;
  if (n === 4) return true;
  if (n === 6) return true;
  // ... hardcoded for specific test cases
  return false;
}
```

You'll clean it up in REFACTOR. The goal is a passing test.

---

## Phase 3: REFACTOR - Improve Without Breaking

### Purpose

- Improve code quality and design
- Remove duplication
- Enhance readability
- Keep tests GREEN throughout

### Rules

1. **Tests must stay green** - Run after every change
2. **Small steps** - One refactoring at a time
3. **No new functionality** - Only restructure existing code
4. **Improve both code AND tests** - Clean up test code too

### Example

```typescript
// Before refactoring
export function formatCurrency(
  amount: number,
  currency: string
): string {
  if (currency === "USD") {
    return (
      "$" +
      amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  return String(amount);
}

// After refactoring
type Currency = "USD" | "EUR" | "CZK";

const CURRENCY_CONFIG: Record<
  Currency,
  { symbol: string; locale: string }
> = {
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" },
  CZK: { symbol: "Kč", locale: "cs-CZ" },
};

export function formatCurrency(
  amount: number,
  currency: Currency
): string {
  const config = CURRENCY_CONFIG[currency];
  const formatted = amount.toLocaleString(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${config.symbol}${formatted}`;
}
```

**Run tests after EVERY refactoring step:**

```bash
bun run vitest run packages/common/src/__tests__/format-currency.test.ts
```

### Refactoring Checklist

- [ ] Extract magic numbers/strings to constants
- [ ] Rename variables for clarity
- [ ] Extract repeated code to functions
- [ ] Simplify conditionals
- [ ] Add types where missing
- [ ] Remove dead code
- [ ] Update test descriptions if behavior clearer now

---

## Complete TDD Cycle Example

### Scenario: Build a `parseResourceSize` function

**Iteration 1:**

```typescript
// RED: Write failing test
it("parses Ki units", () => {
  expect(parseResourceSize("512Ki")).toBe(524288);
});

// GREEN: Minimal implementation
export function parseResourceSize(size: string): number {
  const match = size.match(/^(\d+)Ki$/);
  if (match) return parseInt(match[1]) * 1024;
  return 0;
}

// REFACTOR: Not needed yet, code is simple
```

**Iteration 2:**

```typescript
// RED: Add new test case
it("parses Mi units", () => {
  expect(parseResourceSize("2Mi")).toBe(2097152);
});

// GREEN: Extend implementation
export function parseResourceSize(size: string): number {
  const match = size.match(/^(\d+)(Ki|Mi)$/);
  if (!match) return 0;
  const value = parseInt(match[1]);
  const unit = match[2];
  if (unit === "Ki") return value * 1024;
  if (unit === "Mi") return value * 1024 * 1024;
  return 0;
}

// REFACTOR: Extract multipliers
const UNIT_MULTIPLIERS: Record<string, number> = {
  Ki: 1024,
  Mi: 1024 ** 2,
};

export function parseResourceSize(size: string): number {
  const match = size.match(/^(\d+)(\w+)$/);
  if (!match) return 0;
  const value = parseInt(match[1]);
  const unit = match[2];
  return value * (UNIT_MULTIPLIERS[unit] ?? 1);
}
```

**Iteration 3:**

```typescript
// RED: Handle edge case
it("returns 0 for invalid input", () => {
  expect(parseResourceSize("invalid")).toBe(0);
  expect(parseResourceSize("")).toBe(0);
});

// GREEN: Already passes! (our implementation handles this)

// REFACTOR: Add Gi unit, improve regex
const UNIT_MULTIPLIERS: Record<string, number> = {
  Ki: 1024,
  Mi: 1024 ** 2,
  Gi: 1024 ** 3,
};

export function parseResourceSize(size: string): number {
  const match = size.match(/^(\d+)(Ki|Mi|Gi)$/);
  if (!match) return 0;
  const [, valueStr, unit] = match;
  return parseInt(valueStr) * UNIT_MULTIPLIERS[unit];
}
```

---

## When to Add More Tests

After completing RED-GREEN-REFACTOR for one behavior, decide:

| Question                              | If YES                       | If NO            |
| ------------------------------------- | ---------------------------- | ---------------- |
| Are there untested edge cases?        | Add test for edge case       | Move on          |
| Does the feature have more behaviors? | Add test for next behavior   | Feature complete |
| Did refactoring suggest new tests?    | Add tests to cover new paths | Move on          |

---

## TDD Session Checklist

Before starting:

- [ ] Understand the requirement clearly
- [ ] Identify the first small behavior to test
- [ ] Know where test file should go

During each cycle:

- [ ] RED: Test fails for right reason
- [ ] GREEN: Minimum code to pass
- [ ] REFACTOR: Code cleaner, tests still green

After completing feature:

- [ ] All edge cases covered
- [ ] Code is clean and readable
- [ ] Tests document the behavior
- [ ] Run `bun run test` to verify all tests pass
