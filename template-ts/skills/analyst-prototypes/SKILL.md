---
name: analyst-prototypes
description: Set up analyst prototypes inside a production frontend repository - overrides of real production screens, a mock backend in the browser (MSW), versions and variants, checks, a guarded pull request flow, deployment and developer handoff. Use when a team wants analysts to change screens through a coding agent without touching production code.
---

# Analyst prototypes

Build a prototype layer in the production frontend repository. An analyst asks a coding agent for a change. The agent writes only in `prototypes/` and opens a pull request. The result is a clickable prototype on real production screens, with a mock backend that runs in the browser. After approval, a developer moves the change to production.

The skill does not depend on a framework, build tool, API protocol or agent. [Vite](references/vite.md) has a worked mapping.

## Invariants

Every step keeps these true:

1. The prototype is the production frontend, not a copy. It imports production source files and gets production changes for free.
2. A change is an override: a file at the same relative path in the prototype layer replaces the production file.
3. Production code changes only by minimal seams: a configurable API base URL, a replaceable auth layer, an exported router and providers. A developer approves each seam.
4. The backend runs in the browser and keeps the production contract: schemas, types, error codes, HTTP statuses.
5. During analyst work, the agent writes only in `prototypes/`.
6. Each file of a version belongs to exactly one change. A change has a description, screens and a review state.
7. The repository holds no real personal data.

## Steps

Do the steps in order. Each step ends when its line in [Done](#done) is true or the step has no line.

0. **Survey.** Before code, find and summarize: framework, build tool, router, monorepo and import aliases; how the frontend calls the API (protocol, client, base URL); the contract source (GraphQL SDL, OpenAPI, generated types, or none); auth, telemetry, localization; test runner, lint, CI, hosting and deploy; which seams from invariant 3 are missing. Propose how each step below maps to this stack. Ask all [decisions](#decisions) at once, then continue.
1. **Prototype app.** Create the layout below. The prototype is a separate app in the same repository and reads production source, not built packages. The entry starts the mock backend first and only then loads production code with a dynamic import; static imports of the entry never load production code. The bootstrap copies production providers and router. It differs by mock auth, no telemetry, the toolbar and the version switch.
2. **Override resolver.** Read [override resolver](references/override-resolver.md) and build the option chosen in step 0.
3. **Versions and changes.** Read [versions and changes](references/versions-and-changes.md).
4. **Mock backend.** Read [mock backend](references/mock-backend.md).
5. **Toolbar.** Version, variant (only when the current screen has one) and mock user switch. Review state of the current screen and a changes dialog ("on this screen" and "elsewhere", with navigation). "Reset data" returns the browser data to the seed.
6. **Checks.** Read [checks and CI](references/checks-and-ci.md), section Checks.
7. **Agent rules.** Read [agent rules and handoff](references/agent-rules-and-handoff.md), section Agent rules.
8. **Git and pull requests.** Read [git and release](references/git-and-release.md), section Git and pull requests.
9. **CI.** Read [checks and CI](references/checks-and-ci.md), section CI.
10. **Release.** Read [git and release](references/git-and-release.md), section Release.
11. **Handoff.** Read [agent rules and handoff](references/agent-rules-and-handoff.md), section Handoff.

```
prototypes/
  <entry>               mock backend first, then production bootstrap, toolbar
  <build config>        own build and port, aliases as production
  runtime/              version registry, toolbar, mock auth
  versions/<id>/        version, changes, routes, base, overrides/, variants/, screens/
  backend/<module>/     domain/, application/, api/, seed, fixtures, schema extension
  tooling/              resolver, checks, seed pull, smoke
  PROTOTYPE.md          analyst workflow for the agent (step 7)
```

## Decisions

Ask these in step 0:

- Resolver A, B or C?
- Data: fixtures only, or a seed from the dev database with anonymization?
- No generated contract: accept hand-written types, with no synthesized reads, or add contract generation to production first?
- Hosting, gateway and OIDC provider for the prototype?
- Are required checks available on the main branch?
- Who approves pull requests that also change production?
- Which seams are missing, and who approves them?

## Done

- [ ] The analyst gives a ticket and a topic, and the agent creates the branch, the change and the pull request alone.
- [ ] An override of one production screen works and switches with the version.
- [ ] A new screen and its navigation item appear only in their version.
- [ ] The mock backend serves the reads and writes of a screen. An unserved write answers 501.
- [ ] A domain error of the mock backend shows the same message in the UI as the production error.
- [ ] `check` and the smoke test run locally and in CI.
- [ ] A pull request outside `prototypes/` gets the label, the comment and a red status.
- [ ] After merge, the prototype deploys behind login and opens with a `?v=` URL.
- [ ] The write guard blocks agent writes outside `prototypes/`.
