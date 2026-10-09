# Introduce Andocs

Use this guide when a user asks to introduce or present Andocs, onboard a new user, or start a local Andocs demo or preview. Speak the user's language. Keep each step short, explain a needed term in one sentence, and ask one question at a time.

## Locate the project

1. Check the current folder and its enclosing Git repository. Tell the user both in plain words. If there is no Git repository, say so.
2. Explain that OpenDesign treats the enclosing Git repository as the project. A new folder inside that repository is still part of the same project.
3. Ask: "Do you want to continue in this project, or create a new project?" Do not ask another question until the user answers.

If the user chooses the current project, continue there. If the user asks for a new project, create its own folder outside all other repositories and run `git init` there, unless the user chooses another location or repository setup. Ask where to create the folder before creating it. Then ask which Andocs features to show.

## Choose what to show

For a new project, ask which features the user wants to see. Offer these choices in plain words:

- HTML prototypes inside documents, using `prototype` blocks.
- Prototypes edited in OpenDesign.
- Prototypes with state, where saved data remains after refresh.
- Diagrams, math, or interactive `html-preview` blocks.

Do not ask the user to choose from a technical list if they have already named the features they want. Explain a term only when needed. For example: "State is data that stays saved when you refresh the page."

## Start with a working preview

Tell the user the next steps in a short list, then start with the first step. For example: "I’ll open a working example, show the features you chose, then help you make one change." Guide the user from the first step and pause for their answer when a choice is needed.

1. Identify the documentation folder to show. For the public demo, use the separate [`andocs-demo` repository](https://github.com/blogic-cz/andocs-demo). Do not use a development checkout of the Andocs app as demo content.
2. Start the local preview with the published CLI: `bunx andocs@latest serve --path <docs-root>`. Check the CLI help with `bunx andocs@latest -h` when needed.
3. If the user asks to update demo content, check the content repository's upstream status and identify which process serves the preview port before you change anything.
4. Keep the working preview open while preparing optional services. Replace it only after the new services pass their checks.
5. Show the features the user chose. Point out diagrams, math, and `html-preview` briefly if they did not choose them.

Treat demo content updates and OpenDesign setup as separate steps. Never update a development checkout of the Andocs app to fix demo content.

## Prepare OpenDesign only when requested

Prepare OpenDesign as an optional step after the preview works. Read [the OpenDesign guide](opendesign.md) before preparing it from source. Install dependencies or start services only when the user has authorized those actions. Keep the working preview up until the new services pass their checks. Follow the guide's browser acceptance check before you say OpenDesign works.
