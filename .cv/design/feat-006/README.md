# FEAT-006: Enhanced Moodboard System — Design

**Status:** Design Complete - Ready for Specification  
**Last Updated:** 2026-01-23  
**Council Review:** ✅ Approved

---

## Overview

This directory contains the authoritative design artifacts for FEAT-006: Enhanced Moodboard System. All design decisions were made through a formal council review process with diverse user personas (cosplayers, photographers, wig makers, prop makers, event coordinators, accessibility experts).

## Design Artifacts

### Primary Documents

1. **`council-decisions.md`** - Authoritative design decisions (8 decisions)
   - Mobile UI progressive disclosure
   - Context bar accessibility
   - Piles vs containers distinction
   - Event/contact/checklist nodes
   - Batch operations and ghost nodes
   - Image annotations and progress tracking
   - Bulk import/export
   - Canvas accessibility strategy

2. **`interaction-patterns.md`** - Complete catalog of user interactions
   - Canvas-level interactions (context menus, pan/zoom, multi-select)
   - Node-level interactions (drag/drop, resize, hover, double-click)
   - Edge/connection interactions
   - Container-specific interactions
   - Inspector panel interactions
   - All keyboard shortcuts and accessibility patterns

## Design Principles (Discovered)

Based on council discussion, these principles emerged and guide the implementation:

1. **Progressive Disclosure** - Show simple by default, reveal complexity as needed
2. **Workflow Flexibility** - Support both organized (containers) and chaotic (piles) working styles
3. **Visual + Accessible** - Provide visual spatial canvas AND accessible linear views
4. **Connected Context** - Everything connects (events ↔ contacts ↔ costumes ↔ checklists)
5. **Multi-Project Cross-Reference** - Ghost nodes solve shared resources across projects
6. **Real-World Analogies** - Piles = stacks of paper, Containers = binders, Peek = looking through sleeve
7. **Bulk Operations** - Power users need efficient multi-select and batch actions
8. **Interoperability** - CSV import/export for working with external tools
9. **Build and Compare** - Annotate references, track progress, compare results
10. **Honest Accessibility** - Don't claim full accessibility where not feasible; provide alternatives

## Key Features Approved

### New Node Types (7)
1. **Pile** - Single-layer grouping, expands in-place
2. **Container** - Deep nesting with drill-in (character, prop, group types)
3. **Event** - Calendar-synced scheduling
4. **Contact** - People/businesses with contact info
5. **Checklist** - Task lists with progress tracking
6. **Compare** - Side-by-side comparison of any two nodes
7. **Enhanced Sketch** - Image annotation with drawing tools

### New Edge Types (2)
1. **Sequential** - Ordered progression chains (WIP Day 1 → Day 2 → Day 3)
2. **Ghost edges** - Create ghost node clones in connected containers

### Major Features (12)
1. Progressive disclosure UI (collapsible context bar, dropdown toolbars)
2. Inspector panel (right sidebar desktop / bottom drawer mobile)
3. Container peek (quick view without navigation)
4. Pile-to-container conversion
5. Ghost nodes (cross-container visibility)
6. Ghost filtering (visual highlighting)
7. Node templates (reusable structures)
8. Batch operations (multi-select bulk actions)
9. Enhanced list view (filter, sort, search)
10. CSV import/export with mapping interface
11. Sequential timeline with scrubber/animation
12. Compare modes (side-by-side, slider, overlay)

## User Personas Validated

The design was validated against these diverse user types:

- **Cosplayers** (Jess) - Group cosplays, character variations, budget planning
- **Photographers** (David) - Event scheduling, shot lists, equipment planning
- **Wig Makers** (Taylor) - Multi-client projects, technique library, batch organization
- **Prop Makers** (Alex) - Image annotation, progress tracking, before/after comparison
- **Event Coordinators** (Rachel) - Managing 50+ contestants, bulk import, reporting
- **Lead Designer** (Sarah) - Mobile UX, screen real estate, progressive disclosure
- **UX/UI Lead** (Marcus) - Accessibility, ARIA markup, WCAG 2.1 AA compliance

## Accessibility Strategy

**Canvas View:**
- Primarily visual/spatial (mouse/touch optimized)
- Basic keyboard support (tab, arrow keys, enter, escape)
- Limited screen reader support (announces nodes but not spatial relationships)

**Fully Accessible Views (WCAG 2.1 AA):**
- **List View** - Best for screen readers
- **Table View** - Best for keyboard-only users  
- **Gallery View** - Good for low vision users

**Approach:** Honest about canvas limitations, provide fully accessible alternatives with same functionality.

## Next Steps

1. ✅ Design complete and approved
2. **→ Create Feature Specification (SFS-v2)** in `.cv/spec/features/feat-006/`
3. Identify component reuse from `.cv/components/registry.md`
4. Document new components needed
5. Create implementation plan with checkpoints

## References

- Council session transcript: Session 2026-01-23
- Original spec: `specs/006-brainstorming-moodboard/spec.md`
- Component registry: `.cv/components/registry.md`
