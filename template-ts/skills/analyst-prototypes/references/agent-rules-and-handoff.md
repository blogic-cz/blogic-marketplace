# Agent rules and handoff

## Agent rules

- Add one line to the instruction file the agent reads by itself (`AGENTS.md`, `CLAUDE.md` or another tool's rules): "For a task in `prototypes/` or a request for a prototype, read `prototypes/PROTOTYPE.md` first. Its workflow replaces the normal development process."
- `PROTOTYPE.md` is a short analyst workflow:
  - **Start:** machine setup, branch, dev server.
  - **Change:** version, `changes` entry, override or variant or new screen, `base` entry, typecheck.
  - **Mock backend:** where to add a rule, a fixture or a contract extension.
  - **Screen:** list every state (tabs, filters, dialogs, empty and error states). Take the composition of the nearest production screen. Screenshot each state and compare it with production. List the differences you keep.
  - **Finish:** `check`, pull request.
  - **Production changed:** a "message → action" table. Cover both sources of drift: frontend overrides (changes check warnings, a deleted original, a production route that now exists) and the backend contract (typecheck errors in `backend/`, 501 from `coverage:mocks`, an extension field production now has, a stale seed).
- The analyst's request is a proposal. The agent skips the planning ceremonies of production work.
- Write guard: a hook, sandbox or agent permissions allow writes only to `prototypes/` and temporary folders. The guard resolves symlinks and blocks the write on invalid input. When the tool allows it, the guard also checks shell commands. It installs once per machine into configuration outside Git, and it can be uninstalled. The guard helps; server-side checks give the protection.
- The agent needs browser automation for screenshots.

## Handoff

Add a second workflow for developers (`PROTOTYPE-HANDOFF.md`):

1. One change from `changes` is the whole scope. For each override, compare the original at the `base` commit, the override and current production.
2. Apply the diff of the override, not the whole file. Move new screens into production modules. Replace hand-written API calls with the production client and move texts into localization.
3. Port the mock backend module to the backend: `domain/` becomes the aggregate and its rules, `api/` the endpoints, `*.test.ts` the domain tests. Keep the error keys. `application/` holds store code; replace it with the backend's own persistence.
4. After the production pull request merges, delete the change from the prototype in a separate pull request.
