# Requirements Templates

Use these templates as reusable examples. Replace placeholders with repository-specific details.

## 1) Discovery Questions (`01-discovery-questions.md`)

```markdown
## Q1: Should this feature be organization-scoped?

Default: Yes — most multi-user features are org-scoped.

## Q2: Will users need a dedicated screen/route?

Default: Yes — dedicated flows are usually clearer.

## Q3: Does this require schema changes?

Default: No — prefer extending existing models first.

## Q4: Does this depend on external services?

Default: No — assume internal-only unless specified.

## Q5: Should access be restricted by role?

Default: Yes — apply least-privilege by default.
```

## 2) Discovery Answers (`02-discovery-answers.md`)

```markdown
# Discovery Answers

- Q1: Yes
- Q2: No (default used)
- Q3: Yes
- Q4: Unknown → default No
- Q5: Yes

## Notes

- Capture short rationale when non-default choice is selected.
```

## 3) Context Findings (`03-context-findings.md`)

```markdown
# Context Findings

## Similar Features

- [Feature name] at [path] — [why relevant]

## Likely Files to Modify

- [path/to/file] — [planned change]

## Constraints and Risks

- [constraint]

## Recommended Patterns

- [pattern + source path]
```

## 4) Detail Questions (`04-detail-questions.md`)

```markdown
## Q1: Should this behavior live in the existing settings flow?

Default: Yes — avoids duplicate UX.

## Q2: Which validation strategy should apply?

Options: (A) client only, (B) server only, (C) both
Default: C — defense in depth.

## Q3: Should changes be visible immediately after save?

Default: Yes — improves user feedback.

## Q4: Should this be available to all members?

Options: (A) all members, (B) admins only
Default: A — unless security requires restriction.

## Q5: Should we include end-to-end coverage for this flow?

Default: Yes — for user-facing behavior.
```

## 5) Detail Answers (`05-detail-answers.md`)

```markdown
# Detail Answers

- Q1: Yes
- Q2: C (both)
- Q3: Yes
- Q4: B (admins only)
- Q5: Unknown → default Yes
```

## 6) Requirements Spec (`06-requirements-spec.md`)

```markdown
# Requirements Specification: [Feature Name]

Generated: [timestamp]
Status: [Complete | Incomplete]

## Overview

[Problem statement and intended outcome]

## Functional Requirements

### User Stories

- As a [role], I want [capability], so that [benefit].

### Acceptance Criteria

- [ ] [testable criterion]

## Technical Requirements

### Data / Storage

- [changes or none]

### API / Backend

- [changes or none]

### Frontend / UX

- [changes or none]

### Impacted Files/Systems

- [real path or system name]

## Assumptions

- ASSUMED: [decision] because [rationale]

## Open Questions

- [remaining ambiguity]
```

## 7) Metadata (`metadata.json`)

```json
{
  "id": "feature-slug",
  "started": "ISO-8601",
  "lastUpdated": "ISO-8601",
  "status": "active",
  "phase": "discovery",
  "progress": {
    "discovery": { "answered": 0, "total": 5 },
    "detail": { "answered": 0, "total": 5 }
  }
}
```

## 8) Status Output Snippet

```text
Active Requirement: [name]
Phase: [phase]
Progress: [X/Y]
Last update: [time]
Next: [next question or phase]
```

## 9) End Options Snippet

```text
1) Generate spec with current information
2) Mark as incomplete
3) Cancel
```

## 10) Reminder Snippet

```text
Keep questions closed-form.
Ask one question at a time.
Use defaults with rationale.
Do not implement during requirements gathering.
```
