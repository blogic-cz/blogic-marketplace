# Structural Review

Apply only when selected. Inspect maintainability, ownership, abstraction cost, branching growth, invariant clarity, and opportunity to delete complexity without changing behavior.

Ask whether new special cases leak into unrelated flows; indirection earns itself; canonical helpers/contracts are reused; casts/optionality/silent fallbacks hide invariants; related updates should be atomic; and a large touched file has demonstrable mixed ownership or low cohesion.

Flag only high-confidence in-scope regressions: scattered feature checks, thin wrappers, speculative flexibility, duplicate helpers, repeated conditionals lacking model, boundary leakage, avoidable loose/nullable contracts, or partial orchestration with clear atomic alternative. Size alone is never a finding. Classify adjacent/out-of-scope observations as non-blocking.
