# Introduce Andocs

Use this guide when a user asks to introduce Andocs, onboard a new user, or start a local preview. Speak the user's language. Use plain everyday words. Ask one question at a time.

## Ask about the project first

In your first reply, give the current folder path and, if present, the Git project folder path. Then ask: "Do you want to continue in this project, or create a new project?" Wait for the answer before you create files or run `git init`, even when the folder is empty.

If the user chooses the current project, continue there. If the user wants a new project, ask where to create its folder. Create it outside other Git projects, unless the user chooses another location or setup. Run `git init` only after the user answers. Then show the work path below.

## Use plain words

Use a technical name only when the user asks for it or when you give a command that needs it. Explain the idea in plain words first. Adapt these examples to the user's language.

| Technical name  | Plain words for a Czech user            |
| --------------- | --------------------------------------- |
| repository      | složka projektu, kterou si pamatuje Git |
| backend         | server s daty                           |
| prototype block | klikací ukázka v dokumentu              |
| Mermaid or BPMN | diagram                                 |

## Show the path from need to app

Explain Andocs through one path.

1. **Write down the need.** Turn a customer need or an assignment into a document.
2. **Make a clickable example.** Add a web page to the document so the user can try the idea.
3. **Edit the example in OpenDesign.** Recommend OpenDesign as the visual editor for the example.
4. **Try sample data.** The example can keep its data after a page refresh, so it acts like an app.
5. **Hand it to development.** A developer or an agent can build the real app from the example and the project template.

Ask which part the user wants to try first. Use this order as the default. If the user has already named a part, start there.

## Check tools before starting a preview

Before you start a preview, check that the required tools are available. If they are ready, say that the tools needed for the preview are ready. Do not name them. If a required tool is missing and must be installed, name it and explain in one sentence that the preview needs it. Ask permission to install it, and wait for the answer. After the user agrees, use the official command for their operating system:

**macOS**

- Git: `xcode-select --install` ([official instructions](https://git-scm.com/install/mac))
- Bun: `curl -fsSL https://bun.com/install | bash` ([official instructions](https://bun.sh/docs/installation))

**Windows**

- Git: `winget install --id Git.Git -e --source winget` ([official instructions](https://git-scm.com/install/windows))
- Bun: `powershell -c "irm bun.sh/install.ps1|iex"` ([official instructions](https://bun.sh/docs/installation))

Tell the user the next steps in a short list, then start with the first step. For example: "I’ll open a working example, show how it goes from a need to a clickable example, then help you make one change."

1. Use the separate [`andocs-demo` project](https://github.com/blogic-cz/andocs-demo) for the public example. Do not use a development copy of the Andocs app as demo content. When you point to a demo page, describe what it shows in the user's language. Do not quote its English title.
2. Start the preview with the published command: `bunx andocs@latest serve --path <docs-root>`. Check the command help with `bunx andocs@latest -h` when needed.
3. If the user asks to update the example, check its upstream status and find which process serves the preview before you change anything.
4. Keep the working preview open while preparing optional services. Replace it only after the new services pass their checks.
5. Walk through the path on the example. Mention math and clickable examples briefly if the path did not reach them.

Treat updates to example content and OpenDesign setup as separate steps. Never update a development copy of the Andocs app to fix example content.

## Prepare OpenDesign when the user reaches that step

Prepare OpenDesign after the preview works, when the user accepts the recommendation to edit the example. Read [the OpenDesign guide](opendesign.md), check the required tools, then ask once in plain words before you install any missing tools and OpenDesign. Do not send a non-programmer to a download page. Follow the guide's browser check before you say OpenDesign works.
