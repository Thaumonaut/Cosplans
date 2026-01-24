# FEAT-006 Versioning & Timeline Roadmap

**Feature**: Moodboard Organization & Container Detail Display Patterns  
**Feature ID**: FEAT-006  
**Created**: 2026-01-23  
**Updated**: 2026-01-23

## Alignment with Product Roadmap

This feature implements the enhanced moodboard/canvas functionality referenced in the main product spec (`.cv/spec.md`). The capabilities are distributed across v1.0 through v1.5, with polish deferred to v2.0.

### Product Roadmap Context

- **v1.0 — Planning & Ideation**: Basic canvas (drag, zoom, pan), containers, no connections
- **v1.5 — Quality of Life**: Full canvas with connections, piles, minimap, templates
- **v2.0 — Social Media Tools**: Enhanced table view, timeline view
- **Future versions**: Graph view (v3.0+)

## Aggressive Timeline Strategy

### Key Assumptions

1. **AI-Assisted Development**: Using Claude Code/Cursor for rapid implementation
2. **Target**: 1-2 months for all features (v1.0 through v1.5 scope)
3. **Current State**: Alpha - features can ship incrementally
4. **Release Strategy**: 1.1, 1.2, 1.3, 1.4, 1.5 micro-releases leading to v2.0 major

### Implementation Approach

- **Week 1-2**: v1.0 + v1.1 foundations
- **Week 3-4**: v1.2 + v1.3 node types
- **Week 5-6**: v1.4 power user features
- **Week 7-8**: v1.5 polish and v2.0 prep (if 2-month timeline)

---

## Version 1.0 - Foundation (Week 1)

**Ships**: Basic canvas with containers  
**Aligns with**: Product spec v1.0 (basic canvas, containers)

### Capabilities

| Capability | Priority | Checkpoint | Why v1.0 |
|------------|----------|------------|----------|
| CAP-002: Container Nodes | Critical | CP-001 | Core feature - drill-in containers |
| CAP-004: Inspector Panel | High | CP-001 | Solves detail display problem |

### Scope Notes

- **Container types**: Character, Prop, Group (from product spec)
- **Inspector panel**: Shows container details without losing context
- **Breadcrumb navigation**: Home > Container > nested structure
- **Mobile**: Progressive disclosure (collapsible context bar)
- **No piles yet**: Deferred to v1.5 per product spec

### Success Criteria

✓ Users can create and drill into containers  
✓ Inspector shows container details at any depth  
✓ Breadcrumb navigation works on mobile  
✓ Touch targets meet 48px requirement

---

## Version 1.1 - Ghost Nodes (Week 1-2)

**Ships**: Cross-container visibility  
**Aligns with**: Council Decision 3 (ghost nodes for context)

### Capabilities

| Capability | Priority | Checkpoint | Why v1.1 |
|------------|----------|------------|----------|
| CAP-003: Ghost Nodes | High | CP-002 | Core feature - solves context loss |

### Scope Notes

- Ghost nodes show edge-linked external nodes at 40% opacity
- Computed client-side (not stored in DB)
- Click ghost → navigate to source
- Foundation for v1.5 connections

### Success Criteria

✓ Ghost nodes appear when inside containers  
✓ "Go to source" navigates correctly  
✓ Performance: <100ms computation for 50-node container

---

## Version 1.2 - Planning Nodes (Week 2-3)

**Ships**: Event, Contact, Checklist node types  
**Aligns with**: Product spec v1.0 (contacts, events mentioned)

### Capabilities

| Capability | Priority | Checkpoint | Why v1.2 |
|------------|----------|------------|----------|
| CAP-007: Event Nodes | Medium | CP-003 | High user demand |
| CAP-008: Contact Nodes | Medium | CP-003 | Common workflow |
| CAP-009: Checklist Nodes | Medium | CP-003 | Task management |

### Scope Notes

- **Events**: Calendar sync (Google, Apple, Outlook)
- **Contacts**: Global contact database, reusable across moodboards
- **Checklists**: Task lists with progress tracking
- Integrates with existing content types in product spec

### Success Criteria

✓ Event nodes sync with calendar  
✓ Contact nodes reusable across projects  
✓ Checklist progress tracking works  
✓ All three node types render in canvas/gallery/list views

---

## Version 1.3 - Visual Tools (Week 3-4)

**Ships**: Comparison and annotation features  
**Aligns with**: Research & comparison features in product spec

### Capabilities

| Capability | Priority | Checkpoint | Why v1.3 |
|------------|----------|------------|----------|
| CAP-011: Sketch Tool | Medium | CP-004 | Prop makers use case |
| CAP-012: Compare Nodes | Medium | CP-004 | "Multiple options" feature |

### Scope Notes

- **Sketch Tool**: Import image, annotate with drawings/notes/measurements
- **Compare Nodes**: Side-by-side, overlay, slider modes
- Supports "options per idea for comparison" from product spec

### Success Criteria

✓ Users can annotate reference images  
✓ Compare nodes show 2-4 items side-by-side  
✓ Export comparison as PNG

---

## Version 1.4 - Power User Features (Week 4-5)

**Ships**: Batch operations and data portability  
**Aligns with**: Product spec data export features

### Capabilities

| Capability | Priority | Checkpoint | Why v1.4 |
|------------|----------|------------|----------|
| CAP-013: Batch Operations | Medium | CP-005 | Large moodboard efficiency |
| CAP-016: CSV Import | Low | CP-006 | Bulk data import |
| CAP-017: CSV Export | Low | CP-006 | Data export requirement |
| CAP-018: Enhanced List View | Medium | CP-006 | v1.0 has basic list, this enhances |

### Scope Notes

- **Batch ops**: Multi-select, bulk delete/tag/move
- **CSV**: Import vendor lists, export for spreadsheets
- **Enhanced List**: Sortable, filterable table (product spec mentions v2.0 enhanced table, ship early)
- Supports "data export" cross-cutting concern

### Success Criteria

✓ Marquee selection works  
✓ Bulk actions complete in <500ms (20 nodes)  
✓ CSV import/export handles 100+ rows  
✓ List view sortable and filterable

---

## Version 1.5 - Canvas Polish (Week 5-6)

**Ships**: Full canvas with connections, piles  
**Aligns with**: Product spec v1.5 (full canvas, connections, piles, minimap)

### Capabilities

| Capability | Priority | Checkpoint | Why v1.5 |
|------------|----------|------------|----------|
| CAP-001: Pile Nodes | Critical | CP-001 | Explicitly v1.5 in product spec |
| CAP-006: Pile-to-Container | Medium | CP-001 | Natural workflow |
| CAP-010: Sequential Edges | Medium | CP-004 | "Connections" in product spec |
| CAP-014: Node Templates | Low | CP-005 | Templates library (v1.5 feature) |
| CAP-015: Ghost Filtering | Low | CP-005 | Large moodboard usability |
| CAP-005: Container Peek | Medium | CP-007 | QoL enhancement |

### Scope Notes

- **Piles**: Single-layer grouping, in-place expansion
- **Sequential edges**: Timeline view for project planning
- **Templates**: Reusable node structures (aligns with v1.5 templates library)
- **Filtering**: Ghost non-matching nodes (60% opacity)
- **Container peek**: Quick preview without drill-in

### Success Criteria

✓ Piles expand/collapse smoothly  
✓ Sequential edges create timelines  
✓ Template library functional  
✓ Filter renders ghosts correctly  
✓ Peek opens in <300ms

---

## Version 2.0 - Polish & Accessibility (Week 7-8 or later)

**Ships**: Unified architecture and accessibility  
**Aligns with**: Product spec v2.0+ (enhanced views, accessibility ongoing)

### Capabilities

| Capability | Priority | Checkpoint | Why v2.0 |
|------------|----------|------------|----------|
| CAP-019: Unified Card | High | CP-007 | Major refactor after stabilization |
| CAP-020: Accessibility | High | CP-008 | WCAG 2.1 AA compliance |

### Scope Notes

- **Unified Card**: Single component for all node types (DRY, consistency)
- **Accessibility**: Full WCAG 2.1 AA compliance, screen reader testing
- Major version bump appropriate for architectural changes

### Success Criteria

✓ All nodes render via unified card  
✓ WCAG 2.1 Level AA compliance verified  
✓ Screen reader tested (NVDA, JAWS, VoiceOver)  
✓ 40% code reduction through unification

---

## Aggressive Timeline (AI-Assisted)

### 1-Month Option (Aggressive)

| Week | Version | Capabilities | Focus |
|------|---------|--------------|-------|
| 1 | v1.0 + v1.1 | 2 + 1 = 3 caps | Foundation + Ghost Nodes |
| 2 | v1.2 | 3 caps | Event/Contact/Checklist |
| 3 | v1.3 | 2 caps | Sketch + Compare |
| 4 | v1.4 + v1.5 | 4 + 6 = 10 caps | Batch ops + Canvas polish |

**Total**: 18 capabilities in 4 weeks  
**v2.0**: Deferred to separate sprint (2-3 weeks later)

### 2-Month Option (Recommended)

| Week | Version | Capabilities | Focus |
|------|---------|--------------|-------|
| 1-2 | v1.0 + v1.1 | 3 caps | Foundation + Ghost Nodes + testing |
| 3 | v1.2 | 3 caps | Event/Contact/Checklist |
| 4 | v1.3 | 2 caps | Sketch + Compare |
| 5 | v1.4 | 4 caps | Batch ops + data portability |
| 6 | v1.5 | 6 caps | Canvas polish (piles, connections, templates) |
| 7-8 | v2.0 | 2 caps | Unified card + Accessibility |

**Total**: All 20 capabilities in 8 weeks

---

## AI-Assisted Development Strategy

### Leverage AI For

1. **Component Scaffolding**: Generate base components from specs
2. **Test Generation**: Create unit/integration tests from requirements
3. **Type Definitions**: Generate TypeScript types from data models
4. **Boilerplate Reduction**: CRUD operations, API endpoints, DB queries
5. **Documentation**: Generate JSDoc comments, README updates
6. **Refactoring**: DRY improvements, pattern consistency

### Human Focus Areas

1. **Architecture decisions**: Component structure, state management
2. **UX polish**: Animations, transitions, micro-interactions
3. **Integration**: Connect components, resolve edge cases
4. **Testing**: E2E scenarios, user acceptance testing
5. **Performance**: Optimization, profiling, bottleneck resolution

### Risk Management

**Risks with aggressive timeline:**
- Technical debt accumulation
- Inadequate testing
- Feature creep
- Burnout

**Mitigations:**
- Strict scope control (defer enhancements to next version)
- Automated testing (unit, integration, E2E)
- Daily progress reviews
- Clear "done" criteria per capability

---

## Recommendation

**Ship incrementally: v1.0 → v1.1 → v1.2 → v1.3 → v1.4 → v1.5 → v2.0**

### Rationale

1. **User feedback loops**: Ship early, iterate based on usage
2. **Risk distribution**: Small releases reduce integration risk
3. **Momentum**: Visible progress motivates continued development
4. **Alpha flexibility**: Users expect rapid iteration in alpha
5. **AI-assisted velocity**: Can ship micro-releases quickly

### Timeline Confidence

- **1 month (aggressive)**: 75% confidence (requires focused sprint, no blockers)
- **2 months (recommended)**: 95% confidence (buffer for testing, polish, unforeseen issues)

---

## Next Steps

1. ✅ **Versioning defined** (this document)
2. **Create component specifications** for v1.0 components (priority)
3. **Create tasks.md** for v1.0 implementation
4. **Begin implementation** with CAP-002 (Containers) and CAP-004 (Inspector)

---

## Questions Resolved

✓ **Version strategy**: Incremental micro-releases (1.0 → 1.5)  
✓ **Timeline**: 1-2 months with AI assistance  
✓ **Alignment**: Matches product spec roadmap  
✓ **v2.0 scope**: Polish and accessibility (major bump)

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-23 | 1.0 | Initial versioning strategy | Assistant |
| 2026-01-23 | 2.0 | Aligned with product roadmap, aggressive timeline | Assistant |

