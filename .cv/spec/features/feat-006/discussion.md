# Discussion: FEAT-006 — Enhanced Moodboard System

## Historical Context & Evolution
The "Brainstorming & Moodboard" feature (originally FEAT-006) identifies the "Idea Phase" as the core differentiator for Cosplans. Unlike competitors that start at project creation, Cosplans captures the chaotic "messy middle" of inspiration gathering.

This specification unifies three previous documents:
1. `specs [depricated]/006-brainstorming-moodboard` (Original vision)
2. `.cv/spec/features/FEAT-006.md` (Intermediate v3.0 spec)
3. `.cv/design/feat-006/COUNCIL_DECISIONS.md` (Design authority)

## Design Philosophy: "Organized Chaos"
A critical requirement from the original spec is **ADHD-Friendliness**. The system must minimize friction during capture while allowing structure to emerge later.

### The "Pile" vs "Container" Distinction
- **Piles (Chaos)**: Allow users to dump ideas quickly without categorizing them. "I'll sort this later."
- **Containers (Order)**: Allow deep organization when the user is ready.
- **Progressive Formalization**: The workflow `Quick Capture -> Pile -> Container -> Project` mirrors the user's mental shift from "ooh shiny!" to "I need to build this."

## Original Goals Reconciliation
This SFS-v2 specification preserves the original high-priority goals:

| Original Goal | Implementation in v1.0 |
|---------------|------------------------|
| **Visual Workspace** | Infinite Canvas (CAP-001/002) |
| **Social Integration** | URL Parsing & Share Target (CAP-021) |
| **Context Preservation** | Ghost Nodes & Inspector (CAP-003/004) |
| **Budgeting** | Budget Items & Totals (CAP-019/Unified Card) |
| **Idea → Project** | Conversion Wizard (CAP-022) |

## Social Media Strategy
**Decision**: Start with generic metadata extraction (oembed/OpenGraph) rather than maintaining 5+ official API integrations immediately.
- **Phase 1**: Generic parsers + PWA Share Target.
- **Phase 2**: Official APIs for Instagram/TikTok if scraping becomes unreliable.

## Rejected Alternatives
- **Pure Canvas (Miro-like)**: Rejected because it lacks structured data for budgeting/tasks.
- **Pure List (Trello-like)**: Rejected because it kills creative flow.
- **"Separated" References Tab**: Rejected. The Moodboard *is* the references tab.

## References
- `.cv/ledger/feat-006/` (Archive of previous specs)
- `.cv/design/feat-006/` (Current design assets)
