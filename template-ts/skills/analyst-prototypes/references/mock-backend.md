# Mock backend

The whole backend runs in the browser. Production frontend code does not know: it calls the API at its usual base URL, as if it went to a server. A service worker catches the call and answers from TypeScript code in `prototypes/backend/`. No server, database or network is needed, so the built prototype runs as static files.

```
production frontend ──fetch──▶ service worker (MSW) ──▶ backend.handle()
                                                          ├─ GraphQL over the production schema
                                                          ├─ module REST routes
                                                          └─ sample from the contract / 501
                                                        in-memory store ⇄ IndexedDB
```

## Transport: MSW

- Use [MSW (Mock Service Worker)](https://mswjs.io) 2 with a real service worker (`setupWorker`). Calls show in DevTools as normal network requests.
- The entry runs `await worker.start({ onUnhandledRequest: "bypass" })` before it loads production code. Otherwise the first API calls go to a server that does not exist. `bypass` lets assets and fonts through.
- MSW has one handler, `http.all("<apiBase>/api/*", ...)`. It turns the `Request` into `{ method, path, query, body }`, calls `backend.handle()` and returns the result as a `Response`. MSW is transport only; the handler holds no logic.
- `mockServiceWorker.js` comes from the `msw` package. The dev server serves it and the build emits it, so it stays out of Git. The static server sends it with `no-cache` and `Service-Worker-Allowed: /`.
- When the browser restarts the worker, open tabs must keep mocking. The entry adds a short script that registers the worker again.
- Test the transport in Node with `setupServer` from `msw/node` and `onUnhandledRequest: "error"`.
- Without MSW, any service worker with the same `backend.handle()` interface works. The logic does not change.

## Backend router

`backend.handle()` tries these in order; the first match wins:

1. The GraphQL endpoint runs the query over the production schema (for example `graphqlSync` from `graphql`).
2. Module REST routes: each module returns a list of `{ method, path, handle }`.
3. An unserved read gets a sample synthesized from the contract.
4. An unserved write gets 501 "Out of prototype scope". The `coverage:mocks` script lists every unserved write.

A domain error maps to the production error shape (for example ProblemDetails) with the same HTTP status and the same error key as the backend, so the UI shows the production message.

## Module layout

Logic is plain TypeScript with no imports of UI, framework or mock library. Lint enforces it. `backend/<module>/` mirrors the backend module:

- `domain/`: aggregate, rules, and errors with production codes and HTTP statuses.
- `application/`: load, call the domain, check optimistic concurrency as production does (`?version=`, 409 on mismatch), save.
- `api/`: GraphQL resolvers and REST routes wired to `application/`.
- `module.ts`: registers the module in the backend.
- `*.test.ts`: domain tests.

## Contract

- Use the contract that the frontend generates from the backend (GraphQL SDL, OpenAPI types). The mock backend imports the same generated files as production code; it never keeps a copy.
- For GraphQL, the default resolver returns a list or a detail from the store collection, with filter, order and paging as the production server does them. For REST or another protocol, use an operation table keyed by method and path or by operation name.
- Fields that production does not have yet go into a schema extension in `backend/<module>/`. A module the backend does not have yet gets its own schema. When the production contract later has the same, production wins; delete the extension.
- A GraphQL list without a resolver gets a few synthesized rows; a REST GET without a route gets a sample built from the generated types. New production screens render without mock work.
- With no generated contract, type the store with the frontend's hand-written types. Synthesized reads are then impossible, so every read needs a route or a fixture.

## Backend changes

- When the backend changes its API and the frontend regenerates the contract, the mock backend sees the change with no manual work. New fields are synthesized. The contract hash changes, so browsers drop their saved data.
- Manual work covers only the code written in the mock backend. Typecheck finds changed DTO shapes in domain code and fixtures. `coverage:mocks` finds new writes without a route. Delete a schema extension field that production now has. Pull the seed again when a DTO changes.
- Until the frontend regenerates the contract, the mock backend does not see the change. Put the new field in the schema extension for that time.

## Store and data

- Collections hold DTOs exactly as the API returns them. A write keeps derived fields correct.
- Copy records with `structuredClone` on read and on write, so UI code never mutates the store.
- Save a snapshot to IndexedDB with a short debounce. A `BroadcastChannel` keeps open tabs in sync.
- The hash of `backend/` and of the contract is the data version. When it changes, the browser drops saved data and loads the seed.
- Data order per collection: `seed` (generated, never edited) → synthesized rows when both seed and fixture are missing → `fixtures` on top (hand-written, invented, ids far from the seed range; the same id replaces, a new id adds).
- The seed from the dev database is optional. One query per collection returns the DTO. The query header marks identity and personal fields. Anonymization uses deterministic pseudonyms. A leak check refuses to write the seed when an original value survives.

## Auth

A mock adapter implements the production auth interface. Mock users have roles, and the toolbar switches them.
