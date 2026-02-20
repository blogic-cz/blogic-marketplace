---
name: andocs
description: "LOAD THIS SKILL when: writing documentation, creating markdown files, diagrams, math formulas, HTML prototypes, or user mentions 'docs', 'documentation', 'diagram', 'mermaid', 'math', 'formula', 'HTML preview'. Covers all Andocs rendering features and correct syntax."
---

Write documentation using Andocs rendering capabilities. All features work out of the box.

## Code Blocks

Fenced with language identifier. 100+ languages supported (TypeScript, Python, SQL, YAML, Bash, etc.).

````markdown
```typescript
const config = yield* ConfigService;
```
````

## Mermaid Diagrams

Use `mermaid` language identifier. Renders with zoom, pan, fullscreen.

**Supported types:** flowchart, sequenceDiagram, erDiagram, pie, gitGraph, gantt, classDiagram, stateDiagram-v2

````markdown
```mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[Other]
```
````

````markdown
```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB
    User->>API: GET /resource
    API->>DB: SELECT query
    DB-->>API: Result
    API-->>User: JSON response
```
````

````markdown
```mermaid
erDiagram
    ORGANIZATION ||--o{ PROJECT : has
    PROJECT ||--o{ DOCUMENT : stores
```
````

````markdown
```mermaid
pie title Distribution
    "Category A" : 65
    "Category B" : 25
    "Category C" : 10
```
````

## Math / LaTeX

Block equations via KaTeX with `$$` delimiters. **Inline `$...$` is NOT enabled.**

```markdown
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

Common patterns: `\frac{}{}`, `\sum_{i=1}^{n}`, `\int_{a}^{b}`, `\sqrt{}`, `\begin{bmatrix}...\end{bmatrix}`

## HTML Preview Blocks

Use `html-preview` language identifier for interactive HTML in sandboxed iframes.

````markdown
```html-preview
<div style="padding: 20px; font-family: sans-serif;">
  <h2>Interactive Demo</h2>
  <button onclick="alert('Hello!')">Click me</button>
</div>
```
````

Capabilities: full HTML/CSS/JS, external CDNs, auto-height (200–800px), toolbar (copy/open/fullscreen).

For auto-resize, add to your script:
```javascript
function postHeight() {
  window.parent.postMessage({ type: 'html-preview-height', height: document.documentElement.scrollHeight }, '*');
}
postHeight();
new MutationObserver(postHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
```

## Tables

Standard markdown with alignment:

```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| text | text   | text  |
```

## Task Lists

```markdown
- [x] Completed
- [ ] Pending
```

## Links

- External: `[GitHub](https://github.com)` — opens new tab
- Relative: `[Auth docs](./auth.md)` — in-app navigation
- Anchor: `[Section](#heading-id)` — smooth scroll

## Frontmatter

YAML metadata stripped from output:

```markdown
---
title: My Document
description: Summary
---
```

## Rules

- Start with `# Title` — becomes sidebar entry
- Use headings hierarchically (don't skip h1 → h3)
- Keep code blocks short — show relevant snippet only
- Use Mermaid instead of image diagrams when possible
- Use `html-preview` for interactive content, not raw HTML
- One topic per document — prefer focused docs over giant files
- Use relative `.md` links between docs for in-app navigation

## Anti-Patterns

- Don't use raw HTML instead of markdown (use `html-preview` blocks for interactive content)
- Don't create diagrams as images when Mermaid can express them
- Don't use deeply nested headings (h5, h6) — restructure into separate documents instead
