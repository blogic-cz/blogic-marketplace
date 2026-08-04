# Review Method

Review correctness, security, data loss, compatibility, error handling, and missing behavior tests in changed code. Compare each finding against target-branch behavior and cite the affected `file:line`.

Report only material findings:

- **Critical** — likely security issue, data loss, or severe outage.
- **Major** — incorrect behavior, broken contract, missing required authorization/validation, or significant regression.
- **Minor** — real maintainability or reliability issue worth addressing before merge.

Do not report preferences, broad refactors, or issues outside changed scope unless the change directly exposes them.

For review loops, reviewer does not make fixes. Change owner fixes, runs relevant checks, and presents refreshed state. After every fix, review complete current change view: `git diff <target>...HEAD`, `git diff --cached`, and `git diff`; prior findings are not cleared by assumption. Finish only with passing required checks and no material findings. If scope or target cannot be determined, stop and ask one precise question.
