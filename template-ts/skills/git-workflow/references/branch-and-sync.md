# Branch and Current-State Safety

Start with `git status --short --branch`, current branch, remotes, configured default branch, and target/base supplied by user. Do not assume a branch name or remote exists.

For a new topical branch, first fetch intended base, then create from its remote tracking ref:

```bash
git fetch <remote> <base>
git switch --no-track -c <topic-kebab-case> <remote>/<base>
```

Use task-derived, non-generic branch name. If local changes would be overwritten or branch ownership is unclear, stop and ask where they belong; never stash/reset/clean.

Before push, inspect divergence (`git log --left-right --count <remote>/<branch>...HEAD` when upstream exists). Publish only intended commits. Use normal push (`git push -u <remote> HEAD` initially; `git push <remote> HEAD` afterward), never force push.

If commit succeeds but push/PR mutation fails, report local commit SHA, remote state, command/error, and safe next action. Do not retry mutations blindly or rewrite history. Completion: intended remote branch points to intended local SHA, or partial state is explicitly reported.
