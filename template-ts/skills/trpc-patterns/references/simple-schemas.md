# Simple Inline Schema Examples

Complete examples of inline schema patterns for TRPC routers in the project.

## Basic Inline Schema

For simple validation schemas, define them inline within the procedure:

```typescript
import { z } from "zod";

export const router = {
  getUserById: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, input.userId))
        .limit(1);

      if (!user.length) {
        throw notFoundError("User not found");
      }

      return user[0];
    }),
} satisfies TRPCRouterRecord;
```

## Using Enums from Common

Always use enum values from `@project/common` instead of hardcoding:

```typescript
import {
  OrganizationRoles,
  ProjectStatus,
} from "@project/common";
import { z } from "zod";

export const router = {
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        organizationId: z.string().min(1),
        status: z.enum([
          ProjectStatus.Active,
          ProjectStatus.Archived,
          ProjectStatus.Draft,
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),

  updateMemberRole: protectedMemberAccessProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        memberId: z.string().min(1),
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

## Email Validation

```typescript
export const router = {
  sendInvitation: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        organizationId: z.string().min(1),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),
} satisfies TRPCRouterRecord;
```

## Optional Fields

```typescript
export const router = {
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only update provided fields
      const updates: Partial<User> = {};
      if (input.name) updates.name = input.name;
      if (input.bio) updates.bio = input.bio;
      if (input.avatarUrl)
        updates.avatarUrl = input.avatarUrl;

      return await ctx.db
        .update(usersTable)
        .set(updates)
        .where(eq(usersTable.id, ctx.session.user.id));
    }),
} satisfies TRPCRouterRecord;
```

## Arrays and Nested Objects

```typescript
export const router = {
  bulkCreateMembers: protectedMemberAccessProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        members: z
          .array(
            z.object({
              email: z.string().email(),
              role: z.enum([
                OrganizationRoles.Admin,
                OrganizationRoles.Member,
              ]),
            })
          )
          .min(1)
          .max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),
} satisfies TRPCRouterRecord;
```

## Branded Types (Session IDs)

For session-related inputs, use branded types from `@project/common`:

```typescript
import {
  AuthSessionId,
  ClientSessionId,
} from "@project/common";
import { z } from "zod";

export const router = {
  revokeSession: adminProcedure
    .input(
      z.object({
        sessionId: z.string().$brand<AuthSessionId>(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // input.sessionId is type AuthSessionId
      await ctx.db
        .delete(authSessionsTable)
        .where(eq(authSessionsTable.id, input.sessionId));
    }),

  getClientSession: protectedProcedure
    .input(
      z.object({
        clientSessionId: z
          .string()
          .$brand<ClientSessionId>(),
      })
    )
    .query(async ({ ctx, input }) => {
      // input.clientSessionId is type ClientSessionId
      // Implementation
    }),
} satisfies TRPCRouterRecord;
```

## Pagination

```typescript
export const router = {
  listProjects: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        sortBy: z
          .enum(["name", "createdAt", "updatedAt"])
          .optional(),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const projects = await ctx.db
        .select()
        .from(projectsTable)
        .where(
          eq(
            projectsTable.organizationId,
            input.organizationId
          )
        )
        .limit(input.limit)
        .offset(offset);

      return {
        projects,
        page: input.page,
        limit: input.limit,
      };
    }),
} satisfies TRPCRouterRecord;
```

## Date/Time Validation

```typescript
export const router = {
  getActivityLog: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Implementation
    }),
} satisfies TRPCRouterRecord;
```

## When to Extract Schema

Only extract schema to a separate constant when:

1. The schema is used in multiple procedures
2. The schema is complex (>10 fields)
3. The schema needs to be exported for client-side validation

```typescript
// ✅ Good - Schema used in multiple procedures
const projectInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  organizationId: z.string().min(1),
  status: z.enum([
    ProjectStatus.Active,
    ProjectStatus.Archived,
    ProjectStatus.Draft,
  ]),
});

export const router = {
  createProject: protectedProcedure
    .input(projectInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),

  updateProject: protectedProcedure
    .input(
      z
        .object({
          projectId: z.string().min(1),
        })
        .merge(projectInputSchema.partial())
    )
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),
} satisfies TRPCRouterRecord;
```

## Anti-Patterns to Avoid

```typescript
// ❌ Bad - Hardcoded enum values
role: z.enum(["owner", "admin", "member"]),

// ✅ Good - Using common types
role: z.enum([
  OrganizationRoles.Owner,
  OrganizationRoles.Admin,
  OrganizationRoles.Member,
]),

// ❌ Bad - Extracting simple schema unnecessarily
const getUserByIdSchema = z.object({
  userId: z.string().min(1),
});

export const router = {
  getUserById: protectedProcedure
    .input(getUserByIdSchema)
    .query(async ({ ctx, input }) => {
      // Implementation
    }),
};

// ✅ Good - Inline simple schema
export const router = {
  getUserById: protectedProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      // Implementation
    }),
};
```
