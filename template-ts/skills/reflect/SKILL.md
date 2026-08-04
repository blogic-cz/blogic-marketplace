---
name: reflect
description: This skill harvests reusable lessons from the current session or an explicitly supplied evidence set after delivery, review, or investigation work.
compatibility: opencode
---

# Reflect

Use after completed work to turn verified session evidence into durable guidance. It does not fetch pull-request history; use only current-session evidence or an evidence set supplied by the user.

## Workflow

1. Gather concrete evidence: request, changed behavior, checks, review findings, decisions, and failures.
2. Extract only lessons likely to recur. Classify each as one of:
   - **Skill** — repeatable agent workflow or implementation guidance.
   - **Memory** — durable preference or concise personal/project fact.
   - **Docs/domain context** — source-derived explanation for future maintainers.
   - **ADR** — durable, consequential decision with alternatives and rationale.
   - **Discard** — one-off, unverified, stale, or non-actionable observation.
3. For a skill or memory update, follow repository policy and make only a focused change when evidence supports it.
4. Before writing docs, domain context, or an ADR, propose exact target file and unified diff; wait for approval.
5. Report classification, evidence, write made or proposed, and discarded items.

Keep issue-delivery changes separate from agent-infrastructure lessons unless user explicitly combines them.
