# Module Composition

Load for feature, page, form, modal, or shared component work.

## Ownership

Organize around user-facing domain capability, not file type. A feature owns its screen composition, local UI, state, validation, data adapters, and tests. A reusable UI primitive owns no product policy. Application/route layers choose feature and layout; they do not become an alternative feature folder.

Before extracting shared code, confirm two independent consumers need same contract. Export only stable entrypoints. Internal components may change without coordinating consumers; public components need explicit props, documented behavior through types/stories/tests, and backwards-compatible change care.

## State And Permissions

Keep state as close as possible to interaction. Parent owns state only when siblings coordinate or URL/navigation needs it. Server responses are not editable form state: derive initial values deliberately and define reset/reconciliation behavior. Do not render controls as authorization; enforce access at server boundary too. Hide unavailable actions when this improves clarity, but handle stale permissions and forbidden responses safely.

## Forms And Mutations

Use existing form primitives and validation flow. Keep validation at both client usability boundary and authoritative server boundary. Distinguish field validation, submit failure, pending state, success confirmation, and retryable failure. Disable or make repeated submission safe while a mutation is pending. Close, reset, navigate, or retain a form only by explicit success/failure rule.

## Test And Story Seams

Separate presentational components from data/route wiring when that makes behavior testable or storyable; do not split solely by habit. A shared component needs useful states in stories or focused tests: normal, long content, disabled, loading where applicable, and error/empty variants when it owns them.

## Completion

- [ ] Route wrapper remains composition-only.
- [ ] Feature-only code is co-located; shared code has real consumers.
- [ ] Permission and mutation behavior have an explicit owner.
- [ ] Tests/stories can exercise owned states.
