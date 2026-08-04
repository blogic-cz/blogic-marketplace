---
name: frontend-standards
description: This skill routes frontend changes to the right existing guidance when a task involves visual UX, TanStack routes/forms/query state, TRPC APIs, testing, or relevant performance work.
compatibility: opencode
---

# Frontend Standards

Use for frontend changes that span concerns or need help selecting the owning skill. Inspect nearby code and follow its established conventions; this router does not replace specialist guidance.

## Route by Concern

- Visual UI, layout, styling, accessibility, or interaction design: load `frontend-design`.
- TanStack Router, forms, query state, loaders, or prefetching: load `tanstack-frontend`.
- API contracts, TRPC routers, procedures, middleware, or errors: load `trpc-patterns`.
- Test selection or implementation: load `testing-patterns`.
- Measured or clearly identified latency, rendering, data-loading, or bundle bottlenecks: load `performance-optimization`.

Load only skills relevant to changed behavior. Keep implementation details in their owning skill.
