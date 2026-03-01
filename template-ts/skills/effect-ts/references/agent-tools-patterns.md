# Agent Tools Patterns

Scope: `agent-tools/*` CLI services.

## Preferred Service Shape

- `service.ts`: `Context.Tag` + static `layer`
- `errors.ts`: `Schema.TaggedError` hierarchy
- `types.ts`: input/output contracts
- `config.ts`: constants
- `config-service.ts`: secret/config loading when needed

## Scoped Caching Pattern

Use `Layer.scoped` + `Ref` for runtime cache/state (not module-level `let`).

```ts
const contextRef = yield * Ref.make<string | null>(null);
```

## Timeout As Data

Prefer:

```ts
const resultOption =
  yield * effect.pipe(Effect.timeoutOption(timeoutMs));
if (Option.isNone(resultOption)) {
  return (
    yield *
    new TimeoutError({ message: "timed out", timeoutMs })
  );
}
```

## Secret Safety

Use `Config.redacted` in config service layers.

- keep secrets as `Redacted.Redacted<string>` until last possible boundary
- expose helper method for raw value only where unavoidable
- provide deterministic `testLayer`

## Process Output Pattern

For command execution, use stream-based collection:

```ts
const stdoutChunk =
  yield *
  proc.stdout.pipe(Stream.decodeText(), Stream.runCollect);
const stdout = Chunk.join(stdoutChunk, "");
```

Keep wrappers consistent across tools to avoid drift.
