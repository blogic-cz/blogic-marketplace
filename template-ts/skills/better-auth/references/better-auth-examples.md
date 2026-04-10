# Better Auth Detailed Examples

Use these examples after selecting a procedure from `../SKILL.md`.

## Configure Better Auth

```typescript
// apps/web-app/src/auth/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: serverEnv.BETTER_AUTH_URL,
  secret: serverEnv.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session: sessionsTable,
      account: accountsTable,
      verification: verificationsTable,
      organization: organizationsTable,
      member: membersTable,
      invitation: invitationsTable,
    },
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  socialProviders: {
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    },
  },
  emailAndPassword: { enabled: true },
  plugins: [admin(), organization({ sendInvitationEmail: async () => {} })],
});
```

## Build TRPC Context

```typescript
// apps/web-app/src/infrastructure/trpc/init.ts
export const createTRPCContext = async ({ headers }: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers });
  return { db, session, headers };
};
```

## Define Base Procedures

```typescript
// apps/web-app/src/infrastructure/trpc/procedures/auth.ts
const enforceUserIsAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw unauthorizedError();

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
      userId: ctx.session.user.id as UserId,
    },
  });
});

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user || ctx.session.user.role !== "admin") throw unauthorizedError();
  return next({ ctx });
});

export const publicProcedure = t.procedure.use(debugMiddleware).use(sentryMiddleware);
export const protectedProcedure = publicProcedure.use(enforceUserIsAuthenticated);
export const adminProcedure = publicProcedure.use(enforceUserIsAdmin);
```

## Define Organization Procedures

```typescript
// apps/web-app/src/infrastructure/trpc/procedures/organization.ts
export const protectedOrganizationMemberProcedure = protectedProcedure
  .input(Schema.standardSchemaV1(Schema.Struct({ organizationId: OrganizationId })))
  .use(async function isMemberOfOrganization(opts) {
    const memberAccess = await opts.ctx.db
      .select()
      .from(membersTable)
      .where(
        and(
          eq(membersTable.organizationId, opts.input.organizationId),
          eq(membersTable.userId, opts.ctx.userId),
        ),
      )
      .limit(1);

    if (memberAccess.length === 0) {
      throw forbiddenError("Organization membership required");
    }

    return opts.next({
      ctx: {
        ...opts.ctx,
        member: memberAccess[0],
        organizationId: opts.input.organizationId,
      },
    });
  });

export const protectedOrganizationAdminProcedure = protectedProcedure
  .input(Schema.standardSchemaV1(Schema.Struct({ organizationId: OrganizationId })))
  .use(async function isAdminOfOrganization(opts) {
    const memberAccess = await opts.ctx.db
      .select()
      .from(membersTable)
      .where(
        and(
          eq(membersTable.organizationId, opts.input.organizationId),
          eq(membersTable.userId, opts.ctx.userId),
          or(eq(membersTable.role, "admin"), eq(membersTable.role, "owner")),
        ),
      )
      .limit(1);

    if (memberAccess.length === 0) {
      throw forbiddenError("Organization admin access required");
    }

    return opts.next({
      ctx: {
        ...opts.ctx,
        member: memberAccess[0],
        organizationId: opts.input.organizationId,
      },
    });
  });
```

## Define Project Procedures (Correct Variable Origins)

```typescript
// apps/web-app/src/infrastructure/trpc/procedures/project-access.ts
export const protectedProjectMemberProcedure = protectedProcedure
  .input(Schema.standardSchemaV1(Schema.Struct({ projectId: ProjectId })))
  .use(async function hasProjectAccess(opts) {
    const rows = await opts.ctx.db
      .select({
        project: projectsTable,
        orgRole: membersTable.role,
        projectRole: projectMembersTable.role,
      })
      .from(projectsTable)
      .leftJoin(
        membersTable,
        and(
          eq(membersTable.organizationId, projectsTable.organizationId),
          eq(membersTable.userId, opts.ctx.userId),
        ),
      )
      .leftJoin(
        projectMembersTable,
        and(
          eq(projectMembersTable.projectId, projectsTable.id),
          eq(projectMembersTable.userId, opts.ctx.userId),
        ),
      )
      .where(eq(projectsTable.id, opts.input.projectId))
      .limit(1);

    const row = rows[0];
    if (!row) throw notFoundError("Project not found");

    const isOrgAdmin = row.orgRole === "admin" || row.orgRole === "owner";
    if (isOrgAdmin) {
      return opts.next({
        ctx: {
          ...opts.ctx,
          project: row.project,
          orgRole: row.orgRole,
          projectRole: "admin",
        },
      });
    }

    if (!row.projectRole) {
      throw forbiddenError("Project membership required");
    }

    return opts.next({
      ctx: {
        ...opts.ctx,
        project: row.project,
        orgRole: row.orgRole,
        projectRole: row.projectRole,
      },
    });
  });

export const protectedProjectAdminProcedure = protectedProjectMemberProcedure.use(
  async function requiresProjectAdmin(opts) {
    const isOrgAdmin = opts.ctx.orgRole === "admin" || opts.ctx.orgRole === "owner";
    const isProjectAdmin = opts.ctx.projectRole === "admin";

    if (isOrgAdmin || isProjectAdmin) return opts.next({ ctx: opts.ctx });
    throw forbiddenError("Project admin permissions required");
  },
);
```

## Use Better Auth Client

```typescript
// apps/web-app/src/auth/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  betterAuthBaseUrl,
  plugins: [adminClient(), organizationClient()],
});

export const { signIn, signOut, useSession, getSession } = authClient;
```

## Use Better Auth Admin API from TRPC

```typescript
setUserAdmin: adminProcedure.mutation(async ({ ctx, input }) => {
  const users = await auth.api.listUsers({
    headers: ctx.headers,
    query: {
      searchField: "email",
      searchValue: input.email,
    },
  });

  const user = users.users[0];
  if (!user) throw notFoundError("User not found");

  await auth.api.setRole({
    headers: ctx.headers,
    body: {
      userId: user.id,
      role: input.isAdmin ? "admin" : "user",
    },
  });
});

banUser: adminProcedure.mutation(async ({ ctx, input }) => {
  await auth.api.banUser({
    headers: ctx.headers,
    body: {
      userId: input.userId,
      banReason: input.banReason,
    },
  });
});
```
