---
name: grill-me
description: This skill should be used when a user wants to stress-test a plan, pressure-test a design, expose hidden assumptions, resolve blockers, or explicitly asks to be "grilled" with rigorous questioning.
---

Run a rigorous decision-clarification loop for the user's plan or design.

Use this loop:

1. Identify open decisions, assumptions, dependencies, and risks.
2. Prioritize the single highest-leverage unresolved decision (the one most likely to unblock other choices or prevent rework).
3. Ask one focused question that resolves that decision.
4. Summarize current understanding, including what is now decided, what remains open, and why the next question matters.
5. Repeat until exit criteria are met.

Choose evidence source before asking:

- Inspect available artifacts (codebase, docs, specs, prior decisions) first when the answer is factual and recoverable from existing information.
- Ask the user directly when the answer is preference-, strategy-, risk-tolerance-, or business-priority-dependent.

Separate elicitation from recommendation:

- During elicitation, avoid leading phrasing and avoid presenting a preferred answer in the question.
- After enough context is collected for a decision, provide a recommendation with rationale, tradeoffs, and explicit assumptions.

Exit criteria:

- Stop when all blocker-level decisions are resolved and remaining open items are low impact or explicitly deferred.
- Stop when the user confirms sufficient clarity to proceed.
- If unresolved blockers remain, end with a concise blocker list and the minimum next questions needed.
