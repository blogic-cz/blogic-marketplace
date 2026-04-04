# Database Performance Analysis

## Critical Issues (Immediate Action Required)

### 1. Bloated Tables (Dead Rows >10%)

- **table_name** (X% dead rows, Y MB)
  - Action: Run VACUUM via /app/admin/observability UI
  - Impact: Reclaim ~Z MB disk space, improve query speed

### 2. Missing/Weak Index Coverage (Index Usage <50%)

- **table_name** table (X% index usage, Nk sequential scans)
  - Validation required: Confirm query filter/sort/join patterns before proposing index shape
  - Action: Add index strategy in schema.ts after query-path validation
  - Code example:
    ```typescript
    export const tableName = pgTable(
      "table_name",
      {
        /* fields */
      },
      (table) => [index("idx_table_lookup").on(table.column1, table.column2)],
    );
    ```

## Medium Priority (Plan for Next Sprint)

### 3. Unused Indexes (Remove Only if Safe)

- **idx_name** (N uses, X MB)
  - Validation required: Confirm representative workload window and real query-path usage
  - Safety checks: Verify index is not PK/UNIQUE and not required by app behavior
  - Action: Remove from schema.ts, generate migration
  - Impact: Faster INSERT/UPDATE on affected table

## Low Priority (Monitor)

### 4. Cache Hit Ratio (X%)

- Slightly below optimal (target: >99%)
- Action: Analyze workload and query locality first
- Escalation-only option: Consider `shared_buffers` tuning with infrastructure owners

## Workflow

1. Add indexes to `packages/db/src/schema.ts`
2. Generate migration: `bun run db:generate`
3. Review migration SQL in `packages/db/drizzle/`
4. Apply: `bun run db:migrate`
5. Run VACUUM on bloated tables via /app/admin/observability UI
6. Monitor Sentry for query performance improvements
7. Re-run report after 24-48h to verify impact

## Missing Data Handling

- Ask for missing report sections before final recommendations.
- Mark blocked items as "insufficient data" instead of inferring values.
- Estimate improvements only when the report includes enough data.
