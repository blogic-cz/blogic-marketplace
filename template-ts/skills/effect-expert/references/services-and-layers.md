# Services And Layers

## Core Pattern

Keep service contract and layer in one file.

```ts
export class MyService extends Context.Tag(
  "@project/MyService"
)<
  MyService,
  {
    readonly run: (
      input: string
    ) => Effect.Effect<string, MyError>;
  }
>() {
  static readonly layer = Layer.effect(
    MyService,
    Effect.gen(function* () {
      const dep = yield* SomeDependency;
      const run = Effect.fn("MyService.run")(function* (
        input: string
      ) {
        return yield* dep.execute(input);
      });
      return { run };
    })
  );
}

export const MyServiceLayer = MyService.layer;
```

## Layer Selection

- `Layer.succeed`: pure/sync construction, no dependencies
- `Layer.effect`: needs dependencies or setup work
- `Layer.scoped`: manages lifecycle/resources (processes, handles, caches)

## Project Conventions

- Tag IDs use `@project/...` naming
- Use `Effect.fn("Service.method")` for traced service methods
- Prefer one provide boundary at runtime entrypoints
- Avoid splitting tag and layer into separate "service/layer" files unless there is a strong reason

## Common Anti-Patterns

- Tag in one file and implementation spread across unrelated files
- `as any` to bypass layer type mismatch
- Multiple nested `Effect.provide(...)` calls deep in feature code
