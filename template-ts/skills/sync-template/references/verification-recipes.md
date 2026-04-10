# Verification Recipes

Run these checks during sync execution.

## Per-Wave Verification

Run after each wave:

```bash
bun run check
bun run test
```

Stop and fix failures before starting the next wave.

## Final Verification

Run at the end of all waves:

```bash
bun run check
bun run test
```

## Template String Leak Scan

Run leak scans using the policy in `references/substitution-rules.md`.

```bash
grep -R "@blogic-template/" . --include='*.ts' --include='*.tsx' --include='*.js' --include='*.json' --include='*.yml' --include='*.yaml'
grep -R "blogic-template-ts" . --include='*.ts' --include='*.tsx' --include='*.js' --include='*.json' --include='*.yml' --include='*.yaml'
```

Filter results by approved exceptions only. Treat all other matches as failures.

## Template Version Stamp

Update the project marker:

- Prefer `.template-version`.
- Or update the project metadata field used by that repository (`templateVersion`, `template-version`, or `synced-from`).

## Final Sync Commit

Create final marker commit after all checks pass:

`chore: sync with blogic-template-ts <new-version>`
