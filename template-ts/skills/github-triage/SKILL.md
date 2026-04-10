---
name: github-triage
description: "This skill should be used when reviewing open issues, cleaning up a GitHub backlog, triaging incoming issues, or processing incoming PRs. It resolves items end-to-end (fixes, answers, infra actions, merge decisions) instead of labeling only."
---

# GitHub Triage

Resolve each triaged item end-to-end: fix bugs, answer questions, address infra issues, and process merge-ready PRs.

Never close issues automatically — monitoring systems recreate them if unresolved.

Each issue fix gets its own branch and PR. Never bundle multiple issues into one branch.

Use one background subagent per approved item.

For detailed per-item execution prompts, use [references/subagent-templates.md](references/subagent-templates.md).

## Workflow

### 1. Fetch

```bash
gh-tool issue triage-summary --state open --limit 100
```

Load skill `agent-tools` for full `gh-tool` command reference.

If `agent-tools` is unavailable, continue with native GitHub CLI equivalents (`gh issue list/view/comment`, `gh pr list/view/review/merge`) and local `git` commands.

### 2. Investigate and present plan with solutions

For each item, perform investigation before proposing action:

1. Read existing comments to understand history
2. Investigate root cause — read code, check logs, search codebase, inspect Sentry, inspect Kubernetes state when relevant
3. Identify the concrete fix (which file, what change, what config)

Present a triage plan after investigation:

| Item      | Root Cause                                       | Fix                                             |
| --------- | ------------------------------------------------ | ----------------------------------------------- |
| #481      | Image tag :288 doesn't exist in ACR              | Update helm values to latest valid tag :287     |
| #471      | `isOctokitNotFound` doesn't traverse cause chain | Add recursive cause check in github-sync.ts:142 |
| #476 (PR) | CI pass, approved, clean diff                    | Merge via squash                                |
| #488 (PR) | Merge conflicts, WIP                             | Skip — owner needs to rebase                    |

The plan must include **specific root cause and concrete fix** — not "investigate" or "needs analysis".
If root cause remains unknown after investigation, document what was checked and what remains unknown.

Do not dispatch subagents in this phase.

Stop after presenting the plan and wait for user approval.

User may:

- Approve all: "go" / "ok"
- Skip items: "skip #488"
- Change action: "for #471 just comment, don't fix"
- Ask questions: "what was found in the logs for #309?"

### 3. Execute approved items

Run this phase only after explicit user approval.

Dispatch exactly one background subagent per approved item. Do not batch multiple items into one subagent.

Match category and skills to complexity:

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

- Already assigned and has recent activity (new comment, commit push, PR review, status update, or label/state change in the last 7 days) → propose skip in plan, let user decide
- User explicitly said to skip

### 4. Report

After all subagents complete, produce summary table:

| Item | Type      | Action   | Result                 |
| ---- | --------- | -------- | ---------------------- |
| #481 | INFRA     | Fixed    | Updated helm image tag |
| #476 | PR/BUGFIX | Reviewed | Merged                 |

Use reference templates for subagent prompts and fallback command mapping:

- [references/subagent-templates.md](references/subagent-templates.md)
