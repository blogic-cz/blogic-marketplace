# Test-First Examples

Step-by-step TDD examples for common scenarios in this codebase.

---

## Example 1: Pure Utility Function

**Scenario**: Create a `slugify` function that converts strings to URL-safe slugs.

### Step 1: RED - Write Failing Test

```typescript
// packages/common/src/__tests__/slugify.test.ts
import { describe, expect, it } from "vitest";
import { slugify } from "../slugify";

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("hello world")).toBe("hello-world");
  });
});
```

**Run test:**

```bash
bun run vitest run packages/common/src/__tests__/slugify.test.ts
```

**Result**: FAIL - module not found

### Step 2: GREEN - Minimal Implementation

```typescript
// packages/common/src/slugify.ts
export function slugify(input: string): string {
  return input.replace(/ /g, "-");
}
```

**Run test:** PASS

### Step 3: REFACTOR - Not needed yet

Code is simple enough. Add next test.

### Step 4: RED - Next Behavior

```typescript
it("converts to lowercase", () => {
  expect(slugify("Hello World")).toBe("hello-world");
});
```

**Run test:** FAIL

### Step 5: GREEN

```typescript
export function slugify(input: string): string {
  return input.toLowerCase().replace(/ /g, "-");
}
```

**Run test:** PASS

### Step 6: Continue Cycle

```typescript
// Add more tests one at a time
it("removes special characters", () => {
  expect(slugify("Hello! World?")).toBe("hello-world");
});

it("handles multiple spaces", () => {
  expect(slugify("hello   world")).toBe("hello-world");
});

it("trims leading and trailing spaces", () => {
  expect(slugify("  hello world  ")).toBe("hello-world");
});
```

### Final Implementation

```typescript
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Collapse multiple hyphens
}
```

---

## Example 2: Effect Service with Dependencies

**Scenario**: Create a `HealthCheckService` that checks if external APIs are reachable.

### Step 1: RED - Define Behavior via Test

```typescript
// packages/services/src/__tests__/health-check.test.ts
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { HealthCheckService } from "../health-check";

describe("HealthCheckService", () => {
  it.effect(
    "returns success when endpoint is healthy",
    () =>
      Effect.gen(function* () {
        const service = yield* HealthCheckService;
        const result = yield* service.checkEndpoint(
          "http://api.example.com"
        );

        expect(result.healthy).toBe(true);
        expect(result.latencyMs).toBeGreaterThan(0);
      }).pipe(Effect.provide(testLayer))
  );
});

// Mock HTTP client that always succeeds
const mockHttpLayer = Layer.succeed(HttpClient, {
  get: (url) =>
    Effect.succeed({
      status: 200,
      body: "OK",
      latencyMs: 50,
    }),
});

const testLayer = HealthCheckService.layer.pipe(
  Layer.provide(mockHttpLayer)
);
```

**Run test:** FAIL - HealthCheckService doesn't exist

### Step 2: GREEN - Create Service

```typescript
// packages/services/src/health-check.ts
import { Context, Effect, Layer } from "effect";

type HealthResult = {
  healthy: boolean;
  latencyMs: number;
};

export class HealthCheckService extends Context.Tag(
  "@blogic-template/HealthCheckService"
)<
  HealthCheckService,
  {
    readonly checkEndpoint: (
      url: string
    ) => Effect.Effect<HealthResult>;
  }
>() {
  static readonly layer = Layer.effect(
    HealthCheckService,
    Effect.gen(function* () {
      const http = yield* HttpClient;

      const checkEndpoint = Effect.fn(
        "HealthCheck.checkEndpoint"
      )((url: string) =>
        Effect.gen(function* () {
          const response = yield* http.get(url);
          return {
            healthy: response.status === 200,
            latencyMs: response.latencyMs,
          };
        })
      );

      return { checkEndpoint };
    })
  );
}

export const HealthCheckServiceLayer =
  HealthCheckService.layer;
```

**Run test:** PASS

### Step 3: RED - Add Error Case

```typescript
it.effect("returns unhealthy when endpoint fails", () =>
  Effect.gen(function* () {
    const service = yield* HealthCheckService;
    const result = yield* service.checkEndpoint(
      "http://down.example.com"
    );

    expect(result.healthy).toBe(false);
  }).pipe(Effect.provide(failingTestLayer))
);

// Mock that returns 500
const failingHttpLayer = Layer.succeed(HttpClient, {
  get: (url) =>
    Effect.succeed({
      status: 500,
      body: "Internal Server Error",
      latencyMs: 100,
    }),
});

const failingTestLayer = HealthCheckService.layer.pipe(
  Layer.provide(failingHttpLayer)
);
```

**Run test:** PASS (already handles this case!)

### Step 4: RED - Handle Network Errors

```typescript
import { Either } from "effect";

it.effect("handles network timeout", () =>
  Effect.gen(function* () {
    const service = yield* HealthCheckService;
    const result = yield* service
      .checkEndpoint("http://timeout.example.com")
      .pipe(Effect.either);

    Either.match(result, {
      onLeft: (error) => {
        expect(error._tag).toBe("HealthCheckError");
        expect(error.reason).toBe("timeout");
      },
      onRight: () => {
        expect.fail("Expected error");
      },
    });
  }).pipe(Effect.provide(timeoutTestLayer))
);

// Mock that fails with timeout
const timeoutHttpLayer = Layer.succeed(HttpClient, {
  get: (url) =>
    Effect.fail(new NetworkError({ reason: "timeout" })),
});

const timeoutTestLayer = HealthCheckService.layer.pipe(
  Layer.provide(timeoutHttpLayer)
);
```

**Run test:** FAIL - Need to handle errors

### Step 5: GREEN - Add Error Handling

```typescript
import { Schema } from "effect";

class HealthCheckError extends Schema.TaggedError<HealthCheckError>()(
  "HealthCheckError",
  {
    url: Schema.String,
    reason: Schema.String,
  }
) {}

export class HealthCheckService extends Context.Tag(
  "@blogic-template/HealthCheckService"
)<
  HealthCheckService,
  {
    readonly checkEndpoint: (
      url: string
    ) => Effect.Effect<HealthResult, HealthCheckError>;
  }
>() {
  static readonly layer = Layer.effect(
    HealthCheckService,
    Effect.gen(function* () {
      const http = yield* HttpClient;

      const checkEndpoint = Effect.fn(
        "HealthCheck.checkEndpoint"
      )((url: string) =>
        Effect.gen(function* () {
          const response = yield* http.get(url).pipe(
            Effect.catchAll((error) =>
              Effect.fail(
                new HealthCheckError({
                  url,
                  reason: error.reason ?? "unknown",
                })
              )
            )
          );
          return {
            healthy: response.status === 200,
            latencyMs: response.latencyMs,
          };
        })
      );

      return { checkEndpoint };
    })
  );
}
```

**Run test:** PASS

---

## Example 3: TRPC Endpoint (Optional TDD)

**Scenario**: Add a `getProjectStats` endpoint.

> **Note**: For TRPC endpoints, TDD is optional. Ask user if they want TDD approach.

### If User Wants TDD:

#### Step 1: RED - Write Integration Test

```typescript
// apps/web-app/src/__tests__/project-stats.test.ts
import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
} from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import {
  createTestDb,
  cleanupTestDb,
  seedUser,
  seedOrganization,
  seedMember,
  seedProject,
} from "@blogic-template/db/testing";
import { createTestCaller } from "./trpc-test-utils";

describe("project.getStats", () => {
  let db: TestDb;
  let client: PGlite | undefined;

  beforeEach(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
    client = testDb.client;
  });

  afterEach(async () => {
    await cleanupTestDb(client);
  });

  it("returns project statistics", async () => {
    // Setup
    const user = await seedUser(db);
    const org = await seedOrganization(db);
    await seedMember(db, {
      userId: user.id,
      organizationId: org.id,
    });
    const project = await seedProject(db, {
      organizationId: org.id,
    });

    // Call
    const caller = createTestCaller({
      db,
      userId: user.id,
    });
    const result = await caller.project.getStats({
      projectId: project.id,
    });

    // Assert
    expect(result.memberCount).toBe(0);
    expect(result.createdAt).toBeDefined();
  });
});
```

#### Step 2: GREEN - Implement Endpoint

```typescript
// apps/web-app/src/infrastructure/trpc/routers/project.ts
export const router = {
  getStats: protectedProjectMemberProcedure
    .input(
      Schema.standardSchemaV1(
        Schema.Struct({ projectId: ProjectId })
      )
    )
    .query(async ({ ctx, input }) => {
      const [stats] = await ctx.db
        .select({
          memberCount: count(projectMembersTable.id),
          createdAt: projectsTable.createdAt,
        })
        .from(projectsTable)
        .leftJoin(
          projectMembersTable,
          eq(
            projectMembersTable.projectId,
            projectsTable.id
          )
        )
        .where(eq(projectsTable.id, input.projectId))
        .groupBy(projectsTable.id);

      return stats;
    }),
} satisfies TRPCRouterRecord;
```

---

## Quick Reference: TDD Commands

```bash
# Run specific test file
bun run vitest run packages/common/src/__tests__/slugify.test.ts

# Run tests matching pattern
bun run vitest run -t "slugify"

# Watch mode for TDD cycle
bun run test:watch

# Run all tests before commit
bun run test
```

---

## Checklist: Before Moving to Next Test

- [ ] Current test fails for the right reason (RED)
- [ ] Implementation is minimal (GREEN)
- [ ] Code is refactored and clean (REFACTOR)
- [ ] Test name describes the behavior
- [ ] No skipped or commented tests
