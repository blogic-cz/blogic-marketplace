# Testing With Layers

## Why Not vi.mock

Effect dependencies are resolved from runtime context (`yield* ServiceTag`), so `vi.mock()` does not replace layer-provided dependencies reliably.

## Preferred Pattern

Use `Layer.succeed` (or `Layer.effect`) for mocks and compose a dedicated test layer.

```ts
const MockDatabaseLayer = Layer.succeed(Database, {
  query: {
    documents: { findMany: () => Effect.succeed([]) },
  },
});

const TestLayer = SlugServiceLayer.pipe(Layer.provide(MockDatabaseLayer));

it.effect("returns slug", () =>
  Effect.gen(function* () {
    const svc = yield* SlugService;
    const slug = yield* svc.generateSlug("Doc");
    expect(slug).toBe("doc");
  }).pipe(Effect.provide(TestLayer)),
);
```

## Rules

- Prefer `@effect/vitest` + `it.effect()`
- Keep test doubles typed and explicit
- Build one test layer per scenario when behavior differs
- Keep assertions on domain outcomes, not Effect internals
