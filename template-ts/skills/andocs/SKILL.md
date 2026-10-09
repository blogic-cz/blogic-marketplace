---
name: andocs
description: This skill should be used when starting a local Andocs demo or preview, introducing or presenting Andocs, onboarding a new user, or authoring Andocs documentation and HTML prototypes. Trigger phrases include “start the Andocs demo,” “introduce Andocs,” “představení Andocs,” “rozběhni andocs demo,” “predstavenie Andocs,” and “spusti Andocs demo.” Use it for markdown rendering, diagrams, math, html-preview, prototype.json, shared assets, managed prototype datasets and persistent data, local CLI state, screen review status and release versions, or editing a prototype through OpenDesign.
---

# Andocs authoring

For an Andocs introduction or a local demo, follow [the introduction flow](references/introduction.md). Start a local preview with the published CLI command in that guide.

Find the documentation root from the request or repository before editing. If multiple roots remain plausible, ask which one to use. Follow the repository's language and preview rules.

Read the reference that matches the work:

- [Markdown rendering](references/markdown.md) — read when writing diagrams, math, interactive `html-preview` blocks, or Andocs-specific links.
- [Prototypes](references/prototypes.md) — read when creating or editing `prototype.json`, HTML pages, navigation between pages, relative static files, shared assets, or `prototype` blocks.
- [Review status and releases](references/prototype-releases.md) — read when a prototype uses screen review badges, `releases.json`, or `<id>@<release>.html` screen variants.
- [Prototype state](references/prototype-state.md) — read when prototype data must survive refresh or an existing stateful prototype needs migration.
- [Web Components](references/web-components.md) — read when a prototype uses Custom Elements or Shadow DOM.
- [OpenDesign handoff](references/opendesign.md) — read when the user asks to edit an Andocs prototype in OpenDesign or asks to prepare OpenDesign from source.

For a requested local preview, identify the documentation root and check that Bun is available. Use `bunx andocs@latest serve --path <docs-root>` only when starting a server is authorized by the user and the repository instructions. The CLI help is `bunx andocs@latest -h`.

Before finishing, check that referenced files exist, fenced blocks use the right language, and any prototype state handles unavailable storage. The public [Andocs demo](https://github.com/blogic-cz/andocs-demo) shows a complete prototype repository.
