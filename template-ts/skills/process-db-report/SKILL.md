---
name: process-db-report
description: "LOAD THIS SKILL when: analyzing database performance reports, user mentions 'db report', 'database performance', 'dead rows', 'VACUUM', 'sequential scans', 'unused indexes', 'cache hit ratio'. Contains PostgreSQL performance triage heuristics, priority ranking, and action plan templates for Drizzle ORM codebases."
compatibility: opencode
---

# Database Performance Report Processing

Use this skill to analyze database observability reports and create prioritized optimization plans. Covers PostgreSQL performance triage heuristics specific to Drizzle ORM codebases.

## Triage Workflow

1. **Parse Report** — Extract data from the pasted observability report
2. **Analyze Issues** — Identify critical performance problems
3. **Priority Ranking** — Sort issues by impact (high/medium/low)
4. **Generate Action Plan** — Create specific tasks with code snippets

---

## Issue Detection Heuristics

### Critical Issues (Immediate Action)

| Issue | Detection Rule | Action |
|-------|---------------|--------|
| Bloated Tables | Dead rows >10% in Table Statistics | VACUUM via /app/admin/observability UI |
| Missing Indexes | Index usage <50% with high sequential scans | Add composite index in `packages/db/src/schema.ts` |
| Foreign Keys Without Indexes | FK columns without corresponding indexes | Add index in schema.ts |

### Medium Priority (Next Sprint)

| Issue | Detection Rule | Action |
|-------|---------------|--------|
| Unused Indexes | Non-unique indexes with <10 uses | Remove from schema.ts (verify not PK/UNIQUE first) |
| Duplicate Indexes | Multiple indexes covering same columns | Remove redundant index |

### Low Priority (Monitor)

| Issue | Detection Rule | Action |
|-------|---------------|--------|
| Cache Hit Ratio | Below 99% | Consider increasing `shared_buffers` |

---

## Report Format Expected

```
Table Statistics:
| table_name | total_size | dead_rows | dead_ratio_pct |
|------------|------------|-----------|----------------|
| users      | 2048 MB    | 15000     | 12.5           |

High Sequential Scans:
| table_name | sequential_scans | index_usage_pct |
|------------|------------------|-----------------|
| sessions   | 45000            | 25              |

Unused/Rarely Used Indexes:
| index_name           | times_used | index_size |
|---------------------|------------|------------|
| idx_old_feature     | 2          | 5 MB       |

Foreign Keys Without Indexes:
| table_name | column_name | suggested_index |
|------------|-------------|-----------------|
| posts      | user_id     | CREATE INDEX... |

Cache Hit Ratio:
| cache_hit_ratio_pct |
|---------------------|
| 97.5                |
```

---

## Index Safety Rules

**NEVER remove these indexes:**

- Primary keys (`*_pkey`)
- Unique constraints (`*_unique`)
- Business logic constraints (e.g., `organizations_slug_unique`)

**SAFE to remove:**

- Non-unique indexes with <10 uses
- Redundant indexes (covered by composite indexes)

Example of safe removal:

```typescript
// oauth_consents has composite unique(userId, clientId)
// So single-column index on clientId alone is redundant
index("oauth_consents_client_id_idx"); // SAFE TO REMOVE
```

---

## Action Plan Template

````markdown
# Database Performance Analysis

## Critical Issues (Immediate Action Required)

### 1. Bloated Tables (Dead Rows >10%)

- **table_name** (X% dead rows, Y MB)
  - Action: Run VACUUM via /app/admin/observability UI
  - Impact: Reclaim ~Z MB disk space, improve query speed

### 2. Missing Indexes (Index Usage <50%)

- **table_name** table (X% index usage, Nk sequential scans)
  - Action: Add composite index in schema.ts
  - Code:
    ```typescript
    export const tableName = pgTable(
      "table_name",
      { /* fields */ },
      (table) => [
        index("idx_table_lookup").on(table.column1, table.column2),
      ]
    );
    ```

## Medium Priority (Plan for Next Sprint)

### 3. Unused Indexes (Remove ONLY if Safe)

- **idx_name** (N uses, X MB) - verify not a PK/UNIQUE first
  - Action: Remove from schema.ts, generate migration
  - Impact: Faster INSERT/UPDATE on affected table

## Low Priority (Monitor)

### 4. Cache Hit Ratio (X%)

- Slightly below optimal (target: >99%)
- Action: Consider increasing `shared_buffers` in PostgreSQL config

## Workflow

1. Add indexes to `packages/db/src/schema.ts`
2. Generate migration: `bun run db:generate`
3. Review migration SQL in `packages/db/drizzle/`
4. Apply: `bun run db:migrate`
5. Run VACUUM on bloated tables via /app/admin/observability UI
6. Monitor Sentry for query performance improvements
7. Re-run report after 24-48h to verify impact
````

---

## Important Rules

- Reference actual file paths (`packages/db/src/schema.ts`)
- Provide exact code snippets for schema changes
- Prioritize by impact (dead rows > missing indexes > unused indexes)
- NEVER suggest ad-hoc SQL — schema.ts is source of truth
- Include workflow steps at the end
- Estimate disk space/performance improvements

---

## Related Skills

- `performance-optimization` — Effect parallel patterns, N+1 fixes, batch operations
- `drizzle-database` — Schema patterns, migrations, relations
- `production-troubleshooting` — Kubernetes performance debugging
