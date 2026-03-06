---
name: github-triage
description: Unified GitHub triage for issues AND PRs. 1 item = 1 background task (category: quick). Issues: investigate infra alerts, answer questions, analyze bugs. PRs: review bugfixes, merge safe ones, flag stale/conflicting. ALL items get an action — nothing is silently skipped. Triggers: 'triage', 'triage issues', 'triage PRs', 'github triage'.
---

# GitHub Triage

Triage = classify every item and take an action. Nothing gets silently skipped.

## Fetch

```bash
agent-tools-gh issue triage-summary --state open --limit 100
```

Returns `{ issues: [...], prs: [...], summary: {...} }`. Each item has `classification` (BUG, QUESTION, BUGFIX, FEATURE, OTHER) and `confidence` (HIGH, MEDIUM, LOW).

Full `agent-tools-gh` command reference → load skill `agent-tools`.

## Decision Rules

Every item gets a subagent. Pick the right template:

### Issues
- **BUG** → investigate, propose fix or ask for repro
- **QUESTION** → search codebase, post answer
- **INFRA/MONITORING** (labels: `k8s-monitoring`, `critical`, `sentry`, `new-error`) → investigate current state, assess if still active, recommend action
- **FEATURE** → acknowledge, label, summarize scope
- **OTHER** → assess relevance, comment with recommendation (close/investigate/label)

### PRs
- **BUGFIX** + CI pass + mergeable → review diff, merge if clean
- **BUGFIX** + CI pass + not yet reviewed → review diff, post feedback
- **WIP / draft** → comment current status, note what's blocking
- **CONFLICTING** → comment that rebase is needed
- **OTHER** → review diff, post feedback

### Only skip if
- Already assigned AND has recent activity (someone is handling it)
- Explicitly told by user to skip a category

## Subagent Dispatch

One `task(category="quick", load_skills=["agent-tools"], run_in_background=true)` per item.

### BUG issue
```
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Analyze bug against codebase. Propose fix or ask for repro steps: `agent-tools-gh issue comment --issue {number} --body "..."`.
```

### QUESTION issue
```
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Search codebase for relevant code/docs. Post answer: `agent-tools-gh issue comment --issue {number} --body "..."`.
```

### INFRA/MONITORING issue
```
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

This is an infrastructure alert. Investigate: is this still active or already resolved? Check relevant logs, pods, or error tracking. Post a status update: `agent-tools-gh issue comment --issue {number} --body "..."`. If resolved, close: `agent-tools-gh issue close --issue {number} --comment "..."`.
```

### OTHER issue
```
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Assess relevance. Post recommendation (investigate further / close as stale / add label): `agent-tools-gh issue comment --issue {number} --body "..."`.
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
| #481 | INFRA | Investigated | Still active, needs ACR fix |
| #476 | PR/BUGFIX | Reviewed | Merged |
| #488 | PR/WIP | Commented | Needs rebase |
