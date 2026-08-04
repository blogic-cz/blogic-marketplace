# Localization

Load for user-visible strings, dates, numbers, pluralization, directionality, or locale changes.

Use project translation and formatting facilities. Do not assemble translated sentences from fragments, use translated text as identifiers, or bake locale-specific date/number/currency formatting into components. Keep interpolation values typed and named by meaning. Use plural/select features when grammar needs them.

Keep strings owned with feature/module that gives them meaning; promote only shared product language. Do not duplicate an existing message under a new key. Validation and delayed callbacks resolve text at display time so a locale change does not retain stale text.

Layouts tolerate expansion, alternate scripts, and right-to-left direction where product supports it. Do not use text length, punctuation, or case as control flow. Avoid hard-coded examples that look like production locale data unless they are explicitly fixture/demo content.

## Completion

- [ ] New text uses established translation ownership and keys.
- [ ] Locale-sensitive values use formatter APIs.
- [ ] Plural/interpolation behavior is represented by translation system.
- [ ] Layout survives longer translated text.
