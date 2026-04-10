# Helm values and template examples

## extraEnvVars pattern

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

## Resource presets

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

```yaml
# Typical CronJob resources
resources:
  limits:
    cpu: "1000m"
    memory: "768Mi"
  requests:
    cpu: "200m"
    memory: "384Mi"
```

## Deployment env template

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

## Hook annotations

```yaml
# Pre-install: run migrations before deployment
annotations:
  "helm.sh/hook": pre-install,pre-upgrade
  "helm.sh/hook-weight": "-5"
  "helm.sh/hook-delete-policy": before-hook-creation

# Post-install: run sync after deployment
annotations:
  "helm.sh/hook": post-install,post-upgrade
  "helm.sh/hook-weight": "5"
  "helm.sh/hook-delete-policy": before-hook-creation
```

## CronJob template baseline

```yaml
apiVersion: batch/v1
kind: CronJob
spec:
  schedule: "*/1 * * * *"
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
  startingDeadlineSeconds: 300
  jobTemplate:
    spec:
      backoffLimit: 1
      activeDeadlineSeconds: 600
      template:
        spec:
          restartPolicy: Never
```

## Security context

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

## Ingress baseline

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

## Probe and persistence baselines

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

```yaml
persistence:
  enabled: true
  accessMode: ReadWriteMany
  storageClass: longhorn-rwx
  size: 1Gi
```

## k8s-tool usage examples

```bash
# Query pods
k8s-tool pods --env test

# View logs
k8s-tool logs --pod <pod> --env prod --tail 100

# Check resources
k8s-tool top --env test
```
