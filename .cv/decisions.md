# Decision Ledger

Log of architectural and product decisions with rationale.

---

## 2026-01-20: CodeVision Initialization

**Decision**: Initialize `.cv/` alongside existing `.specify/` system for parallel testing.

**Context**: CodeVision is in early access. We want to evaluate it without disrupting the working speckit workflow.

**Rationale**: 
- Low risk - can remove `.cv/` if CodeVision doesn't work out
- Provides comparison data between the two systems
- Constitution content migrated to contracts for easier management

**Outcome**: TBD

---

## 2026-01-20: Product Specification Approved

**Decision**: Approve the complete product specification (v0.1.0) covering vision through v5.5.

**Context**: Scaffold meeting produced comprehensive draft spec. Expert council (6 experts) reviewed and refined. User performed final sanity check.

**Key Decisions Captured**:
- Core differentiator: Start at ideation, not project creation
- ADHD-friendly design as core principle (not feature checkbox)
- AI philosophy: Assistive YES, creative NO
- Mobile strategy: PWA (Android) + Capacitor (iOS) for v1.0, Flutter for v3.0+
- Dual subscription model: Personal tiers + Team tiers separate
- Founder program: 12-month grace period with Enthusiast + Team+ features free
- v1.0 scope: Simple canvas only (no connections), full canvas in v1.5
- Real-time collaboration deferred to v3.0
- TDD required for all features
- Stripe Connect for payments
- Asia expansion before EU

**Rationale**: Comprehensive vision document needed to guide development. Expert review ensured feasibility and identified gaps. User approval confirms alignment with product goals.

**Outcome**: Draft promoted to official `.cv/spec.md`. Ready for implementation planning.

---

## 2026-01-22: Add Canvas Context Menu (FEAT-006)

**Decision**: Add right-click context menu to canvas for quick node creation.

**Context**: User feedback — "we will need a custom right click menu for the canvas to make interactions like adding or editing easier"

**Options Considered**:
1. Toolbar-only approach - Rejected, requires too many clicks for frequent action
2. Floating action button - Conflicts with mobile touch pan gesture
3. Context menu (chosen) - Standard UX pattern for canvas editors

**Rationale**:
- Standard UX for canvas editors (Figma, Miro, etc.)
- Faster workflow than clicking toolbar "Add" button
- Preserves cursor position for node placement
- Mobile long-press provides same affordance on touch devices

**Changes**:
- Added T-008.5 to FEAT-006 tasks
- Updated CAP-03 in FEAT-006 spec with interaction pattern
- Updated design doc with context menu wireframes

**Impact**:
- Scope: +1 task (S-sized)
- Timeline: No delay, fits within CP-02
- Contracts: None (interaction pattern only)

**Outcome**: TBD after implementation

---

## 2026-01-22: Unify Moodboard Gallery and Reference Card Design

**Decision**: Adopt ReferenceCard design pattern for moodboard gallery view, creating a unified modern card design across all contexts.

**Context**: User feedback after implementing canvas drag/position features — "i want to now focus on the design of the nodes and cards in the gallery view. the gallery view should be like the current reference tab view on the idea page where you can see the notes and embedded content. we should create a unified design that is modern and functional"

**Current State**:
- Moodboard gallery uses minimal `NodeCard` component (basic title, type label)
- Reference tab uses rich `ReferenceCard` component with:
  - Embedded social media content (Instagram, TikTok, YouTube)
  - Platform badges with colors
  - Thumbnail images with lightbox
  - Notes and captions inline
  - Modern hover states and shadows

**Options Considered**:
1. Keep separate card designs - Rejected, creates inconsistent UX
2. Create third "unified" component - Rejected, adds complexity
3. Adopt ReferenceCard pattern for all gallery views (chosen) - Consistent, modern, proven

**Rationale**:
- **Visual consistency**: Users expect same rich display in all moodboard contexts
- **Feature parity**: Gallery view should show embedded content like reference tab does
- **Modern UX**: ReferenceCard design is more polished and information-dense
- **Code consolidation**: Single card component easier to maintain than two
- **User expectation**: Reference tab demonstrates what gallery view should be

**Changes to Spec**:
```markdown
**Moodboards & Ideation**
- View modes:
  - **Gallery**: Grid of rich media cards with embedded content
    - Social media embeds (Instagram, TikTok, YouTube) displayed inline
    - Platform badges with color coding
    - Image thumbnails with lightbox on click
    - Notes and captions shown below media
    - Unified card design across all contexts (ideas, projects, standalone moodboards)
  - **List**: Compact table view with sortable columns
  - **Canvas**: Infinite drag-and-drop workspace (drag, position, zoom/pan — no connections yet)
```

**Impact**:
- Scope: Moderate component refactor
  - Replace `NodeCard` with unified card component based on `ReferenceCard`
  - Update gallery view layout for better media display
  - Ensure mobile responsive grid
- Timeline: Fits within FEAT-006 scope (moodboard feature)
- Contracts: May need moodboard card component contract if formalized
- Dependencies: None - self-contained UI change

**Implementation Notes**:
- Reuse `ReferenceCard` logic for embed detection and rendering
- Maintain platform icon/color mapping
- Keep lightbox functionality for images
- Preserve container node special rendering (drill-in affordance)
- Test with various content types (images, videos, notes, links)

**Outcome**: TBD after implementation

---

## Template for New Decisions

```markdown
## YYYY-MM-DD: Decision Title

**Decision**: What was decided

**Context**: Why this decision was needed

**Options Considered**:
1. Option A - pros/cons
2. Option B - pros/cons

**Rationale**: Why this option was chosen

**Outcome**: Results after implementation (filled in later)
```
