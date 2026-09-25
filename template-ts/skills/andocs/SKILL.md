---
name: andocs
description: This skill should be used when authoring Andocs documentation or HTML prototypes, including markdown rendering, diagrams, math, html-preview, prototype.json, shared assets, browser-local prototype state, and screen review status and release versions.
---

# Andocs authoring

Find the documentation root from the request or repository before editing. If multiple roots remain plausible, ask which one to use. Follow the repository's language and preview rules.

Read the reference that matches the work:

- [Markdown rendering](references/markdown.md) — read when writing diagrams, math, interactive `html-preview` blocks, or Andocs-specific links.
- [Prototypes](references/prototypes.md) — read when creating or editing `prototype.json`, HTML pages, shared assets, or `prototype` blocks.
- [Review status and releases](references/prototype-releases.md) — read when a prototype uses screen review badges, `releases.json`, or `<id>@<release>.html` screen variants.
- [Browser-local state](references/prototype-state.md) — read when prototype data must survive refresh in the same browser.
- [Web Components](references/web-components.md) — read when a prototype uses Custom Elements or Shadow DOM.

For a requested local preview, first identify the documentation root and check that Bun is available. Use `bunx andocs@latest --path <docs-root>` only when starting a server is authorized by the user and the repository instructions. The CLI help is `bunx andocs@latest -h`.

Before finishing, check that referenced files exist, fenced blocks use the right language, and any prototype state handles unavailable storage. The public [Andocs demo](https://github.com/blogic-cz/andocs-demo) shows a complete prototype repository.
