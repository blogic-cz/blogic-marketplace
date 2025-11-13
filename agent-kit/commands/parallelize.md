---
description: Parallelize work-in-progress by splitting tasks and executing them concurrently via subagents
allowed-tools: Task, Read, Bash(git:*), TodoWrite, Glob, Grep
argument-hint: [optional: task description]
---

# Parallelize

Split current work-in-progress into independent subtasks and execute them concurrently using multiple subagents.

## Purpose

Use this command to:
- Speed up complex multi-part tasks by running them in parallel
- Split feature development across multiple independent workstreams
- Parallelize refactoring across unrelated modules
- Execute multiple research or analysis tasks simultaneously
- Reduce waiting time for large-scale changes

## When to Use

**✅ Good candidates for parallelization:**
- Multiple independent feature implementations
- Refactoring separate modules/components
- Testing multiple approaches simultaneously
- Research across different parts of codebase
- Bug fixes in unrelated files
- Writing tests for multiple modules
- Documentation for separate features

**❌ NOT suitable for parallelization:**
- Tasks with dependencies (Task B needs Task A's output)
- Changes to the same files/modules (will cause conflicts)
- Sequential workflows (design → implement → test)
- Shared state modifications
- Single-focus deep work requiring full context

---

## Process

### Phase 1: Analyze Current Context

First, understand what work is in progress by analyzing **conversation context**:

**Priority 1: Conversation Context**
- If user provided task description as argument (`$ARGUMENTS`), use that as primary context
- Check existing **todos** from conversation (TodoWrite list)
- Review what user has asked for in recent messages
- Identify current task or feature being worked on
- Note any stated goals or requirements

**Priority 2: Git Context (Optional)**

Only check git if conversation context is unclear:

```bash
# Check current branch and changes
git status
git diff --stat

# See recent work
git log -3 --oneline
```

**Analysis approach:**

1. **If `$ARGUMENTS` provided:** Use that as the task to parallelize
2. **If todos exist:** Propose parallelizing outstanding todo items
3. **If user is mid-task:** Analyze what's being worked on and split it
4. **If unclear:** Ask user what they want to parallelize
5. **Last resort:** Check git to see recent work

**Important:** Work-in-progress is usually in the conversation, not yet in git. Focus on what the user is actively working on NOW, not what's already committed.

---

### Phase 2: Propose Task Decomposition

Analyze the work and propose splitting it into **2-5 independent parallel tracks**.

#### Key Principles for Decomposition

1. **Independence:** Each task must be completable without waiting for others
2. **No file conflicts:** Different tasks should touch different files/modules
3. **Feature-based:** Split by functionality, not by directory structure
4. **Clear outcomes:** Each task should have a specific deliverable
5. **Balanced workload:** Try to make tasks roughly equal in complexity

#### Example Decomposition

```
Current work: Building user authentication system

Parallel tracks:
1. Login UI Components (src/components/auth/)
   - LoginForm, PasswordInput, AuthButton components
   - No backend dependencies needed yet

2. Authentication API (src/api/auth.ts)
   - Login/logout endpoints
   - JWT token generation
   - Independent of UI implementation

3. User Session Management (src/lib/session.ts)
   - Session store implementation
   - Token refresh logic
   - Independent utility module

4. Auth Tests (tests/auth/)
   - Unit tests for API
   - Component tests for UI
   - Can be written in parallel with implementation
```

#### Validation Checks

Before proposing, verify:
- [ ] Each track works on different files
- [ ] No track depends on another track's output
- [ ] Each track can be tested independently
- [ ] No shared state between tracks
- [ ] Clear boundaries between tracks

#### Present to User

Show the proposed plan in this format:

```markdown
## 🔀 Proposed Parallel Execution Plan

I can split this work into **N independent tracks** that can run simultaneously:

### Track 1: [Name]
**Goal:** [Clear objective]
**Files:** [Affected files/directories]
**Deliverable:** [Specific outcome]
**Constraints:** [What this track should NOT touch]

### Track 2: [Name]
**Goal:** [Clear objective]
**Files:** [Affected files/directories]
**Deliverable:** [Specific outcome]
**Constraints:** [What this track should NOT touch]

[... more tracks ...]

---

**Estimated time:**
- Sequential execution: ~X minutes
- Parallel execution: ~Y minutes (Z% faster)

**Potential risks:**
[If any conflicts or dependencies detected, mention them here]

---

**Proceed with parallel execution? (y/n)**
```

**Wait for user confirmation before proceeding.**

---

### Phase 3: Launch Parallel Subagents

Once user confirms, launch all tasks **in a single message** using multiple Task tool calls.

#### Critical Rules

1. **All Task tools must be called in the SAME message** for true parallel execution
2. **Each subagent gets clear constraints** about what NOT to modify
3. **Each prompt should be self-contained** with full context
4. **Request explicit summaries** from each agent

#### Subagent Prompt Structure

For each parallel track, create a Task tool call with this prompt structure:

**Essential components:**
- **Task Title:** Clear, concise name
- **Objective:** 1-2 sentence goal
- **Scope:** Specific files/modules to work on
- **Important Constraints:** What NOT to modify (critical for avoiding conflicts)
- **Context:** Brief background
- **Deliverable:** Expected outcome
- **Return Summary:** Request structured report

**Example prompts for parallel tracks:**

**Track 1 Prompt Template:**
```
Implement Login UI Components

Objective:
Create React components for user login interface with form validation.

Scope:
- Create LoginForm component in src/components/auth/LoginForm.tsx
- Create PasswordInput component in src/components/auth/PasswordInput.tsx
- Create AuthButton component in src/components/auth/AuthButton.tsx
- Add basic form validation
- Include TypeScript types

Important Constraints:
- DO NOT modify API files (another agent is working on those)
- DO NOT modify session management (another agent handling that)
- Focus only on UI components
- Use placeholder API calls for now

Context:
Building authentication system. UI components need to be created independently
of backend implementation to allow parallel development.

Deliverable:
Working UI components with proper types and basic validation.

Return Summary:
When complete, provide:
1. Files created/modified
2. Key functionality implemented
3. Any blockers or issues encountered
4. Integration points needed for backend
```

**Track 2 Prompt Template:**
```
Implement Authentication API

Objective:
Create backend API endpoints for user authentication with JWT tokens.

Scope:
- Create login endpoint in src/api/auth.ts
- Create logout endpoint
- Implement JWT token generation
- Add request validation
- Include error handling

Important Constraints:
- DO NOT modify UI components (another agent working on those)
- DO NOT modify session store (another agent handling that)
- Focus only on API implementation
- Create mock middleware for now if needed

Context:
Building authentication system. API needs to be created independently
of UI to allow parallel development.

Deliverable:
Working API endpoints with proper validation and error handling.

Return Summary:
When complete, provide:
1. Endpoints implemented
2. Key functionality added
3. Any blockers or issues encountered
4. Integration points needed for UI
```

#### Execution Pattern

When launching parallel agents, use this pattern:

1. **Update TodoWrite** with parallel track items
2. **Call all Task tools in ONE message** (crucial for parallelism)
3. **Wait for all agents to complete**
4. **Review and integrate results**

Example message structure:
```
I'm launching N parallel agents now to work on these tracks simultaneously:

[Call Task tool #1]
[Call Task tool #2]
[Call Task tool #3]
[etc.]
```

**Important:** Do NOT call Task tools sequentially across multiple messages. This defeats the purpose of parallelization.

---

### Phase 4: Review and Integration

After all agents complete:

1. **Review summaries** from each agent
2. **Check for conflicts** in modified files
3. **Identify integration points** between tracks
4. **Test integration** if possible
5. **Report to user** with consolidated results

#### Integration Report Template

```markdown
## ✅ Parallel Execution Complete

**Tracks completed:** N/N

### Track 1: [Name]
**Status:** ✅ Complete
**Files modified:** [list]
**Key deliverables:** [summary]

### Track 2: [Name]
**Status:** ✅ Complete
**Files modified:** [list]
**Key deliverables:** [summary]

[... more tracks ...]

---

### Integration Points

[List any points where tracks need to be connected]

### Next Steps

[Recommended actions to complete the work]

### Issues Encountered

[Any blockers or problems from any track]
```

---

## Best Practices

### Decomposition Tips

1. **Think features, not files:** Split by what the code does, not where it lives
2. **Avoid tight coupling:** If Track A needs Track B's output, they're not parallel
3. **Use interfaces/mocks:** Define interfaces first, then implement in parallel
4. **Consider testing:** Each track should be testable independently
5. **Balance complexity:** Don't give one agent all the hard work

### Common Patterns

**Pattern 1: Frontend + Backend**
- Track 1: UI components
- Track 2: API endpoints
- Track 3: Tests for both

**Pattern 2: Multiple Modules**
- Track 1: User module
- Track 2: Product module
- Track 3: Order module

**Pattern 3: Refactoring**
- Track 1: Refactor module A
- Track 2: Refactor module B
- Track 3: Update tests

**Pattern 4: Research**
- Track 1: Research authentication approaches
- Track 2: Research database options
- Track 3: Research deployment strategies

### Conflict Prevention

**Before launching:**
- Use `git diff --name-only` to see modified files
- Verify each track touches different files
- Check for shared dependencies
- Identify potential merge conflicts

**During execution:**
- Monitor agent progress
- Watch for agents modifying unexpected files
- Be ready to intervene if conflicts arise

---

## Limitations

### What This Command Cannot Do

❌ **Magic conflict resolution:** If agents modify same files, you'll get conflicts
❌ **Dependency handling:** If Task B needs Task A's output, they must run sequentially
❌ **State coordination:** Agents can't share state or communicate during execution
❌ **Automatic integration:** You may need to manually integrate results
❌ **Guaranteed speed-up:** Parallel execution adds coordination overhead

### When Sequential is Better

Use sequential execution when:
- Tasks have clear dependencies
- Working on same codebase area
- Need iterative refinement
- Debugging complex issues
- Learning new codebase

---

## Examples

### Example 1: Simple Feature Split

**User request:**
```
/parallelize Build a todo app with list view and add task form
```

**Decomposition:**
```
Track 1: TodoList Component
- Display todos
- Mark as complete
- Delete todos

Track 2: AddTodo Form
- Input field
- Submit button
- Validation

Track 3: Todo API
- CRUD endpoints
- Data persistence
```

### Example 2: Refactoring Multiple Modules

**User request:**
```
/parallelize Refactor authentication, payments, and notifications modules
```

**Decomposition:**
```
Track 1: Auth Refactoring
- Update auth.ts
- Modernize JWT handling
- Add tests

Track 2: Payments Refactoring
- Update payments.ts
- Modernize Stripe integration
- Add tests

Track 3: Notifications Refactoring
- Update notifications.ts
- Modernize email service
- Add tests
```

### Example 3: Research Task

**User request:**
```
/parallelize Research best practices for React state management, testing, and deployment
```

**Decomposition:**
```
Track 1: State Management Research
- Compare Redux, Zustand, Jotai
- Find best practices
- Suggest recommendation

Track 2: Testing Research
- Compare Jest, Vitest, Playwright
- Find best patterns
- Suggest recommendation

Track 3: Deployment Research
- Compare Vercel, Netlify, AWS
- Find best practices
- Suggest recommendation
```

---

## Troubleshooting

### Issue: Agents modified same files

**Solution:**
- Review diffs from both agents
- Manually merge changes
- Re-run one agent with updated constraints

### Issue: Agent couldn't complete due to missing dependency

**Solution:**
- Identify dependency
- Complete dependency first
- Re-run agent

### Issue: Results don't integrate well

**Solution:**
- Review integration points
- Create integration layer
- Consider if tasks were truly independent

### Issue: Slower than sequential execution

**Possible causes:**
- Tasks were too small (overhead dominated)
- Tasks had hidden dependencies
- Agents needed context from each other

---

## Related Commands

- `/code-review` - Review parallel changes before merging
- `/check-after-stop` - Run quality gates after parallel execution
- `/requirements-start` - Gather requirements before parallelizing work

---

## Tips for Success

1. **Start conservative:** Begin with 2-3 tracks, not 5
2. **Clear boundaries:** Make constraints explicit
3. **Mock dependencies:** Use placeholders for cross-track dependencies
4. **Review carefully:** Check for subtle conflicts
5. **Document integration:** Note how pieces should connect
6. **Test incrementally:** Don't wait to test all tracks together
7. **Use git branches:** Consider separate branches per track for safety

---

## Notes

- This command uses the Task tool with subagent_type="general-purpose"
- All Task calls must be in single message for true parallelism
- Each agent is stateless and cannot communicate with others
- Coordination overhead means not all tasks benefit from parallelization
- Best results with 2-4 independent tracks
- Always verify no file conflicts before launching
