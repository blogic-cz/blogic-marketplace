# Helm chart structure

```text
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

## Secret names by chart

| Chart        | Secret Name                                |
| ------------ | ------------------------------------------ |
| web-app      | `web-app-secrets`                          |
| agent-runner | `agent-runner-secrets`                     |
| hooks/jobs   | `web-app-secrets` (via `hooks.secretName`) |

## Namespace convention

| Environment | Namespace        |
| ----------- | ---------------- |
| Test        | `<project>-test` |
| Production  | `<project>-prod` |
| System      | `bl-system`      |
