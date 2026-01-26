# Spec Updates - 2025-11-04

## Summary of Changes

This document tracks updates made to the spec based on implementation decisions and priority adjustments.

---

## 1. Library Decisions

### @shopify/draggable
- **Decision**: Use `@shopify/draggable` v1.2.1 instead of native HTML5 DnD
- **Rationale**: 
  - Better cross-browser support
  - Built-in touch support
  - Handle-based dragging prevents click conflicts
  - Advanced features (mirror, auto-scroll, constraints)
- **Bundle Size**: ~15KB
- **Documentation**: Updated in `research.md` Section 1

### @melloware/coloris (Coloris.js)
- **Decision**: Use `@melloware/coloris` v0.25.0 for color picker
- **Rationale**:
  - Modern grid-based UI
  - Accessibility features
  - Theme support
  - Small bundle (~8KB)
- **Bundle Size**: ~8KB
- **Documentation**: Added to `research.md` Section 1a

### Total Bundle Impact
- **Previous**: ~18KB (Tanstack Virtual + mobile-drag-drop polyfill)
- **Updated**: ~33KB (includes @shopify/draggable + Coloris)
- **Status**: Acceptable for feature richness

---

## 2. Priority Adjustments

### Bulk Operations - REMOVED FROM MVP
- **Original Priority**: P2 (Phase 7)
- **New Status**: Deferred to Post-MVP
- **Rationale**: 
  - Opinionated workflow encourages individual task progression
  - Aligns with ADHD-friendly, linear task management
  - Needs detailed design to fit app vision
- **Affected Requirements**: FR-043 through FR-047 marked as deferred

### Custom Fields - PROMOTED TO MVP CORE
- **Original Priority**: P3 (Phase 13)
- **New Priority**: P1 - MVP Core
- **Rationale**:
  - Essential for flexibility across user types
  - Supports wig makers, prop creators, specialists
  - Different tracking needs require custom fields
- **MVP Scope**: 5 field types (Text, Number, Currency, Dropdown, Checkbox)
- **Post-MVP**: 5 additional types (Textarea, Multi-select, Date, URL, Email)

### Focus Mode - DEFERRED POST-MVP
- **Original Priority**: P1 (Phase 6)
- **New Status**: Post-MVP (component created but disabled)
- **Rationale**: Needs redesign to align with app vision
- **Status**: Component exists but disabled in code

---

## 3. Custom Fields - Detailed MVP Scope

### MVP Custom Field Types (Phase 1 - Essential)

1. **Text** (Single-line)
   - Use cases: Material names, tool names, supplier names
   - Examples: "Worbla", "EVA Foam", "Smooth-On"

2. **Number** (Numeric with min/max)
   - Use cases: Measurements, quantities, dimensions
   - Examples: "Yardage: 3", "Hair Length: 12 inches"

3. **Currency** (Number + ISO 4217 currency code)
   - Use cases: Material costs, budget tracking
   - Examples: "Material Cost: $45.99", "Budget: €120.00"
   - Display: Locale-appropriate symbols

4. **Dropdown** (Single-select)
   - Use cases: Material types, difficulty levels
   - Examples: "Hair Type: [Synthetic, Human, Heat-Resistant]"

5. **Checkbox** (Boolean)
   - Use cases: Flags, yes/no questions
   - Examples: "Needs Safety Gear", "Requires Ventilation"

### Post-MVP Custom Field Types (Phase 2 - Advanced)

6. **Textarea** (Multi-line) - Deferred
7. **Multi-select** (Multiple selections) - Deferred
8. **Date** (Date picker) - Deferred
9. **URL** (Link input) - Deferred
10. **Email** (Email input) - Deferred

### MVP Custom Field Features

✅ **Included**:
- Create/edit/delete field definitions (team owners/admins)
- View/edit field values (all team members)
- Maximum 20 fields per team
- Required field validation
- Default values
- Display in task detail panel
- Optional display on task cards (1-2 most important)
- Basic filtering by custom field values
- Field ordering/reordering

❌ **Deferred Post-MVP**:
- Export/import field definitions
- Field templates/presets
- Advanced filtering (complex queries)
- Custom validation rules
- Field calculations/formulas
- History tracking in activity log
- Search indexing

---

## 4. Implementation Features Added

### Drag-and-Drop Enhancements
- ✅ Drag handles (`.task-drag-handle`) to prevent click conflicts
- ✅ Auto-scroll at viewport edges
- ✅ Column auto-expand on hover during drag
- ✅ Error recovery mechanism (30s timeout, restore on lost control)
- ✅ Comprehensive logging for debugging

### UI/UX Improvements
- ✅ Column collapse/expand (horizontal)
- ✅ Task/subtask counts when collapsed
- ✅ Stage color customization
- ✅ Theme color improvements throughout

---

## 5. Updated Requirements

### Drag-and-Drop (FR-023 through FR-027)
- Updated FR-023 to specify @shopify/draggable library
- Added FR-023a for drag handles
- Added FR-025a for column auto-expand
- Added FR-025b for error recovery
- Deferred FR-026 and FR-027 (timeline drag, reorder) to post-MVP

### Board View (FR-007)
- Added FR-007a: Column collapse/expand
- Added FR-007b: Stage color customization

### Custom Fields (FR-135 through FR-167)
- Promoted to P1 - MVP Core
- Split into MVP (FR-137-MVP) and Post-MVP (FR-137-POST) types
- Added MVP-specific requirements (FR-144-MVP, FR-145-MVP, FR-150-MVP)
- Deferred advanced features (FR-152 through FR-167)

### Focus Mode (FR-110, FR-111, FR-123, FR-124)
- Marked as deferred post-MVP
- Component created but disabled

### Bulk Operations (FR-043 through FR-047)
- All marked as deferred post-MVP
- Added note explaining opinionated workflow rationale

---

## 6. Files Updated

1. **specs/003-modern-task-ui/research.md**
   - Section 1: Updated drag-and-drop decision to @shopify/draggable
   - Section 1a: Added Coloris.js library selection
   - Summary: Updated bundle size calculations

2. **specs/003-modern-task-ui/spec.md**
   - Header: Added "Last Updated" date
   - Clarifications: Added Q&A for bulk actions, custom fields, libraries
   - User Story 11: Expanded with detailed MVP vs Post-MVP breakdown
   - FR-023-027: Updated drag-and-drop requirements
   - FR-007: Added column collapse and stage color requirements
   - FR-043-047: Marked bulk operations as deferred
   - FR-110-111, FR-123-124: Marked Focus Mode as deferred
   - FR-135-167: Split custom fields into MVP and Post-MVP sections

---

## 7. Next Steps

### Immediate Priorities (MVP)
1. **Complete Phase 6**: Stage-level deadlines + Gentle prompts
2. **Implement Custom Fields (MVP)**: Text, Number, Currency, Dropdown, Checkbox
3. **Standalone Tasks**: Basic standalone task support

### Post-MVP
- Bulk operations (with detailed design)
- Focus Mode redesign
- Advanced custom field types
- Timeline drag-and-drop
- Task reordering

---

## Notes

- All changes align with the app's vision: **opinionated workflow** and **ADHD-friendly features**
- Custom fields are essential for diverse user types (not just nice-to-have)
- Bulk operations intentionally deferred to maintain linear task progression
- Library decisions prioritize user experience over bundle size (within reason)







