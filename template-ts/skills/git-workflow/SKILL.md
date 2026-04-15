---
name: git-workflow
description: "Automates the full PR lifecycle — create or update a pull request, then aggressively monitor CI checks and review feedback in a continuous loop, fixing failures and addressing comments until the PR is fully green. Also covers push, branch creation, and branch sync workflows."
---

# Git Workflow

PR lifecycle automation. Create PR → watch CI + reviews → fix → address → push → repeat until green.

For full `bun gh-tool` command reference, run `bun gh-tool --help` or `bun gh-tool pr --help`. This skill describes the **workflow**, not the tool surface.

For push, branch creation, and branch sync recipes, see [references/push-branch-sync.md](references/push-branch-sync.md).

## PR Workflow

**Trigger**: user says "pr", "pull request", "create PR", "CI failed", "address review comments", "merge when green", or similar.

The entire PR lifecycle runs as one continuous aggressive loop. There is no separate "fix comments" step — it is all one workflow.

### Phase 1: Create or Update PR

First check whether a PR already exists:

```bash
bun gh-tool pr status
```

**If no PR exists** — create branch, commit, push, and open PR in one chain:

```bash
git checkout -b <branch> && git add -A && git commit -m "<msg>" && git push -u origin HEAD && bun gh-tool pr create --base <base> --title "<title>" --body "<body>"
```

**If PR already exists** — commit, push, and update metadata:

```bash
git add -A && git commit -m "<msg>" && git push origin HEAD
bun gh-tool pr edit --pr <pr_number> --title "<title>" --body "<body>"
```

- If already on a feature branch, skip `git checkout -b`.
- Base branch: argument provided by user (default: `test`).
- Branch naming: `feat/`, `fix/`, `chore/` based on changes.

#### PR Body Format

```
## Summary
<1-2 sentences>

## Changes
- <bullet list>
```

### Commit Message Standard

**Every commit MUST use proper conventional commits describing the actual change, not meta-descriptions like "address review feedback" or "fix CI".**

Format: `<type>(<scope>): <what actually changed>`

- `type`: `fix`, `feat`, `refactor`, `perf`, `style`, `chore`, etc.
- `scope`: the module/area affected (e.g., `auth`, `db`, `ui`, `api`)
- `message`: describe the concrete change, not why you are committing

**Good examples:**

- `fix(auth): add null check for session token before redirect`
- `refactor(api): extract validation logic into shared middleware`
- `fix(db): correct JOIN condition in user query`

**Bad examples (NEVER use these):**

- ~~`fix: address review feedback`~~
- ~~`fix: resolve CI check failures`~~
- ~~`chore: fix issues`~~

If a single commit addresses multiple review comments across different scopes, make **separate commits per scope** rather than one catch-all.

### Phase 2: Active Watch Loop

**Immediately after PR creation/update, enter the active watch loop. No pause, no waiting for user input.**

Inform user: "PR created/updated. Entering active watch loop — monitoring CI and reviews. (say 'stop' to exit)"

---

#### LOOP START

##### Step 1: Take a snapshot and decide what to do next

**LOOP CONTRACT — mandatory behavior, not a suggestion:**

- After PR creation/update, stay inside this loop until **LOOP EXIT**.
- After **every** fix + push, immediately return to **Step 1**.
- After **every** reply/resolve pass, immediately return to **Step 1**.
- If CI is still running, the loop is **not done**.
- If visible-open review feedback still exists, the loop is **not done**.
- Do **not** stop after one pass just because one category is clean.
- Do **not** ask the user whether to continue unless the user said `stop` or the max-iteration guard is hit.

**Always start Step 1 with a snapshot:**

```bash
bun gh-tool pr review-triage --pr <pr_number>
```

This returns `info`, `unresolvedThreads`, `visibleOpenThreads`, `summary`, and `checks` in one call. Use it as the single source of truth for branching.

**After the snapshot, branch immediately:**

- **Checks failed → go to Step 2**
- **Checks passed AND visible-open feedback exists → go to Step 3**
- **Checks passed AND no visible-open feedback → go to LOOP EXIT**
- **Checks still running AND visible-open feedback exists → go to Step 3** (work on feedback while CI runs)
- **Checks still running AND no feedback → block on CI:**

```bash
bun gh-tool pr checks --pr <pr_number> --watch
```

When `--watch` completes, return to **Step 1** for a fresh snapshot.

**Do NOT build ad-hoc `sleep` polling loops around `bun gh-tool`.** If work remains, handle it and then explicitly re-enter **Step 1**. If nothing remains except CI, use `--watch`.

##### Step 2: Handle CI failure

1. **First, decide: flaky or real?**
   - If the failure looks flaky (timeout, infra/network issue, unrelated service), rerun and return to Step 1:

     ```bash
     bun gh-tool pr rerun-checks --pr <pr_number>
     ```

     **→ Go back to LOOP START**

   - If the failure looks real, continue below.

2. Get failed check details:

   ```bash
   bun gh-tool pr checks-failed --pr <pr_number>
   ```

3. If the output includes a workflow run and job name, fetch logs:

   ```bash
   bun gh-tool workflow job-logs --run <run_id> --job "<job_name>" --failed-steps-only
   ```

4. Analyze the error, **fix locally** — do not ask, just fix.
5. Run validation:

   ```bash
   bun run check
   ```

6. Commit and push:

   ```bash
   git add -A && git commit -m "<type>(<scope>): <what changed>" && git push origin HEAD
   ```

7. **→ Go back to LOOP START**

##### Step 3: Check for reviews and triage feedback

The snapshot from Step 1 already contains threads and summary. Drill into details:

**3.1 Inline review threads that still need attention:**

Use `--visible-open-only` — it includes unresolved threads **and** resolved threads that still have no reply:

```bash
bun gh-tool pr threads --pr <pr_number> --visible-open-only
```

**3.2 AI reviewer issue comments:**

```bash
bun gh-tool pr issue-comments --pr <pr_number>
```

AI reviewers may post findings as general PR comments under different bot/user accounts, so the standard workflow must be **author-agnostic**: inspect **all** PR issue comments together, and do not let the author identity change the default review flow. Parse actionable issue-comment feedback the same way as inline review feedback: extract severity, file paths, and requested changes, then act on anything still relevant.

**3.3 Decision:**

- **If NO visible-open threads AND NO actionable AI comments →** PR is clean. **→ Go to LOOP EXIT**
- **If ANY feedback found → proceed to Step 4**

##### Step 4: Address every comment immediately

Before changing code, create **one todo item per actionable comment/finding** (use the todo-list tool if available, otherwise maintain an explicit numbered checklist in conversation).

- One comment/finding = one tracked item.
- Use a short label that identifies the source and problem.
- Mark `in_progress` only while actively handling that single comment.
- Mark `completed` only after the code change **and** the reply/resolve are both done.

For each comment/finding:

1. **Read the file** at the specific line mentioned.
2. **Understand the suggestion** — what change is being requested?
3. **Evaluate and act:**
   - **Auto-apply** (no confirmation): typos, style fixes, missing types, import cleanup, obvious bugs, performance improvements, security fixes matching CLAUDE.md conventions.
   - **Apply with judgment**: refactoring suggestions that improve clarity, error handling, naming improvements.
   - **Ask user first**: removing functionality, changing public API signatures, contradicting existing patterns, unclear suggestions.

4. **Make the fix immediately** — track what was changed and why.

##### Step 5: Reply to comments and resolve threads

**CRITICAL: Every thread MUST have a reply before being resolved.**

For inline threads — reply and resolve in one step:

```bash
bun gh-tool pr reply-and-resolve --pr <pr_number> --comment-id <comment_id> --thread-id <thread_id> --body "<response>"
```

For general PR comments — post a reply:

```bash
bun gh-tool pr comment --pr <pr_number> --body "<response>"
```

**Response format:**

- **If fixed**: "Addressed - [brief description of what was changed]"
- **If not applicable**: "Not applicable - [brief explanation why]"
- **If positive feedback**: "Thanks for the feedback!" or similar acknowledgment
- **If needs discussion**: "Question: [ask for clarification]"

**If reply fails with a pending-review validation error:** submit the pending review first with `bun gh-tool pr submit-review --pr <pr_number>`, then retry. If it must be dismissed instead, dismiss it in GitHub first.

**Do NOT resolve** threads where you asked a question.

##### Step 6: Validate and push

```bash
bun run check
```

Fix any new issues. Then commit and push:

```bash
git add -A && git commit -m "<type>(<scope>): <what changed>" && git push origin HEAD
```

**→ Go back to LOOP START**

---

#### LOOP EXIT

When reaching here (all checks pass + no visible-open feedback):

Before the final success message, print a **comment resolution summary list**.

Use a numbered list with **one item per handled comment/finding** and this fixed structure:

```md
1. Source: inline thread | general PR comment | AI review
   Identifier: <thread_id / comment_id / reviewer label>
   Problem: <short summary of the concern>
   Resolution: <what changed, or why it was not applicable>
   Changed files: <file A>, <file B> | none
   Replied: yes | no | n/a
   Resolved: yes | no | n/a
   Link: <comment or PR URL if available>
```

If no comments were found, say so explicitly instead of printing an empty structure.

Inform user: "All CI checks passed. All review comments addressed. PR is ready for review!"

#### Loop exit conditions

Exit the watch loop when:

- **All checks pass AND no visible-open feedback** — natural exit.
- **User says "stop"** or requests to exit.
- **Maximum 20 iterations reached** — ask user if they want to continue.
