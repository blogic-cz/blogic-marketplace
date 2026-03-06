---
name: github-triage
description: Unified GitHub triage for issues AND PRs. 1 item = 1 background task (category: quick). Issues: answer questions from codebase, analyze bugs. PRs: review bugfixes, merge safe ones. All parallel, all background. Triggers: 'triage', 'triage issues', 'triage PRs', 'github triage'.
---

# GitHub Triage Skill

Orchestrate high-volume GitHub triage for issues and pull requests using parallel background subagents.

## Core Workflow

### 1. Fetch Triage Data
Start by fetching classified triage data from GitHub:

```bash
agent-tools-gh issue triage-summary --format json --state open --limit 100
```

### 2. Process and Filter
The command returns a JSON object with `issues` and `prs`. Parse this to determine which items need action.
- **Skip** drafts, items already assigned, or feature requests (unless specifically asked).
- **Prioritize** BUG classifications and green PRs.

### 3. Parallel Dispatch
For each item that needs attention, spawn a background task with `category="quick"`. Always use `load_skills=["agent-tools"]` to ensure the subagent has the necessary GitHub capabilities.

**Example Dispatch Pattern:**
```typescript
task({
  category: "quick",
  load_skills: ["agent-tools"],
  run_in_background: true,
  prompt: `Subagent prompt for item...`
})
```

## Subagent Prompt Templates

Keep subagent prompts lean (under 150 tokens) to ensure rapid execution and clarity.

### Issue: QUESTION
```
Issue #{number}: "{title}"
Author: {author} | Labels: {labels}
Body: {body (truncated)}
URL: {url}

Search the codebase for relevant code or docs. Post a helpful, accurate answer as a comment using `agent-tools-gh issue comment --issue {number} --body "..."`.
```

### Issue: BUG
```
Issue #{number}: "{title}"
Author: {author} | Labels: {labels}
Body: {body (truncated)}
URL: {url}

Analyze the reported bug against the current codebase. If valid, propose a fix or ask for missing reproduction steps using `agent-tools-gh issue comment --issue {number} --body "..."`.
```

### PR: BUGFIX (Green CI)
```
PR #{number}: "{title}"
Author: {author} | Base: {baseRefName}
CI: {ciStatus} | Review: {reviewDecision}
URL: {url}

First review the PR context: `agent-tools-gh pr review-triage --pr {number} --format json`.
Read the code diff: `git diff origin/{baseRefName}...origin/{headRefName}`.
If code is clean and matches project standards, merge: `agent-tools-gh pr merge --pr {number} --strategy squash --delete-branch --confirm`.
If you have concerns, post feedback: `agent-tools-gh pr comment --pr {number} --body "..."`. Do NOT merge.
```

### PR: OTHER
```
PR #{number}: "{title}"
Author: {author} | Labels: {labels}
URL: {url}

Review context: `agent-tools-gh pr review-triage --pr {number} --format json`.
Read the code diff: `git diff origin/{baseRefName}...origin/{headRefName}`.
Check for logic errors, style consistency, and potential regressions.
Post feedback: `agent-tools-gh pr comment --pr {number} --body "..."`.
```

## Collection and Reporting

1. **Wait** for all background subagents to complete.
2. **Collect** status updates from the tasks.
3. **Produce** a clean markdown table summarizing the actions taken.

| Item | Type | Action Taken | Result |
|------|------|--------------|--------|
| #123 | BUG  | Analyzed     | Fix proposed |
| #124 | PR   | Merged       | Successfully squashed |

## Requirements
- Requires `agent-tools` package installed in the project.
- Always use `load_skills=["agent-tools"]` when dispatching subagents.
- Handle cases where `triage-summary` returns 0 items gracefully with a simple message.
- Use `category="quick"` for all triage subagents.
