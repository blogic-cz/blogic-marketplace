# Domain Modeling And Invariants

Load for business state or operation changes.

Place each invariant with owner that can enforce it: entity/aggregate for its own consistency, domain service for cohesive cross-entity rule, application workflow for orchestration. Validate before externally visible side effects. Expected business failures are typed, deliberate outcomes with stable meaning; corruption, violated assumptions, and impossible states fail exceptionally and are observable.

## Before Adding A Domain Type

Decide from behavior, not naming. Ask in order: does an existing aggregate already own it; what invariant does it protect; does it have independent identity and lifecycle; is uniqueness global or scoped to a parent; is its value set finite and stable; and do candidate values carry different semantics? Then choose: entity for independent identity/lifecycle, value object for validated value semantics, enum/union for a finite stable set, or primitive when no stronger behavior exists. Do not add a type merely to wrap a field without invariant, lifecycle, or semantic distinction.

Construct valid objects through explicit operations. Do not expose setters or partially initialized states that let callers bypass invariants. Keep identity, lifecycle transitions, and version/freshness rules explicit. A no-op update still needs defined authorization and freshness behavior; do not silently skip checks because state happens to match.

For durable messages/events, include complete stable payload needed after restart. Test serialization/transport seam when a message crosses a process or durable queue; an in-memory handler test does not prove it. Do not publish event before mutation is accepted and durable according to local transaction/outbox pattern.

Use specialist skills for TypeScript/Effect error implementation. This reference defines when behavior is a typed expected failure, not syntax.

## Completion

- [ ] Existing aggregate ownership and invariant were considered before adding a type.
- [ ] Identity/lifecycle, uniqueness scope, value-set stability, and semantic distinction select entity, value object, enum/union, or primitive.
- [ ] Invariant owner rejects invalid transition.
- [ ] Expected failure has stable typed/client meaning.
- [ ] Freshness/no-op semantics are explicit.
- [ ] Durable message payload can round-trip.
