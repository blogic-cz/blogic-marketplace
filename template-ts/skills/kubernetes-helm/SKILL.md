---
name: kubernetes-helm
description: "ALWAYS LOAD THIS SKILL when user asks about: helm, kubernetes, k8s, deployment, values, secrets, env variable, production URL, test environment, pod, ingress, namespace. Contains EXACT file paths and configurations not in CLAUDE.md. Load BEFORE reading helm files or answering k8s questions."
---

# Kubernetes & Helm Patterns

## Overview

Configure Kubernetes deployments using Helm charts following the project's established patterns for test and production environments.

## When to Use This Skill

- Modifying Helm values files
- Adding new environment variables
- Configuring resource limits
- Setting up CronJobs or Jobs
- Working with Kubernetes secrets

## Helm Chart Structure

```
kubernetes/helm/
├── web-app/           # Main web application (Deployment)
│   ├── Chart.yaml
│   ├── values.test.yaml
│   ├── values.prod.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       ├── hpa.yaml
│       ├── pre-install-migration-job.yaml
│       └── post-install-sync-job.yaml
│
├── agent-runner/      # CronJob for agent processing (if applicable)
├── token-refresh/     # CronJob for OAuth token refresh (if applicable)
└── e2e-tests/         # Job for E2E testing
```

## Environment Variable Patterns

### Adding Environment Variables to Helm

```yaml
# In values.test.yaml or values.prod.yaml
# KEEP ALPHABETICALLY SORTED!

extraEnvVars:
  # Non-sensitive - direct value
  - name: BASE_URL
    value: "https://<project>-test.<domain>"
  - name: ENVIRONMENT
    value: "test"

  # Sensitive - reference K8s Secret
  - name: BETTER_AUTH_SECRET
    valueFrom:
      secretKeyRef:
        name: web-app-secrets
        key: BETTER_AUTH_SECRET
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: web-app-secrets
        key: DATABASE_URL
```

### Secret Names by Chart

| Chart        | Secret Name                                |
| ------------ | ------------------------------------------ |
| web-app      | `web-app-secrets`                          |
| agent-runner | `agent-runner-secrets`                     |
| hooks/jobs   | `web-app-secrets` (via `hooks.secretName`) |

## Resource Configuration

### Test Environment (Conservative)

```yaml
# values.test.yaml
resources:
  limits:
    cpu: 500m
    memory: 640Mi
  requests:
    cpu: 100m
    memory: 320Mi
```

### Production Environment

```yaml
# values.prod.yaml
resources:
  limits:
    cpu: 1000m
    memory: 2Gi
  requests:
    cpu: 200m
    memory: 1Gi
```

### CronJob Resources

```yaml
resources:
  limits:
    cpu: "1000m"
    memory: "768Mi"
  requests:
    cpu: "200m"
    memory: "384Mi"
```

## Deployment Patterns

### Standard Deployment Template

```yaml
# templates/deployment.yaml
env:
  - name: VERSION
    value: {{ .Values.image.tag | default "0" | quote }}
  {{- range .Values.extraEnvVars }}
  - name: {{ .name }}
    {{- if .value }}
    value: {{ .value | quote }}
    {{- end }}
    {{- if .valueFrom }}
    valueFrom:
      {{- toYaml .valueFrom | nindent 16 }}
    {{- end }}
  {{- end }}
```

### Helm Hooks for Migrations

```yaml
# Pre-install: Run migrations BEFORE deployment
annotations:
  "helm.sh/hook": pre-install,pre-upgrade
  "helm.sh/hook-weight": "-5"
  "helm.sh/hook-delete-policy": before-hook-creation

# Post-install: Sync data AFTER deployment
annotations:
  "helm.sh/hook": post-install,post-upgrade
  "helm.sh/hook-weight": "5"
  "helm.sh/hook-delete-policy": before-hook-creation
```

### CronJob Pattern

```yaml
apiVersion: batch/v1
kind: CronJob
spec:
  schedule: "*/1 * * * *" # Every minute
  concurrencyPolicy: Forbid # Prevent overlapping runs
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
  startingDeadlineSeconds: 300
  jobTemplate:
    spec:
      backoffLimit: 1
      activeDeadlineSeconds: 600 # 10 min timeout
      template:
        spec:
          restartPolicy: Never
```

## Security Context

```yaml
podSecurityContext:
  fsGroup: 1000

securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```

## Ingress Configuration

```yaml
ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/proxy-body-size: 50m
  hosts:
    - host: <project>-test.<domain>
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: <project>-web-app-tls
      hosts:
        - <project>-test.<domain>
```

## Health Probes

```yaml
livenessProbe:
  httpGet:
    path: /api/alive
    port: http
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/health
    port: http
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

## Persistence

```yaml
persistence:
  enabled: true
  accessMode: ReadWriteMany
  storageClass: longhorn-rwx
  size: 1Gi
```

## Namespace Convention

| Environment | Namespace     |
| ----------- | ------------- |
| Test        | `<project>-test` |
| Production  | `<project>-prod` |
| System      | `bl-system`   |

## K8s Tool Usage

```bash
# Query pods
bun run agent-tools/k8s-tool.ts --env test --cmd "get pods -n <project>-test"

# View logs
bun run agent-tools/k8s-tool.ts --env prod --cmd "logs -l app=web-app -n <project>-prod"

# Check resources
bun run agent-tools/k8s-tool.ts --env test --cmd "top pod -n <project>-test"
```

## Adding New Environment Variables Checklist

1. Add to `.env.example` and `.env` with `xxx` default value
2. Add to `kubernetes/helm/web-app/values.test.yaml` (alphabetically sorted)
3. Add to `kubernetes/helm/web-app/values.prod.yaml` (alphabetically sorted)
4. If sensitive, create K8s secret and use `valueFrom.secretKeyRef`
5. Update CI/CD pipeline if applicable

## Key Rules

1. **Keep extraEnvVars alphabetically sorted**
2. **Never commit secrets** - use K8s secrets with `secretKeyRef`
3. **Test values are conservative** - lower resources than prod
4. **Use appropriate probe paths** - `/api/alive` for liveness, `/api/health` for readiness
5. **CronJobs need `concurrencyPolicy: Forbid`** to prevent overlapping
