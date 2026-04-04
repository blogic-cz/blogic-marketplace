# Migrations and Testing

## Connection pattern

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export function connectDb(connectionString: string) {
  const pool = new Pool({
    connectionString,
    min: 2,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  return drizzle(pool, { schema });
}

export type Db = ReturnType<typeof connectDb>;
```

## Type inference patterns

```typescript
export async function seedUser(db: TestDb): Promise<typeof usersTable.$inferSelect> {
  const [user] = await db.insert(usersTable).values({ ... }).returning();
  return user;
}

const updateData: Partial<typeof documentMetadataTable.$inferInsert> = {};
if (input.name !== undefined) updateData.name = input.name;

const documents: Array<typeof documentsTable.$inferSelect> = [];
```

## Testing and seed helpers

```typescript
export { createTestDb, cleanupTestDb, type TestDb } from "./__tests__/setup";
export { seedUser, seedOrganization, seedProject } from "./__tests__/seed";

export async function seedUser(db: TestDb): Promise<typeof usersTable.$inferSelect> {
  const [user] = await db
    .insert(usersTable)
    .values({
      name: "Test User",
      email: `test-${createId()}@example.com`,
    })
    .returning();
  return user;
}
```

## Verification checklist after schema changes

1. Generate or apply migration according to the repository workflow.
2. Verify SQL diff contains only expected table/index/constraint changes.
3. Run test suites that cover affected tables/relations/queries.
4. If tests require seeded state, update seed helpers minimally and re-run.
