# Comprehensive Error Handling Guide

Complete guide to error handling in TRPC routers using standardized error helpers.

## Standard Error Helpers

Import error helpers from `@/infrastructure/errors.ts`:

```typescript
import {
  badRequestError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
} from "@/infrastructure/errors";
```

### 1. badRequestError - Invalid Input

Use for invalid input or malformed requests:

```typescript
export const router = {
  createProject: protectedMemberAccessProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if project name already exists
      const existing = await ctx.db
        .select()
        .from(projectsTable)
        .where(
          and(
            eq(
              projectsTable.organizationId,
              input.organizationId
            ),
            eq(projectsTable.name, input.name)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw badRequestError(
          "A project with this name already exists"
        );
      }

      // Create project
    }),
} satisfies TRPCRouterRecord;
```

**When to use:**

- Duplicate resource names
- Invalid data format (beyond Zod validation)
- Business rule violations
- Resource limits exceeded

### 2. unauthorizedError - Authentication Issues

Use for authentication failures:

```typescript
export const router = {
  validateApiKey: publicProcedure
    .input(z.object({ apiKey: z.string() }))
    .query(async ({ ctx, input }) => {
      const key = await ctx.db
        .select()
        .from(apiKeysTable)
        .where(eq(apiKeysTable.key, input.apiKey))
        .limit(1);

      if (!key.length) {
        throw unauthorizedError("Invalid API key");
      }

      if (key[0].expiresAt < new Date()) {
        throw unauthorizedError("API key has expired");
      }

      return { valid: true };
    }),
} satisfies TRPCRouterRecord;
```

**When to use:**

- Invalid credentials
- Expired tokens
- Missing authentication
- Invalid API keys

### 3. forbiddenError - Authorization/Permission Issues

Use for permission and authorization failures:

```typescript
export const router = {
  deleteProject: protectedProjectAccessProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // ctx.project and ctx.member available from procedure

      // Check if user has permission to delete
      if (
        ctx.member.role !== OrganizationRoles.Owner &&
        ctx.member.role !== OrganizationRoles.Admin
      ) {
        throw forbiddenError(
          "Only owners or admins can delete projects"
        );
      }

      await ctx.db
        .delete(projectsTable)
        .where(eq(projectsTable.id, input.projectId));
    }),

  updateOrganizationBilling: protectedMemberAccessProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        billingEmail: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only owners can update billing
      if (ctx.member.role !== OrganizationRoles.Owner) {
        throw forbiddenError(
          "Only organization owners can update billing information"
        );
      }

      // Update billing
    }),
} satisfies TRPCRouterRecord;
```

**When to use:**

- Insufficient role/permissions
- Organization membership required
- Resource ownership required
- Feature not available for user's plan

### 4. notFoundError - Missing Resources

Use when resources don't exist:

```typescript
export const router = {
  getProjectById: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, input.projectId))
        .limit(1);

      if (!project.length) {
        throw notFoundError("Project not found");
      }

      return project[0];
    }),

  getUserByEmail: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, input.email))
        .limit(1);

      if (!user.length) {
        throw notFoundError(
          `User with email ${input.email} not found`
        );
      }

      return user[0];
    }),
} satisfies TRPCRouterRecord;
```

**When to use:**

- Resource doesn't exist
- Invalid resource ID
- Deleted resources
- Expired resources

## Error Handling Patterns

### Pattern: Validate Before Action

Check all conditions before performing actions:

```typescript
export const router = {
  transferProjectOwnership: protectedProjectAccessProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        newOwnerId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate current user is owner
      if (ctx.project.ownerId !== ctx.session.user.id) {
        throw forbiddenError(
          "Only the project owner can transfer ownership"
        );
      }

      // Validate new owner exists and is a member
      const newOwner = await ctx.db
        .select()
        .from(membersTable)
        .where(
          and(
            eq(membersTable.userId, input.newOwnerId),
            eq(
              membersTable.organizationId,
              ctx.project.organizationId
            )
          )
        )
        .limit(1);

      if (!newOwner.length) {
        throw notFoundError(
          "New owner must be a member of the organization"
        );
      }

      // All validations passed, perform action
      await ctx.db
        .update(projectsTable)
        .set({ ownerId: input.newOwnerId })
        .where(eq(projectsTable.id, input.projectId));
    }),
} satisfies TRPCRouterRecord;
```

### Pattern: Early Return with Errors

Return early when conditions aren't met:

```typescript
export const router = {
  createApiKey: protectedProjectAccessProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check API key limit
      const keyCount = await ctx.db
        .select({ count: count() })
        .from(apiKeysTable)
        .where(eq(apiKeysTable.projectId, input.projectId));

      if (keyCount[0].count >= 10) {
        throw badRequestError(
          "Maximum API key limit reached for this project"
        );
      }

      // Check name uniqueness
      const existing = await ctx.db
        .select()
        .from(apiKeysTable)
        .where(
          and(
            eq(apiKeysTable.projectId, input.projectId),
            eq(apiKeysTable.name, input.name)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw badRequestError(
          "An API key with this name already exists"
        );
      }

      // Create API key
      const key = await generateApiKey();
      return await ctx.db.insert(apiKeysTable).values({
        projectId: input.projectId,
        name: input.name,
        key,
      });
    }),
} satisfies TRPCRouterRecord;
```

### Pattern: Contextual Error Messages

Provide helpful error messages with context:

```typescript
export const router = {
  inviteMember: protectedMemberAccessProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        email: z.string().email(),
        role: z.enum([
          OrganizationRoles.Admin,
          OrganizationRoles.Member,
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user can invite (Admin or Owner only)
      if (
        ctx.member.role !== OrganizationRoles.Admin &&
        ctx.member.role !== OrganizationRoles.Owner
      ) {
        throw forbiddenError(
          "Only admins and owners can invite new members. Your current role is: " +
            ctx.member.role
        );
      }

      // Check if email is already a member
      const existing = await ctx.db
        .select()
        .from(membersTable)
        .innerJoin(
          usersTable,
          eq(membersTable.userId, usersTable.id)
        )
        .where(
          and(
            eq(
              membersTable.organizationId,
              input.organizationId
            ),
            eq(usersTable.email, input.email)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw badRequestError(
          `${input.email} is already a member of this organization`
        );
      }

      // Check if there's a pending invitation
      const pendingInvite = await ctx.db
        .select()
        .from(invitationsTable)
        .where(
          and(
            eq(
              invitationsTable.organizationId,
              input.organizationId
            ),
            eq(invitationsTable.email, input.email),
            eq(invitationsTable.status, "pending")
          )
        )
        .limit(1);

      if (pendingInvite.length > 0) {
        throw badRequestError(
          `An invitation for ${input.email} is already pending`
        );
      }

      // Create invitation
      // ...
    }),
} satisfies TRPCRouterRecord;
```

### Pattern: Database Transaction Error Handling

Handle errors within transactions:

```typescript
export const router = {
  createOrganizationWithProject: protectedProcedure
    .input(
      z.object({
        orgName: z.string().min(1),
        projectName: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.transaction(async (tx) => {
          // Create organization
          const org = await tx
            .insert(organizationsTable)
            .values({
              name: input.orgName,
              ownerId: ctx.session.user.id,
            })
            .returning();

          // Create member
          await tx.insert(membersTable).values({
            organizationId: org[0].id,
            userId: ctx.session.user.id,
            role: OrganizationRoles.Owner,
          });

          // Create project
          const project = await tx
            .insert(projectsTable)
            .values({
              name: input.projectName,
              organizationId: org[0].id,
              ownerId: ctx.session.user.id,
            })
            .returning();

          return {
            organization: org[0],
            project: project[0],
          };
        });
      } catch (error) {
        // Log error for debugging
        logger.error(
          {
            error:
              error instanceof Error
                ? error.message
                : String(error),
            userId: ctx.session.user.id,
            orgName: input.orgName,
          },
          "Failed to create organization with project"
        );

        // Return user-friendly error
        throw badRequestError(
          "Failed to create organization and project. Please try again."
        );
      }
    }),
} satisfies TRPCRouterRecord;
```

## Anti-Patterns to Avoid

### ❌ Don't Create TRPCError Manually

```typescript
// ❌ Bad
throw new TRPCError({
  code: "NOT_FOUND",
  message: "Project not found",
});

// ✅ Good
throw notFoundError("Project not found");
```

### ❌ Don't Use Generic Error Messages

```typescript
// ❌ Bad
throw badRequestError("Invalid input");

// ✅ Good
throw badRequestError(
  "Project name must be unique within the organization"
);
```

### ❌ Don't Swallow Errors

```typescript
// ❌ Bad
try {
  await someOperation();
} catch (error) {
  // Error silently ignored
  return null;
}

// ✅ Good
try {
  return await someOperation();
} catch (error) {
  logger.error({ error }, "Operation failed");
  throw badRequestError(
    "Operation failed. Please try again."
  );
}
```

### ❌ Don't Mix Error Types

```typescript
// ❌ Bad - Using wrong error type
const project = await ctx.db
  .select()
  .from(projectsTable)
  .where(eq(projectsTable.id, input.projectId))
  .limit(1);

if (!project.length) {
  throw forbiddenError("Project not found"); // Should be notFoundError
}

// ✅ Good
if (!project.length) {
  throw notFoundError("Project not found");
}
```
