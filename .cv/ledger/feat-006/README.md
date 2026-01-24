# FEAT-006 Brainstorming & Discovery Ledger

**Purpose:** Historical record of brainstorming sessions, council reviews, and discovery process  
**Status:** Reference Only - See `.cv/design/feat-006/` and `.cv/spec/features/feat-006/` for authoritative artifacts  
**Date Range:** 2026-01-18 to 2026-01-23

---

## What This Directory Contains

This ledger contains the **informal brainstorming and discovery artifacts** that led to the final approved design. These are **informative** (non-binding context) per CodeVision Section 3.2.

### Artifacts

1. **`original-spec.md`** - Initial specification before council review
   - Early feature ideas and requirements
   - Original data model proposals
   - Initial UI/UX concepts
   
2. **`original-tasks.md`** - Initial task breakdown before redesign
   - Preliminary implementation thoughts
   - Pre-council task estimates

3. **`council-presentation.md`** - Prepared presentation for council
   - Design challenge summary
   - Initial 5 design decisions
   - Competitive analysis
   - Open questions for council

4. **`council-review.md`** - Preliminary council review document
   - Earlier version of council materials
   - Initial stakeholder questions

5. **`plan/`** - Early planning documents
   - Data model explorations
   - Technical research notes
   - Architecture proposals

6. **`research-assets/`** - Reference materials and research
   - Competitive analysis screenshots
   - UX pattern examples
   - Technical investigation results

---

## Evolution Path

```
Original Spec (Jan 18)
    ↓
Council Preparation (Jan 22-23)
    ↓
Council Role-Play Session (Jan 23)
    ↓ (8 personas, 20+ questions)
    ↓
Approved Design Decisions (Jan 23)
    ↓
Authoritative Artifacts:
    • .cv/design/feat-006/council-decisions.md
    • .cv/design/feat-006/interaction-patterns.md
```

---

## Key Changes During Council Review

### What Changed

**Container Details Display:**
- **Before:** Awkward `container_details` child node
- **After:** Inspector panel + context bar pattern

**Component Design:**
- **Before:** Separate ReferenceCard and NodeCard
- **After:** Unified card component with expand/collapse

**Node Types Added:**
- Event nodes (calendar sync)
- Contact nodes (people/businesses)
- Checklist nodes (task lists)
- Compare nodes (side-by-side comparison)
- Enhanced sketch (image annotation)

**Ghost Nodes Concept:**
- Emerged from wig maker (Taylor) use case
- Solves multi-project cross-referencing
- Major architectural decision

**CSV Import/Export:**
- Added for event coordinator (Rachel) use case
- Mapping interface for flexibility

**Accessibility Strategy:**
- Clarified canvas limitations
- Committed to WCAG 2.1 AA via alternative views

---

## Authoritative Sources

For implementation, reference these authoritative artifacts instead:

1. **Design Decisions:** `.cv/design/feat-006/council-decisions.md`
2. **Interaction Patterns:** `.cv/design/feat-006/interaction-patterns.md`
3. **Feature Specification:** `.cv/spec/features/feat-006/spec.md` (when created)
4. **Component Registry:** `.cv/components/registry.md`

---

## Notes for Future Reference

### Why We Keep This

Per CodeVision Section 3.2, these **informative artifacts** help future developers understand:
- **Why** certain design decisions were made
- **What alternatives** were considered and rejected
- **What user problems** drove the feature design
- **What personas** influenced specific decisions

### What This Is NOT

- ❌ NOT authoritative (binding decisions are in `.cv/design/feat-006/`)
- ❌ NOT implementation specs (those are in `.cv/spec/features/feat-006/`)
- ❌ NOT current state (this is historical record)

### When to Reference This

- Understanding design rationale
- Onboarding new team members
- Reviewing rejected alternatives
- Documenting decision history
- Learning from the design process

---

**Last Updated:** 2026-01-23  
**Preserved By:** CodeVision ledger system
