# Schema Patterns (Drizzle)

## Basic table with typed IDs

```typescript
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
    .$type<UserId>(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  role: text("role").$type<UserRoleValue>(),
});
```

## Table indexes and constraints in third argument

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
    organizationId: text("organization_id").notNull(),
    token: text("token").notNull(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    uniqueIndex("sessions_token_idx").on(table.token),
    unique().on(table.userId, table.organizationId),
  ],
);
```

## JSONB typed columns

```typescript
export const documentMetadataTable = pgTable("document_metadata", {
  configuration: jsonb("configuration").$type<DocumentConfig>(),
  tags: jsonb("tags").$type<string[]>(),
  metadata: jsonb("metadata").$type<Record<string, string>>(),
});
```

## Relations patterns

```typescript
import { relations } from "drizzle-orm";

export const organizationsRelations = relations(organizationsTable, ({ many }) => ({
  members: many(membersTable),
  projects: many(projectsTable),
}));

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

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [projectsTable.organizationId],
    references: [organizationsTable.id],
  }),
  members: many(projectMembersTable),
}));
```
