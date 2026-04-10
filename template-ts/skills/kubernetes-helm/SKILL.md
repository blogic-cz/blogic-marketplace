---
name: kubernetes-helm
description: "This skill should be used when working on Kubernetes or Helm changes in template-ts projects, including values files, env vars, secrets, ingress, resources, hooks, namespaces, pods, and environment-specific deployment settings."
---

# Kubernetes & Helm Workflow

Apply consistent Helm patterns for test and production Kubernetes environments.

## Use this skill when

- Update Helm values files
- Add or change environment variables
- Configure resources, probes, ingress, security, jobs, or cronjobs
- Work with Kubernetes secrets, namespaces, pods, and environment URLs

## Follow this workflow

1. Locate the target chart in `kubernetes/helm/` and edit both `values.test.yaml` and `values.prod.yaml` unless the change is environment-specific.
2. Add non-sensitive variables under `extraEnvVars` with direct `value`; keep entries alphabetically sorted.
3. Add sensitive variables with `valueFrom.secretKeyRef`; never inline secrets in values files.
4. Define hook/job secrets through the chart values key `hooks.secretName` (in `values.*.yaml`), then consume it in hook templates (for example migration/sync jobs).
5. If the repository uses local env files, mirror new variables in `.env.example` and `.env` with safe placeholder defaults.
6. Check chart-specific secret naming and namespace conventions before deploying.
7. Use `k8s-tool` for runtime checks only after prerequisites are met: `k8s-tool` is a project wrapper around `kubectl` with environment shortcuts, and requires an installed CLI plus valid kubeconfig/cluster access.

## Reference material

Read concrete snippets and YAML examples in:

- `references/chart-structure.md`
- `references/helm-examples.md`

## Key Rules

1. **Keep extraEnvVars alphabetically sorted**
2. **Never commit secrets** - use K8s secrets with `secretKeyRef`
3. **Test values are conservative** - lower resources than prod
4. **Use appropriate probe paths** - `/api/alive` for liveness, `/api/health` for readiness
5. **CronJobs need `concurrencyPolicy: Forbid`** to prevent overlapping
