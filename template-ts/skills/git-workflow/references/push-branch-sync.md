# Push, Branch & Sync Workflows

Standalone recipes referenced from the main git-workflow skill.

## Push Workflow

Commit all changes and push to the current branch in one command.

```bash
git add -A && git commit -m "<type>(<scope>): <what changed>" && git push origin HEAD
```

- Commit message: always use `<type>(<scope>): <description>` — see main skill for the full standard.
- If no changes exist, skip.

---

## Branch Workflow

Create a new feature branch from base, preserving current changes.

- Base branch: argument provided by user, or `test` if not provided.
- Branch naming: `feat/`, `fix/`, `chore/` based on changes.
- Infer branch name from changes or ask user.

**If there are uncommitted changes:**

```bash
but oplog snapshot -m "before branch switch" && git checkout <base> && git pull origin <base> && git checkout -b <branch-name> && but oplog restore
```

`but oplog snapshot/restore` is the GitButler-safe alternative to `git stash` (which is banned in GitButler workspaces).

**If working tree is clean:**

```bash
git checkout <base> && git pull origin <base> && git checkout -b <branch-name>
```

---

## Sync Branches Workflow

Merge all environment branches so test, prod, and main point to the same commit.

**Set non-interactive env vars before starting:**

```bash
export GIT_MERGE_AUTOEDIT=no GIT_PAGER=cat
```

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

### Step 5: Merge test into prod

```bash
git fetch origin test prod main
git checkout prod
git pull origin prod
git merge origin/test --no-edit
git push origin prod
```

### Step 6: Merge prod into main

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

- **ALWAYS snapshot before teardown** — protects uncommitted workspace files.
- **ALWAYS use `--no-edit`** for merge commits — no interactive editors.
- **ALWAYS set non-interactive env vars** before git commands.
- **NEVER force push** — all merges should be fast-forward or regular merge.
- **NEVER skip verification** (Step 7) — confirm all SHAs match before returning to workspace.

### Output

Report final state:

```
Branches synced to <SHA>
test:  <SHA>
prod:  <SHA>
main:  <SHA>
```
