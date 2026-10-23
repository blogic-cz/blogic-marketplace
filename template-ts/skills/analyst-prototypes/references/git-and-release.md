# Git and release

## Git and pull requests

- Branch `analyst/<TICKET>-<topic>` from the current main branch. The agent creates the branch, commits, pushes and opens the pull request. The analyst gives only the ticket and the topic.
- Commit messages follow the repository convention.
- The prototype pull request template has: **Why** (ticket), **Changes** (`id`, title and review state of each change), **How to look** (URL with `?v=` and `?variant=`), **Testing** (`check` output), **Release configuration**.
- A pull request that changes only `prototypes/` needs no approval; the analyst merges it.
- A pull request that changes `prototypes/` and production needs a developer approval. A lockfile change counts as a production change. A workflow adds the label `prototype + production` and a comment listing the production files. The status stays red until a person with write access approves the current head commit. Each new push needs a new approval.
- The scope workflow runs from main branch code, not from the pull request (for example `pull_request_target`), so a pull request cannot change its own verdict. It runs again after a review.
- When the repository plan allows it, make the prototype gate and the scope status required checks. Otherwise add a workflow that reports a push to main outside an approved pull request.

## Release

- After green CI on main, build a static bundle. It has no baked-in URL: the API base URL is its own origin, where the mock backend answers.
- Static server: SPA fallback to `index.html`; the service worker at the root with `no-cache` and `Service-Worker-Allowed: /`; hashed assets immutable; `index.html` with no cache; a health endpoint.
- Tag the image or artifact with the commit SHA. Deploy it only to dev or test, never to production. With GitOps, never replace a newer deployed commit with an older one.
- The prototype sits behind login: OIDC at the gateway or proxy, with its own client. Check whether the proxy sends PKCE. When it does not, the client must not require PKCE.
- List the one-time manual steps: DNS and TLS, OIDC client and secret, application registration in the deploy tool.
- No per-branch preview is needed. Before merge, the local dev server is enough.
