# Query Patterns (Drizzle)

## Relation query helper

```typescript
const userMemberships = await db.query.membersTable.findMany({
  where: eq(membersTable.userId, userId),
  with: { organization: true },
});
```

## Select API with joins

```typescript
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

## Aggregation with raw SQL

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

## Subquery in delete

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

## Mutation patterns

```typescript
const [organization] = await db.insert(organizationsTable).values({ name }).returning();

const [updated] = await db
  .update(organizationsTable)
  .set({ name })
  .where(eq(organizationsTable.id, id))
  .returning();

await db.delete(organizationsTable).where(eq(organizationsTable.id, organizationId));
```
