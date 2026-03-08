---
name: better-auth
description: "ALWAYS LOAD THIS SKILL when user asks about: auth, login, session, protected procedure, permission, role, organization member, admin procedure. Contains COMPLETE list of all protected procedures with their exact context - critical for choosing the right one. Load BEFORE implementing any auth logic."
---

# Better Auth Patterns

## Overview

Implement authentication and authorization using Better Auth with TRPC procedures following the project's established patterns.

## When to Use This Skill

- Configuring Better Auth settings
- Creating protected TRPC procedures
- Implementing organization/project access control
- Working with sessions and user roles
- Setting up OAuth providers

## Auth Configuration

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
      maxAge: 5 * 60, // 5 minutes cache
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

## Auth-Related Database Tables

**Core Tables:**

- `usersTable` - User accounts with `role` field (`admin` | `user`)
- `sessionsTable` - Auth sessions with `activeOrganizationId`
- `accountsTable` - OAuth accounts (stores access/refresh tokens)

**Organization Tables:**

- `organizationsTable` - Organizations
- `membersTable` - Organization members with `role` (`owner` | `admin` | `member`)
- `invitationsTable` - Pending invitations

**Project Tables:**

- `projectsTable` - Projects (belong to organizations)
- `projectMembersTable` - Project members with `role` (`admin` | `editor` | `viewer`)

## TRPC Context & Session

```typescript
// apps/web-app/src/infrastructure/trpc/init.ts
export const createTRPCContext = async ({ headers }: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers });
  return { db, session, headers };
};
```

## Protected Procedure Patterns

### Base Auth Procedures

```typescript
// apps/web-app/src/infrastructure/trpc/procedures/auth.ts
const enforceUserIsAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw unauthorizedError();
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
      userId: ctx.session.user.id as UserId,
    },
  });
});

const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user || ctx.session.user.role !== "admin") throw unauthorizedError();
  return next({ ctx });
});

export const publicProcedure = t.procedure.use(debugMiddleware).use(sentryMiddleware);
export const protectedProcedure = publicProcedure.use(enforceUserIsAuthenticated);
export const adminProcedure = publicProcedure.use(enforceUserIsAdmin);
```

### Organization Access Procedures

```typescript
// apps/web-app/src/infrastructure/trpc/procedures/organization.ts
import { OrganizationId } from "@project/common";

// Member access - any org member
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

    if (memberAccess.length === 0)
      throw forbiddenError("You are not a member of this organization");

    return opts.next({
      ctx: {
        member: memberAccess[0],
        organizationId: opts.input.organizationId,
      },
    });
  });

// Admin access - org admin/owner only
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

    if (memberAccess.length === 0) throw forbiddenError("Admin access required");

    return opts.next({
      ctx: {
        member: memberAccess[0],
        organizationId: opts.input.organizationId,
      },
    });
  });
```

### Project Access Procedures

```typescript
// apps/web-app/src/infrastructure/trpc/procedures/project-access.ts

// Single optimized query - checks both org and project membership
export const protectedProjectMemberProcedure = protectedProcedure
  .input(Schema.standardSchemaV1(Schema.Struct({ projectId: ProjectId })))
  .use(async function hasProjectAccess(opts) {
    const result = await ctx.db
      .select({
        projectId: projectsTable.id,
        organizationId: projectsTable.organizationId,
        orgMemberRole: membersTable.role,
        projectMemberRole: projectMembersTable.role,
      })
      .from(projectsTable)
      .leftJoin(
        membersTable,
        and(
          eq(membersTable.organizationId, projectsTable.organizationId),
          eq(membersTable.userId, ctx.userId),
        ),
      )
      .leftJoin(
        projectMembersTable,
        and(
          eq(projectMembersTable.projectId, projectsTable.id),
          eq(projectMembersTable.userId, ctx.userId),
        ),
      )
      .where(eq(projectsTable.id, projectId));

    // Org admins get automatic project admin access
    const isOrgAdmin = data.orgMemberRole === "admin" || data.orgMemberRole === "owner";
    if (isOrgAdmin) {
      return opts.next({
        ctx: {
          project,
          projectRole: "admin",
          orgRole: data.orgMemberRole,
        },
      });
    }
    // Check explicit project membership...
  });

// Chained procedure for admin-only
export const protectedProjectAdminProcedure = protectedProjectMemberProcedure.use(
  async function requiresProjectAdmin(opts) {
    if (ctx.orgRole === "admin" || ctx.orgRole === "owner" || ctx.projectRole === "admin")
      return opts.next({ ctx });
    throw forbiddenError("Project admin permissions required");
  },
);
```

## Available Procedures Summary

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

## Client-Side Auth

```typescript
// apps/web-app/src/auth/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  betterAuthBaseUrl,
  plugins: [adminClient(), organizationClient()],
});

export const { signIn, signOut, useSession, getSession } = authClient;

// Sign in with redirect
export const signInWithEmail = async (
  email: string,
  password: string,
  callbackURL = "/app/dashboard",
) => {
  return withAuthRedirect((callbacks) => signIn.email({ email, password }, callbacks), callbackURL);
};

export const signInWithGoogle = async (callbackURL = "/app/dashboard") => {
  return signIn.social({ provider: "google", callbackURL });
};
```

## Admin API Usage

```typescript
// Using Better Auth server API in TRPC procedures
export const router = {
  setUserAdmin: adminProcedure.mutation(async ({ ctx, input }) => {
    const users = await auth.api.listUsers({
      headers: ctx.headers,
      query: {
        searchField: "email",
        searchValue: input.email,
      },
    });
    await auth.api.setRole({
      headers: ctx.headers,
      body: {
        userId: user.id,
        role: input.isAdmin ? "admin" : "user",
      },
    });
  }),

  banUser: adminProcedure.mutation(async ({ ctx, input }) => {
    await auth.api.banUser({
      headers: ctx.headers,
      body: { userId: input.userId, banReason },
    });
  }),
};
```

## Key Rules

1. **Use appropriate procedure** for access level needed
2. **Org admins get automatic project access** - don't duplicate checks
3. **Single query for access checks** - use JOINs, not multiple queries
4. **Pass headers to auth.api** calls for session context
5. **Chain procedures** for more specific access (e.g., `protectedProjectAdminProcedure`)
