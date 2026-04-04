# TRPC v11 Query Pattern (TanStack Query Integration)

Use TRPC v11 through TanStack Query hooks and TRPC option factories.

## Rule Block

- Use `useQuery(...)` and `useSuspenseQuery(...)` with `trpc.<router>.<procedure>.queryOptions(input)`.
- Use `useMutation(...)` with `trpc.<router>.<procedure>.mutationOptions(options)`.
- Use `trpc.<router>.<procedure>.queryKey(input?)` or `trpc.<router>.queryKey()` for invalidation.
- Reuse the same `.queryOptions(...)` shape in route loaders (`prefetchQuery`/`fetchQuery`) and components.
- Do not use `trpc.<router>.<procedure>.useQuery(...)` or `.useMutation(...)` (legacy pattern).

## Minimal Examples

```ts
const trpc = useTRPC();

const projectQuery = useQuery(trpc.project.getById.queryOptions({ projectId: id }));

const projectSuspense = useSuspenseQuery(trpc.project.getById.queryOptions({ projectId: id }));

const updateProject = useMutation(
  trpc.project.update.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.project.getById.queryKey({ projectId: id }),
      });
    },
  }),
);
```

```ts
loader: async ({ context, params }) => {
  await context.queryClient.prefetchQuery(
    context.trpc.project.getById.queryOptions({ projectId: params.id }),
  );
};
```

## Anti-patterns

```ts
// Legacy v10-style usage (do not use)
trpc.project.getById.useQuery({ projectId: id });
trpc.project.update.useMutation();
```
