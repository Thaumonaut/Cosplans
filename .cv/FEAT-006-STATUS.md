# FEAT-006: Enhanced Moodboard System — Status Summary

**Feature ID:** FEAT-006  
**Status:** Design Complete → Ready for Specification  
**Last Updated:** 2026-01-23  
**CodeVision Phase:** Planning (Design → Spec)

---

## Current State

### ✅ Completed

1. **Council Review Session** (2026-01-23)
   - 8 personas participated (cosplayers, photographers, wig makers, prop makers, event coordinators, designers)
   - 8 major design decisions approved
   - 7 new node types defined
   - 2 new edge types defined
   - 12 major features specified

2. **Design Artifacts Organized** (`.cv/design/feat-006/`)
   - `council-decisions.md` - Authoritative design decisions
   - `interaction-patterns.md` - Complete interaction catalog
   - `README.md` - Design overview and principles

3. **Brainstorming Archive** (`.cv/ledger/feat-006/`)
   - Original specs and tasks preserved
   - Council presentation materials
   - Research and planning documents
   - Historical record for future reference

### 🔄 In Progress

**Next: Create Feature Specification (SFS-v2 format)**

According to CodeVision Section 4.5-4.6, need to create:
- `.cv/spec/features/feat-006/spec.md` - Main feature specification
- Capability definitions using Section 12.13 template
- Component reuse analysis (check `.cv/components/registry.md`)
- Checkpoint definitions for verification

---

## CodeVision Artifacts Location

```
.cv/
├── design/
│   └── feat-006/                    ✅ COMPLETE
│       ├── council-decisions.md     (Authoritative - 8 decisions)
│       ├── interaction-patterns.md  (Complete interaction catalog)
│       └── README.md                (Design overview)
│
├── ledger/
│   └── feat-006/                    ✅ ARCHIVED
│       ├── original-spec.md         (Historical)
│       ├── original-tasks.md        (Historical)
│       ├── council-*.md             (Historical)
│       ├── plan/                    (Early planning docs)
│       ├── research-assets/         (Reference materials)
│       └── README.md                (Ledger guide)
│
├── spec/
│   └── features/
│       └── feat-006/                ⏳ TODO - Create SFS-v2 spec
│           ├── spec.md              (Main specification)
│           ├── capabilities/        (Individual capability specs)
│           └── checkpoints.md       (Verification checkpoints)
│
└── components/
    └── registry.md                  ✅ EXISTS - Check for reuse
```

---

## Feature Summary

### New Node Types (7)

1. **Pile** - Single-layer grouping that expands in-place
2. **Container** - Deep nesting with drill-in (character/prop/group)
3. **Event** - Calendar-synced scheduling with date/time/location
4. **Contact** - People/businesses with contact info and relationships
5. **Checklist** - Task lists with progress tracking and attachments
6. **Compare** - Side-by-side comparison of any two nodes
7. **Enhanced Sketch** - Image annotation with drawing tools and notes

### New Edge Types (2)

1. **Sequential** - Ordered progression chains (WIP Day 1 → 2 → 3)
2. **Ghost edges** - Create ghost node clones in connected containers

### Major Features (12)

1. Progressive disclosure UI (collapsible context bar, dropdown toolbars)
2. Inspector panel (right sidebar desktop / bottom drawer mobile)
3. Container peek (quick view without navigation)
4. Pile-to-container conversion (natural growth pattern)
5. Ghost nodes (cross-container visibility without duplication)
6. Ghost filtering (visual highlighting of matches)
7. Node templates (reusable structures for checklists/containers/notes)
8. Batch operations (multi-select bulk actions: tag, delete, move, connect)
9. Enhanced list view (filter, sort, search, container-only mode)
10. CSV import/export (bulk data with mapping interface)
11. Sequential timeline (progress tracking with scrubber/animation)
12. Compare modes (side-by-side, slider, overlay for any node type)

---

## Design Principles

Per council decisions, implementation must follow these principles:

1. **Progressive Disclosure** - Simple by default, complexity on demand
2. **Workflow Flexibility** - Support organized (containers) AND chaotic (piles)
3. **Visual + Accessible** - Canvas for visual users, List/Table for accessibility
4. **Connected Context** - Events ↔ Contacts ↔ Costumes ↔ Checklists
5. **Multi-Project Cross-Reference** - Ghost nodes for shared resources
6. **Real-World Analogies** - Piles=paper stacks, Containers=binders, Peek=sleeve view
7. **Bulk Operations** - Efficient multi-select for power users
8. **Interoperability** - CSV import/export for external tools
9. **Build and Compare** - Annotate, track progress, compare results
10. **Honest Accessibility** - Canvas limited, List/Table fully accessible (WCAG 2.1 AA)

---

## Accessibility Strategy (Approved)

**Canvas View:**
- Primarily visual/spatial (mouse/touch optimized)
- Basic keyboard support (tab, arrow keys, enter, escape)
- Limited screen reader support (announces nodes, not spatial layout)
- **Honest limitation documented**

**Fully Accessible Alternatives (WCAG 2.1 AA):**
- **List View** - Optimized for screen readers
- **Table View** - Optimized for keyboard-only users
- **Gallery View** - Good for low vision users

**Strategy:** All features work in all views. Canvas not required for any functionality.

---

## Next Steps (CodeVision Process)

### 1. Create Feature Specification (SFS-v2)

Location: `.cv/spec/features/feat-006/spec.md`

Must include (per Section 4.5):
- Feature intent and scope
- Detailed functional capabilities (using Section 12.13 template)
- Implementation approach
- Dependencies and risks
- Design and UX considerations (reference design artifacts)
- Security considerations

### 2. Define Capabilities

For each major feature, create capability spec using template from Section 12.13:
- Inputs, Processing, Outputs
- State & Data (reads/writes)
- Edge Cases & Failure Modes
- Security Considerations
- **Design & UX Notes: Components (reuse from registry)**
- Verification Steps (unit/integration/E2E)

### 3. Component Analysis

**Check `.cv/components/registry.md` for reuse:**
- Existing: InspectorPanel? Drawer? Modal? TagSelector? InlineEditors?
- Existing: Cards? LoadingStates? ConfirmDialog? Breadcrumbs?
- **New needed:** Which components must be created?

### 4. Define Checkpoints

Per Section 4.7, group tasks into verifiable units:
- Checkpoints require evidence to close
- Acceptance occurs only at checkpoint level
- Each checkpoint has clear verification steps

### 5. Create Implementation Plan

Once spec complete:
- Break into checkpoints
- Define tasks per checkpoint
- Identify dependencies
- Set up verification criteria

---

## References

- **CodeVision Spec:** `/home/jek/Downloads/codevision-spec-v1.0.5-rc3/spec.md`
- **Component Registry:** `.cv/components/registry.md`
- **Design Decisions:** `.cv/design/feat-006/council-decisions.md`
- **Interaction Patterns:** `.cv/design/feat-006/interaction-patterns.md`
- **Historical Context:** `.cv/ledger/feat-006/` (informative only)

---

**Status:** ✅ Design phase complete, ready to begin specification phase  
**Next Action:** Create `.cv/spec/features/feat-006/spec.md` using SFS-v2 format
