# Andocs prototypes

Use a `prototype` block for a repository HTML page embedded in a document. Put the page under a `prototype.json` root; that marker makes Andocs sync the HTML files. Use the [published schema](https://andocs.blogic.cz/schemas/prototype-schema.json) for editor validation:

```json
{
  "$schema": "https://andocs.blogic.cz/schemas/prototype-schema.json",
  "version": 1
}
```

## Files and embedding

```text
prototypes/
  prototype.json
  shared.css            # Optional styles
  shared.js             # Optional scripts
  pages/
    dashboard.html
  crm/
    prototype.json      # Optional nested prototype
    shared.css
    pages/
      detail.html
```

Reference an HTML page by repository-relative path. `title=` and `height=` are optional:

````markdown
```prototype path=prototypes/pages/dashboard.html title="Dashboard" height=800

```
````

| Parameter | Behavior                                                    |
| --------- | ----------------------------------------------------------- |
| `path=`   | Required repository-relative HTML path                      |
| `title=`  | Toolbar title; otherwise `<title>` from HTML, then the path |
| `height=` | Initial iframe height, 200–800 px; default 600 px           |

To list HTML outputs without embedding them, use a relative Markdown link such as `[Report](./prototypes/pages/dashboard.html)`. It opens a standalone page in a new tab. The HTML file must still be under a `prototype.json` root.

## Runtime and shared assets

- The iframe uses `sandbox="allow-scripts"`; prototype code cannot directly access host storage, cookies, or DOM.
- Andocs injects Alpine.js, Tailwind CSS v4, and light-theme design tokens. Use ordinary `<script>` tags; module scripts and relative script URLs do not work in the sandboxed page.
- `shared.css` files cascade from the outermost `prototype.json` root to the nearest nested root. A nested root can add or override parent styles.
- The nearest root's `shared.js` is injected in `<head>` before the page body. Put reusable Custom Element definitions there.
- The web app's Open in New Tab action uses an authenticated `/app/prototype` wrapper. The CLI uses a blob URL.

For current CDN URLs, exact design tokens, dimensions, and file types, fetch the [live reference](https://andocs.blogic.cz/llms-andocs-skill). The Tailwind browser build is v4 (`@tailwindcss/browser`), so use v4 utilities.

If the page needs data after refresh, read [browser-local state](prototype-state.md). For Custom Elements or Shadow DOM, read [Web Components](web-components.md).

## Page patterns

Use Alpine.js state for navigation inside a page, for example `x-data="{ page: 'list' }"` with `<template x-if="page === 'list'">`. For a minimal page:

```html
<title>Counter</title>
<div x-data="{ count: 0 }">
  <output x-text="count"></output>
  <button @click="count++">Increment</button>
</div>
```

This counter resets on refresh. Use `window.andocsState` when it must persist.
