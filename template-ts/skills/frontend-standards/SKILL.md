---
name: frontend-standards
description: Guides portable frontend ownership, completion, interaction, boundary, and module-composition standards; routes framework-specific work to existing specialist skills.
compatibility: opencode
---

# Frontend Standards

Use for any frontend change. Inspect nearest comparable route, feature, component, and test first; copy its ownership and naming shape before creating structure. These rules own portable behavior. Keep React, TanStack Router/Query, TRPC, form, and test mechanics in their specialist skills.

## Load by Change

| Change                                                   | Read                                                                                       | Completion                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Every frontend change                                    | [references/coding-conventions.md](references/coding-conventions.md)                       | Local conventions and public boundaries hold. |
| Route, feature, page, modal, form, or shared component   | [references/module-composition.md](references/module-composition.md)                       | Ownership, co-location, and seams are clear.  |
| UI, layout, feedback, accessibility, responsive behavior | [references/interaction-and-accessibility.md](references/interaction-and-accessibility.md) | All user states are usable.                   |
| Query, mutation, cache, invalidation, or API error       | [references/data-boundaries.md](references/data-boundaries.md)                             | Server state and errors remain coherent.      |
| User-visible text or locale-sensitive behavior           | [references/localization.md](references/localization.md)                                   | Text and formatting are localizable.          |

## Specialist Routing

- Visual design system and styling: `frontend-design`.
- React/TanStack Router, forms, loaders, query state, prefetching: `tanstack-frontend`.
- TRPC contracts, procedure errors, middleware: `trpc-patterns`.
- Tests and stories: `testing-patterns`.
- Measured rendering, loading, or bundle issue: `performance-optimization`.

Load only relevant skills. A route or component wrapper stays thin: compose feature behavior there; do not move domain state, data orchestration, or reusable UI internals into it for convenience.

## Completion

Account for each affected reference, run smallest relevant checks, and call out API-contract or user-visible behavior changes. Do not call work complete while loading, empty, error, permission, mutation-pending, or success feedback behavior is unspecified.
