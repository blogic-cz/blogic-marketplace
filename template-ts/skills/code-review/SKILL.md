---
name: code-review
description: "This skill should be used when running a code review or pre-PR review in template-ts repositories. It provides a severity-based checklist for architecture, security, performance, and testing quality gates."
compatibility: opencode
---

# Code Review Methodology

Run a systematic pre-PR review for template-ts codebases. Identify critical risks first, then report major and minor issues with concrete fixes.

## Review Process

1. **Identify scope** — Determine exactly what to review.
2. **Scan changes** — Analyze against template-ts review categories.
3. **Verify uncertain patterns** — Use external lookup only when uncertainty remains.
4. **Categorize findings** — Classify as Critical, Major, or Minor.
5. **Generate report** — Produce an actionable review summary.
6. **Run automated checks** — Run repository-standard quality gates.

---

## Step 1: Identify Scope

Determine scope in this order:

1. **Use explicit user scope first.** Review the exact files, PR, commits, or branch comparison provided by the user.
2. **Infer recent commits by default when scope is missing.** Use `git log -5 --oneline` and `git diff HEAD~5..HEAD --stat` when no scope was given and repository context is available.
3. **Ask one precise scope question only when needed.** Ask only when repository state is unavailable or multiple plausible scopes exist and inference would be unreliable.

---

## Step 2: Apply Template-ts Review Categories

Use the full category checklist and examples in `references/review-pattern-catalog.md`.

Apply these category groups:

- TRPC patterns
- TanStack Router and Query patterns
- Code deduplication (DRY)
- Code quality and style conventions
- Security
- Performance
- Testing
- Effect patterns (when Effect code is in scope)

Load related skills when deeper specialization is required:

- `trpc-patterns`
- `tanstack-frontend`
- `effect-ts`
- `scan-effect-solutions` (for deep Effect audits)

---

## Step 3: Verify Uncertain Patterns

Use lookup tools only when local codebase evidence is insufficient.

Use **Exa** to validate uncertain real-world usage patterns for external libraries or evolving APIs.

Use **Context7** to confirm official documentation details (exact API names, version-specific behavior, deprecations).

Skip both when the repository already contains a clear canonical pattern.

---

## Step 4: Apply Test Expectations Proportionally

Require tests for behavior changes.

Treat these as behavior changes:

- New or changed business logic
- API contract changes
- Query/loader behavior changes
- Security or authorization logic changes
- User-visible component behavior changes

Treat these as low-risk changes where new tests are optional:

- Documentation-only updates
- Comment-only updates
- Mechanical refactors with no logic change (for example rename-only, formatting-only, import reordering)

State test rationale explicitly in the final review summary.

---

## Step 5: Run Automated Checks

Run `bun run check` when the repository uses the standard template-ts quality-gate script.

Run the repository-equivalent command set when a different convention is used (for example separate lint, typecheck, and test commands).

Capture command outcomes in the final report.

---

## Severity Classification

### CRITICAL (must fix before merge)

- Security vulnerabilities
- SQL injection or hardcoded secrets
- Missing authentication on protected endpoints
- Breaking changes to public APIs

### MAJOR (should fix)

- Wrong TRPC v11 patterns (`.useQuery` instead of `.queryOptions`)
- N+1 database queries
- Missing prefetch causing slow page loads
- Manual types instead of `RouterInputs`/`RouterOutputs`
- Code duplication violating DRY

### MINOR (consider fixing)

- Style inconsistencies
- Missing documentation
- Non-critical refactoring opportunities

---

## Report Template

```markdown
# Code Review Report

**Scope:** [What was reviewed]
**Date:** [Current date]

---

## CRITICAL ISSUES

[List with file:line, description, fix]

---

## MAJOR ISSUES

[List with file:line, description, fix]

---

## MINOR ISSUES

[List with file:line, brief description]

---

## TEST EXPECTATIONS

- Behavior-changing code paths covered: [Yes/No + details]
- Low-risk changes with test exemption: [Yes/No + rationale]

---

## AUTOMATED CHECKS

- Commands run: [List]
- Result: [Pass/Fail]

---

## POSITIVE OBSERVATIONS

- [Good patterns found]

---

## SUMMARY

**Assessment:** [APPROVE / NEEDS_WORK / REJECT]
**Next steps:** [Specific actions]

## Quick Stats

- Files reviewed: [N]
- Issues: Critical: [N], Major: [N], Minor: [N]
```

---

## Assessment Criteria

**APPROVE**

- No critical issues
- Core TRPC and TanStack patterns are correct
- Repository quality-gate checks pass

**NEEDS_WORK**

- Major pattern violations exist
- Required tests are missing for behavior changes
- Performance issues impact reliability or UX

**REJECT**

- Security vulnerabilities exist
- Breaking changes are introduced without migration path
- Fundamental design flaws make the change unsafe to merge

---

## Related Skills

- `trpc-patterns` — TRPC router patterns, procedures, error handling
- `tanstack-frontend` — Router, Query, Form patterns
- `effect-ts` — Effect services, layers, ManagedRuntime, error handling
- `scan-effect-solutions` — Deep Effect compliance scan
- `production-troubleshooting` — Performance investigation
