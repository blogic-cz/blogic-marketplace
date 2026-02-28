# Effect TDD Patterns

TDD patterns specifically for Effect TypeScript services with layers, mock dependencies, and error handling.

> **Source**: [Effect and the Near Inexpressible Majesty of Layers](https://www.effect.website/blog/layers)

---

## Why Layers Instead of vi.mock()

**vi.mock() problems:**

```typescript
// ❌ Misspelled file name → silent failure, mock misses target
vi.mock("./future-flaps", () => ({ isEnabled: vi.fn() }))

// ❌ Misspelled function name → mocks imaginary function
vi.mock("./feature-flags", () => ({ isEnable: vi.fn() }))

// ❌ Wrong return type → no type checking
vi.mocked(isEnabled).mockResolvedValue("sure") // string instead of boolean

// ❌ Hidden dependencies → signature reveals nothing
export const getPrice = async (basePrice: number): Promise<number> // ???
```

**Effect solution: Context.Tag + Layer**

```typescript
// 1. Define service interface
class FeatureFlags extends Context.Tag("FeatureFlags")<
  FeatureFlags,
  {
    readonly isEnabled: (
      flag: string
    ) => Effect.Effect<boolean>;
  }
>() {}

// 2. Test layer - parameterized
const testFlagsLayer = (...enabled: string[]) =>
  Layer.succeed(FeatureFlags, {
    isEnabled: (flag) =>
      Effect.succeed(enabled.includes(flag)),
  });

// 3. Service that depends on FeatureFlags
const pricingLayer = Layer.effect(
  Pricing,
  Effect.gen(function* () {
    const flags = yield* FeatureFlags; // Dependency tracked in type!
    return {
      getPrice: Effect.fn(function* (base: number) {
        return (yield* flags.isEnabled("surge"))
          ? base * 6.5
          : base;
      }),
    };
  })
);
// Type: Layer.Layer<Pricing, never, FeatureFlags>
//                                   ^^^^^^^^^^^^^^ requirement visible!

// 4. Test without mocks
it.effect("applies surge pricing", () =>
  Effect.gen(function* () {
    const pricing = yield* Pricing;
    expect(yield* pricing.getPrice(100)).toBe(650);
  }).pipe(
    Effect.provide(pricingLayer),
    Effect.provide(testFlagsLayer("surge"))
  )
);
```

**Benefits:**

| vi.mock()                      | Effect Layers                  |
| ------------------------------ | ------------------------------ |
| Misspellings → silent failures | Misspellings → compile errors  |
| Hidden dependencies            | Explicit dependencies in types |
| Untethered from type system    | Fully type-safe                |
| Import hoisting magic          | Composable, explicit layers    |

---

## Test-First Service Design

### Step 1: Define Interface via Tests

Before writing ANY implementation, write tests that define what the service should do:

```typescript
// packages/services/src/__tests__/pricing-service.test.ts
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { PricingService } from "../pricing-service";

describe("PricingService", () => {
  // These tests define the service contract
  it.effect("calculates price for single item", () =>
    Effect.gen(function* () {
      const service = yield* PricingService;
      const result = yield* service.calculatePrice({
        itemId: "item-1",
        quantity: 1,
      });
      expect(result.total).toBe(100);
    }).pipe(Effect.provide(testLayer))
  );

  it.effect("applies bulk discount for quantity > 10", () =>
    Effect.gen(function* () {
      const service = yield* PricingService;
      const result = yield* service.calculatePrice({
        itemId: "item-1",
        quantity: 15,
      });
      // 15% bulk discount: 15 * 100 * 0.85 = 1275
      expect(result.total).toBe(1275);
    }).pipe(Effect.provide(testLayer))
  );
});
```

### Step 2: Create Mock Layers

Define mock layers that isolate the service from its dependencies:

```typescript
// At the top of test file
import { Layer } from "effect";
import { InventoryService } from "../inventory-service";
import { PricingService } from "../pricing-service";

// Mock inventory with predefined data
const mockInventoryLayer = Layer.succeed(InventoryService, {
  getPrice: (itemId) =>
    Effect.succeed(itemId === "item-1" ? 100 : 50),
  getStock: (itemId) => Effect.succeed(100),
});

// Compose test layer
const testLayer = PricingService.layer.pipe(
  Layer.provide(mockInventoryLayer)
);
```

### Step 3: Implement Service (GREEN)

Now implement the service to make tests pass:

```typescript
// packages/services/src/pricing-service.ts
import { Context, Effect, Layer } from "effect";
import { InventoryService } from "./inventory-service";

export class PricingService extends Context.Tag(
  "@blogic-template/PricingService"
)<
  PricingService,
  {
    readonly calculatePrice: (params: {
      itemId: string;
      quantity: number;
    }) => Effect.Effect<{ total: number }, never>;
  }
>() {
  static readonly layer = Layer.effect(
    PricingService,
    Effect.gen(function* () {
      const inventory = yield* InventoryService;

      const calculatePrice = Effect.fn(
        "PricingService.calculatePrice"
      )((params: { itemId: string; quantity: number }) =>
        Effect.gen(function* () {
          const unitPrice = yield* inventory.getPrice(
            params.itemId
          );
          let total = unitPrice * params.quantity;

          // Bulk discount for quantity > 10
          if (params.quantity > 10) {
            total = total * 0.85;
          }

          return { total };
        })
      );

      return { calculatePrice };
    })
  );
}

export const PricingServiceLayer = PricingService.layer;
```

---

## Mock Layer Factory Pattern

Create parameterized mock layers for different test scenarios:

```typescript
// Parameterized mock for different test cases
const createMockInventoryLayer = (config: {
  prices: Map<string, number>;
  stock: Map<string, number>;
}) =>
  Layer.succeed(InventoryService, {
    getPrice: (itemId) =>
      Effect.succeed(config.prices.get(itemId) ?? 0),
    getStock: (itemId) =>
      Effect.succeed(config.stock.get(itemId) ?? 0),
  });

// Usage in tests
describe("PricingService", () => {
  it.effect("handles item with zero price", () => {
    const testLayer = PricingService.layer.pipe(
      Layer.provide(
        createMockInventoryLayer({
          prices: new Map([["free-item", 0]]),
          stock: new Map([["free-item", 100]]),
        })
      )
    );

    return Effect.gen(function* () {
      const service = yield* PricingService;
      const result = yield* service.calculatePrice({
        itemId: "free-item",
        quantity: 5,
      });
      expect(result.total).toBe(0);
    }).pipe(Effect.provide(testLayer));
  });
});
```

---

## Error Case Testing

### Testing Expected Errors with Effect.either

```typescript
import { Either } from "effect";

it.effect("fails when item not found", () =>
  Effect.gen(function* () {
    const service = yield* PricingService;
    const result = yield* service
      .calculatePrice({
        itemId: "non-existent",
        quantity: 1,
      })
      .pipe(Effect.either);

    Either.match(result, {
      onLeft: (error) => {
        expect(error._tag).toBe("ItemNotFoundError");
        expect(error.itemId).toBe("non-existent");
      },
      onRight: () => {
        expect.fail("Expected Left but got Right");
      },
    });
  }).pipe(Effect.provide(testLayer))
);
```

### Mock Layer That Returns Errors

```typescript
const createFailingInventoryLayer = (errorType: string) =>
  Layer.succeed(InventoryService, {
    getPrice: (itemId) =>
      Effect.fail(new ItemNotFoundError({ itemId })),
    getStock: (itemId) =>
      Effect.fail(
        new InventoryError({
          message: "Service unavailable",
        })
      ),
  });

it.effect("handles inventory service failure", () => {
  const testLayer = PricingService.layer.pipe(
    Layer.provide(createFailingInventoryLayer("not-found"))
  );

  return Effect.gen(function* () {
    const service = yield* PricingService;
    const result = yield* service
      .calculatePrice({ itemId: "any", quantity: 1 })
      .pipe(Effect.either);

    expect(Either.isLeft(result)).toBe(true);
  }).pipe(Effect.provide(testLayer));
});
```

---

## Testing with Real Dependencies (it.live)

When you need to test with real implementations (e.g., HTTP client):

```typescript
import { vi } from "vitest";

it.live("fetches price from external API", () => {
  // Mock global fetch for this test
  globalThis.fetch = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ price: 99 }), {
      status: 200,
    })
  );

  return Effect.gen(function* () {
    const service = yield* PricingService;
    const result =
      yield* service.fetchExternalPrice("external-item");
    expect(result.price).toBe(99);
  }).pipe(Effect.provide(PricingServiceLive));
});
```

---

## Layer.succeed vs Layer.effect

### Use Layer.succeed when:

- No dependencies needed
- Synchronous mock creation
- Simple static values

```typescript
const mockLayer = Layer.succeed(MyService, {
  doSomething: (input) =>
    Effect.succeed(input.toUpperCase()),
  getValue: () => Effect.succeed(42),
});
```

### Use Layer.effect when:

- Need to yield dependencies
- Need async setup
- Complex initialization

```typescript
const realLayer = Layer.effect(
  MyService,
  Effect.gen(function* () {
    const dep = yield* SomeDependency;
    const config = yield* Effect.promise(() =>
      loadConfig()
    );

    return {
      doSomething: Effect.fn("MyService.doSomething")(
        (input: string) =>
          Effect.succeed(dep.process(input))
      ),
    };
  })
);
```

---

## TDD Workflow for Effect Services

### 1. RED - Define behavior via test

```typescript
describe("NotificationService", () => {
  it.effect("sends email notification", () =>
    Effect.gen(function* () {
      const service = yield* NotificationService;
      const result = yield* service.notify({
        type: "email",
        recipient: "user@example.com",
        message: "Hello",
      });
      expect(result.sent).toBe(true);
      expect(result.channel).toBe("email");
    }).pipe(Effect.provide(testLayer))
  );
});
```

### 2. GREEN - Create service interface and minimal implementation

```typescript
// First, define the service tag (minimal)
export class NotificationService extends Context.Tag(
  "@blogic-template/NotificationService"
)<
  NotificationService,
  {
    readonly notify: (
      params: NotifyParams
    ) => Effect.Effect<NotifyResult>;
  }
>() {
  static readonly layer = Layer.succeed(
    NotificationService,
    {
      notify: (params) =>
        Effect.succeed({
          sent: true,
          channel: params.type,
        }),
    }
  );
}
```

### 3. REFACTOR - Add proper implementation with dependencies

```typescript
export class NotificationService extends Context.Tag(
  "@blogic-template/NotificationService"
)<
  NotificationService,
  {
    readonly notify: (
      params: NotifyParams
    ) => Effect.Effect<NotifyResult, NotificationError>;
  }
>() {
  static readonly layer = Layer.effect(
    NotificationService,
    Effect.gen(function* () {
      const emailClient = yield* EmailClient;
      const smsClient = yield* SmsClient;

      const notify = Effect.fn(
        "NotificationService.notify"
      )((params: NotifyParams) =>
        Effect.gen(function* () {
          if (params.type === "email") {
            yield* emailClient.send(
              params.recipient,
              params.message
            );
          } else if (params.type === "sms") {
            yield* smsClient.send(
              params.recipient,
              params.message
            );
          }
          return { sent: true, channel: params.type };
        })
      );

      return { notify };
    })
  );
}
```

### 4. Add more tests for edge cases

```typescript
it.effect("fails for invalid email", () =>
  Effect.gen(function* () {
    const service = yield* NotificationService;
    const result = yield* service
      .notify({
        type: "email",
        recipient: "invalid",
        message: "Hi",
      })
      .pipe(Effect.either);

    Either.match(result, {
      onLeft: (error) => {
        expect(error._tag).toBe("InvalidRecipientError");
      },
      onRight: () => {
        expect.fail("Expected error for invalid email");
      },
    });
  }).pipe(Effect.provide(testLayer))
);
```

---

## Testing Checklist for Effect Services

Before marking service complete:

- [ ] Happy path tested
- [ ] Error cases tested with `Effect.either`
- [ ] Mock layers isolate all dependencies
- [ ] Edge cases covered (null, empty, boundary values)
- [ ] `Effect.fn` used for tracing in implementation
- [ ] Layer export constant defined (`XxxServiceLayer`)
- [ ] Tests pass: `bun run vitest run packages/services/src/__tests__/xxx.test.ts`
