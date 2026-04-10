# Substitution Rules

Apply these rules to every file copied or merged from template source.

## 1) Build Matrix

Derive project values and build this matrix:

| Template Value       | Project Value          |
| -------------------- | ---------------------- |
| `@blogic-template/`  | `@<project-scope>/`    |
| `blogic-template-ts` | `<project-name>`       |
| `blogic-template`    | `<project-short-name>` |

Add any extra template identifiers discovered during diff.

## 2) Apply Matrix Consistently

- Replace template identifiers in synced files.
- Preserve project-specific secrets, domains, namespaces, IDs, and environment values.
- Avoid replacing strings in binary assets or generated lock artifacts unless explicitly required.

## 3) Approved Exceptions

Allow template identifiers only in these locations unless repository policy states otherwise:

- Template source clone (`$TPL/**` or equivalent temporary clone).
- Historical records documenting origin/version (`.template-version`, `CHANGELOG.md`).
- Explicit template metadata files that intentionally reference source identity (`skills-lock.json`).

Treat all other occurrences as substitution failures.

## 4) Guardrail and DoD Alignment

Enforce this rule in both guardrails and definition of done:

- Never leave template identifiers outside approved exceptions.

Keep exception list identical across both sections to avoid policy drift.
