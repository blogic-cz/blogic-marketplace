# Branch and Sync

Before any state-changing command, inspect `git status --short`, current branch, and whether intent is to create or update a branch. Preserve unrelated work and ask when intent is ambiguous.

Resolve target explicitly: use repository convention, then confirm whether it is a local branch or a remote branch such as `origin/<target>`. Do not assume a remote branch exists.

- **New branch:** after target is resolved, create it from that local or remote target.
- **Existing branch:** switch to it only after confirming it is intended; fetch and merge the resolved target only when synchronization is requested.

Use repository naming and target-branch conventions when they exist. Resolve conflicts by understanding both changes; ask when intent is ambiguous. Verify the resulting branch with the repository's relevant checks. Do not use force push, reset, clean, or history rewriting unless user explicitly requests it.
