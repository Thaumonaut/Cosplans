# FEAT-006 Capability Specifications

This directory contains detailed specifications for all 20 capabilities that comprise the Moodboard Organization & Container Detail Display Patterns feature.

## Capability Overview

### Foundation & Core Nodes (CP-001)
- **CAP-001**: Pile Nodes & In-Place Expansion
- **CAP-002**: Container Nodes & Drill-In Navigation
- **CAP-004**: Inspector Panel & Context Bar
- **CAP-006**: Pile-to-Container Conversion

### Ghost Nodes & Cross-Container Linking (CP-002)
- **CAP-003**: Ghost Nodes & Cross-Container Visibility

### Event, Contact, Checklist Nodes (CP-003)
- **CAP-007**: Event Nodes & Calendar Sync
- **CAP-008**: Contact Nodes
- **CAP-009**: Checklist Nodes

### Progress Tracking & Comparison (CP-004)
- **CAP-010**: Sequential Edges & Timeline View
- **CAP-011**: Enhanced Sketch Tool (Image Annotation)
- **CAP-012**: Compare Nodes

### Bulk Operations & Templates (CP-005)
- **CAP-013**: Batch Operations
- **CAP-014**: Node Templates
- **CAP-015**: Ghost Filtering

### Data Import/Export & Enhanced List View (CP-006)
- **CAP-016**: CSV Import with Mapping
- **CAP-017**: CSV Export
- **CAP-018**: Enhanced List View

### Container Peek & Polish (CP-007)
- **CAP-005**: Container Peek (Quick View)
- **CAP-019**: Unified Card Component

### Accessibility Compliance (CP-008)
- **CAP-020**: Accessibility Strategy

## Priority Breakdown

### Critical Priority
- CAP-001: Pile Nodes
- CAP-002: Container Nodes
- CAP-019: Unified Card Component
- CAP-020: Accessibility Strategy

### High Priority
- CAP-003: Ghost Nodes
- CAP-004: Inspector Panel

### Medium Priority
- CAP-005: Container Peek
- CAP-006: Pile-to-Container Conversion
- CAP-007: Event Nodes
- CAP-008: Contact Nodes
- CAP-009: Checklist Nodes
- CAP-010: Sequential Edges
- CAP-011: Sketch Tool
- CAP-012: Compare Nodes
- CAP-013: Batch Operations
- CAP-018: List View

### Low Priority
- CAP-014: Node Templates
- CAP-015: Ghost Filtering
- CAP-016: CSV Import
- CAP-017: CSV Export

## Implementation Checkpoints

The capabilities are organized into 8 checkpoints for staged implementation:

1. **CP-001**: Foundation & Core Nodes (CAP-001, 002, 004, 006)
2. **CP-002**: Ghost Nodes & Cross-Container Linking (CAP-003)
3. **CP-003**: Event, Contact, Checklist Nodes (CAP-007, 008, 009)
4. **CP-004**: Progress Tracking & Comparison (CAP-010, 011, 012)
5. **CP-005**: Bulk Operations & Templates (CAP-013, 014, 015)
6. **CP-006**: Data Import/Export & Enhanced List View (CAP-016, 017, 018)
7. **CP-007**: Container Peek & Polish (CAP-005, 019)
8. **CP-008**: Accessibility Compliance (CAP-020)

## New Components Required

Across all capabilities, the following new components need to be created:

### Moodboard Nodes
- `PileNode.svelte`, `ContainerNode.svelte`, `EventNode.svelte`
- `ContactNode.svelte`, `ChecklistNode.svelte`, `CompareNode.svelte`
- `SketchNode.svelte`, `GhostNode.svelte`

### Moodboard UI Components
- `InspectorPanel.svelte`, `ContextBar.svelte`, `ContainerPeek.svelte`
- `SketchEditor.svelte`, `ComparisonView.svelte`
- `BatchActionToolbar.svelte`, `TemplateLibrary.svelte`
- `CSVImportWizard.svelte`, `ListView.svelte`
- `UnifiedCard.svelte` (foundational component)

### Supporting Components
- Various dialog, editor, and utility components (see individual capability specs)

## Design Decisions Referenced

All capability specifications reference the 8 council decisions made during the design phase:

1. Mobile progressive disclosure strategy
2. Complete ARIA implementation
3. Piles vs containers distinction with peek feature
4. Event, contact, and checklist nodes
5. Batch operations and ghost nodes
6. Enhanced sketch tool and sequential edges
7. CSV import/export
8. Accessibility strategy with alternative views

## Next Steps

1. Review and approve capability specifications
2. Create component specifications for new components
3. Begin implementation following checkpoint order
4. Regular testing at each checkpoint

## References

- Main Feature Spec: `../.cv/spec/features/feat-006/spec.md`
- Design Artifacts: `../.cv/design/feat-006/`
- Ledger (Historical): `../.cv/ledger/feat-006/`
