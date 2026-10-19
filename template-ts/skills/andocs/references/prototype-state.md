# Persistent prototype data

Andocs data is the default for every prototype with records the user adds, edits, or deletes. Build it in from the first version: declare the collections in `prototype.json` and read and write them through `window.andocsData`, without asking first. Keep example records in memory only for screens that display data the user never changes. When the user asks for sample data in a records prototype, show it as an empty-state preview and offer one action that creates those records through `window.andocsData`.

The host injects `window.andocsData` only when that host supports the API. For CLI use, confirm the installed `serve --help` or `edit-prototype --help` exposes the required options and the actual preview exposes the needed API. Authored HTML must not import Evolu, load an Evolu CDN script, or configure a relay.

## Managed datasets

In hosted Andocs, the authenticated host selects a permitted dataset and binds it to the scoped data facade. The account catalog is stored by Andocs; signing into the same account on another device makes permitted datasets discoverable there. The selected dataset ID is a browser-local preference. Dataset names are labels: rename changes neither dataset identity nor its records.

Andocs keeps hosted dataset recovery material encrypted and gives it only to the trusted host. Andocs can access the contents of managed datasets; this is not a zero-knowledge design. Prototype HTML receives only `window.andocsData`, never a catalog, mnemonic, owner key, or account control. Keep dataset selection, creation, fork, rename, and sharing in the trusted host UI.

On first open, Andocs uses the selected managed dataset, applicable global default, or existing personal default. If none applies, it creates one empty personal dataset named **My data**. Historical browser-only records do not count as a selection or default. Hosted managed-dataset setup does not inspect, read, import, or delete those records; leave their original browser storage untouched. There is no hosted adoption banner or import flow. Do not seed over, replace, or merge old records. **New dataset** is empty. **Fork** copies the selected dataset's declared, permitted collections into a new identity with a required name. The source and fork then change independently. An authorized project administrator may set a global default.

Sharing pins a link to one named shared dataset. Publishing from a personal or global dataset creates a separate shared fork; choosing an existing shared dataset reuses it without copying. The author can fork current shared records back to a new personal dataset. Visitors edit only the dataset pinned to their link and get no catalog, switch, rename, or fork controls, even in a signed-in browser. Creating, forking, renaming, and sharing hosted datasets requires an Andocs connection; existing local-first record edits do not.

The CLI's anonymous local catalog is separate from the hosted account catalog. It is stored on the local machine and is not discovered on another device or implicitly merged with hosted, browser, or historical OpenDesign identities.

## Keep local preview data reachable

Use the preview URL printed by the CLI. Andocs saves one loopback preview address per canonical documents root. Without `--port`, later starts keep that address. An explicit `--port N` selects N and saves it only after the listener starts or an existing preview at N is verified. A failed start preserves the saved address and adds no port reservation. A port owned by another project in the same data directory is rejected. Earlier browser data stays at its old origin; use `--local-data-origin <old-origin>` to open it. Only one preview can write a project's dataset catalog. If the project is already open at another verified address, `--port N` exits 1 without changing saved state. Stop that preview before starting at N, or open its printed URL. A `--host` request alone keeps the saved address. If the same project is already open, reuse its printed URL. A second start opens that preview unless `--no-open` is set, then exits successfully.

Keep the same `--local-data-directory <folder-outside-documents>` on `serve`, bare preview, `hello`, `design`, and `edit-prototype` commands. Omitting a custom folder selects the default catalog. Choosing another folder does not move the old catalog or recover its named datasets.

The local data folder must be on a filesystem that supports hard links, such as NTFS on Windows or APFS on macOS. An `EPERM` hard-link error on such a drive means a permission or protection rule blocks the link, so fix the folder access before you choose another folder.

Previews with different `--local-data-directory` values do not coordinate address allocation.

The origin record lives at `<local-data-directory>/preview-origins/<project-identity>.json`. Keep it across restarts. Deleting it can choose another browser origin and hide existing browser records.

Port reservations are permanent within each data directory and cover all loopback hostnames. Andocs does not reclaim them automatically. To retire a reservation deliberately, stop the affected previews first. Remove `preview-origins/ports/<port>` from that data directory. Remove `preview-origins/<project-identity>.json` only if it points to that port. Moving the documents root changes the project identity and dataset scope. Releasing a port does not migrate datasets.

For browser records saved at an earlier known address, restart with `--local-data-origin http://127.0.0.1:<earlier-port>` and the same data directory. This selects that address without copying or merging records. If another application holds the saved address, close that application and retry. For a separate origin, agents can set `--local-data-origin <unused-loopback-url>`. The new origin does not contain the old browser records.

## Declare data

Add a `data` declaration to the nearest `prototype.json`. Leave it out for stateless prototypes.

```json
{
  "version": 1,
  "data": {
    "prototypeId": "client-database",
    "collections": [{ "name": "clients" }, { "name": "catalog", "scope": "project" }]
  }
}
```

Keep `prototypeId` stable for this prototype's data identity. Declare 1–20 unique collection names. The default `prototype` scope is private to this prototype within its trusted project and repository/config root. Use `scope: "project"` only when prototypes in the same project should share that collection; other projects remain isolated. Scope and identity are host-derived, never supplied by prototype code.

Dataset identity is host-selected. For anonymous local or legacy origins without a managed binding, the host's existing local identity rules still apply.

## Use the injected API

Prefer `type="button"` with a click handler. Forms work natively. Use `@submit.prevent` for form handlers because form submission never leaves the page.

| Signature                         | Return value                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `create(collection, value)`       | `Promise<{ id, local: "stored", sync: "unknown" }>`                                                  |
| `get(collection, id)`             | `Promise<{ id, value } \| null>`                                                                     |
| `list(collection)`                | `Promise<Array<{ id, value }>>`                                                                      |
| `update(collection, id, value)`   | `Promise<{ id, local: "stored", sync: "unknown" }>`                                                  |
| `delete(collection, id)`          | `Promise<{ id, local: "stored", sync: "unknown" }>`                                                  |
| `subscribe(collection, callback)` | `() => void`; calls `callback(records)` and optional `callback.error(error)` on subscription failure |

`collection` is a declared collection name. `id` is the string returned by the API. `value` is a plain JSON object. `update` replaces the whole value; it does not merge fields. `get` returns `null` for a missing or deleted record. `list` excludes deleted records. `update` and `delete` reject with code `not-found` when the record is unavailable in that collection. All three writes return the record ID and confirm local storage with `local: "stored"`. Their `sync` field is always `"unknown"`; it does not confirm that this write reached the relay.

Wait for `ready` before enabling CRUD. Initialization errors reject `ready` and are available as `data.error`; failed operations reject. Release subscriptions when the page is done; the host closes the data bridge when the page unloads.

```html
<button id="add" type="button">Add client</button>
<script>
  (async () => {
    const data = window.andocsData;
    const status = document.querySelector("#status");
    if (!data) {
      status.textContent = "Persistent data is unavailable.";
      return;
    }

    try {
      await data.ready;
      const unsubscribe = data.subscribe("clients", (records) => {
        renderClients(records);
      });
      document.querySelector("#add").addEventListener("click", async () => {
        try {
          const result = await data.create("clients", { name: "Ada" });
          status.textContent =
            result.local === "stored"
              ? "Saved in this browser."
              : "Could not confirm the local save.";
        } catch {
          status.textContent = "Could not save this record.";
        }
      });
      window.addEventListener("pagehide", unsubscribe, { once: true });
    } catch {
      status.textContent = "Persistent data could not be opened.";
    }
  })();
</script>
```

A write result's `local: "stored"` confirms local storage only. Its `sync` field is not a receipt for that write's remote delivery. Use `syncStatus()` and `subscribeSyncStatus()` for the owner's current transport state, and `requestSync()` to ask the host to retry. Do not show a particular record as remotely synced based on either signal. Initialization, validation, storage, subscription, and migration failures may reject or report `error`; keep the page usable where possible and show success only after local acknowledgment.

## Alpine data views

For an Alpine page, use `<template x-if="condition">` for loading, error, empty, and record views that change after an asynchronous operation. Put one root element inside each template. Browsers can suspend animation frames offscreen until the page scrolls into view; `x-if` keeps state and DOM consistent during that suspension.

```html
<div x-data="clientsPage()">
  <template x-if="!ready && !error">
    <p>Loading clients...</p>
  </template>
  <template x-if="error">
    <p x-text="error"></p>
  </template>
  <template x-if="ready && !error">
    <ul>
      <template x-for="client in clients" :key="client.id">
        <li x-text="client.value.name"></li>
      </template>
    </ul>
  </template>
</div>
<script>
  function clientsPage() {
    return {
      clients: [],
      ready: false,
      error: "",
      async init() {
        const data = window.andocsData;
        if (!data) {
          this.error = "Persistent data is unavailable.";
          return;
        }
        try {
          await data.ready;
          const listener = (records) => {
            this.clients = records;
            this.ready = true;
          };
          listener.error = () => {
            this.error = "Could not load clients.";
          };
          const unsubscribe = data.subscribe("clients", listener);
          window.addEventListener("pagehide", unsubscribe, { once: true });
        } catch {
          this.error = "Persistent data could not be opened.";
        }
      },
    };
  }
</script>
```

Check the page after a reload with saved records. Check both the loading text's computed display and the list's visible text. Repeat with the iframe below the viewport. A populated component array alone does not prove that the view updated.

## Migrate an existing stateful prototype

`window.andocsState` is deprecated for data-backed prototypes. When moving an existing prototype to `data`, preserve its HTML path and inspect the actual old save shape and every field before writing a versioned mapper. Never guess a schema, seed over the existing records, or overwrite user edits or deletes. The original legacy value is retained by the host.

Set `migrationVersion` in the data declaration, then synchronously register a pure mapper before reading or awaiting `ready`. The mapper receives the exact old value and returns rows with `collection`, stable `legacyId`, and JSON-object `value`:

```json
{
  "version": 1,
  "data": {
    "prototypeId": "client-database",
    "migrationVersion": 1,
    "collections": [{ "name": "clients" }]
  }
}
```

```html
<script>
  (async () => {
    const data = window.andocsData;
    data.registerMigration(1, (oldValue) =>
      oldValue.clients.map((client) => ({
        collection: "clients",
        legacyId: client.id,
        value: {
          name: client.name,
          company: client.company,
          email: client.email,
          status: client.status,
          notes: client.notes,
        },
      })),
    );
    // Only after registering the mapper may initialization begin.
    await data.ready;
  })();
</script>
```

This example is valid only for a legacy value confirmed to have that exact `clients` shape. Write the mapper for the prototype's verified source. If the old shape cannot be established, stop and ask for the source details. A missing or incorrect mapper, corrupt source, or failed host migration rejects `ready` and keeps writes gated. After a completed migration, later loads preserve edits and tombstones instead of replaying the old snapshot.

`registerMigration` maps a value; it cannot read `andocsState` or select the old source. The trusted host must supply a matching legacy source. Prototype code cannot choose a storage key, owner, project, source, or destination ID. CLI hosts with the trusted migration adapter use an existing server value, including `null`, and check the exact browser key only when that server value is absent. This versioned prototype schema migration is separate from account-dataset setup: hosted managed-dataset setup leaves historical browser-only values untouched and does not import them.

The trusted host manages Evolu identity and recovery. Never put a mnemonic or owner key in HTML, repository files, prompts, logs, or telemetry. Do not expose migration or relay credentials to the sandbox.

For a host release that provides only the deprecated `andocsState` API, use [legacy prototype state](prototype-state-legacy.md). Do not infer CLI commands or options for the new API from that older workflow.
