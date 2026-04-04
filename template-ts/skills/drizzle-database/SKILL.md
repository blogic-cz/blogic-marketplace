---
name: drizzle-database
description: "This skill should be used when defining Drizzle ORM schema tables, typed relations, index/constraint patterns, migration changes, or Drizzle query composition in template-ts projects."
compatibility: opencode
---

# Drizzle Database Patterns

Use this skill to implement and review Drizzle ORM schema and query code with project-consistent typing, relation modeling, and migration/test verification.

## When to Use This Skill

Use this skill when work explicitly involves Drizzle ORM primitives, for example:

- `pgTable(...)` schema definitions
- relation declarations with `relations(...)`
- Drizzle select/query builder composition (`db.select`, `db.query.*`)
- Drizzle migrations and schema evolution
- typed test DB seeding for Drizzle-backed tests

Avoid triggering this skill for generic SQL/database discussions that are not tied to Drizzle implementation.

## Canonical Workflow

Apply this sequence for every schema/query change:

1. Inspect nearby schema helpers and existing Drizzle patterns in the target repository.
2. Copy an established local pattern (types, naming, indexes, relation style) instead of inventing a new style.
3. Implement the minimal schema/query change required.
4. Verify generated/applied migration output is coherent with the change.
5. Run related tests that exercise the changed table/query path.

Read full examples in:

- `references/schema-patterns.md`
- `references/query-patterns.md`
- `references/migrations-and-testing.md`

## Conventions and Rules

### Always-rules

1. Keep relation cardinality explicit (`one` vs `many`) and match FK fields to referenced IDs.
2. Keep optional vs required joins explicit (`leftJoin` for optional, `innerJoin` for required).
3. Verify migrations and tests after schema changes before considering the task complete.

### Project conventions (apply unless local codebase uses another established pattern)

1. Prefer branded/typed IDs on columns when the project uses them.

```ts
id: text("id").primaryKey().$type<UserId>();
```

2. Prefer `.$defaultFn(...)` for generated IDs/timestamps when existing tables follow that style.

```ts
createdAt: timestamp("created_at")
  .$defaultFn(() => new Date())
  .notNull();
```

3. Place indexes/compound constraints in the third `pgTable` argument when local schema files do so.

```ts
(table) => [
  index("sessions_user_id_idx").on(table.userId),
  unique().on(table.userId, table.organizationId),
];
```

4. Pass full schema to `drizzle(...)` when the codebase relies on relational query helpers.

## Query Strategy Guidance

Prefer a single composed query (joins/select projection) when it reduces round trips and keeps logic readable.

Use relation query helpers (`db.query.<table>.findMany/findFirst` with `with`) when they express the read clearly, keep types clean, and avoid unnecessary query complexity.

Escalate to custom join/aggregation queries when relation helpers cannot represent required filtering, projection, or aggregation efficiently.

## Scope Boundaries

Focus this skill on Drizzle schema/query/migration implementation patterns.

Delegate broader database performance triage and production indexing strategy to `process-db-report` or `performance-optimization` when the task is primarily performance investigation.

## Resources

Load detailed examples only when needed:

- `references/schema-patterns.md` - Full table, relation, typing, and index examples
- `references/query-patterns.md` - Full query, join, aggregation, and mutation examples
- `references/migrations-and-testing.md` - Migration workflow and test/seed examples
