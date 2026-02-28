# Drizzle ORM Batch Patterns

## Batch SELECT with inArray

```typescript
import { inArray } from "drizzle-orm";

// Instead of N queries in a loop
for (const id of ids) {
  const item = await db
    .select()
    .from(table)
    .where(eq(table.id, id));
}

// Single batch query
const items = await db
  .select()
  .from(table)
  .where(inArray(table.id, ids));

// Build lookup map for O(1) access
const itemMap = new Map(items.map((i) => [i.id, i]));
```

## Batch INSERT

```typescript
// Instead of individual inserts
for (const item of items) {
  await db.insert(table).values(item);
}

// Single batch insert
await db.insert(table).values(items);

// With returning
const inserted = await db
  .insert(table)
  .values(items)
  .returning();

// With onConflictDoNothing
await db.insert(table).values(items).onConflictDoNothing();

// With onConflictDoUpdate
await db
  .insert(table)
  .values(items)
  .onConflictDoUpdate({
    target: table.id,
    set: { updatedAt: new Date() },
  });
```

## Batch UPDATE

```typescript
// Instead of individual updates
for (const id of ids) {
  await db
    .update(table)
    .set({ status: "closed" })
    .where(eq(table.id, id));
}

// Single batch update
await db
  .update(table)
  .set({ status: "closed", updatedAt: new Date() })
  .where(inArray(table.id, ids));
```

## Batch DELETE

```typescript
// Instead of individual deletes
for (const id of ids) {
  await db.delete(table).where(eq(table.id, id));
}

// Single batch delete
await db.delete(table).where(inArray(table.id, ids));
```

## Query Consolidation with JOINs

### Replace Multiple Queries with JOIN

```typescript
// Before: 2 queries
const membership = await db
  .select()
  .from(membersTable)
  .where(
    and(
      eq(membersTable.organizationId, orgId),
      eq(membersTable.userId, userId)
    )
  )
  .limit(1);

const org = await db
  .select()
  .from(organizationsTable)
  .where(eq(organizationsTable.id, orgId))
  .limit(1);

// After: 1 query with JOIN
const [result] = await db
  .select({
    organization: organizationsTable,
    memberRole: membersTable.role,
  })
  .from(organizationsTable)
  .innerJoin(
    membersTable,
    and(
      eq(
        membersTable.organizationId,
        organizationsTable.id
      ),
      eq(membersTable.userId, userId)
    )
  )
  .where(eq(organizationsTable.id, orgId))
  .limit(1);

if (!result)
  throw notFoundError(
    "Organization not found or access denied"
  );
```

### LEFT JOIN for Optional Related Data

```typescript
const results = await db
  .select({
    user: usersTable,
    membership: membersTable, // May be null
  })
  .from(usersTable)
  .leftJoin(
    membersTable,
    eq(membersTable.userId, usersTable.id)
  )
  .where(eq(usersTable.id, userId));
```

## Aggregation with SQL Functions

### Scalar Subquery in SELECT

```typescript
const orgsWithMemberCount = await db
  .select({
    id: organizationsTable.id,
    name: organizationsTable.name,
    memberCount: sql<number>`(
      SELECT COUNT(*) FROM ${membersTable}
      WHERE ${membersTable.organizationId} = ${organizationsTable.id}
    )`,
  })
  .from(organizationsTable);
```

### EXISTS Subquery in WHERE

```typescript
const orgsWithProjects = await db
  .select()
  .from(organizationsTable)
  .where(
    exists(
      db
        .select({ one: sql`1` })
        .from(projectsTable)
        .where(
          eq(
            projectsTable.organizationId,
            organizationsTable.id
          )
        )
    )
  );
```

## Parallel Queries with Promise.all

```typescript
// Independent queries can run in parallel
const [users, projects, settings] = await Promise.all([
  db
    .select()
    .from(usersTable)
    .where(inArray(usersTable.id, userIds)),
  db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.organizationId, orgId)),
  db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.userId, userId)),
]);
```

## Pre-fetch Pattern for N+1 Prevention

```typescript
async function processInvitations(
  emails: string[],
  organizationId: string
) {
  // Step 1: Batch fetch all related data upfront
  const [
    existingUsers,
    existingMembers,
    existingInvitations,
  ] = await Promise.all([
    db
      .select({
        id: usersTable.id,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(inArray(usersTable.email, emails)),
    db
      .select({ userId: membersTable.userId })
      .from(membersTable)
      .innerJoin(
        usersTable,
        eq(membersTable.userId, usersTable.id)
      )
      .where(
        and(
          eq(membersTable.organizationId, organizationId),
          inArray(usersTable.email, emails)
        )
      ),
    db
      .select({ email: invitationsTable.email })
      .from(invitationsTable)
      .where(
        and(
          inArray(invitationsTable.email, emails),
          eq(
            invitationsTable.organizationId,
            organizationId
          ),
          eq(invitationsTable.status, "pending")
        )
      ),
  ]);

  // Step 2: Build lookup structures
  const userByEmail = new Map(
    existingUsers.map((u) => [u.email, u])
  );
  const memberUserIds = new Set(
    existingMembers.map((m) => m.userId)
  );
  const invitedEmails = new Set(
    existingInvitations.map((i) => i.email)
  );

  // Step 3: Process without additional queries
  const toInvite: InvitationData[] = [];
  const toAddDirectly: MemberData[] = [];
  const skipped: string[] = [];

  for (const email of emails) {
    const user = userByEmail.get(email);

    if (user && memberUserIds.has(user.id)) {
      skipped.push(email); // Already member
      continue;
    }

    if (invitedEmails.has(email)) {
      skipped.push(email); // Already invited
      continue;
    }

    if (user) {
      toAddDirectly.push({ userId: user.id, email });
    } else {
      toInvite.push({ email });
    }
  }

  // Step 4: Batch insert results
  if (toAddDirectly.length > 0) {
    await db.insert(membersTable).values(
      toAddDirectly.map((m) => ({
        userId: m.userId,
        organizationId,
        role: "member",
      }))
    );
  }

  if (toInvite.length > 0) {
    await db.insert(invitationsTable).values(
      toInvite.map((i) => ({
        email: i.email,
        organizationId,
        status: "pending",
      }))
    );
  }

  return {
    added: toAddDirectly.length,
    invited: toInvite.length,
    skipped: skipped.length,
  };
}
```

## Upsert Pattern

```typescript
// Instead of: check existence + conditional insert/update
const existing = await db
  .select()
  .from(table)
  .where(eq(table.id, id))
  .limit(1);
if (existing.length > 0) {
  await db
    .update(table)
    .set({ content, updatedAt: new Date() })
    .where(eq(table.id, id));
} else {
  await db.insert(table).values({ id, content });
}

// Use: Single upsert operation
await db
  .insert(table)
  .values({ id, content })
  .onConflictDoUpdate({
    target: table.id,
    set: { content, updatedAt: new Date() },
  });

// For composite unique constraints
await db
  .insert(documentsTable)
  .values({ repositoryId, path, content, sha })
  .onConflictDoUpdate({
    target: [
      documentsTable.repositoryId,
      documentsTable.path,
    ],
    set: { content, sha, updatedAt: new Date() },
  });
```
