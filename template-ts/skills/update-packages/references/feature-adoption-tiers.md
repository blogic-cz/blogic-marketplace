# Feature Adoption Tiers

Classify release-note features with this rubric.

| Tier | Type                                | Action                                          | Example                                        |
| ---- | ----------------------------------- | ----------------------------------------------- | ---------------------------------------------- |
| T0   | Config addition (zero-risk)         | Auto-implement and verify with `bun run check`  | Add `detectAsyncLeaks: true` to Vitest config  |
| T1   | Config addition (behavioral)        | Auto-implement and verify with `bun run check`  | Add new reporters to CI test config            |
| T2   | Code-level adoption                 | Suggest with concrete diffs (do not auto-apply) | Add `{ tags: ["unit"] }` to `describe()` calls |
| T3   | Breaking change or migration needed | Fix during check/fix phase                      | API rename, config schema migration            |

Treat a feature as T0/T1 only when all conditions are true:

- Target change is in a config file, not source code.
- Change is additive.
- Change is verifiable with `bun run check`.
- `configFiles[]` from changelog output identifies the target file.
