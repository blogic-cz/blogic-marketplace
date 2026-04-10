---
name: scan-effect-solutions
description: "This skill should be used when auditing Effect TypeScript compliance, or when users mention effect scan, effect audit, effect best-practices checks, or scan-effect-solutions. It provides a structured compliance checklist for TypeScript configuration, services/layers, data modeling, error handling, config, testing, runtime execution, and Option/Either anti-patterns."
compatibility: opencode
---

# Effect Solutions Compliance Audit

Audit a repository against Effect TypeScript best practices from effect.solutions. Follow this skill to produce a consistent, evidence-based compliance report.

## Prerequisites

Load current effect.solutions recommendations:

```bash
effect-solutions list
```

Load guidance used by this checklist:

```bash
effect-solutions show tsconfig
effect-solutions show services-and-layers
effect-solutions show data-modeling
effect-solutions show error-handling
effect-solutions show config
effect-solutions show testing
```

Load the `effect-ts` skill for Effect-specific implementation patterns:

```
skill({ name: "effect-ts" })
```

---

## Audit Checklist

### 1. TypeScript Configuration

Inspect `tsconfig.base.json` (or `tsconfig.json`) and verify:

- `exactOptionalPropertyTypes: true`
- `strict: true`
- `noUnusedLocals: true`
- `declarationMap: true`
- `sourceMap: true`
- Confirm Effect Language Service plugin is configured.
- Confirm `module` setting matches project type (preserve/bundler for apps, NodeNext for libraries).

Reference: `effect-solutions show tsconfig`

### 2. Services & Layers Pattern

Search for Effect services and verify:

- Confirm services are defined with `Context.Tag`.
- Confirm tag identifiers follow `@path/ServiceName` pattern.
- Confirm layers use `Layer.effect` or `Layer.sync`.
- Confirm a single `Effect.provide` is applied at the entry point.

Reference: `effect-solutions show services-and-layers`

### 3. Data Modeling

Inspect data modeling and verify:

- Confirm `Schema.Class` is used for records.
- Confirm `Schema.TaggedClass` is used for variants.
- Confirm branded types are used for primitives (IDs, emails, and similar values).
- Confirm pattern matching uses `Match.valueTags`.

Reference: `effect-solutions show data-modeling`

### 4. Error Handling

Inspect error handling and verify:

- Confirm `Schema.TaggedError` is used for domain errors.
- Confirm error recovery uses `catchTag`/`catchTags` where appropriate.
- Confirm defects and typed errors are separated intentionally.

Reference: `effect-solutions show error-handling`

### 5. Configuration

Inspect configuration patterns and verify:

- Confirm `Schema.Config` is used for validation.
- Confirm a config service layer pattern is present.
- Confirm secrets use `Config.redacted`.

Reference: `effect-solutions show config`

### 6. Testing

Inspect tests and verify:

- Confirm tests use `@effect/vitest`.
- Confirm Effect tests use `it.effect()`.
- Confirm test layer composition follows Effect layer patterns.

Reference: `effect-solutions show testing`

### 7. Runtime Execution Anti-Pattern (`Effect.runPromise` / `Effect.runSync` in Application Code)

Search application code for direct `Effect.runPromise` and `Effect.runSync` usage. Exclude test-only files and test helpers (`__tests__/`, `*.test.ts`, `*.spec.ts`, fixture directories).

Treat bare `Effect.runPromise` / `Effect.runSync` as findings when they bypass the project runtime composition. Bare execution typically uses the default runtime without project-provided layers (for tracing, config, logging, or domain services).

Apply project-aware evaluation:

- Prefer the project's runtime entrypoint (for example `runtime.runPromise`) in application code.
- Accept explicit layer provisioning when runtime usage is not feasible (for example during bootstrap or dependency-cycle constraints).
- Exempt tests that intentionally provide dedicated test layers.

Template-ts convention example (use only when applicable in the audited repo):

- `ManagedRuntime` in `effect-runtime.ts`
- `AppLayer` composition
- `SentryTracingLive` in runtime-provided observability

Search patterns:

- `Effect.runPromise(` under application source directories (for example `src/`, `apps/*/src/`, `packages/*/src/`)
- `Effect.runSync(` under application source directories (same scope)

Report each occurrence with:

- File path and line
- Whether it's using `runtime.runPromise` (✅) or bare `Effect.runPromise` (❌)
- Whether required observability/config layers are provided by runtime or explicit `Effect.provide` fallback

Reference: `effect-solutions show services-and-layers`

### 8. Option/Either Internal Tag Anti-Patterns

Inspect direct `_tag` branching on `Option`/`Either` in application code and tests.

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

Reference: `effect-solutions show error-handling`

---

## Output Format

Provide a structured report with:

1. **Summary**: Overall compliance score using the rubric below.

   **Scoring rubric (0-16 total):**
   - Evaluate each checklist section (1-8) on a 0-2 scale.
   - `2`: Fully compliant or only minor cosmetic gaps.
   - `1`: Partially compliant, meaningful gaps present.
   - `0`: Non-compliant or pattern missing.
   - Total score = sum of all section scores.
   - Provide percentage = `(total / 16) * 100`, rounded to whole number.

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
