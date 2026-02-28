# Effect Parallel Patterns

## Basic Parallel Execution

### Effect.all - Parallel Array Processing

```typescript
// All effects run in parallel, collect all results
const results =
  yield *
  Effect.all([
    fetchUserEffect,
    fetchProjectsEffect,
    fetchSettingsEffect,
  ]);
// results is a tuple: [user, projects, settings]
```

### Effect.all with Array.map

```typescript
// Process array of items in parallel
const processedItems =
  yield *
  Effect.all(items.map((item) => processItemEffect(item)));
```

### Bounded Concurrency

```typescript
// Limit concurrent operations (e.g., for rate-limited APIs)
const results =
  yield *
  Effect.all(
    items.map((item) => callApiEffect(item)),
    { concurrency: 10 } // Max 10 concurrent
  );
```

## Error Handling in Parallel

### Fail Fast (Default)

```typescript
// If any effect fails, entire Effect.all fails immediately
const results = yield * Effect.all([a, b, c]);
```

### Collect All Errors

```typescript
// Collect results and errors separately
const results =
  yield *
  Effect.all(
    items.map((item) =>
      processItem(item).pipe(
        Effect.either // Converts to Either<Error, Success>
      )
    )
  );

// results is Array<Either<Error, Success>>
const successes = results
  .filter(Either.isRight)
  .map((e) => e.right);
const failures = results
  .filter(Either.isLeft)
  .map((e) => e.left);
```

### Continue on Individual Errors

```typescript
// Use catchAll to convert errors to fallback values
const results =
  yield *
  Effect.all(
    items.map((item) =>
      processItem(item).pipe(
        Effect.catchAll((error) => {
          logger.warn(
            { item, error },
            "Failed to process item"
          );
          return Effect.succeed(null); // Fallback value
        })
      )
    )
  );
```

## Common Patterns

### Parallel Data Fetching

```typescript
const collectData = Effect.fn("Service.collectData")(function* (params: Params) {
  const { credentials, targetIds } = params;

  // Parallel API calls
  const [dataA, dataB] = yield* Effect.all([
    fetchDataA(credentials).pipe(
      Effect.mapError((error) => ServiceError.make({...}))
    ),
    fetchDataB(credentials).pipe(
      Effect.map((result) => result.items),
      Effect.catchTag("HttpError", () => Effect.succeed([]))
    ),
  ]);

  // Process results locally
  return processResults(dataA, dataB, targetIds);
});
```

### Parallel with Logging

```typescript
const processItems = Effect.fn("Items.process")(function* (
  items: Item[]
) {
  const results = yield* Effect.all(
    items.map((item) =>
      processItem(item).pipe(
        Effect.tap(() =>
          Effect.log(`Processed item ${item.id}`)
        ),
        Effect.catchAll((error) =>
          Effect.logWarning(
            `Failed to process item ${item.id}: ${error.message}`
          ).pipe(Effect.as({ success: false, item, error }))
        ),
        Effect.map(() => ({ success: true, item }))
      )
    ),
    { concurrency: 10 }
  );

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  yield* Effect.log(
    `Processed ${succeeded} items, ${failed} failed`
  );

  return results;
});
```

### Sequential Dependent Operations

```typescript
// When operations depend on each other, use sequential yield*
const user = yield * fetchUser(userId);
const permissions = yield * fetchPermissions(user.roleId); // Depends on user
const dashboard = yield * buildDashboard(user, permissions); // Depends on both
```

### Mixed Parallel and Sequential

```typescript
// Fetch independent data in parallel
const [user, settings] =
  yield *
  Effect.all([fetchUser(userId), fetchSettings(userId)]);

// Then use results sequentially
const permissions = yield * fetchPermissions(user.roleId);

// More parallel operations using previous results
const [projects, notifications] =
  yield *
  Effect.all([
    fetchProjects(user.organizationId),
    fetchNotifications(user.id, settings.notificationPrefs),
  ]);
```

## Effect.forEach vs Effect.all

### Effect.forEach - Process with Same Function

```typescript
// When applying the same effect to all items
const results =
  yield *
  Effect.forEach(items, (item) => processItem(item), {
    concurrency: 10,
  });
```

### Effect.all - Different Operations

```typescript
// When running different effects in parallel
const [a, b, c] =
  yield * Effect.all([effectA(), effectB(), effectC()]);
```

## Performance Tips

### Avoid Nested Effect.all

```typescript
// Bad: Creates unnecessary nesting
const results =
  yield *
  Effect.all(
    items.map((item) =>
      Effect.all([fetchA(item), fetchB(item)])
    )
  );

// Better: Flatten the structure
const results =
  yield *
  Effect.all(
    items.flatMap((item) => [
      fetchA(item).pipe(
        Effect.map((a) => ({ item, type: "a", data: a }))
      ),
      fetchB(item).pipe(
        Effect.map((b) => ({ item, type: "b", data: b }))
      ),
    ]),
    { concurrency: 20 }
  );
```

### Use Appropriate Concurrency

```typescript
// External APIs (rate limited): 3-10
{
  concurrency: 5;
}

// GitHub API: 10
{
  concurrency: 10;
}

// Database operations: 10-50
{
  concurrency: 20;
}

// In-memory operations: unbounded (default)
// Just use Effect.all without concurrency option
```
