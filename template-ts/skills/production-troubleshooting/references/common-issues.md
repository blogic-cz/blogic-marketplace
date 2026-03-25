# Common Production Issues Catalog

Catalog of frequently encountered production issues with symptoms, causes, and solutions.

## CPU/Memory Throttling

### Symptoms

- High CPU usage (>70%)
- High memory usage (>80%)
- Slow response times
- Request timeouts
- Pod restarts (for memory OOM)

### Diagnosis

```bash
# Check current resource usage
kubectl top pod -n <project>

# Check pod resource limits
kubectl get pod <pod-name> -n <project> -o yaml | grep -A5 resources

# Check pod events for throttling/OOM
kubectl describe pod <pod-name> -n <project>
```

### Solution

1. Increase resource limits in Helm values:
   - Edit `/kubernetes/helm/{service}/values.{env}.yaml`
   - Increase `resources.limits.cpu` and `resources.limits.memory`
   - Also increase `resources.requests` proportionally

2. Deploy changes via CI/CD pipeline

3. Monitor for improvement

### Prevention

- Set up monitoring alerts for >70% CPU or >80% memory usage
- Regularly review resource usage trends
- Load test before major releases

## Network Latency

### Symptoms

- Slow external API calls
- DNS resolution delays
- Intermittent timeouts
- High latency in Sentry traces

### Diagnosis

```bash
# Check DNS resolution
kubectl exec -it <pod-name> -n <project> -- nslookup example.com

# Check network policies
kubectl get networkpolicies -n <project>

# Check service endpoints
kubectl get endpoints -n <project>
```

### Common Causes

1. **DNS Issues:**
   - CoreDNS overload
   - DNS cache issues
   - External DNS resolution delays

2. **Network Policies:**
   - Overly restrictive policies
   - Missing egress rules

3. **External Service Issues:**
   - Third-party API slowdowns
   - Rate limiting
   - Geographic routing issues

### Solution

1. **DNS Issues:**
   - Restart CoreDNS: `kubectl rollout restart deployment coredns -n kube-system`
   - Increase CoreDNS replicas
   - Review DNS caching configuration

2. **Network Policies:**
   - Review and update network policies
   - Add necessary egress rules

3. **External APIs:**
   - Implement retry logic with exponential backoff
   - Add request timeouts
   - Consider API response caching
   - Review API rate limits

## Database Connection Pool Issues

### Symptoms

- `[DB Pool]` errors in logs
- Slow connection acquisition
- "Too many connections" errors
- Intermittent database timeouts

### Diagnosis

```bash
# Check application logs
k8s-tool logs --pod <pod-name> --env <env> | grep "DB Pool"

# Check database connection count
# (depends on database, example for PostgreSQL)
kubectl exec -it <postgres-pod> -- psql -c "SELECT count(*) FROM pg_stat_activity;"
```

### Common Causes

1. Connection pool too small
2. Connections not being released
3. `idleTimeoutMillis` too aggressive
4. Database under high load

### Solution

1. **Review pool configuration:**

   ```typescript
   // In database configuration
   {
     max: 20,                    // Maximum pool size
     idleTimeoutMillis: 30000,  // 30 seconds
     connectionTimeoutMillis: 5000
   }
   ```

2. **Increase pool size** if consistently exhausted

3. **Review connection leaks:**
   - Ensure all queries properly release connections
   - Check for long-running transactions
   - Review error handling

4. **Monitor database:**
   - Check database CPU/memory
   - Review slow query log
   - Consider read replicas

## Sequential API Calls

### Symptoms

- Multiple API calls taking cumulative time
- SSR timing shows long render times
- Waterfall pattern in Sentry traces

### Diagnosis

```bash
# Check SSR timing in logs
k8s-tool logs --pod <pod-name> --env <env> | grep "[SSR]"

# Review Sentry traces for waterfall pattern
# (use Sentry MCP to analyze traces)
```

### Common Causes

- Sequential `await` calls that could be parallel
- Nested data fetching in components
- Missing prefetch in route loaders

### Solution

1. **Refactor to use `Promise.all()`:**

   ```typescript
   // ❌ Bad - Sequential (600ms total)
   const user = await fetchUser();
   const org = await fetchOrg();
   const projects = await fetchProjects();

   // ✅ Good - Parallel (200ms total)
   const [user, org, projects] = await Promise.all([fetchUser(), fetchOrg(), fetchProjects()]);
   ```

2. **Add prefetching in route loaders:**

   ```typescript
   loader: async ({ context, params }) => {
     await Promise.all([
       context.queryClient.prefetchQuery(...),
       context.queryClient.prefetchQuery(...),
     ]);
   }
   ```

3. **Review component data fetching patterns**

## Database Query Performance

### Symptoms

- Slow database queries (>500ms in Sentry)
- High database CPU usage
- Query timeouts

### Diagnosis

```bash
# Check slow queries in Sentry traces
# Look for queries taking >500ms

# Review database slow query log
# (depends on database)
```

### Common Causes

1. Missing indexes
2. N+1 query problems
3. Fetching too much data
4. Complex JOINs without optimization

### Solution

1. **Add missing indexes:**

   ```sql
   CREATE INDEX idx_users_email ON users(email);
   ```

2. **Optimize N+1 queries:**

   ```typescript
   // ❌ Bad - N+1 problem
   const users = await db.select().from(users);
   for (const user of users) {
     const org = await db.select().from(orgs).where(eq(orgs.id, user.orgId));
   }

   // ✅ Good - Single query with JOIN
   const result = await db.select().from(users).innerJoin(orgs, eq(users.orgId, orgs.id));
   ```

3. **Fetch only needed columns:**

   ```typescript
   // Instead of select()
   .select({ id: users.id, name: users.name })
   ```

4. **Review and optimize complex queries**

## Pod Crashes and Restarts

### Symptoms

- Pods showing restart count > 0
- Application temporarily unavailable
- "CrashLoopBackOff" status

### Diagnosis

```bash
# Check pod status
kubectl get pods -n <project>

# Check pod events
kubectl describe pod <pod-name> -n <project>

# Check previous pod logs
kubectl logs <pod-name> -n <project> --previous
```

### Common Causes

1. **Out of Memory (OOM):**
   - Pod exceeds memory limit
   - Memory leak in application

2. **Uncaught Exceptions:**
   - Unhandled promise rejections
   - Startup errors

3. **Health Check Failures:**
   - Liveness probe fails
   - Readiness probe fails

### Solution

1. **OOM Issues:**
   - Increase memory limits
   - Investigate memory leaks
   - Review resource-intensive operations

2. **Uncaught Exceptions:**
   - Review application logs
   - Add error handling
   - Review startup sequence

3. **Health Checks:**
   - Review liveness/readiness probe configuration
   - Ensure health endpoints respond quickly
   - Increase probe timeout if needed
