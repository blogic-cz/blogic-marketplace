---
name: drizzle-database
description: "ALWAYS LOAD THIS SKILL when user asks about: database, schema, table, migration, drizzle, pgTable, relations, SQL, JOINs. This skill has CRITICAL project-specific patterns not available elsewhere - branded ID types ($type<UserId>), index syntax, relation definitions, complex JOINs. Load BEFORE reading any files or answering."
---

# Drizzle Database Patterns

## Overview

Implement database schemas and queries using Drizzle ORM following the project's established patterns for type-safe database access.

## When to Use This Skill

- Creating or modifying database tables in `packages/db/src/schema.ts`
- Writing complex SQL queries with JOINs
- Defining table relations
- Working with database migrations
- Setting up test databases with PGlite

## Table Definition Patterns

### Basic Table with Typed IDs

```typescript
// packages/db/src/schema.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  unique,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import type { UserId, UserRoleValue } from "@project/common";

export const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .$type<UserId>(), // Branded type for type-safety
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  role: text("role").$type<UserRoleValue>(), // Union type for enums
});
```

### Table with Indexes (Third Argument)

```typescript
export const sessionsTable = pgTable(
  "sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      })
      .$type<UserId>(),
    // ...
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    uniqueIndex("sessions_token_idx").on(table.token),
    unique().on(table.userId, table.projectId), // Composite unique
  ],
);
```

### JSONB Columns with Types

```typescript
export const documentMetadataTable = pgTable("document_metadata", {
  configuration: jsonb("configuration").$type<DocumentConfig>(),
  tags: jsonb("tags").$type<string[]>(),
  metadata: jsonb("metadata").$type<Record<string, string>>(),
});
```

## Relations Definition

```typescript
import { relations } from "drizzle-orm";

// One-to-many
export const organizationsRelations = relations(organizationsTable, ({ many }) => ({
  members: many(membersTable),
  projects: many(projectsTable),
}));

// Many-to-one
export const membersRelations = relations(membersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [membersTable.userId],
    references: [usersTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [membersTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

// Combined one + many
export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [projectsTable.organizationId],
    references: [organizationsTable.id],
  }),
  members: many(projectMembersTable),
}));
```

## Query Patterns

### Simple SELECT with Relations (Query API)

```typescript
const userMemberships = await db.query.membersTable.findMany({
  where: eq(membersTable.userId, userId),
  with: { organization: true },
});
```

### SELECT with JOINs (Select API)

```typescript
// INNER JOIN - required relationship
const [result] = await db
  .select({
    id: organizationsTable.id,
    name: organizationsTable.name,
    memberRole: membersTable.role,
  })
  .from(organizationsTable)
  .innerJoin(
    membersTable,
    and(eq(membersTable.organizationId, organizationsTable.id), eq(membersTable.userId, userId)),
  )
  .where(eq(organizationsTable.id, id))
  .limit(1);

// LEFT JOIN - optional relationship
const members = await db
  .select({
    id: usersTable.id,
    name: usersTable.name,
    role: membersTable.role,
  })
  .from(membersTable)
  .leftJoin(usersTable, eq(membersTable.userId, usersTable.id))
  .where(eq(membersTable.organizationId, organizationId));
```

### Complex Aggregation with Raw SQL

```typescript
import { sql } from "drizzle-orm";

const result = await db
  .select({
    orgId: organizationsTable.id,
    projects: sql<Array<{ id: string; name: string }>>`
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', ${projectsTable.id},
            'name', ${projectsTable.name}
          )
        ) FILTER (WHERE ${projectsTable.id} IS NOT NULL),
        '[]'
      )
    `,
  })
  .from(membersTable)
  .innerJoin(organizationsTable, eq(membersTable.organizationId, organizationsTable.id))
  .leftJoin(projectsTable, eq(projectsTable.organizationId, organizationsTable.id))
  .where(eq(membersTable.userId, userId))
  .groupBy(organizationsTable.id);
```

### Subquery in DELETE (inArray)

```typescript
await db
  .delete(projectMembersTable)
  .where(
    and(
      eq(projectMembersTable.userId, userId),
      inArray(
        projectMembersTable.projectId,
        db
          .select({ id: projectsTable.id })
          .from(projectsTable)
          .where(eq(projectsTable.organizationId, organizationId)),
      ),
    ),
  );
```

## Type Inference Patterns

```typescript
// Return type from table
export async function seedUser(db: TestDb): Promise<typeof usersTable.$inferSelect> {
  const [user] = await db.insert(usersTable).values({...}).returning();
  return user;
}

// Partial update type
const updateData: Partial<typeof documentMetadataTable.$inferInsert> = {};
if (input.name !== undefined) updateData.name = input.name;

// Array type from table
const documents: Array<typeof documentsTable.$inferSelect> = [];
```

## INSERT/UPDATE/DELETE Patterns

```typescript
// INSERT with returning
const [organization] = await db.insert(organizationsTable).values({ name }).returning();

// UPDATE with where
const [updated] = await db
  .update(organizationsTable)
  .set({ name })
  .where(eq(organizationsTable.id, id))
  .returning();

// DELETE (cascades handled by FK)
await db.delete(organizationsTable).where(eq(organizationsTable.id, organizationId));
```

## Database Connection

```typescript
// packages/db/src/index.ts
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
  return drizzle(pool, { schema }); // Pass schema for relational queries
}

export type Db = ReturnType<typeof connectDb>;
```

## Testing with PGlite

```typescript
// packages/db/src/testing.ts
export { createTestDb, cleanupTestDb, type TestDb } from "./__tests__/setup";
export { seedUser, seedOrganization, seedProject } from "./__tests__/seed";

// Seed functions return typed records
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

## Key Rules

1. **Always use branded types** for IDs: `.$type<UserId>()`
2. **Use INNER JOIN** for required relationships, **LEFT JOIN** for optional
3. **Prefer single queries with JOINs** over multiple queries
4. **Pass schema to drizzle()** to enable relational queries
5. **Use `.$defaultFn()`** for auto-generated values (IDs, timestamps)
6. **Foreign keys with cascade**: `references(() => table.id, { onDelete: "cascade" })`
