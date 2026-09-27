---
name: andocs
description: This skill should be used when authoring Andocs documentation or HTML prototypes, including markdown rendering, diagrams, math, html-preview, prototype.json, shared assets, prototype state, local CLI persistence, screen review status and release versions, or editing a prototype through OpenDesign.
---

# Andocs authoring

Find the documentation root from the request or repository before editing. If multiple roots remain plausible, ask which one to use. Follow the repository's language and preview rules.

Read the reference that matches the work:

- [Markdown rendering](references/markdown.md) — read when writing diagrams, math, interactive `html-preview` blocks, or Andocs-specific links.
- [Prototypes](references/prototypes.md) — read when creating or editing `prototype.json`, HTML pages, shared assets, or `prototype` blocks.
- [Review status and releases](references/prototype-releases.md) — read when a prototype uses screen review badges, `releases.json`, or `<id>@<release>.html` screen variants.
- [Prototype state](references/prototype-state.md) — read when data must survive refresh or local CLI state is used by OpenDesign.
- [Web Components](references/web-components.md) — read when a prototype uses Custom Elements or Shadow DOM.
- [OpenDesign handoff](references/opendesign.md) — read when the user asks to edit an Andocs prototype in OpenDesign.

For a requested local preview, first identify the documentation root and check that Bun is available. Use `bunx andocs@latest --path <docs-root>` only when starting a server is authorized by the user and the repository instructions. The CLI help is `bunx andocs@latest -h`.

Before finishing, check that referenced files exist, fenced blocks use the right language, and any prototype state handles unavailable storage. The public [Andocs demo](https://github.com/blogic-cz/andocs-demo) shows a complete prototype repository.
