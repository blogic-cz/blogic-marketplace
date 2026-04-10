# TDD Command Catalog

Use this catalog when running test-first loops in template-ts projects.

## Unit and integration

```bash
# Run all tests (unit + TRPC integration)
bun run test

# Watch mode
bun run test:watch

# Coverage
bun run test:coverage

# Run specific test file (from project root, full path)
bun run vitest run packages/common/src/__tests__/pagination.test.ts
bun run vitest run apps/web-app/src/__tests__/formatters.test.ts

# Run by test name pattern
bun run vitest run -t "calculateDiscount"
```

## E2E

```bash
# First-time Playwright browser install
bun run test:e2e:install

# Run all E2E tests
bun run test:e2e

# Run E2E with interactive UI
bun run test:e2e:ui
```

## Incorrect patterns (avoid)

```bash
# Does not work: script does not accept direct path argument
bun run test packages/common/src/__tests__/file.test.ts

# Does not work: running from nested cwd breaks expected paths
cd packages/common && bun run vitest run src/__tests__/file.test.ts
```
