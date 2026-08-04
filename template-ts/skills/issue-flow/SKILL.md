---
name: issue-flow
description: "Phased reported-issue delivery from concrete reproduction through root-cause fix, verification, review, and portable Git workflow."
---

# Issue Flow

Use for a reported defect that must be reproduced and delivered. This composes repository skills; it does not replace them.

## Prerequisites

Read `AGENTS.md`, repository validation instructions, and relevant domain/runtime guidance. Load tools only when needed:

- worktree guidance when repository requires isolated worktrees;
- `agent-browser` for browser-visible behavior;
- live/log/trace/database tools only for evidence unavailable locally;
- `code-review` before non-trivial delivery;
- `git-workflow` for branch, PR, and feedback lifecycle.

Do not alter production, remote data, or unrelated local changes. If prerequisite cannot run, record command, output, and blocker; do not claim reproduction or verification.

## State machine

`intake → reproduce → baseline → investigate → implement → verify → deterministic-checks → local-review → delivery → final-evidence → reflect → done`

A state advances only when its completion condition is met. Return to `investigate` if same-scenario verification fails; return to `implement` for review findings; stop at `blocked` when required evidence or approval is unavailable.

## 1. Intake and acceptance target

Turn report into testable contract:

- reporter/context, affected page/API/job, account/tenant or safe fixture, relevant identifiers;
- exact observed and expected behavior;
- preconditions, inputs, sequence, permissions, and boundary/negative case;
- concrete acceptance criteria and what evidence would disprove success.

Ask only for unavailable product intent. Do not substitute a vague report with guessed acceptance criteria.

**Complete:** one reproducible scenario and explicit acceptance criteria exist, or an exact information blocker is recorded.

## 2. Reproduce and baseline

Use existing project setup, fixtures, imports, and runtime instructions first. Create minimum local data only when existing tooling cannot create state. For browser-visible behavior, use real browser flow; static inspection and unit tests do not replace it.

Capture baseline evidence before production-code edits: exact steps/requests, expected result, observed result, console/network/log evidence when relevant, and revision/environment used. For API/job behavior use closest realistic surface.

**Complete:** failure is observed in specified scenario, or report is classified non-reproducible with attempted steps and evidence. Never implement a presumed fix as a reproduction substitute.

## 3. Investigate root cause

Trace affected path end-to-end: caller, state/query, endpoint/job, persistence/integration, authorization, and sibling callers of candidate shared code. Use narrowest read-only evidence source first. Distinguish symptom from root cause.

Select smallest shared location that fixes all affected callers without changing unrelated behavior. No drive-by refactors, speculative abstractions, or fixture-only workaround.

**Complete:** root-cause hypothesis explains baseline evidence, affected surface is known, and each acceptance criterion has planned verification.

## 4. Implement

Make smallest correct change at root-cause location. Preserve contracts unless acceptance criteria explicitly change them. Add deterministic regression test only where meaningful seam and risk exist; test observed scenario plus relevant boundary, not implementation accident.

**Complete:** change is scoped, reviewable, and deterministic test is added or an explicit reason says why no valuable seam exists.

## 5. Same-scenario verification

Repeat baseline scenario unchanged except intended fix. Record exact steps/request, expected and observed result, and browser/runtime evidence where applicable. Verify negative, permission, and boundary cases derived in intake when behavior changes them.

**Complete:** every acceptance criterion has passing same-scenario evidence; failures return to investigation.

## 6. Deterministic checks and local review

Run repository-required focused checks from correct root. Run broader required check when repository instructions require it. Then run [`code-review`](../code-review/SKILL.md) for non-trivial changes; fix in-scope findings and recompute review scope until terminal `RESULT: PASSED`.

**Complete:** required checks pass or are honestly blocked, and local review passed or explicit user-approved skip reason is recorded.

## 7. Delivery and final evidence

Use [`git-workflow`](../git-workflow/SKILL.md) for approved branch/PR delivery. Do not commit, push, or publish without authorization. Its PR loop owns remote feedback and CI.

Final report includes: acceptance criteria; baseline and passing evidence; root cause and changed paths; deterministic checks with commands/outcomes; local-review result; commit/PR state if delivered; blocked checks and residual risks.

## 8. Separate reflection

After delivery, optionally record reusable process lesson separately. Reflection never changes issue verdict, delays delivery, or expands issue PR. Do not create process changes without approval.

## Definition of Done

Done only when reproduction target, baseline evidence, root-cause fix, same-scenario evidence, required deterministic checks, local review, and final evidence all pass; Git delivery is complete when requested and authorized.

## Stop conditions

Stop and report `blocked` for missing product intent, unavailable safe data/runtime, inability to reproduce after documented attempt, failing required checks, unresolved material review finding, unavailable approval for remote mutation, or user request to stop. Never invent evidence or silently skip a state.
