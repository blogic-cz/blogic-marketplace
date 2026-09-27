# Edit an Andocs prototype in OpenDesign

Use this workflow only when the user asks to continue prototype editing in OpenDesign. Keep Andocs as the source of truth: OpenDesign must open the prototype in its actual Git repository, and edits must land in the existing source files.

## Handoff

- Identify the documentation root and exact HTML page selected by the `prototype` block. Start the local Andocs preview for that root when the user requests the handoff. Confirm OpenDesign's local web app and daemon are running; Andocs does not install OpenDesign for you. macOS `/usr/bin/od` is an unrelated system utility.
- In the prototype toolbar, choose **Edit in OpenDesign** and provide the original task prompt when asked. Reuse the task, Andocs constraints, and relevant decisions or next steps already explicit in the current conversation; do not make the user repeat them. If the UI asks the user to paste the prompt, provide concise copyable text. Andocs opens the matching project and file in OpenDesign. It selects the enclosing Git repository as the project, reuses an existing project and conversation for that repository, and selects the HTML page. If there is no Git root, the configured documents folder is used.
- Review the handoff in OpenDesign, add any user-provided instruction, then send it. Andocs does not read an earlier agent transcript or submit the model run for you. Add a session reference only when it is known and readable; do not invent one, assume transcript access, or scrape unrelated history. Keep unrelated transcripts and secrets out of the handoff.
- Edit and save the existing repository files. The original HTML remains canonical. Keep its `prototype.json` entry and shared CSS/JavaScript dependencies in view and reuse them.

For CLI use, run `andocs edit-prototype <markdown-file> --prototype <prototype-html> --prompt <original-task>`. Build `--context <decisions-and-next-steps>` from relevant explicit information already in the current conversation; use `--session-ref <existing-session-reference>` only when it is known and readable. Both this command and `andocs serve` accept `--opendesign-cli <path>`, `--opendesign-daemon-url <loopback-url>`, and `--opendesign-url <loopback-url>` for local OpenDesign configuration.

On first open, Andocs adds a marked compatibility bootstrap to the canonical HTML. It links the existing shared CSS/JS, adds the same Tailwind and Alpine CDN URLs used by Andocs, and supplies Andocs' light-theme tokens so OpenDesign previews the prototype with its dependencies. Andocs removes only this marked block before its own preview injection. Preserve the block and shared files. The Andocs CLI watcher reloads prototypes after HTML, CSS, JavaScript, or `prototype.json` changes; use that live preview to review the saved result.

Browser-local prototype state uses Andocs' sandbox bridge and is not shared with OpenDesign.

Do not duplicate shared assets into the HTML, change unrelated files, or push/sync a separate deployed OpenDesign project as part of this local workflow. Follow [prototype authoring](prototypes.md) and [browser-local state](prototype-state.md) when those details apply.
