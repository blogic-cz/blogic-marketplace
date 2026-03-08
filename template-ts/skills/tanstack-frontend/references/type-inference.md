# TRPC Type Inference Patterns and Examples

Complete guide to type inference from TRPC using `RouterInputs` and `RouterOutputs`.

## Basic Type Inference

### RouterOutputs for Response Types

Always use `RouterOutputs` to infer response types from TRPC procedures:

```typescript
import type { RouterOutputs } from "@/infrastructure/trpc/router";

// Infer type from TRPC query response
type Organization = RouterOutputs["organization"]["getById"];

// Infer type from array response
type ProjectsList = RouterOutputs["projects"]["list"];
type Project = ProjectsList[number];

// Infer nested types
type SessionData = RouterOutputs["adminAuthSessions"]["listTokens"]["sessions"][0];
```

### RouterInputs for Input Types

Use `RouterInputs` to infer input types for TRPC procedures:

```typescript
import type { RouterInputs } from "@/infrastructure/trpc/router";

// Infer input type from mutation
type CreateProjectInput = RouterInputs["projects"]["create"];

// Infer input type from query
type GetProjectsInput = RouterInputs["projects"]["list"];

// Use in function parameters
function createProject(input: CreateProjectInput) {
  // Input is fully typed
  console.log(input.name, input.organizationId);
}
```

## Component Props with Inferred Types

### Pattern: Using RouterOutputs for Props

```typescript
import type { RouterOutputs } from "@/infrastructure/trpc/router";

type Organization =
  RouterOutputs["organization"]["getById"];

type Props = {
  organization: Organization;
  onUpdate?: (org: Organization) => void;
};

export function OrganizationCard({
  organization,
  onUpdate,
}: Props) {
  return (
    <div>
      <h2>{organization.name}</h2>
      <p>{organization.description}</p>
      <button onClick={() => onUpdate?.(organization)}>
        Edit
      </button>
    </div>
  );
}
```

### Pattern: Array Item Types

```typescript
import type { RouterOutputs } from "@/infrastructure/trpc/router";

// Infer array type
type MembersList = RouterOutputs["members"]["getByOrgId"];

// Extract single item type
type Member = MembersList[number];

type Props = {
  members: Member[];
  onRemove: (member: Member) => void;
};

export function MembersTable({ members, onRemove }: Props) {
  return (
    <table>
      <tbody>
        {members.map((member) => (
          <tr key={member.id}>
            <td>{member.name}</td>
            <td>{member.email}</td>
            <td>{member.role}</td>
            <td>
              <button onClick={() => onRemove(member)}>
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Pattern: Nested Object Types

```typescript
import type { RouterOutputs } from "@/infrastructure/trpc/router";

type OrganizationDetail =
  RouterOutputs["organization"]["getDetail"];

// Access nested types
type Project = OrganizationDetail["projects"][number];
type Integration =
  OrganizationDetail["integrations"][number];

type Props = {
  organization: OrganizationDetail;
};

export function OrganizationDetailView({
  organization,
}: Props) {
  const projects: Project[] = organization.projects;
  const integrations: Integration[] =
    organization.integrations;

  return (
    <div>
      <h1>{organization.name}</h1>
      <ProjectsList projects={projects} />
      <IntegrationsList integrations={integrations} />
    </div>
  );
}
```

## State Management with Inferred Types

### Pattern: useState with RouterOutputs

```typescript
import type { RouterOutputs } from "@/infrastructure/trpc/router";
import { useState } from "react";

type Organization =
  RouterOutputs["organization"]["getById"];

export function OrganizationManager() {
  const [selectedOrg, setSelectedOrg] =
    useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<
    Organization[]
  >([]);

  return <div>{/* Component implementation */}</div>;
}
```

### Pattern: Form State with RouterInputs

```typescript
import type { RouterInputs } from "@/infrastructure/trpc/router";
import { useState } from "react";

type CreateProjectInput =
  RouterInputs["projects"]["create"];

export function CreateProjectForm({
  organizationId,
}: Props) {
  const [formData, setFormData] =
    useState<CreateProjectInput>({
      name: "",
      description: "",
      organizationId,
    });

  const handleSubmit = async () => {
    // formData is fully typed
    await trpc.projects.create.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>{/* Form fields */}</form>
  );
}
```

## Function Parameters and Return Types

### Pattern: Callback Functions

```typescript
import type { RouterOutputs } from "@/infrastructure/trpc/router";

type Project = RouterOutputs["projects"]["list"][number];

type Props = {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onProjectDelete: (projectId: string) => Promise<void>;
};

export function ProjectsList({
  projects,
  onProjectSelect,
  onProjectDelete,
}: Props) {
  return (
    <div>
      {projects.map((project) => (
        <div key={project.id}>
          <button onClick={() => onProjectSelect(project)}>
            {project.name}
          </button>
          <button
            onClick={() => onProjectDelete(project.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Pattern: Utility Functions

```typescript
import type { RouterOutputs } from "@/infrastructure/trpc/router";

type Member = RouterOutputs["members"]["getByOrgId"][number];

// Utility function with inferred types
function filterAdminMembers(members: Member[]): Member[] {
  return members.filter(
    (m) => m.role === OrganizationRoles.Admin || m.role === OrganizationRoles.Owner,
  );
}

// Transform function
function getMemberNames(members: Member[]): string[] {
  return members.map((m) => m.name);
}

// Validation function
function isOwner(member: Member): boolean {
  return member.role === OrganizationRoles.Owner;
}
```

## Advanced Patterns

### Pattern: Conditional Types

```typescript
import type { RouterOutputs } from "@/infrastructure/trpc/router";

type Organization =
  RouterOutputs["organization"]["getById"];
type OrganizationDetail =
  RouterOutputs["organization"]["getDetail"];

type OrganizationViewProps =
  | {
      variant: "simple";
      organization: Organization;
    }
  | {
      variant: "detailed";
      organization: OrganizationDetail;
    };

export function OrganizationView(
  props: OrganizationViewProps
) {
  if (props.variant === "simple") {
    // props.organization is Organization
    return <SimpleView organization={props.organization} />;
  } else {
    // props.organization is OrganizationDetail
    return (
      <DetailedView organization={props.organization} />
    );
  }
}
```

### Pattern: Generic Components

```typescript
import type { RouterOutputs } from "@/infrastructure/trpc/router";

type Project = RouterOutputs["projects"]["list"][number];
type Member =
  RouterOutputs["members"]["getByOrgId"][number];

type TableProps<T> = {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
  }>;
  onRowClick?: (item: T) => void;
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
}: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={index}
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((col) => (
              <td key={String(col.key)}>
                {String(item[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage with inferred types
function ProjectsView() {
  const projects: Project[] = [
    /* ... */
  ];

  return (
    <DataTable
      data={projects}
      columns={[
        { key: "name", label: "Name" },
        { key: "status", label: "Status" },
      ]}
      onRowClick={(project) => console.log(project.id)}
    />
  );
}
```

### Pattern: Partial Types for Updates

```typescript
import type {
  RouterOutputs,
  RouterInputs,
} from "@/infrastructure/trpc/router";

type Project = RouterOutputs["projects"]["getById"];
type UpdateProjectInput =
  RouterInputs["projects"]["update"];

type Props = {
  project: Project;
  onUpdate: (
    updates: Partial<UpdateProjectInput>
  ) => Promise<void>;
};

export function ProjectEditor({
  project,
  onUpdate,
}: Props) {
  const handleNameChange = async (name: string) => {
    await onUpdate({ id: project.id, name });
  };

  const handleDescriptionChange = async (
    description: string
  ) => {
    await onUpdate({ id: project.id, description });
  };

  return (
    <div>
      <input
        value={project.name}
        onChange={(e) => handleNameChange(e.target.value)}
      />
      <textarea
        value={project.description}
        onChange={(e) =>
          handleDescriptionChange(e.target.value)
        }
      />
    </div>
  );
}
```

## Branded Types

### Pattern: Session IDs

Always use branded types from `@project/common` for session identifiers:

```typescript
import type {
  AuthSessionId,
  McpSessionId,
  ClientSessionId,
} from "@project/common";
import type { RouterOutputs } from "@/infrastructure/trpc/router";

type SessionData =
  RouterOutputs["adminAuthSessions"]["listTokens"]["sessions"][number];

type Props = {
  sessionId: AuthSessionId;
  clientSessionId: ClientSessionId;
  onRevoke: (sessionId: AuthSessionId) => Promise<void>;
};

export function SessionManager({
  sessionId,
  clientSessionId,
  onRevoke,
}: Props) {
  // Type-safe session ID handling
  const handleRevoke = async () => {
    await onRevoke(sessionId);
  };

  return (
    <div>
      <p>Session: {sessionId}</p>
      <p>Client Session: {clientSessionId}</p>
      <button onClick={handleRevoke}>Revoke</button>
    </div>
  );
}
```

## Common Types from @project/common

Always import shared types from `@project/common`:

```typescript
import {
  OrganizationRoles,
  ProjectStatus,
  AuthSessionId,
  McpSessionId,
  ClientSessionId,
  type ProviderType,
} from "@project/common";
import type { RouterOutputs } from "@/infrastructure/trpc/router";

type Member = RouterOutputs["members"]["getByOrgId"][number];

function getRoleLabel(role: OrganizationRoles): string {
  switch (role) {
    case OrganizationRoles.Owner:
      return "Owner";
    case OrganizationRoles.Admin:
      return "Administrator";
    case OrganizationRoles.Member:
      return "Member";
    default:
      return "Unknown";
  }
}

type Props = {
  member: Member;
  providerType: ProviderType;
};
```

## Anti-Patterns to Avoid

### ❌ Don't Create Manual Types

```typescript
// ❌ BAD - Duplicating TRPC response structure
type SessionData = {
  sessionId: string;
  userSessionId: string;
  userId: string;
  createdAt: Date;
  // ... duplicating what TRPC already returns
};

// ✅ GOOD - Using RouterOutputs
type SessionData = RouterOutputs["adminAuthSessions"]["listTokens"]["sessions"][0];
```

### ❌ Don't Use Plain Strings for Session IDs

```typescript
// ❌ BAD - Using plain string
type Props = {
  sessionId: string;
  clientSessionId: string;
};

// ✅ GOOD - Using branded types
import type { AuthSessionId, ClientSessionId } from "@project/common";

type Props = {
  sessionId: AuthSessionId;
  clientSessionId: ClientSessionId;
};
```

### ❌ Don't Hardcode Enum Values

```typescript
// ❌ BAD - Hardcoding role values
type Role = "owner" | "admin" | "member";

// ✅ GOOD - Using common types
import { OrganizationRoles } from "@project/common";
type Role = OrganizationRoles;
```

### ❌ Don't Use interface When type Works

```typescript
// ❌ BAD - Using interface
interface Props {
  organization: Organization;
  onUpdate: () => void;
}

// ✅ GOOD - Using type
type Props = {
  organization: Organization;
  onUpdate: () => void;
};
```

## Type Safety Best Practices

1. **Always use `RouterOutputs`** for response types
2. **Always use `RouterInputs`** for input types
3. **Use branded types** for session identifiers
4. **Import common types** from `@project/common`
5. **Use `type` instead of `interface`** unless extending
6. **Extract array item types** with `[number]` indexer
7. **Use `Partial<T>`** for optional update fields
8. **Avoid type assertions** (`as`) when possible
9. **Leverage TypeScript inference** in callbacks
10. **Keep types close to usage** for maintainability
