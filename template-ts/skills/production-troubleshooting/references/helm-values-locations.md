# Helm Values File Locations

This document describes the location and structure of Helm values files for the application.

## File Locations

### web-app Service

**Test Environment:**

```text
/kubernetes/helm/web-app/values.test.yaml
```

**Production Environment:**

```text
/kubernetes/helm/web-app/values.prod.yaml
```

### API Service

**Test Environment:**

```text
/kubernetes/helm/api/values.test.yaml
```

**Production Environment:**

```text
/kubernetes/helm/api/values.prod.yaml
```

## Key Configuration Sections

### Resource Limits

Resource limits control how much CPU and memory a pod can use:

```yaml
resources:
  limits:
    cpu: "1000m" # 1 CPU core
    memory: "1Gi" # 1 Gigabyte
  requests:
    cpu: "500m" # 0.5 CPU cores
    memory: "512Mi" # 512 Megabytes
```

**Common Values:**

- CPU: Measured in millicores (m). 1000m = 1 CPU core
- Memory: Measured in Mi (Mebibytes) or Gi (Gibibytes)

### Environment Variables

Environment variables configuration:

```yaml
env:
  - name: DATABASE_URL
    value: "postgresql://..."
  - name: REDIS_URL
    valueFrom:
      secretKeyRef:
        name: redis-secret
        key: url
```

### Image Configuration

Docker image and tag:

```yaml
image:
  repository: registry.example.com/<project>/web-app
  tag: "v1.2.3"
  pullPolicy: IfNotPresent
```

### Replica Count

Number of pod replicas:

```yaml
replicaCount: 2
```

## Comparing Environments

To compare resource limits between environments, diff the Helm values files directly:

```bash
diff kubernetes/helm/web-app/values.test.yaml kubernetes/helm/web-app/values.prod.yaml
```

## Updating Resource Limits

When updating resource limits:

1. Identify the environment (test/prod) and service (web-app)
2. Edit the appropriate values file
3. Update both `limits` and `requests` sections
4. Commit changes and deploy via CI/CD pipeline

**Example change:**

```yaml
resources:
  limits:
    cpu: "2000m" # Increased from 1000m
    memory: "2Gi" # Increased from 1Gi
  requests:
    cpu: "1000m" # Increased from 500m
    memory: "1Gi" # Increased from 512Mi
```

## Best Practices

1. **Requests vs Limits:**
   - `requests`: Guaranteed resources for the pod
   - `limits`: Maximum resources the pod can use

2. **CPU Throttling:**
   - Occurs when pod reaches CPU limit
   - Monitor with `kubectl top pod`
   - If consistently at limit, increase CPU limits

3. **Memory OOM:**
   - Occurs when pod exceeds memory limit
   - Results in pod restart
   - Monitor with `kubectl top pod` and pod events

4. **Environment Parity:**
   - Test environment should mirror production
   - Use slightly lower limits in test to save costs
   - Keep critical services (API) at production parity
