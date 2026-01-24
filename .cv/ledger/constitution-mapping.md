# Constitution to Contracts Mapping

Maps sections from `.specify/memory/constitution.md` v1.2.0 to `.cv/contracts/` files.

## Mapping Table

| Constitution Section | Contract File | Notes |
|---------------------|---------------|-------|
| I. Project-Centric Planning | `product.contract.md` | Core product principle |
| II. Team-Based Architecture | `architecture.contract.md` | Data model foundation |
| III. Complete Workflow Coverage | `product.contract.md` | Feature scope |
| IV. MVP First, Test-Driven Development | `product.contract.md` | Development philosophy |
| V. Modular Feature Organization | `architecture.contract.md` | Domain structure |
| VI. Cost-Conscious Infrastructure | `architecture.contract.md` | Infrastructure costs |
| VII. Future-Ready Design | `architecture.contract.md` | Data abstraction |
| VIII. AI Features & Premium Monetization | `product.contract.md` | Monetization |
| IX. Data Privacy & User Rights | `security.contract.md` | Full section |
| Feature Scope Matrix | `product.contract.md` | Summary only; full matrix stays in constitution |
| Technical Standards | `architecture.contract.md` + `design.contract.md` | Split by concern |
| Component Standards | `design.contract.md` | UI/component rules |
| Development Workflow | `product.contract.md` | Brief; detailed in constitution |
| Navigation Structure | `design.contract.md` | Sidebar structure |
| Governance | *Not migrated* | Keep in constitution for amendment process |

## What Stays in Constitution

The original `.specify/memory/constitution.md` remains the authoritative source for:

1. **Full Feature Scope Matrix** - Too detailed for contracts
2. **Governance & Amendment Process** - Meta-rules about changing rules
3. **Version History** - Changelog and sync impact reports
4. **Detailed Technical Examples** - Code snippets and patterns

## Sync Protocol

When updating contracts:

1. Check if change affects constitution principle
2. If yes, update constitution first (follow amendment process)
3. Then sync change to relevant contract
4. Note sync in this mapping file if structure changes

## Last Synced

- **Date**: 2026-01-20
- **Constitution Version**: 1.2.0
- **Contracts Created**: Initial migration
