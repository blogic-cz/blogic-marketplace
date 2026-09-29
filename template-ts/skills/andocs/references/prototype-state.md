# Persistent prototype data

Use this for prototypes that keep structured records after refresh. The host injects `window.andocsData` only when that host supports the API. For CLI use, confirm the installed `serve --help` or `edit-prototype --help` exposes the required options and the actual preview exposes the needed API. Authored HTML must not import Evolu, load an Evolu CDN script, or configure a relay.

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

The Evolu owner is scoped to the browser profile and origin. A different profile or origin has a separate identity.

## Use the injected API

Wait for `ready` before enabling CRUD. Initialization errors reject `ready` and are available as `data.error`; failed operations reject. `create`, `get`, `list`, `update`, and `delete` accept only declared collection names. Records are `{ id, value }`; IDs come from the API, and `value` must be a plain JSON object. `subscribe` emits the current matching records and returns an unsubscribe function; add an `.error(error)` handler to its callback when the page must surface subscription failures. Release subscriptions when the page is done; the host closes the data bridge when the page unloads.

```html
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

`registerMigration` maps a value; it cannot read `andocsState` or select the old source. The trusted host must supply a matching legacy source. Prototype code cannot choose a storage key, owner, project, source, or destination ID. CLI hosts with the trusted migration adapter use an existing server value, including `null`, and check the exact browser key only when that server value is absent. OpenDesign explicitly uses `no-legacy-source` and a separate origin identity, so it does not automatically copy Andocs state. Keep the existing **Send** action and automatic context handoff unchanged. V1 has no data import, export, or cross-profile sharing flow.

The host manages Evolu identity and recovery. Never put a mnemonic in HTML, repository files, prompts, or logs; recovery details are revealed only through trusted settings. Do not expose migration or relay credentials to the sandbox.

For a host release that provides only the deprecated `andocsState` API, use [legacy prototype state](prototype-state-legacy.md). Do not infer CLI commands or options for the new API from that older workflow.
