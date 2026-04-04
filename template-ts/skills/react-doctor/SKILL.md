---
name: react-doctor
description: "This skill should be used when reviewing React components, hooks, and rendering behavior, then triaging React Doctor diagnostics for performance, correctness, security, and maintainability issues."
version: 1.0.0
---

# React Doctor

Use React Doctor to scan a React codebase for security, performance, correctness, and architecture issues. Use the diagnostics to prioritize fixes and improve overall code health.

## Usage

```bash
npx -y react-doctor@latest . --verbose
```

Use `@latest` intentionally to run the newest rule set.

## Workflow

1. Run the command at the project root and capture the full output.
2. Verify diagnostics before patching: confirm each reported issue against actual runtime behavior, project conventions, and framework constraints.
3. Fix validated issues, starting with highest severity diagnostics.
4. Re-run React Doctor and confirm the diagnostics list is reduced.
5. Re-run project checks (lint, tests, typecheck/build as applicable) to ensure no regressions.

## Rule Coverage (47+)

React Doctor includes 47+ rules. The categories below are representative examples, not an authoritative or exhaustive rule list.

- **Security**: hardcoded secrets in client bundle, eval()
- **State & Effects**: derived state in useEffect, missing cleanup, useState from props, cascading setState
- **Architecture**: components inside components, giant components, inline render functions
- **Performance**: layout property animations, transition-all, large blur values
- **Correctness**: array index as key, conditional rendering bugs
- **Next.js (in projects using Next.js)**: missing metadata, client-side fetching for server data, async client components
- **Bundle Size**: barrel imports, full lodash, moment.js, missing code splitting
- **Server Actions (in projects using Next.js)**: missing auth in server actions, blocking without after()
- **Accessibility**: missing prefers-reduced-motion
- **Dead Code**: unused files, exports, types

## Score

- **75+**: Great
- **50-74**: Needs work
- **0-49**: Critical
