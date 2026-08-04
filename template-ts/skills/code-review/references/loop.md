# Review Loop

Coordinator owns scope, validation, and fixes. Findings-only reviewer owns independent assessment. Before first pass, validate optional `max-turns=<positive integer>`; default `10`, reject invalid input, impose no upper bound, and never extend budget automatically.

1. Capture effective scope: committed base/head plus staged, unstaged, and intended untracked overlay.
2. Consume one review-budget turn; reviewer returns only material findings with terminal result.
3. Owner fixes approved in-scope findings; no drive-by changes.
4. Coordinator runs relevant deterministic checks.
5. Recompute scope and request a fresh complete pass. Prior findings are not cleared by assumption.

Stop and report when budget is exhausted, a material finding remains, validation fails/blocks, target/scope is ambiguous, or fix expands product intent. A new run needs explicit authorization. `RESULT: PASSED` requires fresh final pass with no unresolved Critical/Important findings.
