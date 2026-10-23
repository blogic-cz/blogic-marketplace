# Versions and changes

- `version`: the label of the version.
- `changes`: the list of changes. Fields: `id`, `title`, `description` (one or two sentences: what and why), `review` (`draft` → `draft-ok` → `approved`), `screens` (route patterns), `files` (paths in the version), optional `ticket` and `variant: { id, label }`.
- New screen: a file in `screens/` and a route under the authenticated layout. In production and older versions it shows an empty state. When production later gets the same route, production wins and the prototype warns.
- Navigation item: an override of the production navigation definition that calls the original and adds the item.
- `base`: for each override, store the hash of the original and the last commit that changed it. The changes check uses it to detect production drift.
