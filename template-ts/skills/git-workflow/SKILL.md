---
name: git-workflow
description: "LOAD THIS SKILL when: user mentions 'pr'. Covers the full PR lifecycle — create PR, then aggressively watch CI + reviews in a continuous loop, fixing failures and addressing comments immediately until the PR is fully green."
---

# Git Workflow

PR lifecycle automation. Create PR → watch → fix → address → push → repeat until green.

## PR Workflow

**Trigger**: user says "pr"

The entire PR lifecycle runs as one continuous aggressive loop. There is no separate "fix comments" step — it's all one workflow.

### Phase 1: Create or Update PR

Run everything as ONE chained command so user approves only once:

```bash
git checkout -b <branch> && git add -A && git commit -m "<msg>" && git push -u origin HEAD && gh-tool pr create --base <base> --title "<title>" --body "<body>"
```

- If already on a feature branch, skip `git checkout -b`
- Check if PR exists: `gh-tool pr status` (auto-detects PR for current branch or GitButler workspace)
- If PR exists, use `gh-tool pr edit --pr <pr_number> --title "<title>" --body "<body>"` instead of `gh-tool pr create`
- Base branch: argument provided by user (default: `test`)
- Branch naming: `feat/`, `fix/`, `chore/` based on changes

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
- `message`: describe the concrete change, not why you're committing

**Good examples:**

- `fix(auth): add null check for session token before redirect`
- `refactor(api): extract validation logic into shared middleware`
- `fix(db): correct JOIN condition in user query`
- `perf(search): add index on created_at for faster lookups`
- `style(ui): align spacing in sidebar navigation`

**Bad examples (NEVER use these):**

- ~~`fix: address review feedback`~~
- ~~`fix: resolve CI check failures`~~
- ~~`fix: address Claude PR feedback`~~
- ~~`chore: fix issues`~~

If a single commit addresses multiple review comments across different scopes, make **separate commits per scope** rather than one catch-all.

### Phase 2: Active Watch Loop

**Immediately after PR creation/update, enter the active watch loop. No pause, no waiting for user input.**

Inform user: "PR created/updated. Entering active watch loop — monitoring CI and reviews. (say 'stop' to exit)"

---

#### LOOP START

##### Step 1: Poll CI checks (non-blocking)

**Do NOT use `--watch` — it blocks for 10+ minutes and times out.** Instead, poll CI status in a loop with review checks interleaved:

```
POLL LOOP:
  1. Check CI status (non-blocking):
gh-tool pr checks --pr <pr_number>

  2. Parse output:
     - ALL PASSED  → set ci_status=passed, break poll loop
     - ANY FAILED  → set ci_status=failed, break poll loop
     - STILL RUNNING → proceed to step 3

  3. While CI is running, check for reviews:
gh-tool pr review-triage --pr <pr_number>
gh-tool pr threads --pr <pr_number> --unresolved-only
     → If reviews found, address them NOW (go to Step 4, then return here)

  4. Wait ~60 seconds, then repeat from step 1
     (use: sleep 60 or equivalent delay)
```

**This interleaved approach means you're productively addressing reviews while CI runs, instead of blocking on CI.**

##### Step 2: Handle CI results

**If ci_status=failed:**

1. Get failed check details immediately:

   ```bash
gh-tool pr checks-failed --pr <pr_number>
   ```

2. For deeper CI log analysis, fetch clean parsed logs for the failed job:

   ```bash
gh-tool workflow job-logs --run <run_id> --job "<job_name>" --failed-steps-only
   ```

3. Analyze the error from the logs
4. **Fix the issues locally** — do not ask, just fix
5. Run validation:
   ```bash
   bun run check
   ```
6. Commit and push:
   ```bash
   git add -A && git commit -m "<conventional commit message>" && git push origin HEAD
   ```
7. If the failure seems flaky (e.g., timeout, network issue), consider rerunning instead of fixing:
   ```bash
gh-tool pr rerun-checks --pr <pr_number> --failed-only
   ```
8. **→ Go back to LOOP START**

**If ci_status=passed:** proceed to Step 3.

##### Step 3: Check for reviews and comments

Run a full triage immediately:

```bash
gh-tool pr review-triage --pr <pr_number>
```

Then check each source of feedback:

**3.1 Inline review threads:**

```bash
gh-tool pr threads --pr <pr_number> --unresolved-only
```

Each thread includes `threadId`, `commentId`, `path`, `line`, and `body`.

**3.2 AI reviewer issue comments** (Claude bot, Sentry Seer, etc.):

```bash
gh-tool pr discussion-summary --pr <pr_number>
gh-tool pr issue-comments-latest --pr <pr_number> --author claude --body-contains "Claude Code Review"
gh-tool pr issue-comments-latest --pr <pr_number> --author sentry-io --body-contains "Sentry"
```

AI reviewers post findings as general PR comments with severity-tagged items (Critical, Major, Minor), specific file paths and line numbers, and code suggestions.

Parse the comment body to extract actionable items.

**3.3 Decision:**

- **If NO unresolved threads AND NO actionable AI comments →** PR is clean. **→ Go to LOOP EXIT**
- **If ANY feedback found →** proceed to Step 4

##### Step 4: Address every comment immediately

For each comment/finding:

1. **Read the file** at the specific line mentioned
2. **Understand the suggestion** — what change is being requested?
3. **Evaluate and act:**
   - **Auto-apply** (no confirmation): typos, style fixes, missing types, import cleanup, obvious bugs, performance improvements, security fixes matching CLAUDE.md conventions
   - **Apply with judgment**: refactoring suggestions that improve clarity, error handling, naming improvements
   - **Ask user first**: removing functionality, changing public API signatures, contradicting existing patterns, unclear suggestions

4. **Make the fix immediately** — track what was changed and why

##### Step 5: Reply to comments and resolve threads

**CRITICAL: Every thread MUST have a reply before being resolved.**

First, identify all threads needing replies:

```bash
gh-tool pr threads --pr <pr_number>
gh-tool pr comments --pr <pr_number>
```

Threads with only 1 comment (the original) need a reply added.

**Reply to EVERY thread** (including already resolved ones missing replies):

For inline threads — use the shortcut to reply and resolve in one step:

```bash
gh-tool pr reply-and-resolve --pr <pr_number> --comment-id <comment_id> --thread-id <thread_id> --body "<response>"
```

Or reply separately then resolve:

```bash
gh-tool pr reply --pr <pr_number> --comment-id <comment_id> --body "<response>"
gh-tool pr resolve --thread-id <thread_id>
```

For general PR comments:

```bash
gh-tool pr comment --pr <pr_number> --body "<response>"
```

**Response format:**

- **If fixed**: "Addressed - [brief description of what was changed]"
- **If not applicable**: "Not applicable - [brief explanation why]"
- **If positive feedback**: "Thanks for the feedback!" or similar acknowledgment
- **If needs discussion**: "Question: [ask for clarification]"

**If reply fails with "pending review" error:** Submit the pending review first, then retry:

```bash
gh-tool pr submit-review --pr <pr_number>
```

**Do NOT resolve** threads where you asked a question.

##### Step 6: Validate and push

```bash
bun run check
```

Fix any new issues. Then commit and push:

```bash
git add -A && git commit -m "<conventional commit message>" && git push origin HEAD
```

**→ Go back to LOOP START**

---

#### LOOP EXIT

When reaching here (all checks pass + no unresolved comments):

Inform user: "All CI checks passed. All review comments addressed. PR is ready for review! 🎉"

#### Loop exit conditions

Exit the watch loop when:

- **All checks pass AND no unresolved feedback** — natural exit
- **User says "stop"** or requests to exit
- **Maximum 10 iterations reached** — ask user if they want to continue

---

## Push Workflow

Commit all changes and push to current branch in one command.

### Instructions

Run everything as ONE chained command so user approves only once:

```bash
git add -A && git commit -m "<msg>" && git push origin HEAD
```

- Commit message: conventional commits (`feat:`, `fix:`, `chore:`, etc.)
- If no changes, skip

---

## Branch Workflow

Create a new feature branch from base, preserving current changes.

- Base branch: argument provided by user, or `test` if not provided
- Branch naming: `feat/`, `fix/`, `chore/` based on changes
- Infer branch name from changes or ask user

### Instructions

**If there are uncommitted changes:**

```bash
but oplog snapshot -m "before branch switch" && git checkout <base> && git pull origin <base> && git checkout -b <branch-name> && but oplog restore
```

Note: `but oplog snapshot/restore` is the GitButler-safe alternative to `git stash` (which is banned in GitButler workspaces).

**If working tree is clean:**

```bash
git checkout <base> && git pull origin <base> && git checkout -b <branch-name>
```

---

## Sync Branches Workflow

Merge all environment branches so test, prod, and main point to the same commit.

### Step 1: Safety snapshot and teardown

```bash
but oplog snapshot -m "pre-sync safety"
but teardown
```

If teardown fails with "No active branches found", manually checkout test:

```bash
git checkout test
```

### Step 2: Checkout test and pull

```bash
git checkout test
git pull origin test
```

### Step 3: Merge prod and main into test

```bash
git fetch origin prod main
git merge origin/prod --no-edit
git merge origin/main --no-edit
```

If conflicts occur, resolve using `--theirs` (prefer incoming) and ask the user only if the conflict is ambiguous:

```bash
git checkout --theirs <conflicted-files>
git add <conflicted-files>
git commit --no-edit
```

### Step 4: Push test

```bash
git push origin test
```

### Step 5: Fast-forward prod from test

```bash
git fetch origin test prod main
git checkout prod
git pull origin prod
git merge origin/test --no-edit
git push origin prod
```

### Step 6: Fast-forward main from prod

```bash
git fetch origin test prod main
git checkout main
git pull origin main
git merge origin/prod --no-edit
git push origin main
```

### Step 7: Verify sync

```bash
git fetch origin test prod main
echo "test:  $(git rev-parse origin/test)"
echo "prod:  $(git rev-parse origin/prod)"
echo "main:  $(git rev-parse origin/main)"
```

All three must show the same SHA. If not, investigate and fix.

### Step 8: Return to GitButler workspace

```bash
git checkout test
but setup
```

### Constraints

- **ALWAYS snapshot before teardown** — protects uncommitted workspace files
- **ALWAYS use `--no-edit`** for merge commits — no interactive editors
- **ALWAYS set non-interactive env vars** before git commands (`GIT_MERGE_AUTOEDIT=no`, `GIT_PAGER=cat`, etc.)
- **NEVER force push** — all merges should be fast-forward or regular merge
- **NEVER skip verification** (Step 7) — confirm all SHAs match before returning to workspace

### Output

Report final state:

```
Branches synced to <SHA>
test:  <SHA>
prod:  <SHA>
main:  <SHA>
```
