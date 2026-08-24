# template-ts skills

Reusable Agent Skills for applications based on [`blogic-template-ts`](https://github.com/blogic-cz/blogic-template-ts). This directory also provides examples of how to structure focused skills, supporting references, scripts, and multi-step workflows.

## Install

Interactive selection:

```bash
npx skills add blogic-cz/blogic-marketplace/template-ts
```

Install every skill:

```bash
npx skills add blogic-cz/blogic-marketplace/template-ts --all
```

Install selected skills:

```bash
npx skills add blogic-cz/blogic-marketplace/template-ts --skill drizzle-database --skill trpc-patterns --skill tanstack-frontend
```

Update installed skills:

```bash
npx skills update
```

## Example layouts

- A focused skill keeps its workflow in one `SKILL.md`, for example [`react-doctor`](skills/react-doctor/SKILL.md).
- A larger skill links detailed material from `references/`, for example [`drizzle-database`](skills/drizzle-database/) and [`tanstack-frontend`](skills/tanstack-frontend/).
- Process skills split reusable review or delivery rules into small references, for example [`code-review`](skills/code-review/) and [`git-workflow`](skills/git-workflow/).
- Skills can include executable helpers alongside references, for example [`update-packages`](skills/update-packages/).

## Skill groups

| Group                 | Skills                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Delivery              | `code-review`, `git-workflow`, `github-triage`, `issue-flow`, `requirements`, `tdd`                                    |
| Backend               | `backend-standards`, `better-auth`, `drizzle-database`, `effect-ts`, `trpc-patterns`                                   |
| Frontend              | `frontend-design`, `frontend-standards`, `react-doctor`, `tanstack-frontend`                                           |
| Testing and debugging | `debugging-with-opensrc`, `scan-effect-solutions`, `testing-patterns`                                                  |
| Operations            | `kubernetes-helm`, `performance-optimization`, `process-db-report`, `production-troubleshooting`, `sentry-integration` |
| Maintenance           | `reflect`, `sync-template`, `update-packages`                                                                          |
| Product work          | `grill-me`, `marketing-expert`                                                                                         |

Skills encode Blogic conventions. Read a skill and its linked references before applying it outside `blogic-template-ts`.
