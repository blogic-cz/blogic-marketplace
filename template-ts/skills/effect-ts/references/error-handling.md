# Error Handling

## Domain Errors

Use `Schema.TaggedError` for typed domain failures.

```ts
export class EmptySlugError extends Schema.TaggedError<EmptySlugError>()("EmptySlugError", {
  message: Schema.String,
}) {}

return yield * new EmptySlugError({ message: "Slug is empty" });
```

## Recovery

- `Effect.catchTag("ErrorTag", ...)` for single typed branch
- `Effect.catchTags({...})` for multi-branch recovery
- Keep mapping to transport errors (TRPC/http) at boundary layers

## Option/Either Rules

- Do not branch on internal `_tag`
- Prefer `Option.match`, `Either.match`, `isNone`, `isLeft`

```ts
const result = yield * effect.pipe(Effect.either);

return Either.match(result, {
  onLeft: (error) => Effect.fail(error),
  onRight: (value) => Effect.succeed(value),
});
```

## Defects vs Typed Errors

- Expected business/integration failures -> typed error channel
- Programmer bugs/invariants impossible to recover -> defects
- Do not hide typed errors in defects only to simplify signatures
