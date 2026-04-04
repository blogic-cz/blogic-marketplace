# Testing Patterns Examples

Use these examples as implementation references while keeping `SKILL.md` focused on decision and process guidance.

## Unit Test Examples

### Basic Vitest

```typescript
import { describe, expect, it } from "vitest";

describe("parseResourceSize", () => {
  it("parses Ki units", () => {
    expect(parseResourceSize("512Ki")).toBe(524288);
  });
});
```

### Effect with `@effect/vitest` and mock layers

```typescript
import { describe, expect, it } from "@effect/vitest";
import { Effect, Either, Layer } from "effect";

describe("K8sMetricsService", () => {
  const createMockLayer = (responses: Map<string, unknown>) =>
    Layer.succeed(K8sHttpClient, {
      request: (params) => Effect.succeed(responses.get(params.path)),
    });

  const testLayer = K8sMetricsService.layer.pipe(
    Layer.provide(createMockLayer(mockResponses)),
  );

  it.effect("collects metrics", () =>
    Effect.gen(function* () {
      const service = yield* K8sMetricsService;
      const result = yield* service.collectMetrics({ ... });
      expect(result.namespaces).toHaveLength(3);
    }).pipe(Effect.provide(testLayer)),
  );

  it.effect("handles error case", () =>
    Effect.gen(function* () {
      const result = yield* myEffect.pipe(Effect.either);
      Either.match(result, {
        onLeft: (error) => {
          expect(error._tag).toBe("K8sConnectionError");
        },
        onRight: () => {
          expect.fail("Expected Left but got Right");
        },
      });
    }).pipe(Effect.provide(testLayer)),
  );
});
```

### Service-layer test with real service logic and mocked boundary

```typescript
it.live("returns success when endpoint is ready", () => {
  globalThis.fetch = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));

  return Effect.gen(function* () {
    const svc = yield* HealthCheckService;
    const result = yield* svc.checkApiHealth("http://api", {
      maxRetries: 1,
    });
    expect(result.success).toBe(true);
  }).pipe(Effect.provide(HealthCheckServiceLive));
});
```

## TRPC Integration Test Examples

### Setup pattern

```typescript
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import {
  createTestDb,
  cleanupTestDb,
  type TestDb,
  seedUser,
  seedOrganization,
  seedMember,
  seedProject,
} from "@project/db/testing";
import { createTestCaller } from "./trpc-test-utils";

describe("agents.listRuns", () => {
  let db: TestDb;
  let client: PGlite | undefined;

  beforeEach(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
    client = testDb.client;
  });

  afterEach(async () => {
    await cleanupTestDb(client);
    client = undefined;
  });

  it("returns correct results", async () => {
    const user = await seedUser(db);
    const org = await seedOrganization(db);
    await seedMember(db, {
      userId: user.id,
      organizationId: org.id,
    });
    const project = await seedProject(db, {
      organizationId: org.id,
    });

    const caller = createTestCaller({
      db,
      userId: user.id,
    });

    const result = await caller.agents.listRuns({
      projectId: project.id,
      page: 1,
      pageSize: 10,
    });

    expect(result.runs).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
```

### Available seed helpers

```typescript
import {
  seedUser,
  seedOrganization,
  seedMember,
  seedProject,
  seedAgentTemplate,
  seedAgentInstance,
  seedAgentRun,
  seedGitHubIssue,
  seedCompleteScenario,
} from "@project/db/testing";
```

## E2E Test Examples

### Basic Playwright E2E

```typescript
import { expect, test } from "@playwright/test";
import { e2eEnv } from "./env";
import { ensureTestUserExists, signInWithEmail } from "./auth-helpers";

const testEmail = e2eEnv.E2E_TEST_EMAIL;
const testPassword = e2eEnv.E2E_TEST_PASSWORD;

test("auth: can sign in with email", async ({ page }) => {
  await ensureTestUserExists(page.request, {
    email: testEmail,
    password: testPassword,
    name: "E2E Test User",
  });

  await signInWithEmail(page, {
    email: testEmail,
    password: testPassword,
  });

  await expect(
    page.getByRole("heading", {
      name: "Dashboard",
      exact: true,
    }),
  ).toBeVisible({ timeout: 5_000 });
});
```

### Auth helpers and hydration

```typescript
import { signInWithEmail, ensureTestUserExists } from "./auth-helpers";
import { waitForHydration } from "./wait-for-hydration";

await waitForHydration(page);
```

### Test credentials

```typescript
const testEmail = e2eEnv.E2E_TEST_EMAIL;
const testPassword = e2eEnv.E2E_TEST_PASSWORD;
```
