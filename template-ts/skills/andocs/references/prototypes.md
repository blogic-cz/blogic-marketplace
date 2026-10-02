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
- Andocs injects Alpine.js, Tailwind CSS v4, and light-theme design tokens. Use classic scripts or local module scripts loaded through the prototype asset URLs. Bare package imports still need a browser-compatible URL or a build step.
- `shared.css` files cascade from the outermost `prototype.json` root to the nearest nested root. A nested root can add or override parent styles.
- The nearest root's `shared.js` is injected in `<head>` before the page body. Put reusable Custom Element definitions there.
- Open in New Tab uses the authenticated host wrapper in the web app and a standalone prototype page in the CLI.

For current CDN URLs, exact design tokens, dimensions, and file types, fetch the [live reference](https://andocs.blogic.cz/llms-andocs-skill). The Tailwind browser build is v4 (`@tailwindcss/browser`), so use v4 utilities.

If the page needs data after refresh, read [prototype state](prototype-state.md). For Custom Elements or Shadow DOM, read [Web Components](web-components.md). For screen review badges and release variants, read [review status and releases](prototype-releases.md).

Stateless prototypes need no data declaration. A data-backed prototype declares its identity and allowed collections in the nearest `prototype.json`; read [prototype state](prototype-state.md) for the runtime API, scope rules, and migrations. Data support depends on the installed Andocs host version.

## Navigation and relative static files

In hosted project previews and CLI previews that include the navigation API, use
`window.andocs.openPrototype()` with a repository-root HTML path. Andocs keeps the
repository context and handles the host URL parameters:

```html
<button onclick="window.andocs.openPrototype('prototypes/pages/dashboard.html')">Dashboard</button>
```

For ordinary page links, use HTML anchors. Relative paths resolve from the actual
HTML directory; a leading slash selects the repository root:

```html
<a href="./detail.html">Detail</a>
<a href="../crm/pages/detail.html">CRM detail</a>
<a href="/prototypes/pages/dashboard.html">Dashboard</a>
```

HTML navigation preserves query strings and fragments. Same-page fragment links
scroll within the current preview. External links keep their browser behavior.
Let the host build its navigation URLs rather than constructing `/app/prototype`
links in the HTML. The API and relative asset support are available in project
and CLI previews; immutable public-share snapshots have a separate runtime.

Keep static files beside the page or in a nearby directory:

```html
<img src="./logo.svg" alt="Logo" />
<link rel="stylesheet" href="./styles.css" />
<script src="./helpers.js"></script>
<script type="module" src="./components.js"></script>
```

Andocs serves GIF, JPEG, PNG, SVG, WebP, CSS, and JavaScript resources. External CSS
and module imports resolve their own relative dependencies from their file URLs.
Keep prototype resources under a `prototype.json` root so the hosted app syncs
them. Local CLI previews warn when the marker is missing; a working local preview
alone does not confirm that the hosted app can load the page. These capabilities
depend on the installed host or CLI version.

## Page patterns

Use Alpine.js state for navigation inside a page, for example `x-data="{ page: 'list' }"` with `<template x-if="page === 'list'">`. For a minimal page:

```html
<title>Counter</title>
<div x-data="{ count: 0 }">
  <output x-text="count"></output>
  <button @click="count++">Increment</button>
</div>
```

This counter resets on refresh. Use [persistent prototype data](prototype-state.md) when records must survive refresh.
