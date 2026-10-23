# Vite

- `prototypes/vite.config` has its own port, `server.fs.allow: [".."]` and `publicDir` from the production app.
- Take aliases from the production `tsconfig` (`resolve.tsconfigPaths` in Vite 8, otherwise the `vite-tsconfig-paths` plugin). For workspace packages, set `resolve.conditions` to the export that points to `src/`.
- The resolver is a plugin with `enforce: "pre"`:
  - `buildStart` builds the override index.
  - `resolveId` skips virtual ids and calls `this.resolve(source, importer, { skipSelf: true })`.
  - When the result has an override and the importer is not its own override, `resolveId` returns `"\0prototype-override:<file>.proxy.js"`.
  - `load` reads the exports of the original and the overrides (es-module-lexer or oxc-parser), checks them and generates the proxy. It calls `addWatchFile`.
  - `hotUpdate` returns a full reload for an override.
  - `configureServer` restarts the server when an override is added or deleted.
- The framework plugin must skip the proxy virtual ids. With `@vitejs/plugin-react`, use `exclude`.
- React: remount with a `key` on the root. `memo` and `forwardRef` exports are objects, not functions, so the registry handles them separately or reloads.
- `define` sets `import.meta.env.VITE_API_BASE_URL` to `location.origin` and turns telemetry off.
- MSW worker: serve it in dev with a middleware in `configureServer`; emit it into the build with `emitFile`.
- The data version is a virtual module with the hash of `backend/` and the schemas.
- `import.meta.glob` loads versions, changes, routes, seeds and fixtures. The entry reads version ids from folder names without `eager`.
- `build.target: "es2022"` for top-level `await` in the entry.
