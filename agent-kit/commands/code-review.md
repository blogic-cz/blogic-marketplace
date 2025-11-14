---
description: Perform systematic pre-PR code review covering quality, security, performance, testing, and documentation with Exa search and Context7 verification
allowed-tools: [Read, Grep, Bash, mcp__agentsfera__exa-get_code_context_exa, mcp__agentsfera__exa-web_search_exa, mcp__agentsfera__context7-resolve-library-id, mcp__agentsfera__context7-get-library-docs]
---

# Code Review

Systematic code review for pull request readiness. Identifies critical issues, suggests fixes, and provides actionable feedback.

## Purpose

Use this command to:
- Review code changes before creating pull requests
- Conduct quality assessments on recent commits
- Identify security vulnerabilities, performance issues, and test gaps
- Get structured feedback with severity-based prioritization

## Process

**Overview:**
1. **Identify Scope** - Determine what code to review
2. **Scan Changes** - Analyze code across 5 categories (Quality, Security, Performance, Testing, Documentation)
3. **Verify with Exa & Context7** - Validate uncertain patterns using real-world examples and official docs
4. **Categorize Findings** - Organize by severity (Critical, Major, Minor)
5. **Generate Report** - Create structured report with actionable feedback
6. **Run Automated Checks** - Verify builds and tests pass

---

### Step 1: Identify Scope

Ask the user what to review:

**Options:**
1. **Recent commits** (default): Last 5 commits from HEAD
2. **Specific files/directories**: User-provided paths
3. **Branch comparison**: Compare feature branch against main
4. **Full codebase**: Review entire project (for small projects)

**Commands to use:**
```bash
# Recent commits
git log -5 --oneline
git diff HEAD~5..HEAD

# Specific files
git diff main..HEAD -- path/to/files

# Branch comparison
git diff main..HEAD
```

### Step 2: Scan Changes

For each changed file, perform systematic analysis across five categories:

---

## Review Categories

### 1. Code Quality 🧹

**Check for:**

**Readability Issues:**
- Unclear variable/function names
- Overly complex functions (>50 lines)
- Deeply nested logic (>3 levels)
- Inconsistent naming conventions
- Poor code organization

**Design Patterns:**
- SOLID principle violations
- God objects (classes doing too much)
- Tight coupling between modules
- Missing abstraction layers
- Inappropriate design patterns

**Maintainability:**
- DRY violations (duplicate code)
- Magic numbers/strings without constants
- Lack of error handling
- Missing input validation
- Hardcoded configuration values

**Patterns to grep:**
```bash
# Find long functions (JavaScript/TypeScript)
grep -n "function.*{" file.ts | # check line counts

# Find magic numbers
grep -E "[^a-zA-Z0-9][0-9]{2,}[^a-zA-Z0-9]" file.ts

# Find TODO/FIXME comments
grep -n "TODO\|FIXME" file.ts
```

---

### 2. Security 🔒

**Check for:**

**Injection Vulnerabilities:**
- SQL injection (string concatenation in queries)
- XSS vulnerabilities (unescaped user input in HTML)
- Command injection (shell commands with user input)
- Path traversal (user-controlled file paths)

**Authentication/Authorization:**
- Missing authentication checks
- Weak password validation
- Insecure session management
- Missing authorization on endpoints
- Privilege escalation risks

**Data Protection:**
- Hardcoded secrets/API keys
- Sensitive data in logs
- Unencrypted sensitive data
- Missing input sanitization
- Error messages leaking information

**Patterns to grep:**
```bash
# Find potential SQL injection
grep -n "query.*+\|query.*\${" file.ts

# Find hardcoded secrets
grep -iE "api[_-]?key|password|secret|token" file.ts

# Find console.log with sensitive data
grep -n "console\.log" file.ts

# Find eval usage
grep -n "eval(" file.ts
```

**Common Issues:**
- `eval()` usage
- `innerHTML` without sanitization
- Direct database queries without parameterization
- Password fields without minimum requirements
- Missing CSRF tokens

---

### 3. Performance ⚡

**Check for:**

**Algorithm Complexity:**
- O(n²) nested loops that could be O(n)
- Unnecessary array iterations
- Inefficient data structures
- Missing memoization/caching
- Redundant calculations

**Resource Usage:**
- Memory leaks (unclosed connections, event listeners)
- Large bundle sizes (unnecessary imports)
- N+1 query problems (database)
- Unnecessary re-renders (React/Vue)
- Blocking operations in async contexts

**Optimization Opportunities:**
- Missing lazy loading
- No code splitting
- Large images without optimization
- Unused dependencies
- Missing pagination for large datasets

**Patterns to check:**
```bash
# Find nested loops
grep -A 5 "for.*{" file.ts | grep "for.*{"

# Find array operations in loops
grep -E "forEach|map|filter|reduce" file.ts

# Find synchronous operations
grep -n "readFileSync\|execSync" file.ts
```

**Common Issues:**
- Nested `.map()` or `.forEach()` calls
- Database queries inside loops
- Large images loaded upfront
- Missing indexes on frequently queried fields
- Unnecessary full-table scans

---

### 4. Testing ✅

**Check for:**

**Test Coverage:**
- New features without tests
- Critical paths untested
- Edge cases missing
- Error handling untested
- Integration points untested

**Test Quality:**
- Flaky tests (timing-dependent)
- Overly broad mocks
- Tests testing implementation details
- Missing test descriptions
- Unclear test assertions

**Test Patterns:**
```bash
# Check if test file exists for source file
test -f src/utils/helper.test.ts || echo "Missing test"

# Find test files
find . -name "*.test.ts" -o -name "*.spec.ts"

# Check test coverage (if configured)
npm run test:coverage || bun test --coverage
```

**Common Gaps:**
- New API endpoints without integration tests
- Complex business logic without unit tests
- UI components without rendering tests
- Error boundaries untested
- Database migrations untested

---

### 5. Documentation 📝

**Check for:**

**Code Documentation:**
- Complex functions without comments
- Public APIs without JSDoc/TSDoc
- Type definitions incomplete
- Ambiguous variable names needing clarification
- Algorithms without explanation

**Project Documentation:**
- README not updated for new features
- API documentation missing endpoints
- Breaking changes undocumented
- Migration guides missing
- Configuration options unexplained

**Patterns to check:**
```bash
# Find public functions without JSDoc
grep -B 2 "export function" file.ts | grep -v "/**"

# Check for README
test -f README.md || echo "README missing"

# Find undocumented breaking changes
git log --oneline | grep -i "break\|breaking"
```

**Common Issues:**
- New CLI commands not in README
- Environment variables without documentation
- API breaking changes without migration guide
- Complex regex without explanation comments
- Public interfaces without type documentation

---

## Step 2.5: Verify with Exa & Context7 🔍

**MANDATORY when unsure about:**
- Whether a technology/library is being used correctly
- If a pattern/approach follows current best practices
- Security implications of a specific implementation
- Performance characteristics of a library/framework feature
- Correct API usage for unfamiliar dependencies

### When to Use Verification

#### Use Exa Search (`exa-get_code_context_exa`)

**Best for finding real-world patterns and implementation examples:**

```
When you find:
- Unfamiliar framework patterns (e.g., React hooks usage)
- Security-sensitive code you're uncertain about
- Performance patterns (e.g., caching strategies)
- Error handling approaches
- API integration patterns
- Testing strategies for specific features
```

**Example queries:**
```
exa-get_code_context_exa(query: "React useEffect cleanup memory leaks best practices")
exa-get_code_context_exa(query: "Express.js SQL injection prevention parameterized queries")
exa-get_code_context_exa(query: "Next.js API routes rate limiting implementation")
exa-get_code_context_exa(query: "TypeScript discriminated unions error handling patterns")
```

#### Use Context7 (`context7-resolve-library-id` + `context7-get-library-docs`)

**Best for getting official documentation and API references:**

```
When you need:
- Official API documentation for a library/framework
- Correct usage of specific library methods
- Verification of deprecated APIs
- Type definitions and interfaces
- Configuration options and parameters
```

**Example workflow:**
```
1. context7-resolve-library-id(libraryName: "next")
   → Returns: /vercel/next.js

2. context7-get-library-docs(
     context7CompatibleLibraryID: "/vercel/next.js",
     topic: "API routes middleware"
   )
   → Returns: Official Next.js docs on middleware
```

### Verification Decision Tree

```
Found uncertain code pattern?
│
├─ Is it about a SPECIFIC library/framework API?
│  └─ YES → Use Context7
│     1. Resolve library ID
│     2. Get official docs for the specific topic
│     3. Compare with code being reviewed
│
└─ Is it about GENERAL patterns or best practices?
   └─ YES → Use Exa Search
      1. Search for real-world implementations
      2. Analyze patterns from multiple sources
      3. Identify common pitfalls or anti-patterns
```

### Verification Process

1. **Identify Uncertain Patterns**
   ```
   During review, flag code where you're unsure:
   - "Is this the correct way to use React.memo?"
   - "Is this SQL query properly parameterized?"
   - "Does this Next.js pattern follow best practices?"
   ```

2. **Choose Verification Tool**
   ```
   Framework/library-specific → Context7
   General patterns/practices → Exa Search
   Both needed → Use both (Context7 first, then Exa for real-world examples)
   ```

3. **Execute Verification**
   ```
   Run the appropriate MCP tool with specific queries
   ```

4. **Compare & Validate**
   ```
   - Compare reviewed code against verified patterns
   - Note discrepancies or anti-patterns
   - Update severity if needed (e.g., "might be okay" → "MAJOR issue")
   ```

5. **Document Findings**
   ```
   Include verification sources in review comments:
   "Based on Next.js official docs [Context7] and production examples [Exa],
   this pattern violates best practices..."
   ```

### Example Verification Scenarios

#### Scenario 1: React Hook Usage

**Found in code:**
```typescript
useEffect(() => {
  fetchData();
}, []);
```

**Uncertainty:** "Should fetchData be in dependency array?"

**Verification:**
1. `exa-get_code_context_exa(query: "React useEffect missing dependency warning ESLint exhaustive-deps")`
2. Analyze real-world patterns from Exa results
3. **Conclusion:** If fetchData is defined in component body, it should be in deps array OR wrapped in useCallback

**Review comment:**
```
⚠️ MAJOR: Missing dependency in useEffect
File: src/components/DataFetcher.tsx:15

Current code has fetchData outside dependency array, which can cause stale closures.
[Verified via Exa search of React best practices]

Fix:
- Option 1: Add to deps array (may cause extra renders)
- Option 2: Wrap fetchData in useCallback with proper deps
```

---

#### Scenario 2: SQL Query Security

**Found in code:**
```typescript
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

**Uncertainty:** "Is this vulnerable to SQL injection?"

**Verification:**
1. `exa-get_code_context_exa(query: "SQL injection prevention parameterized queries node.js")`
2. Analyze multiple sources confirming string interpolation is vulnerable
3. **Conclusion:** CRITICAL security issue - always use parameterized queries

**Review comment:**
```
🚨 CRITICAL: SQL Injection Vulnerability
File: src/api/auth.ts:42

String interpolation in SQL queries allows injection attacks.
[Verified via Exa search - confirmed security anti-pattern]

Fix:
const query = 'SELECT * FROM users WHERE email = ?';
const result = await db.execute(query, [email]);
```

---

#### Scenario 3: Next.js API Route Middleware

**Found in code:**
```typescript
export default function handler(req, res) {
  // No rate limiting
  const data = await processRequest(req.body);
  res.json(data);
}
```

**Uncertainty:** "Should API routes have rate limiting? What's the standard approach?"

**Verification:**
1. `context7-resolve-library-id(libraryName: "next")`
2. `context7-get-library-docs(context7CompatibleLibraryID: "/vercel/next.js", topic: "API routes middleware")`
3. `exa-get_code_context_exa(query: "Next.js API routes rate limiting production best practices")`
4. **Conclusion:** Production APIs should have rate limiting; common pattern is using middleware

**Review comment:**
```
⚠️ MAJOR: Missing Rate Limiting on Public API
File: pages/api/process.ts:1

Public API routes should implement rate limiting to prevent abuse.
[Verified via Context7 (Next.js docs) + Exa (production patterns)]

Suggested approach:
1. Install: npm install express-rate-limit
2. Implement middleware pattern from Next.js docs
3. Consider per-user vs per-IP limits based on auth
```

---

### Verification Guidelines

**Always verify when you encounter:**
- ❓ Unfamiliar library/framework usage
- 🔐 Security-sensitive operations
- ⚡ Performance-critical code paths
- 🧪 Complex testing patterns
- 🔌 Third-party API integrations
- 📚 Deprecated API warnings

**DON'T verify for:**
- ✅ Well-known standard patterns (e.g., basic if/else, loops)
- ✅ Project-specific conventions (check CLAUDE.md instead)
- ✅ Simple utility functions
- ✅ Code you're 100% confident about

**Verification adds value when:**
- 🎯 Prevents false positives (marking correct code as wrong)
- 🎯 Catches subtle anti-patterns (code that "works" but is wrong)
- 🎯 Provides authoritative sources for recommendations
- 🎯 Improves reviewer confidence and accuracy

---

## Step 3: Categorize Findings

Organize all findings by severity:

### 🚨 CRITICAL (Must Fix Before Merge)

**Criteria:**
- Security vulnerabilities (SQL injection, XSS, exposed secrets)
- Data loss risks
- Breaking changes to public APIs
- Critical bugs that crash the application
- Authentication/authorization bypasses

**Example:**
```markdown
- [Security] src/api/auth.ts:42 - SQL injection vulnerability
  Current code uses string concatenation in query:
  ```typescript
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  ```
  Fix: Use parameterized queries:
  ```typescript
  const query = `SELECT * FROM users WHERE id = ?`;
  const result = await db.execute(query, [userId]);
  ```
```

### ⚠️ MAJOR (Should Fix)

**Criteria:**
- Performance issues (O(n²) algorithms, memory leaks)
- Missing error handling on critical paths
- Poor code quality affecting maintainability
- Missing tests for critical functionality
- Significant technical debt

**Example:**
```markdown
- [Performance] src/utils/search.ts:15 - O(n²) nested loops
  Nested iteration over arrays causing slow searches:
  ```typescript
  items.forEach(item => {
    categories.forEach(cat => { /* check */ });
  });
  ```
  Fix: Use Map for O(n) lookup:
  ```typescript
  const catMap = new Map(categories.map(c => [c.id, c]));
  items.forEach(item => {
    const cat = catMap.get(item.categoryId);
  });
  ```
```

### 💡 MINOR (Consider Fixing)

**Criteria:**
- Style inconsistencies
- Minor code smells
- Non-critical refactoring opportunities
- Optional documentation improvements
- Nice-to-have optimizations

**Example:**
```markdown
- [Style] src/components/Button.tsx:8 - Inconsistent naming
  Component uses `onClick` and `onPress` inconsistently.
  Consider standardizing to `onClick` across all components.
```

---

## Step 4: Generate Report

### Report Structure

```markdown
# Code Review Report

**Scope:** [Brief description of what was reviewed]
**Reviewed:** [Number of files, lines changed]
**Date:** [Current date]

---

## 🚨 CRITICAL ISSUES (Must Fix Before Merge)

[If any critical issues found, list them with file:line, description, and fix]

[If none:]
✅ No critical issues found

---

## ⚠️ MAJOR ISSUES (Should Fix)

[List major issues with file:line, description, and suggested fix]

[If none:]
✅ No major issues found

---

## 💡 MINOR ISSUES (Consider Fixing)

[List minor issues with file:line and brief description]

[If none:]
✅ No minor issues found

---

## ✅ POSITIVE OBSERVATIONS

[Highlight good practices found in the code:]
- Well-structured test coverage in src/api/
- Clean separation of concerns in components
- Comprehensive error handling in auth flow
- Clear documentation in README updates

---

## 📝 SUMMARY

**Overall Assessment:** [APPROVE / NEEDS_WORK / REJECT]

**Recommendation:**
[Specific next steps based on findings]

**Key Takeaways:**
- [Most important points]
- [Action items]

---

## Quick Stats

- Files reviewed: [N]
- Lines changed: [+X, -Y]
- Issues found: [Critical: N, Major: N, Minor: N]
- Test coverage: [X%] (if available)
```

---

## Step 5: Run Automated Checks

After completing the code review, run automated quality checks to verify builds and tests pass.

**Recommended:** Use the `/check-after-stop` command to run project-configured checks:

```
/check-after-stop
```

This command will:
1. Read `.claude/check-after-stop.sh` configuration
2. Run build commands (e.g., `bun run build`, `dotnet build`)
3. Run test suites (e.g., `bun test`, `npm run test:ci`)
4. Report any failures

**Why this matters:**
- Code review catches logical issues, but automated checks catch runtime issues
- Ensures builds succeed before creating PR
- Verifies test suite passes with your changes
- Catches integration issues early

**Example flow:**
```
1. /code-review          → Manual review (quality, security, performance)
2. Fix critical issues   → Address findings from review
3. /check-after-stop     → Automated checks (build, tests)
4. Create PR             → All checks passed
```

If automated checks fail, document failures in the review report and recommend fixing before merge.

---

## Assessment Criteria

**APPROVE ✅**
- No critical issues
- No major issues OR all major issues have clear workarounds
- Minor issues don't affect functionality
- Code improves overall quality

**NEEDS_WORK ⚠️**
- One or more major issues present
- Minor issues are numerous
- Missing critical tests
- Significant refactoring needed

**REJECT ❌**
- One or more critical security vulnerabilities
- Breaking changes without migration path
- Code introduces significant technical debt
- Fundamental design flaws

---

## Best Practices

1. **Be Specific:** Always include file:line references
2. **Provide Examples:** Show both problem and solution code
3. **Balance Feedback:** Highlight positives, not just problems
4. **Prioritize:** Focus on high-impact issues first
5. **Be Actionable:** Every issue should have a clear fix
6. **Consider Context:** Check CLAUDE.md and .claude/ for project standards
7. **Stay Objective:** Focus on code quality, not personal preferences
8. **Verify When Unsure:** Use Exa search and Context7 to validate patterns and best practices before flagging issues
9. **Cite Sources:** Include verification sources ([Context7], [Exa]) in review comments for authority
10. **Run Automated Checks:** After review, use `/check-after-stop` to verify builds and tests

---

## Common Patterns to Check

### Security Red Flags
- `eval()`
- `innerHTML` without sanitization
- `dangerouslySetInnerHTML` in React
- String concatenation in SQL queries
- User input in file paths
- Passwords in plain text

### Performance Red Flags
- Nested loops over large arrays
- Database queries in loops
- Missing indexes on queries
- Synchronous file operations
- Unnecessary component re-renders
- Large dependencies imported in hot paths

### Quality Red Flags
- Functions longer than 50 lines
- Cyclomatic complexity > 10
- Duplicate code blocks
- God objects (>300 lines)
- Missing error handling
- Magic numbers without constants

---

## Example Review Session

**User:** `/code-review src/api/`

**Assistant:**
1. Scans files in src/api/
2. Uses git diff to see recent changes
3. Analyzes each file against the 5 categories
4. **Verifies uncertain patterns:**
   - Uses `exa-get_code_context_exa` to verify SQL query patterns
   - Confirms string interpolation in queries is SQL injection vulnerability
5. Finds:
   - Critical: SQL injection in auth.ts (verified via Exa)
   - Major: Missing error handling in users.ts
   - Minor: Inconsistent naming in types.ts
6. Generates structured report with verification sources
7. Recommends: NEEDS_WORK (fix critical issue)

---

## Notes

- This command is read-only (no edits made)
- Uses git diff, Read, Grep, Exa search, and Context7 for comprehensive analysis
- Focuses on changed code, not entire codebase
- Adapts to project-specific conventions in CLAUDE.md
- Can be run multiple times during development
- **Verification tools (Exa + Context7) prevent false positives and ensure accurate recommendations**
- Review comments include verification sources for transparency and authority
