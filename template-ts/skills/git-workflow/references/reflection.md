# Delivery Reflection

After readiness, completed human review, or observed merge, optionally start a non-blocking reflection for material product or business-code delivery. Skip metadata-only, tooling-only, generated-only, or operational-only changes. Reflection never changes PR verdict, readiness, delivery state, or monitoring budget.

Give a read-only reviewer the current delivery summary, effective product-code diff, relevant review/CI evidence, known false positives, and applicable workflow guidance. Review complete available feedback before analysis. If evidence is incomplete, report limitation and make no proposal. Do not edit files, post comments, resolve threads, publish, or mutate external systems during reflection.

Propose only reusable process knowledge: repeated delivery friction, missing guidance or automation, stale guidance that creates false positives, or a recurring review failure. Do not derive policy from one-off preference or typo. Prefer updating existing guidance over adding another workflow.

```text
Observed pattern: <repeated behavior>
Evidence: <diff/review/session sources>
Owner: <existing skill or documentation>
Proposed change: <add|tighten|soften|remove|automate>
Expected benefit: <future behavior improved>
Confidence: <high|medium>
```

If none exists, report `Reflection: no workflow change proposed.` Present proposals after delivery result. Any edit, comment, publication, or other mutation resulting from reflection requires separate explicit approval and belongs to follow-up work, never current delivery.
