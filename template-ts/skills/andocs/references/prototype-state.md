# Browser-local prototype state

Use `window.andocsState` when a prototype should restore JSON data after refresh in the same browser profile. The authenticated Andocs web host provides this API to embedded, fullscreen, and New Tab prototype views:

```js
const saved = await window.andocsState.load(); // JSON value or null
await window.andocsState.save({ selectedTab: "overview" });
```

The host stores data under the authenticated user, project, repository, and resolved prototype path. Prototype code does not choose the storage key. This is browser-local storage: it does not sync to other browsers or devices. CLI and standalone previews without the authenticated host have no bridge, so their state resets on refresh.

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
        status.textContent = "Saved in this browser.";
      } catch {
        canSave = false;
        status.textContent = "Could not save state.";
      }
    });
  })();
</script>
```

The iframe remains sandboxed. Use this API for JSON persistence, and keep sensitive or shared data in an authenticated server API when that is actually required.
