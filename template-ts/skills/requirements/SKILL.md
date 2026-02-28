---
name: requirements
description: "LOAD THIS SKILL when: gathering requirements for new features, user mentions 'requirements', 'requirements-start', 'requirements-end', 'requirements-status', 'requirements-current', 'requirements-list', 'requirements-remind'. Covers structured Q&A workflow with 5-phase requirements gathering, codebase analysis, and spec generation."
---

# Requirements Gathering

This skill covers a structured 5-phase requirements gathering workflow for new features. It guides you through initial setup and codebase analysis, context discovery questions, autonomous context gathering, expert requirements questions, and final requirements documentation — producing a comprehensive spec ready for implementation.

## Start Workflow

Begin gathering requirements for a new feature using this structured 5-phase process.

### Phase 1: Initial Setup & Codebase Analysis

1. Get current timestamp: `` `date "+%Y-%m-%d-%H%M"` ``
2. Extract slug from the feature description (e.g., "add user profile" -> "user-profile")
3. Create folder: `requirements/[timestamp]-[slug]/`
4. Create initial files:
   - `00-initial-request.md` with the user's request
   - `metadata.json` with status tracking
5. Create/update `requirements/.current-requirement` with folder name
6. Analyze project codebase structure:
   - `apps/web-app/` - TanStack Start frontend + TRPC server
   - `packages/` - Shared packages (db, services, common, logger, agents)
   - Identify relevant existing features and patterns

### Phase 2: Context Discovery Questions

Generate 5 yes/no questions to understand the problem space.

**Focus areas for the project:**

- User interactions and workflows
- Organization/project scope (org-scoped vs user-scoped)
- Data model requirements (new tables vs extending existing)
- UI requirements (new pages vs extending existing)
- Integration with existing features (auth, billing, integrations)

**Question format:**

```markdown
## Q1: Will this feature be organization-scoped (vs user-scoped)?

**Default if unknown:** Yes (most project features are org-scoped)

## Q2: Will users interact with this through a new page/route?

**Default if unknown:** Yes (most features have dedicated UI)

## Q3: Does this require new database tables?

**Default if unknown:** No (prefer extending existing schema)

## Q4: Will this integrate with external services/APIs?

**Default if unknown:** No (unless explicitly mentioned)

## Q5: Should this be accessible to all org members or only admins?

**Default if unknown:** All members (with appropriate role checks)
```

**Process:**

1. Write ALL questions to `01-discovery-questions.md` with smart defaults
2. Ask questions ONE at a time, proposing default
3. Accept: yes / no / idk (use default)
4. After ALL answered, record in `02-discovery-answers.md`
5. Update `metadata.json`

### Phase 3: Targeted Context Gathering (Autonomous)

After discovery questions answered:

1. **Search relevant code** using available tools:
   - Find similar features in `apps/web-app/src/`
   - Check existing TRPC routers in `apps/web-app/src/*/trpc/`
   - Review database schema in `packages/db/src/schema.ts`
   - Check existing UI patterns in `apps/web-app/src/shared/`

2. **Analyze patterns** from similar features:
   - How similar TRPC routers are structured
   - How similar pages use TanStack Router loaders
   - Database table conventions
   - Form handling patterns

3. **Document findings** in `03-context-findings.md`:

   ```markdown
   ## Codebase Analysis

   ### Similar Features Found

   - [Feature name] at [path] - [why relevant]

   ### Relevant Files to Modify/Extend

   - `apps/web-app/src/[module]/trpc/[router].ts` - [what to add]
   - `packages/db/src/schema.ts` - [new tables if needed]

   ### Patterns to Follow

   - TRPC router pattern from [example]
   - TanStack route pattern from [example]
   - Form pattern from [example]

   ### Technical Constraints

   - [Any limitations discovered]

   ### Integration Points

   - [Services/modules this will interact with]
   ```

### Phase 4: Expert Requirements Questions

Now ask questions like a senior developer who knows the project codebase.

**Focus on clarifying system behavior:**

```markdown
## Q1: Should we extend the existing [Router]Router at [path]?

**Default if unknown:** Yes (maintains consistency)

## Q2: For the UI, should we follow the pattern from [similar feature]?

**Default if unknown:** Yes (established pattern)

## Q3: Should this data be cached in TanStack Query or fetched fresh?

**Default if unknown:** Cached (standard for most data)

## Q4: Should we add E2E tests for this flow?

**Default if unknown:** Yes (if user-facing feature)

## Q5: Should validation happen client-side, server-side, or both?

**Default if unknown:** Both (Zod on frontend, TRPC input validation on backend)
```

**Process:**

1. Write questions to `04-detail-questions.md`
2. Ask ONE at a time
3. Record answers in `05-detail-answers.md` after all asked

### Phase 5: Requirements Documentation

Generate comprehensive spec in `06-requirements-spec.md`:

```markdown
# Requirements Specification: [Name]

Generated: [timestamp]
Status: Complete

## Overview

[Problem statement and solution summary]

## Functional Requirements

### User Stories

- As a [role], I want to [action] so that [benefit]

### Acceptance Criteria

- [ ] [Testable criterion]

## Technical Requirements

### Database Changes

- New table: [name] in `packages/db/src/schema.ts`
- Fields: [list with types]

### TRPC Router

- Location: `apps/web-app/src/[module]/trpc/[name].ts`
- Procedures: [list]
- Use `protectedMemberAccessProcedure` for org-scoped operations

### Frontend Routes

- New route: `/app/[path]`
- Components: [list]
- Pattern to follow: [reference]

### Files to Create/Modify

1. `packages/db/src/schema.ts` - Add table
2. `apps/web-app/src/[module]/trpc/[name].ts` - Add router
3. `apps/web-app/src/routes/app/[path]/route.tsx` - Add page

## Implementation Notes

### Patterns to Follow

- TRPC: See `trpc-patterns` skill
- Frontend: See `tanstack-frontend` skill

### Testing

- Unit tests in `packages/services/src/__tests__/`
- E2E tests in `apps/web-app/e2e/`

## Assumptions

[Any defaults used for unanswered questions]
```

### Metadata Structure

```json
{
  "id": "feature-slug",
  "started": "ISO-8601-timestamp",
  "lastUpdated": "ISO-8601-timestamp",
  "status": "active",
  "phase": "discovery|context|detail|complete",
  "progress": {
    "discovery": { "answered": 0, "total": 5 },
    "detail": { "answered": 0, "total": 5 }
  },
  "contextFiles": ["paths/of/files/analyzed"],
  "relatedFeatures": ["similar features found"]
}
```

### Phase Transitions

- After each phase, announce: "Phase complete. Starting [next phase]..."
- Save all work before moving to next phase
- User can check progress anytime with `/requirements-status`

---

## End Workflow

Finalize the current requirement gathering session.

### Instructions

1. Read `requirements/.current-requirement`

2. **If no active requirement:**

   ```
   No active requirement to end.

   Use /requirements-list to see all requirements.
   ```

3. **Show current status and ask user intent:**

   ```
   Ending requirement: [name]
   Current phase: [phase] ([X/Y] complete)

   What would you like to do?

   1. Generate spec with current information
   2. Mark as incomplete for later
   3. Cancel and delete

   Choose (1/2/3):
   ```

4. **Based on choice:**

### Option 1: Generate Spec

- Create `06-requirements-spec.md`
- Include all answered questions
- Add defaults for unanswered with "ASSUMED:" prefix
- Generate implementation hints based on project patterns
- Update `metadata.json` status to "complete"

**Spec format:**

```markdown
# Requirements Specification: [Name]

Generated: [timestamp]
Status: Complete with [N] assumptions

## Overview

[Problem statement from initial request]
[Solution summary based on answers]

## Functional Requirements

[Based on answered questions]

### User Stories

- As a [role], I want to [action] so that [benefit]

### Acceptance Criteria

- [ ] [Criterion based on answers]

## Technical Requirements

### Database Changes

[If applicable based on answers]

### TRPC Router

- Location: `apps/web-app/src/[module]/trpc/`
- Procedures needed: [list]

### Frontend Routes

- Path: `/app/[route]`
- Components: [list]

### Files to Create/Modify

[Specific paths in project codebase]

## Implementation Notes

### Patterns to Follow

- TRPC: Load skill `trpc-patterns`
- Frontend: Load skill `tanstack-frontend`

### Validation

- Run `bun run check` after implementation
- Add E2E tests if user-facing

## Assumptions (REVIEW THESE)

[List any defaults used for unanswered questions]

- ASSUMED: [Question] -> [Default used] because [reason]

## Next Steps

1. Review assumptions above
2. Start implementation
3. Run `/code-review` before PR
```

### Option 2: Mark Incomplete

- Update `metadata.json`:
  ```json
  {
    "status": "incomplete",
    "lastUpdated": "[timestamp]",
    "pausedAt": "[phase]",
    "remainingQuestions": [N]
  }
  ```
- Create summary of progress
- Note what's still needed

**Output:**

```
Requirement marked as incomplete.

Progress saved:
- Phase: [current phase]
- Questions answered: [X/Y]
- Last activity: [now]

To resume later: /requirements-status
```

### Option 3: Cancel

- Confirm deletion:

  ```
  Are you sure you want to delete this requirement?
  All gathered information will be lost.

  Type 'yes' to confirm:
  ```

- If confirmed:
  - Remove requirement folder
  - Clear `.current-requirement`

**Output:**

```
Requirement cancelled and deleted.

Start fresh: /requirements-start [description]
```

### Post-Completion

After generating spec (Option 1):

1. Clear `.current-requirement`
2. Show summary:

   ```
   Requirements complete!

   Spec saved: requirements/[folder]/06-requirements-spec.md

   Next steps:
   1. Review the spec, especially ASSUMPTIONS section
   2. Start implementation
   3. Use /code-review before creating PR

   View spec: Read @requirements/[folder]/06-requirements-spec.md
   ```

---

## Status Workflow

Show current requirement gathering progress and continue from last question.

### Instructions

1. Read `requirements/.current-requirement`

2. **If no active requirement:**

   ```
   No active requirement gathering session.

   Options:
   - Start new: /requirements-start [description]
   - List all: /requirements-list
   ```

3. **If active requirement exists:**
   - Read `metadata.json` for current phase and progress
   - Show formatted status
   - Load appropriate question/answer files
   - Continue from last unanswered question

### Status Display Format

```
Active Requirement: [name]
Started: [time ago]
Phase: [Discovery/Context/Detail/Complete]
Progress: [X/Y] questions answered

--- Recent Progress ---

[Show last 3 answered questions with responses]

--- Next Question ---

[Show next unanswered question with default]

Type 'yes', 'no', or 'idk' (uses default)
```

### Continuation Flow

1. Read next unanswered question from file:
   - Phase 2: `01-discovery-questions.md`
   - Phase 4: `04-detail-questions.md`

2. Present to user with default

3. Accept response:
   - `yes` / `y` - Affirmative
   - `no` / `n` - Negative
   - `idk` / `default` / `d` - Use default value

4. **DO NOT record answer yet** - wait until ALL questions in phase are asked

5. After ALL questions answered:
   - Update answer file (`02-discovery-answers.md` or `05-detail-answers.md`)
   - Update `metadata.json` progress

6. Move to next question or phase

### Phase Transitions

**Discovery (Phase 2) -> Context (Phase 3):**

- All 5 discovery questions answered
- Record answers in `02-discovery-answers.md`
- Run autonomous context gathering (no user interaction)
- Create `03-context-findings.md`

**Context (Phase 3) -> Detail (Phase 4):**

- Context findings documented
- Generate expert questions based on findings
- Write to `04-detail-questions.md`
- Begin asking detail questions

**Detail (Phase 4) -> Complete (Phase 5):**

- All detail questions answered
- Record answers in `05-detail-answers.md`
- Generate final spec in `06-requirements-spec.md`
- Update status to "complete"
- Clear `.current-requirement`

### Quick Actions

```
Continue: Just respond to the question
Skip phase: /requirements-end (generates spec with current info)
View all: /requirements-current
List all: /requirements-list
```

---

## Current Workflow

Display detailed information about the active requirement. This is **view-only** — it does not continue gathering.

### Instructions

1. Read `requirements/.current-requirement`

2. **If no active requirement:**

   ```
   No active requirement.

   Recent completed requirements:
   [Show last 3 completed with dates]

   Start new: /requirements-start [description]
   List all: /requirements-list
   ```

3. **For active requirement:**
   - Load all files from requirement folder
   - Display comprehensive status
   - Show codebase analysis overview
   - Show all questions and answers so far
   - Display context findings if available
   - Indicate current phase and next steps

### File Structure

```
requirements/[timestamp]-[slug]/
├── 00-initial-request.md    # Original user request
├── 01-discovery-questions.md # Context discovery questions
├── 02-discovery-answers.md   # User's answers (after all asked)
├── 03-context-findings.md    # AI's codebase analysis
├── 04-detail-questions.md    # Expert requirements questions
├── 05-detail-answers.md      # User's detailed answers
├── 06-requirements-spec.md   # Final requirements document
└── metadata.json             # Status tracking
```

### Display Format

```
===========================================
Current Requirement: [name]
===========================================

Duration: [time since start]
Phase: [Initial Setup/Discovery/Context/Detail/Complete]
Progress: [total answered]/[total questions]

-------------------------------------------
INITIAL REQUEST
-------------------------------------------

[Content from 00-initial-request.md]

-------------------------------------------
CODEBASE OVERVIEW (Phase 1)
-------------------------------------------

Architecture: TanStack Start + TRPC + PostgreSQL + Drizzle
Relevant modules identified:
- [module 1]: [why relevant]
- [module 2]: [why relevant]

-------------------------------------------
DISCOVERY PHASE (5/5 complete)
-------------------------------------------

Q1: Will this be organization-scoped? YES
Q2: Will users interact through a new page? YES
Q3: Does this require new database tables? NO
Q4: Will this integrate with external APIs? NO (default)
Q5: Should this be accessible to all members? YES

-------------------------------------------
CONTEXT FINDINGS
-------------------------------------------

Similar Features Found:
- [Feature] at [path] - [pattern to follow]

Files to Modify:
- apps/web-app/src/[module]/trpc/[router].ts
- packages/db/src/schema.ts (if needed)

Patterns Identified:
- TRPC: [pattern reference]
- Frontend: [pattern reference]

-------------------------------------------
EXPERT QUESTIONS (2/5 answered)
-------------------------------------------

Q1: Extend existing UserRouter? YES
Q2: Follow pattern from ProjectSettings? YES
Q3: Cache data in TanStack Query? [PENDING]
Q4: Add E2E tests? [PENDING]
Q5: Validation on both client and server? [PENDING]

-------------------------------------------
NEXT ACTION
-------------------------------------------

Current: Answering expert question Q3

Options:
- Continue: /requirements-status
- End early: /requirements-end
- View all: /requirements-list
```

### Important Notes

- This is **view-only** (doesn't continue gathering)
- Shows complete history and context
- Use `/requirements-status` to continue answering questions
- All file paths are relative to project root

---

## List Workflow

Display all requirements with their status and summaries.

### Instructions

1. Check `requirements/.current-requirement` for active requirement
2. List all folders in `requirements/` directory
3. For each requirement folder:
   - Read `metadata.json`
   - Extract key information
   - Format for display

4. Sort by:
   - Active first (if any)
   - Then by status: complete, incomplete
   - Then by date (newest first)

### Display Format

```
Requirements Documentation

--- ACTIVE ---

[name]
   Phase: Discovery (3/5) | Started: 30m ago
   Request: [first line of 00-initial-request.md]
   Next: Continue with /requirements-status

--- COMPLETE ---

2025-01-26-0900-dark-mode-toggle
   Status: Ready for implementation
   Questions answered: 10
   Summary: [first line of spec overview]
   Spec: requirements/2025-01-26-0900-dark-mode-toggle/06-requirements-spec.md

2025-01-25-1400-export-reports
   Status: Implemented
   Questions answered: 10
   Summary: PDF/CSV export with filtering

--- INCOMPLETE ---

2025-01-24-1100-notification-system
   Status: Paused at Detail phase (2/5)
   Last activity: 2 days ago
   Resume: /requirements-status

--- STATISTICS ---

Total: 4 requirements
- Complete: 2
- Active: 1
- Incomplete: 1
```

### Stale Detection

Mark if incomplete > 7 days:

```
2025-01-15-old-feature (STALE - 8 days)
   Consider: Resume or cancel with /requirements-end
```

### Linked Artifacts

For complete requirements, check if there are:

- Related git branches
- Pull requests (search git log for requirement name)
- Implementation status

### Quick Actions

```
Quick Actions:
- View active detail: /requirements-current
- Resume incomplete: /requirements-status
- Start new: /requirements-start [description]
- End/cancel active: /requirements-end
```

### Empty State

If no requirements exist:

```
No requirements found.

Start gathering requirements for a new feature:
/requirements-start [feature description]

Example:
/requirements-start add dark mode toggle to settings
```

---

## Remind Workflow

Quick correction when deviating from requirements gathering rules.

### Instructions

1. Check `requirements/.current-requirement`
2. If no active requirement:
   - Show "No active requirement gathering session"
   - Exit

3. Display reminder based on current context:

```
🔔 Requirements Gathering Reminder

You are gathering requirements for: [active-requirement]
Current phase: [Initial Setup/Context Discovery/Targeted Context/Expert Requirements]
Progress: [X/Y questions]

📋 PHASE-SPECIFIC RULES:

Phase 2 - Context Discovery:
- ✅ Ask 5 yes/no questions about the problem space
- ✅ Questions for product managers (no code knowledge required)
- ✅ Focus on user workflows, not technical details
- ✅ Write ALL questions before asking any
- ✅ Record answers ONLY after all questions asked

Phase 3 - Targeted Context (Autonomous):
- ✅ Use RepoPrompt tools to search and read code
- ✅ Analyze similar features and patterns
- ✅ Document findings in context file
- ❌ No user interaction during this phase

Phase 4 - Expert Requirements:
- ✅ Ask 5 detailed yes/no questions
- ✅ Questions as if speaking to PM who knows no code
- ✅ Clarify expected system behavior
- ✅ Reference specific files when relevant
- ✅ Record answers ONLY after all questions asked

🚫 GENERAL RULES:
1. ❌ Don't start coding or implementing
2. ❌ Don't ask open-ended questions
3. ❌ Don't record answers until ALL questions in phase are asked
4. ❌ Don't exceed 5 questions per phase

📍 CURRENT STATE:
- Last question: [Show last question]
- User response: [pending/answered]
- Next action: [Continue with question X of 5]

Please continue with the current question or read the next one from the file.
```

### Common Correction Scenarios

**Open-ended question asked:**

"Let me rephrase as a yes/no question..."

**Multiple questions asked:**

"Let me ask one question at a time..."

**Implementation started:**

"I apologize. Let me continue with requirements gathering..."

**No default provided:**

"Let me add a default for that question..."

### Auto-trigger Patterns

- Detect code blocks → remind no implementation
- Multiple "?" in response → remind one question
- Response > 100 words → remind to be concise
- Open-ended words ("what", "how") → remind yes/no only

---

## Important Rules

These rules apply across all phases of requirements gathering:

- **ONLY yes/no questions** with smart defaults — never open-ended questions
- **ONE question at a time** — never ask multiple questions in a single message
- **Write ALL questions to file BEFORE asking any** — prepare the full set first, then ask sequentially
- **Stay focused on requirements** — no implementation, no code, no technical solutions during gathering
- **Use actual file paths from codebase** — reference real paths like `apps/web-app/src/[module]/trpc/` not generic placeholders
- **Document WHY each default makes sense** — every default must have a rationale (e.g., "most project features are org-scoped")
- **Reference similar existing features as examples** — ground questions in concrete codebase patterns
- **Do NOT record answers until ALL questions in a phase are asked** — collect all responses before writing to answer files
- **Phase 3 is fully autonomous** — no user interaction during targeted context gathering
- **Maximum 5 questions per phase** — keep each phase focused and bounded
