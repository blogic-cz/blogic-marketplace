---
name: github-triage
description: GitHub triage — resolve issues and review PRs. Goal is to FIX problems, not just label them. Issues get investigated and resolved (code fixes, infra fixes, answers). PRs get reviewed and merged. 1 item = 1 background subagent. Triggers: 'triage', 'triage issues', 'triage PRs', 'github triage'.
---

# GitHub Triage

Goal: **resolve** every item — fix bugs, answer questions, fix infra, merge good PRs. Not just triage and move on.

Never close issues automatically — monitoring systems recreate them if unresolved.

## Fetch

```bash
agent-tools-gh issue triage-summary --state open --limit 100
```

Returns `{ issues: [...], prs: [...], summary: {...} }`. Each item has `classification` (BUG, QUESTION, BUGFIX, FEATURE, OTHER) and `confidence` (HIGH, MEDIUM, LOW).

Full `agent-tools-gh` command reference → load skill `agent-tools`.

## Decision Rules

Every item gets a subagent. Match category and skills to complexity:

### Issues
- **BUG** → find root cause in code, implement fix, create PR. Category: `deep`, skills: `["agent-tools", "testing-patterns"]`
- **QUESTION** → search codebase, post thorough answer. Category: `quick`, skills: `["agent-tools"]`
- **INFRA/MONITORING** (labels: `k8s-monitoring`, `critical`, `sentry`, `new-error`) → diagnose root cause, fix config/code/deployment. Category: `deep`, skills: `["agent-tools", "kubernetes-helm", "production-troubleshooting", "sentry-integration"]`
- **FEATURE** → acknowledge, summarize scope, comment. Category: `quick`, skills: `["agent-tools"]`
- **OTHER** → assess, investigate if needed, comment. Category: `quick`, skills: `["agent-tools"]`

### PRs
- **BUGFIX** + CI pass + mergeable → review diff, merge if clean. Category: `quick`, skills: `["agent-tools"]`
- **WIP / draft / conflicting** → comment what's blocking. Category: `quick`, skills: `["agent-tools"]`
- **OTHER** → review diff, post feedback. Category: `quick`, skills: `["agent-tools"]`

### Only skip if
- Already assigned AND has recent activity (someone is handling it)
- Explicitly told by user to skip a category

## Subagent Templates

### BUG issue
```
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Find the root cause in the codebase. Implement a fix and create a PR. If you can't fix it, post a detailed analysis of the root cause and what's needed: `agent-tools-gh issue comment --issue {number} --body "..."`.
```

### QUESTION issue
```
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Search codebase for relevant code/docs. Post a thorough answer: `agent-tools-gh issue comment --issue {number} --body "..."`.
```

### INFRA/MONITORING issue
```
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Diagnose the infrastructure problem. Check logs, pods, deployments, error tracking. Fix the root cause if possible (config, helm values, code). Post your findings and what you fixed: `agent-tools-gh issue comment --issue {number} --body "..."`. Do NOT close — monitoring manages lifecycle.
```

### OTHER issue
```
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Investigate and assess. If actionable, work on resolving it. Post findings: `agent-tools-gh issue comment --issue {number} --body "..."`. Do NOT close.
```

### BUGFIX PR (CI pass, mergeable)
```
PR #{number}: "{title}" | {author} | {baseRefName}→{headRefName}
CI: {ciStatus} | Review: {reviewDecision}
URL: {url}

Review: `agent-tools-gh pr review-triage --pr {number} --format json`
Diff: `git diff origin/{baseRefName}...origin/{headRefName}`
If clean → merge: `agent-tools-gh pr merge --pr {number} --strategy squash --delete-branch --confirm`
If concerns → comment only: `agent-tools-gh pr comment --pr {number} --body "..."`. Do NOT merge.
```

### WIP / CONFLICTING PR
```
PR #{number}: "{title}" | {author} | {baseRefName}→{headRefName}
Mergeable: {mergeable} | Draft: {isDraft}
URL: {url}

Post status comment noting what's blocking (conflicts, WIP, missing reviews): `agent-tools-gh pr comment --pr {number} --body "..."`.
```

### OTHER PR (needs review)
```
PR #{number}: "{title}" | {author} | {baseRefName}→{headRefName}
URL: {url}

Review: `agent-tools-gh pr review-triage --pr {number} --format json`
Diff: `git diff origin/{baseRefName}...origin/{headRefName}`
Check logic, style, regressions. Post feedback: `agent-tools-gh pr comment --pr {number} --body "..."`.
```

## Reporting

After all subagents complete, produce summary table:

| Item | Type | Action | Result |
|------|------|--------|--------|
| #481 | INFRA | Fixed | Updated helm image tag |
| #471 | SENTRY | Investigated | Root cause found, PR created |
| #476 | PR/BUGFIX | Reviewed | Merged |
| #488 | PR/WIP | Commented | Needs rebase |
