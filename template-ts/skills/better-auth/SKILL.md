---
name: better-auth
description: "This skill should be used when implementing or reviewing Better Auth authorization boundaries in template-ts apps, especially when selecting TRPC protected procedures for organization/project/member/admin access."
---

# Better Auth Procedure Selection

Select authorization boundaries with Better Auth + TRPC patterns used in template-ts apps.

## Procedure Selection Table

| Procedure                              | Access Level    | Context Provided                         |
| -------------------------------------- | --------------- | ---------------------------------------- |
| `publicProcedure`                      | No auth         | `{ db, session?, headers }`              |
| `protectedProcedure`                   | Authenticated   | `{ db, session, userId, headers }`       |
| `adminProcedure`                       | Admin role      | `{ db, session, headers }`               |
| `protectedOrganizationMemberProcedure` | Org member      | `{ ..., member, organizationId }`        |
| `protectedOrganizationAdminProcedure`  | Org admin/owner | `{ ..., member, organizationId }`        |
| `protectedProjectMemberProcedure`      | Project access  | `{ ..., project, projectRole, orgRole }` |
| `protectedProjectAdminProcedure`       | Project admin   | `{ ..., project, projectRole, orgRole }` |
| `protectedProjectEditorProcedure`      | Project editor+ | `{ ..., project, projectRole, orgRole }` |

Use this table as the primary selector before writing router logic.

## Use This Skill When

- Select the correct protected procedure for organization/project/member/admin access.
- Implement Better Auth authorization checks inside TRPC procedures.
- Review auth boundaries in existing routers.

## Follow This Workflow

1. Identify required access level from the Procedure Selection Table.
2. Start implementation from the matching base procedure.
3. Chain stricter middleware only when the table does not fully satisfy the access rule.
4. Load `references/better-auth-examples.md` for detailed examples and copy-ready snippets.
5. Keep context shape stable; add only route-specific fields.

## Key Rules

1. Select the narrowest procedure that matches the required permission.
2. Reuse inherited context (`userId`, `organizationId`, `project`, roles) instead of recomputing it.
3. Grant organization admins automatic project-admin behavior; avoid duplicate checks.
4. Pass `ctx.headers` to `auth.api.*` server calls.
5. Validate variable origins in every middleware (`opts.ctx`, `opts.input`) before adding business logic.

## References

- `references/better-auth-examples.md` — auth configuration, context setup, middleware examples, client auth usage, and admin API patterns.
