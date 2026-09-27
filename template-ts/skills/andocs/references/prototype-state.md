# Prototype state

Use `window.andocsState` when a prototype should restore JSON data after refresh. The authenticated Andocs web app and local Andocs CLI provide this API to embedded, fullscreen, and New Tab prototype views:

```js
const saved = await window.andocsState.load(); // JSON value or null
await window.andocsState.save({ selectedTab: "overview" });
```

The cloud web app keeps state in browser `localStorage`, scoped by authenticated user, project, repository, and resolved prototype path. It survives reloads in that browser; it does not sync to another browser. A loopback local CLI preview stores state durably by the running Andocs server outside the documentation and Git trees. Its key combines the canonical documentation root with the resolved repository-relative HTML path. During a live loopback handoff, Andocs and OpenDesign use that same identity. A CLI server accessed over a nonloopback network address keeps browser-local `localStorage` state instead. Prototype code does not choose either storage key. Cloud and CLI state remain separate.

Only a live handoff from a running Andocs server provides the shared Andocs/OpenDesign state bridge. A standalone `andocs edit-prototype` launch has no bridge; state cannot be read or persisted there. If the server restarts, reopen the live handoff so Andocs refreshes OpenDesign's runtime capability; the stored data remains durable. OpenDesign receives an ignored generated JavaScript sidecar in its project runtime directory. The canonical HTML contains only a relative script reference in Andocs' managed bootstrap, not the per-server, per-prototype capability. Treat the sidecar as exposed to anyone who can read the OpenDesign project source. Data requests require that prototype capability and a loopback peer.

When the loopback CLI's durable store has no value for a prototype, it may import that browser's existing localStorage value once. Only a missing server record permits this import; an existing record is authoritative even when its value is JSON `null`. A failed state API request remains an error and must not trigger a localStorage fallback. Later browser-local values never overwrite durable CLI state. Do not assume CLI state is available while its server is stopped.

Opening a raw HTML file directly, outside Andocs or the managed OpenDesign handoff, has no state bridge.

Save after each state-changing action when changes must survive refresh without a separate Save button. Show a saved status only after `await api.save(value)` resolves. The iframe allows scripts but not native form submission: use a `type="button"` control with a click handler for form actions.

Check for the API and handle rejected calls. Loading can fail if storage is unavailable or contains invalid JSON; saving can fail for unavailable storage, quota limits, or a non-JSON value. Both calls can also time out if the host does not respond. Keep the prototype usable when persistence is unavailable:

```html
<p>Count: <output id="count">0</output></p>
<button id="increment">Add one</button>
<p id="status"></p>
<script>
  (async () => {
    const api = window.andocsState;
    const output = document.querySelector("#count");
    const status = document.querySelector("#status");
    let count = 0;
    let canSave = Boolean(api);

    if (api) {
      try {
        const saved = await api.load();
        if (Number.isInteger(saved?.count)) count = saved.count;
      } catch {
        canSave = false;
        status.textContent = "Could not load saved state.";
      }
    } else {
      status.textContent = "Changes last until this page closes.";
    }
    output.textContent = String(count);

    document.querySelector("#increment").addEventListener("click", async () => {
      count += 1;
      output.textContent = String(count);
      if (!canSave) return;
      try {
        await api.save({ count });
        status.textContent = "Saved.";
      } catch {
        canSave = false;
        status.textContent = "Could not save state.";
      }
    });
  })();
</script>
```

The iframe remains sandboxed. Use this API for prototype JSON persistence; keep sensitive or production data in an authenticated server API.
