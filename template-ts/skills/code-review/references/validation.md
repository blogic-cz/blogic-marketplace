# Manual and Runtime Validation

Use when diff changes runnable behavior, API/contract, permissions, jobs/events, migrations, generated clients, or browser-visible flow.

1. Derive happy-path, negative-path, permission, and boundary cases from diff.
2. Use repository runtime/worktree guidance when required.
3. For browser-accessible behavior, load `agent-browser` and execute real scenario plus focused exploratory pass.
4. For API-only behavior, use closest realistic surface: request/probe, job run, logs, database-visible effect, or generated-client check.
5. Record exact steps/command, expected result, observed result, and evidence.
6. Mark blocked/unexecuted cases honestly. Do not invent coverage.

Return findings only. Do not edit, commit, publish, or replace deterministic checks with this lane.

```text
VALIDATION
Use cases: <list>
Executed: <case, steps, expected, observed, evidence>
Blocked: <case and reason|none>
Findings: <none|material failures>
RESULT: <PASSED|FAILED>
```
