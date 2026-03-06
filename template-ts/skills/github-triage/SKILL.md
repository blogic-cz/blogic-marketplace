---
name: github-triage
description: "GitHub triage - resolve issues and review PRs. Goal is to FIX problems, not just label them. Issues get investigated and resolved (code fixes, infra fixes, answers). PRs get reviewed and merged. 1 item = 1 background subagent. Triggers: 'triage', 'triage issues', 'triage PRs', 'github triage'."
---

# GitHub Triage

Goal: **resolve** every item — fix bugs, answer questions, fix infra, merge good PRs. Not just triage and move on.

Never close issues automatically — monitoring systems recreate them if unresolved.

Each issue fix gets its own branch and PR. Never bundle multiple issues into one branch.

## Workflow

### 1. Fetch

```bash
agent-tools-gh issue triage-summary --state open --limit 100
```

Full `agent-tools-gh` command reference → load skill `agent-tools`.

### 2. Analyze and present plan

For each item, read existing comments to understand current state. Then present a **triage plan table** to the user:

| # | Item | Type | Current State | Proposed Action | Category |
|---|------|------|--------------|-----------------|----------|
| 1 | #481 | INFRA | ErrImagePull, no comments | Investigate ACR image, fix deployment | deep |
| 2 | #471 | SENTRY | New error, 1 comment | Find root cause in code, propose fix | deep |
| 3 | #476 | PR/BUGFIX | CI pass, mergeable | Review diff, merge if clean | quick |
| 4 | #488 | PR/WIP | Conflicting | Comment: needs rebase | quick |

**STOP HERE. Wait for user approval before dispatching any subagents.**

User may:
- Approve all: "go" / "ok" / "pokračuj"
- Skip items: "skip #488"
- Change action: "for #471 just comment, don't fix"
- Ask questions: "what's the current state of #309?"

### 3. Execute approved items

Only after user confirms, dispatch subagents. Match category and skills to complexity:

#### Issue categories
- **BUG** → Category: `deep`, skills: `["agent-tools", "testing-patterns"]`
- **QUESTION** → Category: `quick`, skills: `["agent-tools"]`
- **INFRA/MONITORING** (labels: `k8s-monitoring`, `critical`, `sentry`, `new-error`) → Category: `deep`, skills: `["agent-tools", "kubernetes-helm", "production-troubleshooting", "sentry-integration"]`
- **FEATURE** → Category: `quick`, skills: `["agent-tools"]`
- **OTHER** → Category: `quick`, skills: `["agent-tools"]`

#### PR categories
- **BUGFIX** + CI pass + mergeable → Category: `quick`, skills: `["agent-tools"]`
- **WIP / draft / conflicting** → Category: `quick`, skills: `["agent-tools"]`
- **OTHER** → Category: `quick`, skills: `["agent-tools"]`

#### Skip rules
- Already assigned AND has recent activity (someone is handling it) → propose skip in plan, let user decide
- User explicitly said to skip

### 4. Report

After all subagents complete, produce summary table:

| Item | Type | Action | Result |
|------|------|--------|--------|
| #481 | INFRA | Fixed | Updated helm image tag |
| #476 | PR/BUGFIX | Reviewed | Merged |

## Subagent Templates

### BUG issue
```
Issue #{number}: "{title}" | {author} | {labels}
{body}
URL: {url}

Find the root cause in the codebase. Create a dedicated branch (e.g. `fix/issue-{number}-short-desc`), implement the fix, and create a PR. If you can't fix it, post a detailed analysis of the root cause and what's needed: `agent-tools-gh issue comment --issue {number} --body "..."`.
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

Diagnose the infrastructure problem. Check logs, pods, deployments, error tracking. Fix the root cause if possible (config, helm values, code) on a dedicated branch (e.g. `fix/issue-{number}-short-desc`). Post your findings and what you fixed: `agent-tools-gh issue comment --issue {number} --body "..."`. Do NOT close — monitoring manages lifecycle.
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
