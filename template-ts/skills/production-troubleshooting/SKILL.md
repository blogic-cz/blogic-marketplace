---
name: production-troubleshooting
description: "This skill should be used when troubleshooting production/test incidents such as slow endpoints, high latency, OOMKilled pod restarts, pod crashes/throttling, slow queries, or Sentry-reported errors and traces."
compatibility: opencode
---

# Production Troubleshooting

## Overview

Diagnose performance issues and errors in production/test environments using systematic investigation workflows with Sentry, kubectl, and Helm configuration analysis.

## Prerequisites

Verify access to Sentry and Kubernetes tooling before troubleshooting.

- Prefer `k8s-tool` when available for environment-aware commands.
- Fall back to raw `kubectl` commands when `k8s-tool` is not installed or not configured in the current environment.
- Confirm namespace and target environment (`test` or `prod`) before running commands.

## When to Use This Skill

Apply this skill when:

- Investigating incidents in test/production (not localhost)
- Troubleshooting slow endpoints, slow queries, or elevated latency
- Debugging pod crashes, restart loops, `OOMKilled`, or potential throttling
- Analyzing Sentry traces for failures or degraded transactions
- Validating Kubernetes resource limits and related Helm values

## Investigation Workflow

Follow this symptom-driven workflow and confirm evidence before making changes.

### Step 1: Triage by Primary Symptom

Choose the first investigation path based on the reported symptom.

- For pod crash/restart symptoms (`CrashLoopBackOff`, `OOMKilled`, frequent restarts): check pod status and logs first.
- For latency/slow endpoint symptoms: inspect traces first, then correlate with logs and pod state.

### Step 2A: Inspect Pod Status and Logs (Crash/Restart Path)

Check pod health state before trace analysis when the incident is pod-centric.

**Using k8s-tool (preferred):**

```bash
k8s-tool describe --resource pod --name <pod-name> --env <env>
k8s-tool logs --pod <pod-name> --env <env> --tail 200
```

**Fallback using kubectl:**

```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --tail 200
```

Look for restart reasons, termination messages, probe failures, and repeated startup errors.

### Step 2B: Inspect Sentry Traces (Latency/Error Path)

Use Sentry to identify slow database calls, external latency, and transaction-level failures.

**Using Sentry MCP:**

- Search for traces related to the reported issue
- Look for slow database queries (for this project, >500ms is a useful baseline heuristic, not a universal threshold)
- Check external API call latency
- Identify error patterns and stack traces

**What to look for:**

- Database query times exceeding expected baseline (commonly ~500ms in this project)
- External API calls with high latency
- Repeated error patterns
- Performance degradation trends

### Step 3: Review Application Logs

Examine kubectl logs for timing information and error patterns.

**Using k8s-tool:**

```bash
k8s-tool logs --pod <pod-name> --env <env> --tail 200
```

**Key log patterns to search for:**

- `[Server]` - Server startup and initialization timing
- `[SSR]` - Server-side rendering timing
- `[tRPC]` - TRPC query execution timing
- `[DB Pool]` - Database connection pool status
- `ERROR` or `WARN` - Application errors and warnings

**Common issues:**

- Sequential API calls instead of parallel (Promise.all)
- Long DB connection acquisition times
- Slow SSR rendering

### Step 4: Check Pod Resource Usage

Verify CPU and memory usage to detect throttling.

**Using k8s-tool:**

```bash
k8s-tool top --env <env>
```

**Warning signs:**

- CPU usage >70% may indicate potential throttling
- Memory usage >80% may indicate elevated OOM risk
- Consistent high utilization suggests under-provisioning

### Step 5: Review Pod Configuration

Check resource limits and Helm values to identify misconfigurations.

**Using kubectl:**

```bash
kubectl get pod <pod-name> -n <namespace> -o yaml
```

**Key sections to check:**

- `resources.limits.cpu` and `resources.limits.memory`
- `resources.requests.cpu` and `resources.requests.memory`
- Environment variables configuration
- Image version and tags

**Helm values locations:**

- web-app: `/kubernetes/helm/web-app/values.{test,prod}.yaml`

Reference `references/helm-values-locations.md` for detailed Helm configuration structure.

### Step 6: Confirm Evidence Before Changing Configuration

Confirm that proposed fixes map to observed evidence before editing Helm values or code.

- Link each change to concrete evidence from traces, logs, pod events, or resource metrics.
- Prefer the smallest reversible change first.
- Re-check traces/logs after deployment to verify impact.

## Common Causes & Solutions

### CPU/Memory Throttling

- **Symptom:** Sustained high CPU/memory usage with degraded response times or restarts
- **Confirm with evidence:** Correlate resource metrics with throttling signals, restart events, and latency spikes
- **Solution:** Adjust resource requests/limits in Helm values only after confirmation

### Network Latency

- **Symptom:** Slow external API calls, DNS resolution delays
- **Confirm with evidence:** Validate slow spans and timed log entries for network-bound operations
- **Solution:** Check network policies, verify DNS configuration, and tune retry behavior where appropriate

### Database Connection Pool Issues

- **Symptom:** `[DB Pool]` errors, slow connection acquisition
- **Confirm with evidence:** Match pool warnings with trace timing and connection wait patterns
- **Solution:** Review `idleTimeoutMillis` and pool size configuration

### Sequential API Calls

- **Symptom:** Multiple API calls taking cumulative time
- **Confirm with evidence:** Verify sequential span ordering in traces or timestamped log sequence
- **Solution:** Refactor to use `Promise.all()` for parallel execution

## Resources

### kubectl commands

Use these common operations with `k8s-tool` when available, or run equivalent raw `kubectl` commands as fallback:

- `k8s-tool logs --pod <pod> --env <env> --tail 200` - Extract and filter pod logs
- `k8s-tool top --env <env>` - Show CPU/memory usage for pods
- `k8s-tool describe --resource pod --name <pod> --env <env>` - Check resource limits and pod configuration
- `k8s-tool kubectl --env <env> --cmd "get pods"` - Raw kubectl for anything else

### references/

- `helm-values-locations.md` - Detailed guide to Helm values file structure and locations
- `common-issues.md` - Catalog of common production issues and solutions
