# Introduce Andocs

Use this guide for an introduction, onboarding, a new project, or a question about what Andocs can do. Speak the user's language and use plain words.

## Follow the onboarding instructions

Before `agent`, run `git --version` and `bun --version`. If Git is missing, follow the [official Git installation steps](https://git-scm.com/install/). If Bun is missing, use the [official Bun installer](https://bun.sh/get): run `curl -fsSL https://bun.sh/install | bash` on macOS or Linux, or `powershell -c "irm bun.sh/install.ps1 | iex"` on Windows. Run both checks again.

Read [the Andocs skill](../SKILL.md) for the first CLI step. The CLI's JSON instructions own the questions, folder choice, commands, and their order.

## Create files for the user's idea

Wait until the user describes what they want to build. An introduction alone does not authorize sample documents or a prototype.

For a new project, use `docs/` as the documentation root inside the selected project folder. Match the layout that `andocs hello` creates:

```text
<project-folder>/
  docs/
    index.md
    prototypes/
      prototype.json
      pages/
        index.html
```

Write the user's need in `docs/index.md`. If the project needs a README document, put it in `docs/` too. Keep its prototype pages and assets under `docs/prototypes/`. Preview with `bunx andocs@latest serve --path <project-folder>/docs`. Publish with `--root <project-folder> --documents-root docs`. Keep an existing project's documentation root when you continue its work.

## Use plain words

Use a technical name only when the user asks for it or when a command needs it. Explain the idea first.

| Technical name  | Plain words for a Czech user            |
| --------------- | --------------------------------------- |
| repository      | složka projektu, kterou si pamatuje Git |
| backend         | server s daty                           |
| prototype block | klikací ukázka v dokumentu              |
| Mermaid or BPMN | diagram                                 |

## Explain the path from need to app

Present one path:

1. Write the need as a document.
2. Add a clickable example to the document.
3. Use OpenDesign to edit the example.
4. Add sample data so the example can act like an app and keep its data after a page refresh.
5. Give the example to a developer or agent to build the real app.

Ask which part the user wants to try first. Start with the part they named.

## Check the tools

Use the onboarding result to check which tools the selected step needs. Follow its next instruction when a tool is missing. Say the tools are ready after the result confirms it.

For a direct preview request for an existing docs folder, reuse its open preview. Otherwise run `bunx andocs@latest serve --path <docs-root>`. Use the URL printed by the CLI, which preserves the saved address even when another port is requested. Keep any earlier `--local-data-directory` option. Read [local preview continuity](prototype-state.md#keep-local-preview-data-reachable) for `--local-data-origin` recovery and catalog rules.

## Use account commands

Sign in with `bunx andocs@latest login` when the user wants to share or publish. Then use these commands as needed:

- `bunx andocs@latest whoami` shows the signed-in account.
- `bunx andocs@latest organizations list` lists accessible organizations.
- `bunx andocs@latest projects list` lists projects.
- `bunx andocs@latest sync status` shows a project's sync status.

Publishing to GitHub comes later.

## See a public example

For an optional public example, open the [Andocs demo](https://github.com/blogic-cz/andocs-demo). Describe the example in the user's language.
