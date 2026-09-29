# Edit an Andocs prototype in OpenDesign

Use this workflow only when the user asks to continue prototype editing in OpenDesign. Keep Andocs as the source of truth: OpenDesign must open the prototype in its actual Git repository, and edits must land in the existing source files.

## Handoff

- Identify the documentation root and exact HTML page selected by the `prototype` block. Start the local Andocs preview for that root when the user requests the handoff. Confirm OpenDesign's local web app and daemon are running; Andocs does not install OpenDesign for you. macOS `/usr/bin/od` is an unrelated system utility.
- In the prototype toolbar, choose **Edit in OpenDesign**. Andocs opens the matching project and file with its custom instructions; it does not ask for a task prompt. If the current conversation already contains an explicit original prompt or relevant decisions and next steps, pass them through the CLI options below. Without a new prompt, Andocs preserves any existing pending draft and opens the selected file. An explicit new prompt does not overwrite another unsent prompt. Andocs selects the enclosing Git repository as the project, reuses an existing project and conversation for that repository, and selects the HTML page. If there is no Git root, the configured documents folder is used.
- Review the handoff in OpenDesign and send it when ready. Andocs does not read an earlier agent transcript or submit the model run for you. Add a session reference only when it is known and readable; do not invent one, assume transcript access, or scrape unrelated history. Keep unrelated transcripts and secrets out of the handoff.
- Before editing, read the canonical Andocs skill at the absolute path supplied in OpenDesign's custom instructions, then load its relevant references.
- Edit and save the existing repository files. The original HTML remains canonical. Keep its `prototype.json` entry and shared CSS/JavaScript dependencies in view and reuse them.

For CLI use, run `andocs edit-prototype <markdown-file> --prototype <prototype-html> [--prompt <original-task>]`. `--prompt` is optional; pass the original task when it is already available. Build `--context <decisions-and-next-steps>` from relevant explicit information already in the current conversation; use `--session-ref <existing-session-reference>` only when it is known and readable. Both this command and `andocs serve` accept `--opendesign-cli <path>`, `--opendesign-daemon-url <loopback-url>`, and `--opendesign-url <loopback-url>` for local OpenDesign configuration.

On handoff, Andocs prepares discovered Andocs prototype pages for OpenDesign, including pages reached through in-app file navigation. It adds an idempotent, marked bootstrap to the canonical HTML and uses the original shared CSS/JS assets, the same Tailwind and Alpine CDN URLs as Andocs, and Andocs' light-theme tokens. Andocs removes only this marked block before its own preview injection. Preserve the block and shared files. The Andocs CLI watcher reloads prototypes after HTML, CSS, JavaScript, or `prototype.json` changes; use that live preview to review the saved result.

Read [prototype state](prototype-state.md) for data-backed prototypes and migration. For a host that still provides only `window.andocsState`, read [legacy prototype state](prototype-state-legacy.md) for its live-handoff and standalone behavior.

## Data-backed OpenDesign handoff from the CLI

Use this flow only when the installed Andocs CLI's `serve --help` or `edit-prototype --help` exposes the options below. Confirm the running preview exposes every capability the prototype needs. For a migration, check that `window.andocsData.registerMigration` is a function before enabling it; otherwise keep writes gated and preserve the legacy value.

Both CLI commands accept `--opendesign-cli`, `--opendesign-daemon-url`, `--opendesign-url`, `--opendesign-data-port`, and `--evolu-relay-url`. Declared data requires an explicit validated relay URL (`wss:` or loopback-only `ws:`); never derive it from HTML, `prototype.json`, or a prototype request. The data host uses fixed loopback `127.0.0.1:7457` by default. An occupied port fails; there is no fallback port. Keep one foreground CLI process alive while using the handoff: `edit-prototype` remains active until Ctrl+C, and `serve` owns the host for its server lifetime. Shutdown revokes the host.

The selected OpenDesign CLI must be the trusted local `apps/daemon/bin/od.mjs` from Git HEAD `89e64d813bb1c7a11519b3f668f011f7017637d7`, with clean tracked source except generated `apps/web/next-env.d.ts`. This source pin does not verify ignored build output, dependencies, or a separately running daemon. If the selected source or required runtime capabilities cannot be verified, keep the page static and report that the data handoff is unavailable.

The data host grants only the selected page and pages discovered through Markdown with a valid contained `prototype.json`. A configless page stays static; invalid config fails closed instead of falling back to stateless. Config, Markdown registration, or root changes revoke the current registrations; start a fresh handoff after those changes.

Do not duplicate shared assets into the HTML, change unrelated files, or push/sync a separate deployed OpenDesign project as part of this local workflow. Follow [prototype authoring](prototypes.md) and [prototype state](prototype-state.md) when those details apply.
