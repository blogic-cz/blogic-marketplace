---
name: trpc-patterns
description: "LOAD THIS SKILL when: creating TRPC routers, adding procedures, building custom middleware, or implementing error handling in TRPC endpoints."
compatibility: opencode
---

# TRPC Patterns

## Overview

Implement TRPC routers following the project's established patterns for schema definition, custom procedures, middleware, and error handling.

## When to Use This Skill

Use this skill when:

- Creating new TRPC routers
- Adding procedures to existing routers
- Building custom middleware for authorization
- Implementing error handling in TRPC endpoints
- Need examples of proper TRPC patterns

## Core Patterns

### 1. Simple Inline Schemas

For simple validation schemas, define them inline within the procedure. Always use types from `@project/common` instead of hardcoding values.

**Pattern:**

```typescript
import { OrganizationRoles } from "@project/common";
import { z } from "zod";

export const router = {
  createInvitation: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        organizationId: z.string().min(1),
        role: z.enum([
          OrganizationRoles.Owner,
          OrganizationRoles.Admin,
          OrganizationRoles.Member,
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),
} satisfies TRPCRouterRecord;
```

**Rules:**

- ✅ Inline simple schemas directly in procedure definition
- ✅ Use enum values from `@project/common`
- ❌ Don't create separate schema constants for simple cases
- ❌ Don't hardcode enum values like `["owner", "admin", "member"]`

See `references/simple-schemas.md` for more examples.

### 2. Custom Procedures for Organization Access

For organization-scoped operations, use `protectedMemberAccessProcedure` instead of manually checking membership.

**Pattern:**

```typescript
export const router = {
  getOrganizationCredentials: protectedMemberAccessProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Organization membership already validated
      const credentials = await ctx.db
        .select()
        .from(credentialsTable);
      // Direct implementation
    }),
} satisfies TRPCRouterRecord;
```

**Available Procedures:**

- `publicProcedure` - No authentication required
- `protectedProcedure` - Requires authenticated user
- `adminProcedure` - Requires admin role
- `protectedMemberAccessProcedure` - Requires organization membership

**Rules:**

- ✅ Use `protectedMemberAccessProcedure` for org-scoped operations
- ❌ Don't manually check organization membership in procedures

See `references/custom-procedures.md` for detailed examples and context enhancement patterns.

### 3. Creating Custom Middleware

Build reusable base procedures using the `.use()` method for middleware logic.

**Pattern:**

```typescript
export const protectedMemberAccessProcedure =
  protectedProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .use(async function isMemberOfOrganization(opts) {
      const { ctx, input } = opts;

      const memberAccess = await ctx.db
        .select()
        .from(membersTable)
        .where(
          and(
            eq(
              membersTable.organizationId,
              input.organizationId
            ),
            eq(membersTable.userId, ctx.session.user.id)
          )
        )
        .limit(1);

      if (!memberAccess.length) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You are not a member of this organization",
        });
      }

      return opts.next({
        ctx: {
          member: memberAccess[0],
        },
      });
    });
```

**Middleware Rules:**

- ✅ Use `.use()` method to chain middleware functions
- ✅ Always return `opts.next()` with enhanced context
- ✅ Name middleware functions descriptively
- ✅ Build on existing base procedures
- ❌ Don't create utility function approaches

See `references/middleware-patterns.md` for advanced middleware examples.

### 4. Error Handling

Always use standardized error helpers from `@/infrastructure/errors.ts`.

**Pattern:**

```typescript
import {
  badRequestError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
} from "@/infrastructure/errors";

export const router = {
  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, input.projectId))
        .limit(1);

      if (!project.length) {
        throw notFoundError("Project not found");
      }

      if (project[0].ownerId !== ctx.session.user.id) {
        throw forbiddenError(
          "You don't have permission to delete this project"
        );
      }

      // Implementation...
    }),
} satisfies TRPCRouterRecord;
```

**Available Error Helpers:**

- `badRequestError(message)` - Invalid input or request
- `unauthorizedError(message)` - Authentication issues
- `forbiddenError(message)` - Authorization/permission issues
- `notFoundError(message)` - Missing resources

**Rules:**

- ✅ Use error helper functions
- ❌ Don't create TRPCError manually

See `references/error-handling.md` for comprehensive error handling patterns.

## Type Inference

**IMPORTANT:** TRPC types are **automatically inferred** from backend router definitions through TypeScript's static type system. No code generation is needed.

**Pattern:**

```typescript
// Backend: apps/web-app/src/projects/trpc/project.ts
export const router = {
  estimateProjectCreation: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        integrationsCount: 10,
        estimatedSeconds: 5,
      };
    }),
} satisfies TRPCRouterRecord;

// Frontend: Types are automatically inferred via static imports
const estimate =
  trpc.project.estimateProjectCreation.useQuery({
    organizationId: "123",
  });
// TypeScript knows estimate.data has { integrationsCount: number, estimatedSeconds: number }
```

**Type Inference Rules:**

- ✅ Types are **statically inferred** from backend router through TypeScript imports
- ✅ Frontend imports `AppRouter` type and gets full type safety
- ✅ Server does NOT need to be running for type inference (it's static analysis)
- ✅ Changes to backend router immediately update frontend types on next TypeScript check
- ❌ Don't create manual type definitions for TRPC endpoints
- ❌ Don't expect runtime type generation - it's compile-time only

**How It Works:**

1. Backend exports `AppRouter` type from root router
2. Frontend imports `AppRouter` and creates typed TRPC client
3. TypeScript compiler statically analyzes backend code and infers all types
4. IDE and type checker see changes immediately after file save

**If new endpoint doesn't appear:**

- Check if backend router is properly exported in root router
- Verify TypeScript can resolve the import path
- Restart TypeScript language server in IDE if needed

## SQL Query Optimization

Always prefer single SQL queries with JOINs over multiple separate queries.

**Pattern:**

```typescript
// ✅ Good - Single optimized query with joins
export const router = {
  getOrganizationsDetails: protectedProcedure.query(
    async ({ ctx: { session, db } }) => {
      const result = await db
        .select({
          organization: organizationsTable,
          project: projectsTable,
          integration: organizationIntegrationsTable,
          userRole: membersTable.role,
        })
        .from(membersTable)
        .innerJoin(
          organizationsTable,
          eq(
            membersTable.organizationId,
            organizationsTable.id
          )
        )
        .leftJoin(
          projectsTable,
          eq(
            projectsTable.organizationId,
            organizationsTable.id
          )
        )
        .where(eq(membersTable.userId, session.user.id));

      return groupResults(result);
    }
  ),
};
```

**SQL Optimization Rules:**

- Use single queries with JOINs instead of multiple queries
- Only fetch data that's actually needed
- Use LEFT JOIN for optional relationships, INNER JOIN for required
- Group/aggregate in SQL when possible, otherwise in application code

## Resources

### references/

Detailed reference documentation for each pattern:

- `simple-schemas.md` - Complete examples of inline schema patterns
- `custom-procedures.md` - Available procedures and context enhancement
- `middleware-patterns.md` - Advanced middleware creation patterns
- `error-handling.md` - Comprehensive error handling guide
