---
name: requirements
description: This skill should be used when clarifying a feature, writing a requirements spec, running a structured discovery session, or when users mention requirements-start, requirements-status, requirements-current, requirements-list, requirements-remind, or requirements-end.
---

# Requirements Skill

Run a structured 5-phase requirements workflow that turns a feature request into an implementation-ready specification.

Keep SKILL.md as the workflow source of truth. Load detailed templates and canned output text from `references/templates.md`.

## Purpose

- Clarify product and technical expectations before implementation.
- Capture assumptions explicitly.
- Produce a requirements spec that references real codebase patterns when available.

## When to Use

Use this skill when:

- A user asks to clarify scope for a new feature.
- A user asks to write or refine a requirements document/spec.
- A requirements command workflow is active (`requirements-start`, `requirements-status`, `requirements-current`, `requirements-list`, `requirements-remind`, `requirements-end`).

## Core Rules

1. Ask one question per message.
2. Keep each question closed-form:
   - yes/no, or
   - bounded multiple choice (2-5 options), with a default.
3. Generate all questions for the current phase first, then ask sequentially.
4. Keep product language primary; add technical notes only when they help decision quality.
5. During requirements gathering, do not implement code.
6. Use real repository paths once discovered. Use placeholders only in reusable templates/examples.
7. Keep phase question count bounded (target 5; allow 4-7 when justified).

## 5-Phase Workflow

### Phase 1 — Initialize Session

1. Create a requirement folder: `requirements/[timestamp]-[slug]/`.
2. Create initial artifacts:
   - `00-initial-request.md`
   - `metadata.json`
3. Update `requirements/.current-requirement` with the active folder.
4. Scan the codebase to identify relevant modules, data models, routes, and APIs.

If the repository structure differs, adapt paths and naming to that repository.

### Phase 2 — Discovery Questions (Product Scope)

1. Draft discovery questions focused on user outcomes, scope boundaries, permissions, data impact, and external integrations.
2. Write all phase questions to `01-discovery-questions.md` before asking any.
3. Ask questions sequentially, each with a proposed default.
4. Accept concise answers:
   - yes/no
   - one option from a bounded list
   - unknown/default
5. Store responses in temporary working notes while the phase is in progress.
6. After all questions are asked, persist finalized responses to `02-discovery-answers.md` and update `metadata.json`.

### Phase 3 — Context Gathering (Autonomous)

1. Search code for similar features and reusable patterns.
2. Review relevant backend/frontend/data files and integration points.
3. Record findings in `03-context-findings.md`:
   - similar features
   - candidate files to modify
   - constraints and risks
   - recommended patterns
4. Perform this phase without user questioning unless critical ambiguity blocks progress.

Use whichever search/read/navigation tools are available in the current agent runtime.

### Phase 4 — Detail Questions (Behavior & Design Decisions)

1. Derive follow-up questions from Phase 3 findings.
2. Write all phase questions to `04-detail-questions.md` before asking.
3. Ask one at a time with defaults.
4. Keep wording PM-friendly first, then include optional technical anchor when useful.
   - Good: “Should users edit this from the existing Project Settings screen?”
   - Optional anchor: “(Likely in `apps/web/src/routes/project-settings.tsx`)”
5. Store answers in temporary notes during the phase.
6. After all questions are asked, persist finalized responses to `05-detail-answers.md` and update `metadata.json`.

### Phase 5 — Generate Requirements Spec

1. Create `06-requirements-spec.md`.
2. Include:
   - overview
   - functional requirements and acceptance criteria
   - technical requirements
   - files/systems impacted
   - assumptions and open questions
3. Mark unresolved items as `ASSUMED:` with rationale.
4. Update metadata status to complete (or incomplete if explicitly paused).
5. Clear `.current-requirement` when the session ends.

Use spec templates from `references/templates.md`.

## Command Behaviors

### requirements-start

- Initialize the folder and metadata.
- Run Phase 1, then begin Phase 2.

### requirements-status

- Show current phase, progress, recent answers, and next question.
- Resume from the next unanswered question.

### requirements-current

- Show full read-only snapshot of the active requirement (all artifacts).
- Do not continue questioning unless explicitly asked.

### requirements-list

- List all requirement folders with status, sorted by:
  1. active,
  2. complete/incomplete,
  3. newest first.

### requirements-remind

- Show concise rule reminders based on current phase.
- Correct process drift (for example: open-ended questions, implementation drift, missing defaults).

### requirements-end

- If active requirement exists, offer:
  1. generate spec now,
  2. mark incomplete,
  3. cancel.
- Confirm destructive actions before deleting artifacts.

## Portability Rules

1. Treat project-specific paths as examples, not constants.
2. Treat companion skills as optional accelerators, not dependencies.
3. Prefer generic wording unless repository context confirms specific frameworks/tools.
4. Keep artifacts and process identical across agent runtimes.

## Quality Checklist

- Question sets are complete before asking begins.
- Every asked question has a default and rationale.
- Temporary notes are consolidated into phase answer files.
- Spec clearly separates confirmed decisions vs assumptions.
- Output stays requirements-focused (no implementation).

## Reference Files

- `references/templates.md` — canonical templates for:
  - question files
  - answer files
  - context findings
  - metadata
  - requirements spec
  - status/list/reminder output snippets
