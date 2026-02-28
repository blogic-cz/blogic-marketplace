# Advanced Middleware Patterns

Advanced middleware creation patterns for complex authorization and validation scenarios.

## Chaining Multiple Middleware

Stack multiple middleware functions for complex validation:

```typescript
export const protectedOwnerWithBillingProcedure =
  protectedMemberAccessProcedure
    .use(async function requiresOwnerRole(opts) {
      if (
        opts.ctx.member.role !== OrganizationRoles.Owner
      ) {
        throw forbiddenError(
          "Only organization owners can perform this action"
        );
      }
      return opts.next({ ctx: {} });
    })
    .use(async function hasBillingAccess(opts) {
      const billingInfo = await opts.ctx.db
        .select()
        .from(billingTable)
        .where(
          eq(
            billingTable.organizationId,
            opts.input.organizationId
          )
        )
        .limit(1);

      if (!billingInfo.length) {
        throw notFoundError(
          "Billing information not found"
        );
      }

      return opts.next({
        ctx: {
          billing: billingInfo[0],
        },
      });
    });
```

## Conditional Middleware

Apply middleware based on conditions:

```typescript
export const protectedFlexibleAccessProcedure =
  protectedProcedure
    .input(
      z.object({
        resourceId: z.string().min(1),
        resourceType: z.enum(["project", "organization"]),
      })
    )
    .use(async function checkFlexibleAccess(opts) {
      const { ctx, input } = opts;

      if (input.resourceType === "project") {
        // Check project access
        const project = await ctx.db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.id, input.resourceId))
          .limit(1);

        if (!project.length) {
          throw notFoundError("Project not found");
        }

        return opts.next({
          ctx: {
            resource: project[0],
            resourceType: "project" as const,
          },
        });
      } else {
        // Check organization access
        const member = await ctx.db
          .select()
          .from(membersTable)
          .where(
            and(
              eq(
                membersTable.organizationId,
                input.resourceId
              ),
              eq(membersTable.userId, ctx.session.user.id)
            )
          )
          .limit(1);

        if (!member.length) {
          throw forbiddenError(
            "Not a member of this organization"
          );
        }

        return opts.next({
          ctx: {
            resource: member[0],
            resourceType: "organization" as const,
          },
        });
      }
    });
```

## Rate Limiting Middleware

Implement rate limiting in middleware:

```typescript
export const rateLimitedProcedure = protectedProcedure.use(
  async function rateLimit(opts) {
    const { ctx } = opts;
    const key = `rate_limit:${ctx.session.user.id}`;

    // Check rate limit (using Redis or similar)
    const requests = await ctx.redis.incr(key);
    if (requests === 1) {
      await ctx.redis.expire(key, 60); // 1 minute window
    }

    if (requests > 100) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message:
          "Rate limit exceeded. Please try again later.",
      });
    }

    return opts.next({ ctx: {} });
  }
);
```

## Audit Logging Middleware

Add automatic audit logging:

```typescript
export const auditedProcedure = protectedProcedure.use(
  async function auditLog(opts) {
    const { ctx, path, type } = opts;

    // Log the request
    const auditEntry = await ctx.db
      .insert(auditLogsTable)
      .values({
        userId: ctx.session.user.id,
        action: `${type}:${path}`,
        timestamp: new Date(),
        metadata: JSON.stringify(opts.rawInput),
      })
      .returning();

    // Continue with the request
    const result = await opts.next({ ctx: {} });

    // Update audit log with result (optional)
    await ctx.db
      .update(auditLogsTable)
      .set({
        completed: true,
        completedAt: new Date(),
      })
      .where(eq(auditLogsTable.id, auditEntry[0].id));

    return result;
  }
);
```

## Feature Flag Middleware

Check feature flags before proceeding:

```typescript
export const featureFlaggedProcedure = (
  featureFlag: string
) =>
  protectedProcedure.use(
    async function checkFeatureFlag(opts) {
      const { ctx } = opts;

      // Check if feature is enabled for user's organization
      const feature = await ctx.db
        .select()
        .from(featureFlagsTable)
        .where(
          and(
            eq(featureFlagsTable.name, featureFlag),
            eq(featureFlagsTable.enabled, true)
          )
        )
        .limit(1);

      if (!feature.length) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This feature is not available",
        });
      }

      return opts.next({ ctx: {} });
    }
  );

// Usage
export const router = {
  experimentalFeature: featureFlaggedProcedure(
    "new_dashboard"
  ).query(async ({ ctx }) => {
    // Feature flag already validated
    return { enabled: true };
  }),
} satisfies TRPCRouterRecord;
```

## Permission-Based Middleware

Check specific permissions:

```typescript
export const withPermission = (permission: Permission) =>
  protectedMemberAccessProcedure.use(
    async function checkPermission(opts) {
      const { ctx, input } = opts;

      // Check if user has the required permission
      const userPermissions = await ctx.db
        .select()
        .from(permissionsTable)
        .where(
          and(
            eq(
              permissionsTable.userId,
              ctx.session.user.id
            ),
            eq(
              permissionsTable.organizationId,
              input.organizationId
            ),
            eq(permissionsTable.permission, permission)
          )
        )
        .limit(1);

      if (!userPermissions.length) {
        throw forbiddenError(
          `Missing required permission: ${permission}`
        );
      }

      return opts.next({ ctx: {} });
    }
  );

// Usage
export const router = {
  deleteIntegration: withPermission("integrations:delete")
    .input(
      z.object({
        organizationId: z.string().min(1),
        integrationId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Permission already validated
      await ctx.db
        .delete(integrationsTable)
        .where(
          eq(integrationsTable.id, input.integrationId)
        );
    }),
} satisfies TRPCRouterRecord;
```

## Caching Middleware

Add response caching:

```typescript
export const cachedProcedure = (ttl: number = 60) =>
  publicProcedure.use(async function cacheResponse(opts) {
    const { ctx, path } = opts;
    const cacheKey = `cache:${path}:${JSON.stringify(opts.rawInput)}`;

    // Check cache
    const cached = await ctx.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Execute procedure
    const result = await opts.next({ ctx: {} });

    // Store in cache
    await ctx.redis.setex(
      cacheKey,
      ttl,
      JSON.stringify(result)
    );

    return result;
  });
```

## Error Recovery Middleware

Add automatic error recovery:

```typescript
export const resilientProcedure = protectedProcedure.use(
  async function errorRecovery(opts) {
    const { ctx } = opts;
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await opts.next({ ctx: {} });
      } catch (error) {
        lastError = error as Error;

        // Only retry on transient errors
        if (
          error instanceof Error &&
          (error.message.includes("ECONNRESET") ||
            error.message.includes("timeout"))
        ) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
          continue;
        }

        // Non-transient error, don't retry
        throw error;
      }
    }

    // All retries failed
    throw lastError;
  }
);
```

## Validation Enhancement Middleware

Add additional validation beyond Zod:

```typescript
export const businessValidatedProcedure =
  protectedMemberAccessProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        projectName: z.string().min(1).max(100),
      })
    )
    .use(async function businessValidation(opts) {
      const { ctx, input } = opts;

      // Check if project name already exists in organization
      const existing = await ctx.db
        .select()
        .from(projectsTable)
        .where(
          and(
            eq(
              projectsTable.organizationId,
              input.organizationId
            ),
            eq(projectsTable.name, input.projectName)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw badRequestError(
          "A project with this name already exists in your organization"
        );
      }

      // Check organization project limit
      const projectCount = await ctx.db
        .select({ count: count() })
        .from(projectsTable)
        .where(
          eq(
            projectsTable.organizationId,
            input.organizationId
          )
        );

      if (projectCount[0].count >= 10) {
        throw badRequestError(
          "Organization has reached maximum project limit"
        );
      }

      return opts.next({ ctx: {} });
    });
```

## Transaction Wrapper Middleware

Automatically wrap in database transaction:

```typescript
export const transactionalProcedure =
  protectedProcedure.use(
    async function wrapInTransaction(opts) {
      const { ctx } = opts;

      return await ctx.db.transaction(async (tx) => {
        return await opts.next({
          ctx: {
            db: tx, // Override db with transaction
          },
        });
      });
    }
  );
```

## Anti-Patterns to Avoid

### Don't Use Utility Function Approach

```typescript
// ❌ BAD - Utility function approach (creates inconsistent patterns)
export const createOrgMemberCheck =
  () =>
  async ({ ctx, input, next }) => {
    // Don't do this - creates inconsistent patterns
    // Hard to compose, type inference issues
  };

// ✅ GOOD - Use reusable base procedure pattern instead
export const protectedMemberAccessProcedure =
  protectedProcedure
    .input(
      Schema.standardSchemaV1(
        Schema.Struct({ organizationId: Schema.String })
      )
    )
    .use(async function isMemberOfOrganization(opts) {
      const memberAccess = await opts.ctx.db
        .select()
        .from(membersTable)
        .where(/* check */);
      if (!memberAccess.length)
        throw forbiddenError("Not a member");
      return opts.next({
        ctx: { member: memberAccess[0] },
      });
    });
```

**Why avoid utility functions:**

- Breaks the procedure chain pattern
- Harder to compose with other middleware
- Type inference doesn't work as well
- Creates inconsistent patterns across codebase

## Best Practices Summary

1. **Name middleware functions descriptively** - Use clear function names
2. **Return enhanced context** - Always return `opts.next()` with new context
3. **Build on existing procedures** - Chain from appropriate base procedures
4. **Handle errors appropriately** - Use standardized error helpers
5. **Keep middleware focused** - Each middleware should have a single responsibility
6. **Document complex middleware** - Add comments explaining business logic
7. **Consider performance** - Cache expensive checks when possible
8. **Make middleware reusable** - Create factories for configurable middleware
