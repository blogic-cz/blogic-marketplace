# Form Handling with Validation Examples

Complete guide to form handling using TanStack Form with project patterns.

## Basic Form with useAppForm

Simple form using `useAppForm` and form components:

```typescript
import { useAppForm } from "@/shared/forms/form-context";
import { FormInput, FormTextarea } from "@/shared/forms";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<FormData>;
};

export function ProfileForm({
  onSubmit,
  initialData,
}: Props) {
  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      bio: initialData?.bio ?? "",
    },
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit}
      className="space-y-4"
    >
      <FormInput
        field="name"
        label="Name"
        form={form}
        required
      />

      <FormInput
        field="email"
        label="Email"
        type="email"
        form={form}
        required
      />

      <FormTextarea
        field="bio"
        label="Bio"
        form={form}
        rows={4}
      />

      <button
        type="submit"
        disabled={form.state.isSubmitting}
        className="btn-primary"
      >
        {form.state.isSubmitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

## Form with TRPC Mutation

Integrating form with TRPC mutation:

```typescript
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/infrastructure/trpc/client";
import { useAppForm } from "@/shared/forms/form-context";
import { FormInput } from "@/shared/forms";
import { toast } from "sonner";

type Props = {
  organizationId: string;
  onSuccess?: () => void;
};

export function CreateProjectForm({
  organizationId,
  onSuccess,
}: Props) {
  const trpc = useTRPC();

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: () => {
        toast.success("Project created successfully");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useAppForm({
    defaultValues: {
      name: "",
      description: "",
    },
    onSubmit: async (values) => {
      await createProject.mutateAsync({
        organizationId,
        ...values,
      });
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit}
      className="space-y-4"
    >
      <FormInput
        field="name"
        label="Project Name"
        form={form}
        required
        placeholder="Enter project name"
      />

      <FormInput
        field="description"
        label="Description"
        form={form}
        placeholder="Enter project description"
      />

      <button
        type="submit"
        disabled={form.state.isSubmitting}
        className="btn-primary"
      >
        {form.state.isSubmitting
          ? "Creating..."
          : "Create Project"}
      </button>
    </form>
  );
}
```

## Form with Select/Enum

Form with select dropdown for enum values:

```typescript
import { FormInput, FormSelect } from "@/shared/forms";
import { OrganizationRoles } from "@project/common";

export function InviteMemberForm({
  organizationId,
  onSuccess,
}: Props) {
  const trpc = useTRPC();

  const inviteMember = useMutation(
    trpc.members.invite.mutationOptions({
      onSuccess: () => {
        toast.success("Invitation sent");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useAppForm({
    defaultValues: {
      email: "",
      role: OrganizationRoles.Member,
    },
    onSubmit: async (values) => {
      await inviteMember.mutateAsync({
        organizationId,
        ...values,
      });
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit}
      className="space-y-4"
    >
      <FormInput
        field="email"
        label="Email Address"
        type="email"
        form={form}
        required
      />

      <FormSelect
        field="role"
        label="Role"
        form={form}
        required
        options={[
          {
            value: OrganizationRoles.Member,
            label: "Member",
          },
          {
            value: OrganizationRoles.Admin,
            label: "Admin",
          },
        ]}
      />

      <button
        type="submit"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting
          ? "Sending..."
          : "Send Invitation"}
      </button>
    </form>
  );
}
```

## Form with Checkbox

Form with checkbox fields:

```typescript
import { FormInput, FormCheckbox } from "@/shared/forms";

export function NotificationSettingsForm({
  userId,
  initialData,
}: Props) {
  const trpc = useTRPC();

  const updateSettings = useMutation(
    trpc.users.updateNotificationSettings.mutationOptions({
      onSuccess: () => {
        toast.success("Settings updated");
      },
    })
  );

  const form = useAppForm({
    defaultValues: {
      emailNotifications:
        initialData?.emailNotifications ?? true,
      pushNotifications:
        initialData?.pushNotifications ?? false,
      weeklyDigest: initialData?.weeklyDigest ?? true,
    },
    onSubmit: async (values) => {
      await updateSettings.mutateAsync({
        userId,
        ...values,
      });
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit}
      className="space-y-4"
    >
      <FormCheckbox
        field="emailNotifications"
        label="Email Notifications"
        form={form}
        description="Receive notifications via email"
      />

      <FormCheckbox
        field="pushNotifications"
        label="Push Notifications"
        form={form}
        description="Receive push notifications in your browser"
      />

      <FormCheckbox
        field="weeklyDigest"
        label="Weekly Digest"
        form={form}
        description="Receive a weekly summary of activity"
      />

      <button
        type="submit"
        disabled={form.state.isSubmitting}
      >
        Save Settings
      </button>
    </form>
  );
}
```

## Form with Validation

Custom validation with Zod:

```typescript
import { z } from "zod";

const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(
      100,
      "Project name must be less than 100 characters"
    )
    .regex(
      /^[a-zA-Z0-9-_\s]+$/,
      "Project name contains invalid characters"
    ),
  description: z
    .string()
    .max(
      500,
      "Description must be less than 500 characters"
    )
    .optional(),
  isPublic: z.boolean(),
  tags: z
    .array(z.string())
    .max(10, "Maximum 10 tags allowed")
    .optional(),
});

type FormData = z.infer<typeof projectSchema>;

export function CreateProjectForm({
  organizationId,
  onSuccess,
}: Props) {
  const trpc = useTRPC();

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: () => {
        toast.success("Project created");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useAppForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
      tags: [],
    },
    onSubmit: async (values) => {
      // Validate with Zod
      const result = projectSchema.safeParse(values);
      if (!result.success) {
        // Show validation errors
        result.error.errors.forEach((err) => {
          toast.error(err.message);
        });
        return;
      }

      await createProject.mutateAsync({
        organizationId,
        ...result.data,
      });
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit}
      className="space-y-4"
    >
      <FormInput
        field="name"
        label="Project Name"
        form={form}
        required
      />

      <FormTextarea
        field="description"
        label="Description"
        form={form}
      />

      <FormCheckbox
        field="isPublic"
        label="Make project public"
        form={form}
      />

      <button
        type="submit"
        disabled={form.state.isSubmitting}
      >
        Create Project
      </button>
    </form>
  );
}
```

## Form with Optimistic Updates

Form with optimistic UI updates:

```typescript
export function UpdateProjectNameForm({
  projectId,
  currentName,
}: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateProject = useMutation(
    trpc.projects.update.mutationOptions({
      onMutate: async (newData) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: trpc.projects.getById.queryKey({
            id: projectId,
          }),
        });

        // Snapshot previous value
        const previousProject = queryClient.getQueryData(
          trpc.projects.getById.queryKey({ id: projectId })
        );

        // Optimistically update
        queryClient.setQueryData(
          trpc.projects.getById.queryKey({ id: projectId }),
          (old: any) => ({
            ...old,
            name: newData.name,
          })
        );

        return { previousProject };
      },
      onError: (err, newData, context) => {
        // Rollback on error
        if (context?.previousProject) {
          queryClient.setQueryData(
            trpc.projects.getById.queryKey({
              id: projectId,
            }),
            context.previousProject
          );
        }
        toast.error(err.message);
      },
      onSuccess: () => {
        toast.success("Project updated");
      },
      onSettled: () => {
        // Refetch to ensure consistency
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getById.queryKey({
            id: projectId,
          }),
        });
      },
    })
  );

  const form = useAppForm({
    defaultValues: {
      name: currentName,
    },
    onSubmit: async (values) => {
      await updateProject.mutateAsync({
        id: projectId,
        name: values.name,
      });
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <FormInput
        field="name"
        label="Project Name"
        form={form}
        required
      />
      <button
        type="submit"
        disabled={form.state.isSubmitting}
      >
        Update
      </button>
    </form>
  );
}
```

## Form with Array Fields

Form handling array of items:

```typescript
export function BulkInviteForm({
  organizationId,
  onSuccess,
}: Props) {
  const trpc = useTRPC();

  const bulkInvite = useMutation(
    trpc.members.bulkInvite.mutationOptions({
      onSuccess: () => {
        toast.success("Invitations sent");
        onSuccess?.();
      },
    })
  );

  const form = useAppForm({
    defaultValues: {
      invitations: [
        { email: "", role: OrganizationRoles.Member },
      ],
    },
    onSubmit: async (values) => {
      await bulkInvite.mutateAsync({
        organizationId,
        invitations: values.invitations,
      });
    },
  });

  const addInvitation = () => {
    const current = form.getFieldValue("invitations") ?? [];
    form.setFieldValue("invitations", [
      ...current,
      { email: "", role: OrganizationRoles.Member },
    ]);
  };

  const removeInvitation = (index: number) => {
    const current = form.getFieldValue("invitations") ?? [];
    form.setFieldValue(
      "invitations",
      current.filter((_, i) => i !== index)
    );
  };

  return (
    <form
      onSubmit={form.handleSubmit}
      className="space-y-4"
    >
      {form
        .getFieldValue("invitations")
        ?.map((_, index) => (
          <div key={index} className="flex gap-2">
            <FormInput
              field={`invitations.${index}.email`}
              label="Email"
              type="email"
              form={form}
              required
            />
            <FormSelect
              field={`invitations.${index}.role`}
              label="Role"
              form={form}
              options={[
                {
                  value: OrganizationRoles.Member,
                  label: "Member",
                },
                {
                  value: OrganizationRoles.Admin,
                  label: "Admin",
                },
              ]}
            />
            <button
              type="button"
              onClick={() => removeInvitation(index)}
            >
              Remove
            </button>
          </div>
        ))}

      <button type="button" onClick={addInvitation}>
        Add Invitation
      </button>

      <button
        type="submit"
        disabled={form.state.isSubmitting}
      >
        Send Invitations
      </button>
    </form>
  );
}
```

## Form Best Practices

1. **Always use `useAppForm`** instead of raw TanStack Form
2. **Use form components** (`FormInput`, `FormTextarea`, `FormCheckbox`, etc.)
3. **Pass `form` and `field` props** to form components
4. **Handle loading states** with `form.state.isSubmitting`
5. **Show success/error feedback** with toast notifications
6. **Invalidate queries** after mutations to refresh data
7. **Consider optimistic updates** for better UX
8. **Validate with Zod** for complex validation logic
9. **Use enum values** from `@project/common`
10. **Clear forms** after successful submission if needed
