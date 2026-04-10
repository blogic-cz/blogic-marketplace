# GitHub Triage Subagent Templates

Use these templates when dispatching one background subagent per approved item.

## BUG issue

```text
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Find root cause in the codebase. Create a dedicated branch (for example `fix/issue-{number}-short-desc`), implement the fix, and create a PR. If a complete fix is not possible, post a detailed root-cause analysis and required follow-up steps: `gh-tool issue comment --issue {number} --body "..."`.
```

## QUESTION issue

```text
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Search codebase and docs for relevant context. Post a thorough answer: `gh-tool issue comment --issue {number} --body "..."`.
```

## INFRA / MONITORING issue

```text
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Diagnose the infrastructure problem. Check logs, pods, deployments, and error tracking. Fix root cause where possible (config, helm values, or code) on a dedicated branch (for example `fix/issue-{number}-short-desc`). Post findings and fixes: `gh-tool issue comment --issue {number} --body "..."`. Do not close monitoring-generated issues automatically.
```

## OTHER issue

```text
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Investigate and assess. If actionable, resolve or partially resolve with clear next steps. Post findings: `gh-tool issue comment --issue {number} --body "..."`. Do not close automatically.
```

## BUGFIX PR (CI pass, mergeable)

```text
PR #{number}: "{title}" | {author} | {baseRefName}→{headRefName}
CI: {ciStatus} | Review: {reviewDecision}
URL: {url}

Review: `gh-tool pr review-triage --pr {number} --format json`
Diff: `git diff origin/{baseRefName}...origin/{headRefName}`
If clean, merge: `gh-tool pr merge --pr {number} --strategy squash --delete-branch --confirm`
If concerns exist, comment only: `gh-tool pr comment --pr {number} --body "..."` and do not merge.
```

## WIP / CONFLICTING PR

```text
PR #{number}: "{title}" | {author} | {baseRefName}→{headRefName}
Mergeable: {mergeable} | Draft: {isDraft}
URL: {url}

Post a status comment describing blockers (conflicts, WIP, missing reviews): `gh-tool pr comment --pr {number} --body "..."`.
```

## OTHER PR (needs review)

```text
PR #{number}: "{title}" | {author} | {baseRefName}→{headRefName}
URL: {url}

Review: `gh-tool pr review-triage --pr {number} --format json`
Diff: `git diff origin/{baseRefName}...origin/{headRefName}`
Check logic, style, and regressions. Post feedback: `gh-tool pr comment --pr {number} --body "..."`.
```

## Fallback command mapping when `agent-tools` skill is unavailable

- `gh-tool issue triage-summary --state open --limit 100` → `gh issue list --state open --limit 100`
- `gh-tool issue comment --issue <n> --body "..."` → `gh issue comment <n> --body "..."`
- `gh-tool pr review-triage --pr <n> --format json` → `gh pr view <n> --json number,title,body,author,mergeable,reviewDecision,commits,statusCheckRollup,reviews`
- `gh-tool pr comment --pr <n> --body "..."` → `gh pr comment <n> --body "..."`
- `gh-tool pr merge --pr <n> --strategy squash --delete-branch --confirm` → `gh pr merge <n> --squash --delete-branch`

Use `git diff origin/<base>...origin/<head>` for code diff review in both modes.
