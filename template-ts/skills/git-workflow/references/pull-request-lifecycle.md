# Pull-Request Lifecycle

Keep each cycle bounded:

1. Inspect current diff against target branch and CI/review state.
2. Address one concrete failure or finding.
3. Run relevant local checks.
4. Commit and push only when authorized by task or repository workflow.
5. Refresh CI and review state; repeat only while actionable work remains.

Do not claim readiness while required checks are failing or material review findings remain. Leave reviewer discussion and merge decisions to their owners unless the task assigns them.
