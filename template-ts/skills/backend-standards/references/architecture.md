# Architecture And Module Contracts

Read for every backend change.

Organize by domain capability and module ownership. Keep transport adapters and vendor/database implementation at edges; domain/application behavior depends on capabilities, not transport clients. A module owns its internal persistence shape, implementation details, and invariants. Other modules use its deliberate public contract, not internal tables, repositories, or imports.

Commands change state; queries answer questions. Give create and update operations different shapes when required state differs: do not represent invalid combinations with nullable identifiers, versions, or flags. Keep command/query handler close to its contract unless an adapter-specific implementation belongs at infrastructure edge.

Cross-module workflows orchestrate through public contracts and translate between models. They do not reach through an internal database or reuse another module's private business logic. Keep source-specific reconciliation/application workflow out of domain core when it translates an external goal state into operations.

Dependency direction is inward: policy/domain does not import HTTP, queue, ORM, SDK, or vendor implementation. Make time, IDs, randomness, and external effects explicit dependencies where testability or determinism needs them. Public contracts are stable: version/change them intentionally and test contract seams.

## Completion

- [ ] Changed code lives in owning layer and module.
- [ ] Command shapes make missing required state unrepresentable.
- [ ] Cross-module integration uses public contract.
- [ ] Infrastructure dependency has not leaked inward.
