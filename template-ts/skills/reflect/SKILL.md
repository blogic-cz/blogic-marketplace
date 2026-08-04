---
name: reflect
description: Harvests verified lessons from current-session or supplied evidence, classifies each once, applies portable updates with single-source ownership, and reports an auditable receipt.
compatibility: opencode
---

# Reflect

Use after delivery, review, or investigation. Turn what this session taught into guidance next session gets for free. A lesson is something surprising, retried, corrected by user, repeated enough to template, or a decision whose rationale would otherwise be re-derived. Use current-session evidence or evidence explicitly supplied by user; do not invent history.

## 1. Harvest

List every candidate lesson. Yield order: failures and diagnoses (wrong assumptions, killed checks, reversions), user corrections, repeated manual choreography, hard-won design decisions, and clarified/conflicting domain terms. Account for **every failure and user correction**: keep it or dismiss it explicitly. Capture evidence, recurrence trigger, and why it matters.

## 2. Classify

Give each lesson **exactly one** disposition:

- **Skill edit** — changes repeatable process. Search existing skills; update single skill owning process. If two fit, more specific owner wins.
- **New skill** — repeatable process no skill owns and has distinct trigger/leading verb. Prefer thin composition pointing to existing skills over restatement.
- **Memory** — durable user preference, private ephemeral project state, or agent bias. Keep private.
- **Docs** — durable domain language or source-derived explanation for maintainers.
- **ADR** — consequential hard-to-reverse decision with real alternatives and rationale.
- **No-op** — situational, stale, unverified, or already default behavior. State dismissal reason.

Promotion test before memory: would another agent in repository hit same wall? Yes: skill, docs, or ADR—not memory. Then decide process versus meaning: how work runs goes to skill; system meaning or settled decision goes to docs/ADR.

## 3. Apply

Check destination is current enough for edit: inspect current repository content and relevant local policy; do not base change on stale excerpts. Keep each meaning in one source of truth. For skill edits, add smallest actionable rule and remove duplicate/no-op wording. New skills are user-invoked by default and link rather than copy owner guidance.

For docs or ADR, **propose exact target file and unified diff before writing**; wait for approval. Put one ADR per decision at lowest affected scope. Do not store team-reusable guidance in private memory. Apply only lessons evidence supports; issue delivery changes remain separate from agent-infrastructure lessons unless user combines them.

## 4. Report

Return one auditable table:

| Lesson | Evidence | Disposition | Destination | Write/proposal | Reason |
| ------ | -------- | ----------- | ----------- | -------------- | ------ |

Destination is changed file, proposed file, memory location, or `dismissed: reason`. Every kept lesson names resulting write/proposal; every no-op names dismissal reason.
