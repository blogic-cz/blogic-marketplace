# Frontend Ownership And Conventions

Read for every frontend change.

- Inspect nearest comparable code before choosing folders, names, imports, state shape, or test placement. Reuse local helpers and public entrypoints; do not create a second pattern for one feature.
- Keep application and route files thin: route parameters, guards, layout composition, and feature entry only. Put feature behavior beside the feature.
- A module exposes deliberate public entrypoints. Consumers import its public API, not private components, hooks, or implementation files. Move a shared abstraction only after more than one consumer has a real common need.
- Co-locate feature components, hooks, schemas, API adapters, tests, stories, and feature-only types. Keep cross-feature UI and utilities at the nearest shared level with a stable boundary.
- State has one owner. Keep transient input, focus, and disclosure state local; lift it only to the nearest common owner. Keep URL state in URL mechanisms and server state in the query client; do not duplicate either into client state.
- Give required inputs explicit types and preserve local import, naming, formatting, and error conventions. Prefer functions and plain data over classes unless object lifetime carries real state.
- Do not hide a required input with a default. Do not add a generic component, hook, or context for one caller.

## Completion

- [ ] Existing feature and route patterns were inspected.
- [ ] Public/private module boundary is intentional.
- [ ] State has one owner and remains in correct layer.
- [ ] Changed behavior has an appropriate test or story seam.
