REPO: $GITHUB_REPOSITORY
PR NUMBER: $PR_NUMBER

Review ONLY the changes introduced by this pull request.
Use `gh pr diff $PR_NUMBER` to get the PR diff. Do NOT use `git fetch` or `git diff`.

PROJECT-SPECIFIC REVIEW CHECKS:

Review the PR diff for these marketplace-specific patterns:

Skill Quality:

- ✅ SKILL.md has valid YAML frontmatter with `name` and `description` ❌ Missing or malformed frontmatter
- ✅ Description uses third-person ("This skill should be used when...") ❌ Second person ("Use this skill when...")
- ✅ References to bundled files (`references/`, `examples/`, `scripts/`) actually exist ❌ Broken references to non-existent files
- ✅ SKILL.md stays lean, detailed info lives in `references/` ❌ Huge SKILL.md with everything inlined
- ✅ Imperative/infinitive writing style (verb-first instructions) ❌ "You should..." or "If you need to..."

File Quality:

- ✅ No `.DS_Store` or other OS artifacts in commits ❌ `.DS_Store`, `Thumbs.db`, etc.
- ✅ Files end with a newline ❌ Missing trailing newline
- ✅ Consistent markdown formatting (headings, tables, code blocks) ❌ Broken tables, inconsistent heading levels
- ✅ kebab-case directory and file names ❌ PascalCase or camelCase names

Shell Scripts:

- ✅ Scripts have proper shebang (`#!/usr/bin/env bash`) ❌ Missing shebang
- ✅ `set -euo pipefail` for error handling ❌ No error handling
- ✅ Proper quoting of variables (`"$VAR"`) ❌ Unquoted variables

Plugin Structure:

- ✅ Hook scripts reference correct env vars (`CLAUDE_PLUGIN_ROOT`, `CLAUDE_PROJECT_DIR`) ❌ Hardcoded paths
- ✅ plugin.json follows valid schema ❌ Malformed JSON or invalid hook types

Security:

- No hardcoded secrets, API keys, or tokens in code
- No sensitive data in log output

Only flag patterns above if they appear in CHANGED lines of the PR diff. Do not scan the entire codebase.

INLINE COMMENTS:

- For each concrete issue that maps to a changed line in the PR, add an inline comment on that line.
- Each inline comment MUST end with this invisible signature, on a separate line:
  <!-- claude-code-review-inline -->

FINAL RESULT FORMAT (deterministic):

- At the very end of your run, output EXACTLY one of these lines as plain text (no markdown, no extra text):

  RESULT: PASSED
  (if you found no actionable issues in the PR diff)

  RESULT: FAILED
  (if you found at least one actionable issue)
