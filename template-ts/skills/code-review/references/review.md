# Findings-Only Review Contract

Read each effective changed file and enough callers, tests, configuration, and contract context to verify behavior. Check correctness, input validation and authorization, security/privacy, data loss, error paths, idempotency/concurrency, API/schema compatibility, migrations, configuration, observability, and missing regression coverage.

Compare behavior with target-branch baseline. Deduplicate root causes and existing review history. A finding must name severity, changed path/line, concrete failure mode, evidence, and necessary action.

Do not edit, commit, push, post comments, or run broad deterministic checks in this lane. Coordinator owns checks; reviewer returns findings only.
