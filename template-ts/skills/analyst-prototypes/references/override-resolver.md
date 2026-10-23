# Override resolver

## Requirements

- Index `versions/<v>/overrides/<path from repository root>` and `versions/<v>/variants/<id>/overrides/<path>`.
- An import of a production file that has an override returns the prototype implementation.
- When an override imports its own production file, it gets the original. The override can wrap the original.
- An override must have every export of the original. Otherwise the build fails with an exact error.
- Version order: `production` < `YYYYMMDD` < `target`. An override applies from its version until a newer one replaces it. A selected variant wins when its version is not newer than the active version.
- Active version: `?v=` in the URL, then the last version in local storage, then `target`. Variants come only from `?variant=a,b`, so a link shares them. The router keeps `?v=` and `?variant=` on every navigation; when it drops them, add them back.
- An override edit causes a full reload. A new or deleted override rebuilds the index.

## Options

- **A. Build per version.** The resolver picks the override from a build-time variable. Simplest; the recommended start.
- **B. Switch at runtime.** The resolver returns a proxy module that imports the original and every override. A registry picks the implementation from `?v=` and `?variant=`. Function exports are stable delegates, so a switch keeps export identity. Other exports (constants, classes) are copied by value; when they differ between versions, a switch reloads the page. After a switch, remount the app root and invalidate the query cache.
- **C. No bundler** (plain HTML, server-rendered, mixed stack). A dev server or service worker returns the override file at the URL of the original file.
