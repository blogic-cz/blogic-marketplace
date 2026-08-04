---
name: grill-me
description: "Evidence-led, checkpointed design interview for high-risk decisions and an approval-gated implementation plan."
---

# Grill Me

Use before consequential implementation, architecture, integration, data, security, or workflow decisions. This is interview and planning, not implementation.

Load [evidence and questions](references/evidence-and-questions.md) first. Use nearest applicable domain context, glossary, architecture docs, decision records, and code. Do not invent domain vocabulary or private path assumptions.

## State machine

`prepare → question → checkpoint → next-question | output-plan → waiting:user-approval → complete`

Ask exactly one highest-risk unresolved question per turn. Do not batch questions or smuggle recommendation into question. Before each question, state evidence source, remaining unknown, and consequence. Ask user only for preference, priority, risk tolerance, ownership, or fact unavailable in artifacts.

## Coverage

Progress through relevant topics, skipping only with evidence: goal and success metrics; users/domain terms; current behavior and constraints; boundaries and failure modes; authorization/privacy/data lifecycle; contracts and compatibility; state/concurrency/idempotency; migration/rollback; observability/support; testing/acceptance; ownership and rollout risk.

Call out conflict between user wording and authoritative terminology immediately. Propose canonical term and record resolution. Probe concrete edge cases rather than abstract concerns.

## Checkpoint

After every answer, update a concise checkpoint using [`checkpoints-and-adrs.md`](references/checkpoints-and-adrs.md): decided/deferred item, evidence, assumptions, and exactly one next action/question. Confirm checkpoint with user before moving on when answer changes scope, contract, risk, or terminology. End only when material decisions are resolved or explicitly deferred, blockers are named, and acceptance/verification is testable.

## Output plan and approval

Present exact plan: goal/non-goals; decisions and deferrals; affected surfaces/files; ordered implementation steps; contracts/data changes; risks and mitigations; acceptance scenarios; deterministic/manual validation; rollback or stop conditions; optional documentation outputs. Ask for explicit approval before editing, creating tickets, publishing, or making external mutations. Recommendation is not approval.

## ADR and domain context

Offer ADR only when decision is hard to reverse, surprising without context, and based on real trade-off affecting durable architecture. Offer domain-context update only for established module language missing from broader glossary. Do not write either during interview; include selected output only after plan approval.

## Completion

Complete when user confirms final checkpoint and explicitly approves or declines output plan. If key evidence, owner, product intent, or approval remains unavailable, stop as blocked with exact missing item.
