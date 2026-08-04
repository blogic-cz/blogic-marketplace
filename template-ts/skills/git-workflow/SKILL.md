---
name: git-workflow
description: "Portable branch and pull-request lifecycle with safe publication, bounded CI and feedback loop, and approval-gated human-review handling."
---

# Git Workflow

Use for branch state, pull requests, CI/review feedback, or safe publication. Read repository instructions first. Never reset, clean, stash, discard unrelated work, force-push, merge, deploy, or mutate production as part of this skill.

## Route

- branch/current state and publish: [`branch-and-sync.md`](references/branch-and-sync.md);
- PR setup, target diff/body, CI and automated feedback loop: [`pull-request-lifecycle.md`](references/pull-request-lifecycle.md);
- human review body, general comment, or inline thread: [`human-review.md`](references/human-review.md);
- non-blocking material-delivery learning: [`reflection.md`](references/reflection.md).

Human feedback always takes human-review route, even for inventory or summary request. A comment is hypothesis, not authority.

## End-to-end authorization

Before ordinary delivery, ask authorization for complete loop: branch/worktree selection where applicable, implementation, focused checks, local [`code-review`](../code-review/SKILL.md) pass, commit, push, PR create/update, then bounded CI/automated-feedback monitoring. Local-only work occurs only when explicitly requested.

This authorization never covers force push, merge/deploy, production mutation, posting/replying/resolving human feedback, or material scope expansion. Those need separate exact approval.

## Watcher ownership

A watcher is read-only: it may collect SHA-stable snapshots, inspect feedback, wait on running checks, and report state. Coordinator owns diagnosis, edits, validation, commits, pushes, reruns, replies, and resolutions. Stop every active watcher before coordinator mutation. After mutation completes, restart monitoring only from a fresh SHA-stable snapshot; never act on watcher state for an older head.

## Completion

PR is ready only after latest published head has required checks passing, no actionable automated feedback, and all human feedback is either absent or processed through its approval gates. After readiness, completed human review, or observed merge, optionally start non-blocking [`reflection`](references/reflection.md). It never changes delivery verdict or blocks delivery; any resulting mutation requires separate approval. Stop with evidence when user stops, required intent/approval is missing, remote operation partially succeeds, CI cannot be diagnosed, feedback cannot be inspected, or bounded loop ends without readiness.
