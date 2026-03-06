---
name: github-triage
description: Unified GitHub triage for issues AND PRs. 1 item = 1 background task (category: quick). Issues: answer questions from codebase, analyze bugs. PRs: review bugfixes, merge safe ones. All parallel, all background. Triggers: 'triage', 'triage issues', 'triage PRs', 'github triage'.
---

# GitHub Triage

## Fetch

```bash
agent-tools-gh issue triage-summary --format json --state open --limit 100
```

Returns `{ issues: [...], prs: [...], summary: {...} }`. Each item has `classification` (BUG, QUESTION, BUGFIX, FEATURE, OTHER) and `confidence` (HIGH, MEDIUM, LOW).

Full `agent-tools-gh` command reference → load skill `agent-tools`.

## Decision Rules

### Skip
- Bot-generated monitoring alerts (author: `app/vivus-agent`, labels: `vivus-generated`)
- Drafts and WIP PRs (`[WIP]` in title or `isDraft: true`)
- PRs with `mergeable: CONFLICTING`
- Already assigned issues (unless user asked)
- Feature requests (unless user asked)

### Act on
- Issues: BUG or QUESTION classification
- PRs: BUGFIX with `ciStatus: PASS` + `mergeable: MERGEABLE` → review + merge candidate
- PRs: any non-draft, non-conflicting PR without review → review candidate

## Subagent Dispatch

One `task(category="quick", load_skills=["agent-tools"], run_in_background=true)` per actionable item.

### QUESTION issue
```
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Search codebase for relevant code/docs. Post answer: `agent-tools-gh issue comment --issue {number} --body "..."`.
```

### BUG issue
```
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Analyze bug against codebase. Propose fix or ask for repro steps: `agent-tools-gh issue comment --issue {number} --body "..."`.
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
| #123 | BUG | Analyzed | Fix proposed |
| #476 | PR/BUGFIX | Reviewed | Approved + merged |
| #488 | PR | Skipped | WIP + conflicting |
