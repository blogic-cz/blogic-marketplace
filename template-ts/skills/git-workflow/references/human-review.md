# Human Review

Human review is approval-gated. Do not edit, publish, reply, resolve, or merge from an inventory-only request. Treat uncertain authorship as human.

## Intake and critical analysis barrier

Fetch full current feedback inventory using repository-supported tooling. Create one source ledger record for every human submitted-review body, general comment, and inline thread, including stable ID/URL, author, origin, kind, full verbatim text, reply language, and every distinct point. Never merge sources into themes or discard old/unknown feedback without evidence.

For each point, independently verify premise against current head, dependency/runtime configuration, callers, tests, documentation, and behavior/data where applicable. Classify `valid`, `partially_valid`, `invalid`, or `clarification_required`; record evidence, impact, full coherent affected surface, options, recommendation, unknowns, and dependencies. Runtime/framework claims need empirical evidence when documentation cannot establish behavior. Reconfirm head SHA and complete inventory immediately before alignment; re-intake affected points if either changed.

## Approval-gated state machine

`intake → analyze → waiting:user-alignment → all-aligned → implement → validate/publish → re-intake → waiting:user-closeout → post-approved-reply → complete`

1. Present one source at a time, hardest first: ID/link, full text, real current-head snippet with `file:line`, point dossier, complete scope, recommendation, and draft reply in reviewer language. Ask explicit handling approval.
2. A clarification needs separate approval of exact question. Post only approved text; keep thread open. Re-intake/re-analyze answer before renewed alignment.
3. When every current point has approved handling and no clarification waits, make one consolidated plan. Only then implement all approved points as coordinated wave.
4. Run repository checks, local code-review loop, publish through PR lifecycle, and obtain green evidence for latest SHA.
5. Re-intake after publication. New human feedback restarts barrier.
6. Present per-source closeout: original text, assessment, changed files, validation/CI evidence, exact reply, and resolution intent. Ask separate approval. Post exactly approved reply. Resolve only eligible approved inline thread; general comments and review bodies never resolve.
7. Take fresh snapshot; any new human feedback restarts intake.

## Completion

Complete only with complete source ledger; evidence-backed assessment and explicit handling decision for every point; all-aligned barrier before edits; green latest-SHA evidence; separate approved reply/resolve action per source; and fresh inventory showing no visible-open human feedback or pending clarification. If approval, inspection, intent, or required evidence is unavailable, stop and report blocker.
