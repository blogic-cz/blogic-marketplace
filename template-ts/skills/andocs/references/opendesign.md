# Edit an Andocs prototype in OpenDesign

Use this workflow only when the user asks to continue prototype editing in OpenDesign. Keep Andocs as the source of truth: OpenDesign must open the prototype in its actual Git repository, and edits must land in the existing source files.

## Handoff

- Identify the documentation root and exact HTML page selected by the `prototype` block. Start the local Andocs preview for that root when the user requests the handoff. Confirm OpenDesign's local web app and daemon are running; Andocs does not install OpenDesign for you. macOS `/usr/bin/od` is an unrelated system utility.
- In the prototype toolbar, choose **OpenDesign**. Andocs opens the matching project and file with its custom instructions; it does not ask for a task prompt. If the current conversation already contains an explicit original prompt or relevant decisions and next steps, pass them through the CLI options below. Without a new prompt, Andocs preserves any existing pending draft and opens the selected file. An explicit new prompt does not overwrite another unsent prompt. Andocs selects the enclosing Git repository as the project, reuses an existing project and conversation for that repository, and selects the HTML page. If there is no Git root, the configured documents folder is used.
- Review the handoff in OpenDesign and send it when ready. Andocs does not read an earlier agent transcript or submit the model run for you. Add a session reference only when it is known and readable; do not invent one, assume transcript access, or scrape unrelated history. Keep unrelated transcripts and secrets out of the handoff.
- Before editing, read the canonical Andocs skill at the absolute path supplied in OpenDesign's custom instructions, then load its relevant references.
- Edit and save the existing repository files. The original HTML remains canonical. Keep its `prototype.json` entry and shared CSS/JavaScript dependencies in view and reuse them.

The hosted web application does not support direct source-file handoff of account-managed prototype datasets to OpenDesign. For a data-backed OpenDesign handoff, use the supported CLI flow below, which uses the CLI's anonymous local dataset catalog.

For CLI use, run `andocs edit-prototype <markdown-file> --prototype <prototype-html> [--prompt <original-task>]`. `--prompt` is optional; pass the original task when it is already available. Build `--context <decisions-and-next-steps>` from relevant explicit information already in the current conversation; use `--session-ref <existing-session-reference>` only when it is known and readable. Both this command and `andocs serve` accept `--opendesign-cli <path>`, `--opendesign-daemon-url <loopback-url>`, and `--opendesign-url <loopback-url>` for local OpenDesign configuration.

On handoff, Andocs prepares discovered Andocs prototype pages for OpenDesign, including pages reached through in-app file navigation. It adds an idempotent, marked bootstrap to the canonical HTML and uses the original shared CSS/JS assets, the same Tailwind and Alpine CDN URLs as Andocs, and Andocs' light-theme tokens. Andocs removes only this marked block before its own preview injection. Preserve the block and shared files. The Andocs CLI watcher reloads prototypes after HTML, CSS, JavaScript, or `prototype.json` changes; use that live preview to review the saved result.

Read [prototype state](prototype-state.md) for data-backed prototypes and migration. For a host that still provides only `window.andocsState`, read [legacy prototype state](prototype-state-legacy.md) for its live-handoff and standalone behavior.

## Data-backed OpenDesign handoff from the CLI

The CLI dataset catalog is local to that machine and does not require an Andocs account. It is separate from the hosted account catalog and is not synchronized or merged with hosted, browser-origin, or historical OpenDesign identities. In the CLI prototype host, choose an existing local dataset, create a named empty one, fork the current dataset, or rename the selected dataset. These actions change the CLI's local catalog only.

The **OpenDesign** toolbar action requires a selected CLI dataset before opening a data-backed page. The explicit handoff captures that dataset ID; the trusted CLI host resolves it from its local catalog and binds the OpenDesign data host to the same identity. Dataset keys stay in trusted host processes and never enter prototype HTML, Git, or the handoff prompt.

The CLI handoff captures the selected local dataset when **OpenDesign** is launched. A later change to the CLI selection does not change the open OpenDesign view, and saving native source files does not change its dataset. A new explicit CLI handoff replaces the current OpenDesign binding with the newly selected CLI dataset.

OpenDesign's header has a **Manage dataset** control: its button shows the selected dataset's name, or **Choose dataset** when none is bound. Use this trusted control to select a dataset from the permitted local catalog, create a named empty dataset, fork the current prototype data, or rename the selection. Selecting a dataset reloads the editor and revokes the previous binding; this OpenDesign selection does not follow or update later CLI selections. If no valid dataset is bound, select one through **Manage dataset** or reopen from the CLI with a valid selection. The host never falls back to an origin identity.

Use this flow only when the installed Andocs CLI's `serve --help` or `edit-prototype --help` exposes the options below. Confirm the running preview exposes every capability the prototype needs. For a migration, check that `window.andocsData.registerMigration` is a function before enabling it; otherwise keep writes gated and preserve the legacy value.

Both CLI commands accept `--opendesign-cli`, `--opendesign-daemon-url`, `--opendesign-url`, `--opendesign-data-port`, and `--evolu-relay-url`. Declared data requires an explicit validated relay URL (`wss:` or loopback-only `ws:`); never derive it from HTML, `prototype.json`, or a prototype request. The data host uses fixed loopback `127.0.0.1:7457` by default. An occupied port fails; there is no fallback port. Keep one foreground CLI process alive while using the handoff: `edit-prototype` remains active until Ctrl+C, and `serve` owns the host for its server lifetime. Shutdown revokes the host.

The selected OpenDesign CLI must be the trusted local `apps/daemon/bin/od.mjs` from Git HEAD `89e64d813bb1c7a11519b3f668f011f7017637d7`, with clean tracked source except generated `apps/web/next-env.d.ts`. This source pin does not verify ignored build output, dependencies, or a separately running daemon. If the selected source or required runtime capabilities cannot be verified, keep the page static and report that the data handoff is unavailable.

The data host grants only the selected page and pages discovered through Markdown with a valid contained `prototype.json`. A configless page stays static; invalid config fails closed instead of falling back to stateless. Config, Markdown registration, or root changes revoke the current registrations; start a fresh handoff after those changes.

Do not duplicate shared assets into the HTML, change unrelated files, or push/sync a separate deployed OpenDesign project as part of this local workflow. Follow [prototype authoring](prototypes.md) and [prototype state](prototype-state.md) when those details apply.
