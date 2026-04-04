# Report Formats

## Release Notes Report

Use this table for the final unified release report:

```markdown
| Package | Type | Old → New | Changes | Impact |
| ------- | ---- | --------- | ------- | ------ |
```

Apply these rules:

- Search codebase usages for changed, deprecated, and new APIs.
- List affected files with line references and migration snippets for breaking changes.
- List implemented T0/T1 adoptions.
- Prefix T2 suggestions with `ADOPTABLE:` and include concrete before/after snippets.
- Skip patch-only entries.

## What's New Summary

Generate a user-facing summary after the release report.

Primary source:

1. Read `outdated-changelog.json`.
2. Fetch missing release notes only when `releases[]` is empty.
3. Focus on minor and major updates; include patch updates only when they add meaningful features.

Use this exact structure:

```markdown
## What's New from Package Updates

### <Package Name> <version range> — <one-line summary>

- **<Feature name>** — <what it does and why it matters>
- **<Feature name>** — <what it does and why it matters>
```

Apply these rules:

- Skip packages with bug-fix-only changes.
- Mark breaking changes as `BREAKING:` and describe required action.
- Keep each bullet to one line.
- Group related packages when one feature spans multiple packages.
- Write in the user's language.
