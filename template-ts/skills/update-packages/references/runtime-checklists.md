# Runtime Checklists

## Bun Runtime Updates

Apply all steps when bumping Bun:

1. Update root `package.json` `packageManager` to `bun@X.Y.Z`.
2. Update Bun pins in Dockerfiles, including `ARG BUN_VERSION=X.Y.Z` and `FROM oven/bun:X.Y.Z-*`.
3. Update CI and pipeline pins (for example `bun-version: X.Y.Z`, `BUN_VERSION="X.Y.Z"`).
4. Run `bun run check`.
5. Commit with `chore: update bun to vX.Y.Z`.

When runtime report shows drift, align all Bun-related pins before completion, including:

- `packageManager`
- `@types/bun`
- `bun-version:` in workflows
- `BUN_VERSION=` and `ARG BUN_VERSION=` in scripts and Dockerfiles
- `FROM oven/bun:...` base images
- `node-version:` in workflows
- Playwright package and image alignment

Manual search fallback:

```bash
grep -R "bun-version:\|BUN_VERSION=\|bun@1\.\|oven/bun:1\." .
```

## Playwright Updates

Apply all steps when bumping Playwright:

1. Keep Docker image version equal to npm package version.
2. Update every `mcr.microsoft.com/playwright:vX.Y.Z-noble` reference across Dockerfiles, CI, and Helm values.
3. Run `bun run test:e2e`.
4. Commit with `chore: update playwright to vX.Y.Z`.
