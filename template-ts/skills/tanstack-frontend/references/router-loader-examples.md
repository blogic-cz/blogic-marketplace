# Complete Route Definition Examples

Full examples of TanStack Router route definitions with TRPC integration.

## Basic Route with Single Query

Simple route that fetches and displays organization data:

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/infrastructure/trpc/client";

export const Route = createFileRoute(
  "/app/organization/$id"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.organization.getById.queryOptions({
        id: params.id,
      })
    );
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const trpc = useTRPC();

  const { data: organization } = useSuspenseQuery(
    trpc.organization.getById.queryOptions({ id })
  );

  return (
    <div>
      <h1>{organization.name}</h1>
      <p>{organization.description}</p>
    </div>
  );
}
```

## Route with Multiple Parallel Queries

Route that fetches multiple critical data sources in parallel:

```typescript
export const Route = createFileRoute(
  "/app/organization/$id/members"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    // All queries critical for members table
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.organization.getById.queryOptions({
          id: params.id,
        })
      ),
      context.queryClient.prefetchQuery(
        context.trpc.members.getByOrgId.queryOptions({
          orgId: params.id,
        })
      ),
      context.queryClient.prefetchQuery(
        context.trpc.permissions.getAll.queryOptions({
          orgId: params.id,
        })
      ),
    ]);

    // Secondary data - loads in background
    void context.queryClient.prefetchQuery(
      context.trpc.analytics.getMemberStats.queryOptions({
        orgId: params.id,
      })
    );
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const trpc = useTRPC();

  const { data: organization } = useSuspenseQuery(
    trpc.organization.getById.queryOptions({ id })
  );

  const { data: members } = useSuspenseQuery(
    trpc.members.getByOrgId.queryOptions({ orgId: id })
  );

  const { data: permissions } = useSuspenseQuery(
    trpc.permissions.getAll.queryOptions({ orgId: id })
  );

  // This may suspend briefly if not loaded yet
  const { data: stats } = useSuspenseQuery(
    trpc.analytics.getMemberStats.queryOptions({
      orgId: id,
    })
  );

  return (
    <div>
      <h1>{organization.name} - Members</h1>
      <MembersTable
        members={members}
        permissions={permissions}
      />
      {stats && <StatsPanel stats={stats} />}
    </div>
  );
}
```

## Route with Mutation

Route with both queries and mutations:

```typescript
export const Route = createFileRoute(
  "/app/organization/$id/settings"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.organization.getById.queryOptions({
        id: params.id,
      })
    );
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: organization, refetch } = useSuspenseQuery(
    trpc.organization.getById.queryOptions({ id })
  );

  const updateOrg = useMutation(
    trpc.organization.update.mutationOptions({
      onSuccess: async () => {
        // Invalidate cache to refetch
        await queryClient.invalidateQueries({
          queryKey: trpc.organization.getById.queryKey({
            id,
          }),
        });
        // Or use refetch
        await refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleSave = async (data: UpdateOrgData) => {
    await updateOrg.mutateAsync({
      id,
      ...data,
    });
  };

  return (
    <div>
      <h1>Settings - {organization.name}</h1>
      <SettingsForm
        initialData={organization}
        onSave={handleSave}
        isLoading={updateOrg.isPending}
      />
    </div>
  );
}
```

## Route with Search Parameters

Route that uses URL search parameters:

```typescript
import { z } from "zod";

const searchSchema = z.object({
  page: z.number().min(1).default(1),
  search: z.string().optional(),
  status: z
    .enum(["active", "archived", "all"])
    .default("active"),
});

export const Route = createFileRoute(
  "/app/organization/$id/projects"
)({
  component: RouteComponent,
  validateSearch: searchSchema,
  loader: async ({ context, params }) => {
    // Just fetch organization, projects will be loaded with search params
    await context.queryClient.prefetchQuery(
      context.trpc.organization.getById.queryOptions({
        id: params.id,
      })
    );
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const trpc = useTRPC();

  const { data: organization } = useSuspenseQuery(
    trpc.organization.getById.queryOptions({ id })
  );

  // Query depends on search params
  const { data: projects } = useSuspenseQuery(
    trpc.projects.list.queryOptions({
      orgId: id,
      page: search.page,
      search: search.search,
      status: search.status,
    })
  );

  return (
    <div>
      <h1>{organization.name} - Projects</h1>
      <ProjectsTable
        projects={projects}
        currentPage={search.page}
        searchTerm={search.search}
        statusFilter={search.status}
      />
    </div>
  );
}
```

## Route with Loader Return Value

Route that returns data from loader:

```typescript
export const Route = createFileRoute("/app/organizations")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const orgsWithProjects =
      await context.queryClient.fetchQuery(
        context.trpc.organization.getOrganizationsDetails.queryOptions()
      );

    return { orgsWithProjects };
  },
});

function RouteComponent() {
  const { orgsWithProjects } = Route.useLoaderData();
  const trpc = useTRPC();

  // Still use suspense query for reactivity
  const { data } = useSuspenseQuery(
    trpc.organization.getOrganizationsDetails.queryOptions()
  );

  return (
    <div>
      <h1>Organizations</h1>
      <OrganizationsList organizations={data} />
    </div>
  );
}
```

## Protected Route with Auth Check

Route that checks authentication:

```typescript
export const Route = createFileRoute(
  "/app/organization/$id/admin"
)({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(
      context.trpc.auth.getSession.queryOptions()
    );

    if (!session.user.isAdmin) {
      throw redirect({
        to: "/app/organization/$id",
        params: { id: context.params.id },
      });
    }
  },
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.admin.getOrgAdminData.queryOptions({
        orgId: params.id,
      })
    );
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.admin.getOrgAdminData.queryOptions({ orgId: id })
  );

  return (
    <div>
      <h1>Admin Panel</h1>
      <AdminDashboard data={data} />
    </div>
  );
}
```

## Route with Error Boundary

Route with custom error handling:

```typescript
import { ErrorComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/app/organization/$id"
)({
  component: RouteComponent,
  errorComponent: ({ error, reset }) => (
    <div>
      <h1>Error loading organization</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  ),
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.organization.getById.queryOptions({
        id: params.id,
      })
    );
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const trpc = useTRPC();

  const { data: organization } = useSuspenseQuery(
    trpc.organization.getById.queryOptions({ id })
  );

  return (
    <div>
      <h1>{organization.name}</h1>
    </div>
  );
}
```

## Index Route Pattern

Index route that redirects or shows overview:

```typescript
export const Route = createFileRoute(
  "/app/organization/$id/"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.organization.getById.queryOptions({
          id: params.id,
        })
      ),
      context.queryClient.prefetchQuery(
        context.trpc.organization.getOverview.queryOptions({
          id: params.id,
        })
      ),
    ]);
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const trpc = useTRPC();

  const { data: organization } = useSuspenseQuery(
    trpc.organization.getById.queryOptions({ id })
  );

  const { data: overview } = useSuspenseQuery(
    trpc.organization.getOverview.queryOptions({ id })
  );

  return (
    <div>
      <h1>{organization.name} - Overview</h1>
      <OverviewDashboard overview={overview} />
    </div>
  );
}
```

## Layout Route Pattern

Layout route with outlet for nested routes:

```typescript
import { Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/app/organization/$id"
)({
  component: LayoutComponent,
  loader: async ({ context, params }) => {
    // Load data needed for layout (navigation, breadcrumbs, etc.)
    await context.queryClient.prefetchQuery(
      context.trpc.organization.getById.queryOptions({
        id: params.id,
      })
    );
  },
});

function LayoutComponent() {
  const { id } = Route.useParams();
  const trpc = useTRPC();

  const { data: organization } = useSuspenseQuery(
    trpc.organization.getById.queryOptions({ id })
  );

  return (
    <div>
      <OrganizationHeader organization={organization} />
      <OrganizationNav organizationId={id} />
      <main>
        {/* Child routes render here */}
        <Outlet />
      </main>
    </div>
  );
}
```
