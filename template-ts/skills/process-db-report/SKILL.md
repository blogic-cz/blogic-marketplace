---
name: process-db-report
description: "This skill should be used when analyzing PostgreSQL performance reports, including pasted PostgreSQL reports, or when users mention db report, database performance, dead rows, VACUUM, sequential scans, unused indexes, or cache hit ratio. It provides PostgreSQL triage heuristics, priority ranking, and action-plan guidance for Drizzle ORM codebases."
compatibility: opencode
---

# Database Performance Report Processing

Analyze database observability reports and produce prioritized optimization plans for Drizzle ORM codebases.

## Triage Workflow

1. **Parse report** — Extract structured data from the pasted observability report.
2. **Validate report completeness** — Identify missing sections before making recommendations.
3. **Analyze issues** — Detect high-impact problems with evidence-based rules.
4. **Rank priorities** — Sort issues by impact (high/medium/low).
5. **Generate action plan** — Propose specific, safe tasks with schema-level guidance.

## Incomplete Report Handling

- Ask for missing sections instead of guessing when required data is absent.
- Request only the missing parts needed for the blocked recommendation.
- Mark recommendations as conditional when partial data is available.

Required sections for full triage:

- Table Statistics
- High Sequential Scans
- Unused/Rarely Used Indexes
- Foreign Keys Without Indexes
- Cache Hit Ratio

---

## Issue Detection Heuristics

### Critical Issues (Immediate Action)

| Issue                        | Detection Rule                                                                   | Action                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Bloated Tables               | Dead rows >10% in Table Statistics                                               | VACUUM via /app/admin/observability UI                                                        |
| Missing/Weak Index Coverage  | Index usage <50% with high sequential scans and known query filter/sort patterns | Propose an index strategy in `packages/db/src/schema.ts` only after validating query patterns |
| Foreign Keys Without Indexes | FK columns without corresponding indexes                                         | Add index in schema.ts                                                                        |

### Medium Priority (Next Sprint)

| Issue             | Detection Rule                                                     | Action                                                                         |
| ----------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Unused Indexes    | Non-unique indexes with low usage across a defined workload window | Remove from schema.ts only after validating real query paths and safety checks |
| Duplicate Indexes | Multiple indexes covering same columns                             | Remove redundant index                                                         |

### Low Priority (Monitor)

| Issue           | Detection Rule | Action                                                                                                            |
| --------------- | -------------- | ----------------------------------------------------------------------------------------------------------------- |
| Cache Hit Ratio | Below 99%      | Investigate workload and cache behavior first; escalate `shared_buffers` tuning as optional infra-level follow-up |

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

- Non-unique indexes with consistently low usage over a representative workload window (for example 7-30 days, depending on traffic patterns)
- Redundant indexes (covered by composite indexes)

**Removal guards (required):**

- Validate workload window coverage before deciding an index is unused.
- Validate query-path usage from real application paths (API endpoints, background jobs, cron flows) before removal.
- Verify no hidden dependency through constraints, migrations, or operational workflows.
- Keep recommendation conditional if query-path validation data is missing.

Example of safe removal:

```typescript
// oauth_consents has composite unique(userId, clientId)
// So single-column index on clientId alone is redundant
index("oauth_consents_client_id_idx"); // SAFE TO REMOVE
```

---

## Action Plan Template

Load and follow `references/action-plan-template.md` for the full output structure and wording.

---

## Important Rules

- Reference actual file paths (`packages/db/src/schema.ts`)
- Provide exact code snippets for schema changes
- Prioritize by impact (dead rows > missing indexes > unused indexes)
- NEVER suggest ad-hoc SQL — schema.ts is source of truth
- Include workflow steps at the end
- Estimate improvements only when the report provides enough data to support a defensible estimate
- Treat `shared_buffers` tuning as optional and escalation-only infrastructure guidance

---

## Related Skills

- `performance-optimization` — Effect parallel patterns, N+1 fixes, batch operations
- `drizzle-database` — Schema patterns, migrations, relations
- `production-troubleshooting` — Kubernetes performance debugging
