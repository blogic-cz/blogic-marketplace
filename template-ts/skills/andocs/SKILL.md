---
name: andocs
description: Introduce or onboard Andocs, or author its Markdown documents (diagrams, math) and HTML prototypes with data that survives refresh, inside or outside OpenDesign.
---

<!-- Generated from blogic-cz/andocs .agents/skills/andocs; edit it there. -->

# Andocs

When a terminal agent introduces or onboards Andocs, first read [the introduction guide](references/introduction.md) and complete its Git and Bun checks. Then run `bunx andocs@latest agent --path <folder> --json`. Follow its JSON `instructions` in order. Run `agent` again when an instruction asks for it. The guide also covers plain words, the path from a need to an app, and account commands.

For a direct local preview of an existing docs folder, follow [the introduction guide](references/introduction.md).

When the user asks to install this skill, ask once in plain words, naming folders rather than projects: "Should I install it only in this folder (the default), or for all folders on this computer?" Do not write outside the current folder before the user chooses. Check the install command's exit code and report a nonzero result as a failure.

For a new project, read [the introduction guide](references/introduction.md) for the `docs/` layout before writing files. For an existing project, find the documentation root from the request or repository before editing. If multiple roots remain plausible, ask which one to use. Follow the repository's language and preview rules.

Read the reference that matches the work:

- [Publish](references/publish.md) — read when the user wants to share, publish, or put the project on Andocs/GitHub.
- [Markdown rendering](references/markdown.md) — read when writing diagrams, math, interactive `html-preview` blocks, or Andocs-specific links.
- [Prototypes](references/prototypes.md) — read when creating or editing `prototype.json`, HTML pages, navigation between pages, relative static files, shared assets, or `prototype` blocks.
- [Review status and releases](references/prototype-releases.md) — read when a prototype uses screen review badges, `releases.json`, or `<id>@<release>.html` screen variants.
- [Prototype state](references/prototype-state.md) — read whenever a prototype has records the user adds, edits, or deletes (lists, forms, CRUD screens, trackers, dashboards with entries), or an existing stateful prototype needs migration. Andocs data is the default home for such records; use in-memory arrays only for screens that display data the user never changes.
- [Web Components](references/web-components.md) — read when a prototype uses Custom Elements or Shadow DOM.
- [OpenDesign handoff](references/opendesign.md) — read when the user asks to edit an Andocs prototype in OpenDesign or asks to prepare OpenDesign from source.

For command options, read `bunx andocs@latest <command> --help`.

Before finishing, check that referenced files exist, fenced blocks use the right language, and any prototype state handles unavailable storage.
