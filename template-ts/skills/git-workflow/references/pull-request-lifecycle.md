# Pull Request Lifecycle

## Setup

Inspect existing PR and repository template using available repository-supported tooling. Determine explicit target/base and compute target diff. Title/body must describe concrete why, what, use cases/risks, and verification; preserve required template headings and remove placeholders. Do not create ad-hoc metadata when repository template exists.

Before first non-trivial publish and before any later push after fixes, require local [`code-review`](../../code-review/SKILL.md) terminal `RESULT: PASSED` unless user explicitly skips it; record skip reason. Commit message is concrete conventional style when repository uses it, never generic "fix feedback".

Publish only after authorization. Confirm PR is ready for review rather than draft unless user explicitly requests draft. Record PR URL, number, base, head SHA, title/body state, and published commit.

## Fresh bounded CI and automated-feedback loop

After each publication, collect fresh SHA-stable snapshot through repository-supported tooling. Inspect checks and complete feedback inventory; do not infer from latest comment summary. Treat uncertain author as human.

Watcher is read-only: it may wait and report snapshots only. Coordinator owns every mutation. Before diagnosis, edit, validation, commit, push, retry, reply, or resolution, stop active watcher. Complete mutation, then take a fresh SHA-stable snapshot before restarting watcher or acting on status. Older-head watcher output is stale.

- failed checks: coordinator stops monitoring, diagnoses failure against current SHA, and retries only documented pre-test infrastructure/network/timeout failure once. Fix real failure locally, run required checks and code review, publish, then fresh snapshot.
- running checks: use available bounded watcher; otherwise take one snapshot and report monitoring limitation. Never sleep-poll or build custom watcher.
- automated feedback: coordinator stops watcher, verifies against current head and full affected surface, fixes valid issue, validates, publishes, then replies/resolves only where repository platform permits. General comments/review bodies are reply-only.
- human feedback: stop watcher and route to [`human-review.md`](human-review.md).
- passed with no actionable automated feedback and no human feedback: ready.

Maximum 20 fresh snapshots across replacement watchers. After budget exhaustion, stop and ask whether to continue; never extend automatically. After every fix, push, reply, or resolution, take fresh snapshot. CI/feedback state from older SHA is stale.

## Exit evidence

Report each handled automated finding: source/identifier, concern, resolution, changed files, reply/resolution state, and link when available. Then give latest head SHA, CI result, visible-open feedback status, monitoring limitation if any, and terminal ready/blocked state.
