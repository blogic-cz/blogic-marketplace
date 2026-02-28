# Custom Procedures and Context Enhancement

Detailed examples of available TRPC procedures and how to create custom procedures with context enhancement.

## Available Base Procedures

### 1. publicProcedure

No authentication required. Use for public endpoints.

```typescript
export const router = {
  healthCheck: publicProcedure.query(async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),

  getPublicStats: publicProcedure.query(async ({ ctx }) => {
    // ctx includes: db, but no session
    const stats = await ctx.db
      .select({ count: count() })
      .from(usersTable);

    return stats;
  }),
} satisfies TRPCRouterRecord;
```

**Context available:**

- `ctx.db` - Database client

**Context NOT available:**

- `ctx.session` - No user session

### 2. protectedProcedure

Requires authenticated user. Use for user-specific operations.

```typescript
export const router = {
  getCurrentUser: protectedProcedure.query(
    async ({ ctx }) => {
      // ctx.session is guaranteed to exist
      return await ctx.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, ctx.session.user.id))
        .limit(1);
    }
  ),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(usersTable)
        .set({ name: input.name })
        .where(eq(usersTable.id, ctx.session.user.id));
    }),
} satisfies TRPCRouterRecord;
```

**Context available:**

- `ctx.db` - Database client
- `ctx.session` - User session (guaranteed)
- `ctx.session.user` - User information
- `ctx.session.user.id` - User ID

### 3. adminProcedure

Requires admin role. Use for administrative operations.

```typescript
export const router = {
  listAllUsers: adminProcedure.query(async ({ ctx }) => {
    // ctx.session.user.isAdmin is true
    return await ctx.db
      .select()
      .from(usersTable)
      .limit(100);
  }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(usersTable)
        .where(eq(usersTable.id, input.userId));
    }),
} satisfies TRPCRouterRecord;
```

**Context available:**

- `ctx.db` - Database client
- `ctx.session` - Admin user session (guaranteed)
- `ctx.session.user.isAdmin` - Always `true`

### 4. protectedMemberAccessProcedure

Requires organization membership. Use for organization-scoped operations.

```typescript
export const router = {
  getOrganizationCredentials: protectedMemberAccessProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      // Organization membership already validated
      // ctx.member contains the membership record

      const credentials = await ctx.db
        .select()
        .from(credentialsTable)
        .where(
          eq(
            credentialsTable.organizationId,
            input.organizationId
          )
        );

      return credentials;
    }),

  updateOrganization: protectedMemberAccessProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin role in organization
      if (
        ctx.member.role !== OrganizationRoles.Admin &&
        ctx.member.role !== OrganizationRoles.Owner
      ) {
        throw forbiddenError(
          "Only admins can update organization details"
        );
      }

      await ctx.db
        .update(organizationsTable)
        .set({ name: input.name })
        .where(
          eq(organizationsTable.id, input.organizationId)
        );
    }),
} satisfies TRPCRouterRecord;
```

**Context available:**

- `ctx.db` - Database client
- `ctx.session` - User session (guaranteed)
- `ctx.member` - Organization membership record
- `ctx.member.role` - User's role in the organization
- `ctx.member.organizationId` - Organization ID

**Input requirements:**

- Must include `organizationId: z.string().min(1)` in input schema

## Creating Custom Procedures

### Pattern: Context Enhancement Middleware

Build custom procedures by chaining middleware with `.use()`:

```typescript
export const protectedProjectAccessProcedure =
  protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .use(async function isProjectMember(opts) {
      const { ctx, input } = opts;

      // Check if user has access to the project
      const projectAccess = await ctx.db
        .select({
          project: projectsTable,
          member: membersTable,
        })
        .from(projectsTable)
        .innerJoin(
          membersTable,
          eq(
            projectsTable.organizationId,
            membersTable.organizationId
          )
        )
        .where(
          and(
            eq(projectsTable.id, input.projectId),
            eq(membersTable.userId, ctx.session.user.id)
          )
        )
        .limit(1);

      if (!projectAccess.length) {
        throw forbiddenError(
          "You don't have access to this project"
        );
      }

      // Return enhanced context
      return opts.next({
        ctx: {
          project: projectAccess[0].project,
          member: projectAccess[0].member,
        },
      });
    });
```

**Usage:**

```typescript
export const router = {
  getProjectDetails: protectedProjectAccessProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      // ctx.project and ctx.member are available
      return {
        project: ctx.project,
        userRole: ctx.member.role,
      };
    }),

  deleteProject: protectedProjectAccessProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is owner or admin
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
} satisfies TRPCRouterRecord;
```

### Pattern: Role-Based Procedure

Create procedures that require specific roles:

```typescript
export const protectedOwnerProcedure =
  protectedMemberAccessProcedure.use(
    async function requiresOwnerRole(opts) {
      const { ctx } = opts;

      if (ctx.member.role !== OrganizationRoles.Owner) {
        throw forbiddenError(
          "Only organization owners can perform this action"
        );
      }

      return opts.next({
        ctx: {
          // Context already includes member from parent procedure
        },
      });
    }
  );
```

**Usage:**

```typescript
export const router = {
  deleteOrganization: protectedOwnerProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // User is guaranteed to be owner
      await ctx.db
        .delete(organizationsTable)
        .where(
          eq(organizationsTable.id, input.organizationId)
        );
    }),
} satisfies TRPCRouterRecord;
```

### Pattern: Resource Ownership Check

Create procedures that verify resource ownership:

```typescript
export const protectedApiKeyAccessProcedure =
  protectedProjectAccessProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        apiKeyId: z.string().min(1),
      })
    )
    .use(async function isApiKeyOwner(opts) {
      const { ctx, input } = opts;

      const apiKey = await ctx.db
        .select()
        .from(apiKeysTable)
        .where(
          and(
            eq(apiKeysTable.id, input.apiKeyId),
            eq(apiKeysTable.projectId, input.projectId)
          )
        )
        .limit(1);

      if (!apiKey.length) {
        throw notFoundError("API key not found");
      }

      return opts.next({
        ctx: {
          apiKey: apiKey[0],
        },
      });
    });
```

## Middleware Best Practices

### 1. Named Middleware Functions

Always name middleware functions descriptively:

```typescript
// ✅ Good
.use(async function isMemberOfOrganization(opts) { ... })
.use(async function requiresOwnerRole(opts) { ... })
.use(async function hasProjectAccess(opts) { ... })

// ❌ Bad
.use(async (opts) => { ... })
.use(async function middleware(opts) { ... })
```

### 2. Return Enhanced Context

Always return `opts.next()` with enhanced context:

```typescript
// ✅ Good
return opts.next({
  ctx: {
    member: memberAccess[0],
    project: projectData,
  },
});

// ❌ Bad
return opts.next(); // Missing context enhancement
```

### 3. Build on Existing Procedures

Chain from existing base procedures instead of starting from scratch:

```typescript
// ✅ Good - Building on protectedProcedure
export const protectedMemberAccessProcedure = protectedProcedure
  .input(z.object({ organizationId: z.string().min(1) }))
  .use(async function isMemberOfOrganization(opts) { ... });

// ❌ Bad - Starting from publicProcedure
export const protectedMemberAccessProcedure = publicProcedure
  .input(z.object({ organizationId: z.string().min(1) }))
  .use(async function isMemberOfOrganization(opts) {
    // Now need to check authentication manually
    if (!opts.ctx.session) {
      throw unauthorizedError("Not authenticated");
    }
    // ... rest of logic
  });
```

### 4. Input Schema in Procedure Definition

Include input validation in the procedure chain, not in middleware:

```typescript
// ✅ Good
export const protectedMemberAccessProcedure =
  protectedProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .use(async function isMemberOfOrganization(opts) {
      // opts.input.organizationId is validated
    });

// ❌ Bad
export const protectedMemberAccessProcedure =
  protectedProcedure.use(
    async function isMemberOfOrganization(opts) {
      // Need to access raw input, no validation
      const organizationId = opts.rawInput.organizationId;
      if (!organizationId) {
        throw badRequestError("organizationId is required");
      }
    }
  );
```
