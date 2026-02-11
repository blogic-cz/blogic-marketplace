REPO: $GITHUB_REPOSITORY
PR NUMBER: $PR_NUMBER

Review ONLY the changes introduced by this pull request.

Run `bun run check`.

- If it FAILS: summarize only the relevant error output and use it (plus PR diff) to guide feedback.
- If it PASSES: do not include command output; just note that it passed and focus on PR diff review.

MAIN PR COMMENT (idempotent):

- Create or replace the main PR comment using gh:
  1. List PR comments via: gh api "/repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments"
  2. If a comment containing "<!-- claude-code-review -->" exists, DELETE it:
     gh api -X DELETE "/repos/$GITHUB_REPOSITORY/issues/comments/{comment_id}"
  3. Create a new main comment:
     gh pr comment $PR_NUMBER --body "..."
- The comment MUST start with "## Claude Code Review" and end with "<!-- claude-code-review -->".
- Keep it short: status + a concise summary.

INLINE COMMENTS (no duplicates):

- For each concrete issue that maps to a changed line in the PR, add an inline comment on that line.
- Each inline comment MUST end with this invisible signature, on a separate line:
  <!-- claude-code-review-inline -->
- Before posting a new inline comment for a given file + line, check existing comments to avoid duplicates:
  - Inline (review) comments: gh api "/repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER/comments"
  - Main thread comments: gh api "/repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments"
    If there's already a comment with "<!-- claude-code-review-inline -->" that clearly refers to the same issue, skip it.

FINAL RESULT FORMAT (deterministic):

- At the very end of your run, output EXACTLY one of these lines as plain text (no markdown, no extra text):

  RESULT: PASSED
  (if `bun run check` passes and you found no actionable issues)

  RESULT: FAILED
  (if `bun run check` fails OR you found at least one actionable issue)
