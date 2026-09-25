# Review status and releases in prototypes

Use these rules for prototypes whose screens are wrapped in the `<nexus-shell>` layout shell. The shell renders the review badge and the release switcher; pages only declare attributes.

## Review status (required)

Every screen sets `review` on `<nexus-shell>`:

| Value       | Badge     | Meaning                              |
| ----------- | --------- | ------------------------------------ |
| `draft`     | Draft     | Work in progress, waiting for review |
| `draft-ok`  | Draft OK  | Passed review, waiting for approval  |
| `schvaleno` | Schváleno | Approved                             |

```html
<nexus-shell review="draft"> ... </nexus-shell>
```

- A new screen starts as `draft`.
- Change the status only when the user asks for it.
- The shell draws the badge in the bottom-left corner. Do not add a status badge to the page content.

## Releases and screen versions

- **Target state** is the screen file without a suffix, such as `pages/smlouvy.html`.
- **Releases** are listed in `releases.json` at the prototype root:

  ```json
  {
    "releases": [
      {
        "id": "20261007",
        "label": "Release 7. 10. 2026",
        "screens": ["prehled", "inbox", "smlouvy"]
      },
      { "id": "20261021", "label": "Release 21. 10. 2026", "screens": ["*"] }
    ]
  }
  ```

  - `id` is a `YYYYMMDD` date or a project phase name.
  - `screens` lists screen ids (file name without `.html`) included in the release. `["*"]` means all screens.

- **A screen's release variant** is the sibling file `pages/<id>@<release>.html`, such as `smlouvy@20261007.html`:
  - Create it only where the release differs from the target state.
  - Keep the same `<title>` as the target screen.
  - Set `version="<release>"` and its own `review` on `<nexus-shell>`.
  - It may reuse the target screen's function names.
  - The release must exist in `releases.json`.

- **What the view of release R shows:**
  1. A screen missing from R's `screens` disappears from the menu and shows a "není součástí releasu" placeholder instead.
  2. Otherwise, the nearest variant `<id>@<release>` with release ≤ R.
  3. If no such variant exists, the target state.

- **Switching versions** is handled by the version badge in the bottom-left corner. Do not build a custom control for it.

- **Embedding in `nexus.md`:** a `prototype path=…/smlouvy@20261007.html` block opens the frame directly in that release.

  ````markdown
  ```prototype path=prototypes-final/pages/smlouvy@20261007.html

  ```
  ````

## Workflow

- **Change a screen for a specific release:** copy the target file to `<id>@<release>.html`, add `version`, and edit only the copy. Leave the target state unchanged.
- **New release:** add an entry to `releases.json` and list its screens in `screens`.
- **After every change**, run in `prototypes-final/`:

  ```bash
  node scripts/build-shared-css.mjs && node scripts/build-shared-js.mjs
  node scripts/check-links.mjs
  ```

  `check-links.mjs` reports:
  - a missing or unknown `review`,
  - a variant without a target screen,
  - a variant whose release is not in `releases.json` or whose `version` does not match,
  - an unknown id in `screens`.

  Fix every reported issue before finishing.
