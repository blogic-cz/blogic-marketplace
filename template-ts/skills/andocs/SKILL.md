---
name: andocs
description: This skill should be used when starting a local Andocs demo or preview, introducing or presenting Andocs, onboarding a new user, or authoring Andocs documentation and HTML prototypes. Trigger phrases include “start the Andocs demo,” “introduce Andocs,” “představení Andocs,” “rozběhni andocs demo,” “predstavenie Andocs,” and “spusti Andocs demo.” Use it for markdown rendering, diagrams, math, html-preview, prototype.json, shared assets, managed prototype datasets and persistent data, local CLI state, screen review status and release versions, or editing a prototype through OpenDesign.
---

# Andocs authoring

For an Andocs introduction or a local demo, follow [the introduction flow](references/introduction.md). Start a local preview with the published CLI command in that guide.

When the user asks to install this skill, ask once in plain words, naming folders rather than projects: "Should I install it only in this folder (the default), or for all folders on this computer?" Do not write outside the current folder before the user chooses. Check the install command's exit code and report a nonzero result as a failure.

For other editing tasks, find the documentation root from the request or repository before editing. If multiple roots remain plausible, ask which one to use. Follow the repository's language and preview rules.

Read the reference that matches the work:

- [Markdown rendering](references/markdown.md) — read when writing diagrams, math, interactive `html-preview` blocks, or Andocs-specific links.
- [Prototypes](references/prototypes.md) — read when creating or editing `prototype.json`, HTML pages, navigation between pages, relative static files, shared assets, or `prototype` blocks.
- [Review status and releases](references/prototype-releases.md) — read when a prototype uses screen review badges, `releases.json`, or `<id>@<release>.html` screen variants.
- [Prototype state](references/prototype-state.md) — read when prototype data must survive refresh or an existing stateful prototype needs migration.
- [Web Components](references/web-components.md) — read when a prototype uses Custom Elements or Shadow DOM.
- [OpenDesign handoff](references/opendesign.md) — read when the user asks to edit an Andocs prototype in OpenDesign or asks to prepare OpenDesign from source.

For a requested local preview, identify the folder and check that Bun is available. Run `bunx andocs@latest --path .` from that folder. This opens the idea screen in an empty folder and opens documents when the folder contains them. Do not create files or folders before starting Andocs. The CLI help is `bunx andocs@latest -h`.

Before finishing, check that referenced files exist, fenced blocks use the right language, and any prototype state handles unavailable storage. The public [Andocs demo](https://github.com/blogic-cz/andocs-demo) shows a complete prototype repository.
