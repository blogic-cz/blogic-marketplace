---
name: scan-effect-solutions
description: "LOAD THIS SKILL when: auditing Effect TypeScript compliance, user mentions 'effect scan', 'effect audit', 'effect best practices check', 'scan-effect-solutions'. Contains Effect compliance audit checklist covering tsconfig, services, data modeling, error handling, config, testing, runtime usage, and Option/Either anti-patterns."
compatibility: opencode
---

# Effect Solutions Compliance Audit

Scan repository against Effect TypeScript best practices from effect.solutions. Use this skill to perform systematic audits of Effect code compliance.

## Prerequisites

Before scanning, load current recommendations:

```bash
effect-solutions list
```

Read targeted references:

```text
references/error-handling.md
references/testing-layers.md
```

Load the effect-ts skill for best practices context:

```
skill({ name: "effect-ts" })
```

---

## Audit Checklist

### 1. TypeScript Configuration

Check `tsconfig.base.json` (or `tsconfig.json`) for:

- `exactOptionalPropertyTypes: true`
- `strict: true`
- `noUnusedLocals: true`
- `declarationMap: true`
- `sourceMap: true`
- Effect Language Service plugin configured
- Correct `module` setting for project type (preserve/bundler for apps, NodeNext for libraries)

Run: `effect-solutions show tsconfig`

### 2. Services & Layers Pattern

Search for Effect services and check:

- Are services defined with `Context.Tag`?
- Do tag identifiers use `@path/ServiceName` pattern?
- Are layers defined with `Layer.effect` or `Layer.sync`?
- Is there a single `Effect.provide` at entry point?

Run: `effect-solutions show services-and-layers`

### 3. Data Modeling

Check for:

- Use of `Schema.Class` for records
- Use of `Schema.TaggedClass` for variants
- Branded types for primitives (IDs, emails, etc.)
- Pattern matching with `Match.valueTags`

Run: `effect-solutions show data-modeling`

### 4. Error Handling

Check for:

- Use of `Schema.TaggedError` for domain errors
- Proper error recovery with `catchTag`/`catchTags`
- Appropriate use of defects vs typed errors

Run: `effect-solutions show error-handling`

### 5. Configuration

Check for:

- Use of `Schema.Config` for validation
- Config service layer pattern
- `Config.redacted` for secrets

Run: `effect-solutions show config`

### 6. Testing

Check for:

- Use of `@effect/vitest`
- `it.effect()` for Effect tests
- Test layer composition patterns

Run: `effect-solutions show testing`

### 7. Runtime Usage Anti-Pattern (`Effect.runPromise` in Production)

Search for `Effect.runPromise` in production code (exclude `__tests__/`, `*.test.ts`, `agent-tools/`).

**`Effect.runPromise` uses the default runtime with NO layers** — no tracer, no config, no observability. Effect spans (`Effect.fn`, `Effect.withSpan`) will be invisible to Sentry/OpenTelemetry.

- Production code MUST use `runtime.runPromise` (from `ManagedRuntime` in `effect-runtime.ts`) which includes `AppLayer` with `SentryTracingLive`
- If `runtime.runPromise` is not possible (circular deps), the code MUST add `Effect.provide(SentryTracingLive)` to the pipe chain
- Test files are exempt (they provide their own layers)

Search patterns:

- `Effect.runPromise(` in `apps/web-app/src/` (excluding `__tests__/`)
- `Effect.runSync(` in `apps/web-app/src/` (excluding `__tests__/`)

Report each occurrence with:

- File path and line
- Whether it's using `runtime.runPromise` (✅) or bare `Effect.runPromise` (❌)
- Whether `SentryTracingLive` is provided in the pipe chain (fallback ✅)

Run: `effect-solutions show services-and-layers`

### 8. Option/Either Internal Tag Anti-Patterns

Check for direct `_tag` branching on `Option`/`Either` in production code and tests.

- Production code: report all direct `_tag` usage as findings with replacement recommendation
- Tests: allow `_tag` assertions for domain error identity, but flag control-flow branching patterns that should use helpers
- Prefer:
  - `Either.match`, `Either.isLeft`, `Either.isRight`
  - `Option.match`, `Option.isSome`, `Option.isNone`, `Option.getOrElse`

Search patterns to include:

- `if (.*\._tag === "Left")`
- `if (.*\._tag === "Right")`
- `if (.*\._tag === "Some")`
- `if (.*\._tag === "None")`
- `expect\(.*\._tag\)`

Run: `effect-solutions show error-handling`

---

## Output Format

Provide a structured report with:

1. **Summary**: Overall compliance score (e.g., 7/10)

2. **What's Working Well**: List patterns that follow best practices

3. **Improvements Needed**: List specific issues with:
   - File location
   - Current pattern
   - Recommended pattern
   - Priority (high/medium/low)
   - Scope label: `production` or `test`

4. **Quick Wins**: Easy fixes that can be done immediately

5. **Next Steps**: Recommended order of improvements

---

## Related Skills

- `effect-ts` — Effect services, layers, error handling, config patterns
- `testing-patterns` — Vitest and @effect/vitest test patterns
- `code-review` — General code review methodology (includes Effect section)
