# Checks and CI

## Checks

- The `check` command in `prototypes/` runs typecheck, lint, mock backend domain tests and the changes check.
- The changes check fails when a file belongs to no change or to two, when a file of a change is missing, when an override has no original or no `base` entry, and when a variant does not belong to exactly one change.
- When an original changed since its override was made, the changes check warns with `git diff <commit> -- <file>`.
- A smoke test in a real browser, over the production build, visits every navigation screen and its first detail. It does this for production, every version and every variant. A screen fails on a console error, a page error, a timeout or the text of an error page.
- Optional: record which overridden files each screen used. On a pull request, retest only the affected screens plus new screens.

## CI

- The workflow runs on pull requests and on the main branch with no path filter, because a production change can break the prototype.
- Modes:
  - **The pull request changes the prototype:** blocks.
  - **The pull request changes only production:** warns. Fix the prototype in a follow-up pull request.
  - **Main branch:** full smoke test.
- Steps: install, typecheck, lint, tests, changes check with diff, smoke, `coverage:mocks` report, test report, artifacts on failure.
