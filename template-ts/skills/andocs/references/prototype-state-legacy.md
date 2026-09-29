# Legacy prototype state

Use this reference only to inspect data created by an existing prototype on a host that provides `window.andocsState`. Do not author new stateful prototypes with this deprecated API; use [persistent prototype data](prototype-state.md).

The old API exposed one JSON value per prototype path to embedded, fullscreen, and New Tab prototype views. Read an existing value only to establish its exact shape before migration; do not use it as a new persistence design:

```js
const legacyValue = await window.andocsState.load(); // JSON value or null
// Inspect the actual fields in memory; do not log or rewrite the value.
```

The cloud web app keeps state in browser `localStorage`, scoped by authenticated user, project, repository, and resolved prototype path. It survives reloads in that browser; it does not sync to another browser. A loopback local CLI preview stores state durably by the running Andocs server outside the documentation and Git trees. Its key combines the canonical documentation root with the resolved repository-relative HTML path. During a live loopback handoff, Andocs and OpenDesign use that same identity. A CLI server accessed over a nonloopback network address keeps browser-local `localStorage` state instead. Prototype code does not choose either storage key. Cloud and CLI state remain separate.

Only a live handoff from a running Andocs server provides the shared Andocs/OpenDesign state bridge. A standalone `andocs edit-prototype` launch has no bridge; state cannot be read or persisted there. If the server restarts, reopen the live handoff so Andocs refreshes OpenDesign's runtime capability; the stored data remains durable. OpenDesign receives an ignored generated JavaScript sidecar in its project runtime directory. The canonical HTML contains only a relative script reference in Andocs' managed bootstrap, not the per-server, per-prototype capability. Treat the sidecar as exposed to anyone who can read the OpenDesign project source. Data requests require that prototype capability and a loopback peer.

When the loopback CLI's durable store has no value for a prototype, it may import that browser's existing localStorage value once. Only a missing server record permits this import; an existing record is authoritative even when its value is JSON `null`. A failed state API request remains an error and must not trigger a localStorage fallback. Later browser-local values never overwrite durable CLI state. Do not assume CLI state is available while its server is stopped.

Opening a raw HTML file directly, outside Andocs or the managed OpenDesign handoff, has no state bridge.

To migrate, preserve the original HTML path and source value, verify the actual fields, then use the new data API only on a host that supplies the corresponding trusted migration source. A host without that source must keep writes gated. Never log or copy sensitive legacy values into prompts or repository files.
