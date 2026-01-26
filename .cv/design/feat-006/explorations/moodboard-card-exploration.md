# Moodboard Card & Node Design Exploration

**Designer Persona:** World-class UI/UX designer specializing in content-heavy applications  
**Project:** Cosplay Tracker Moodboard System  
**Challenge:** Design cards that are functional, beautiful, and content-type specific  
**Date:** 2026-01-24

---

## Design Philosophy & Constraints

### Core Principles
1. **Content-First Design** - Let the content type dictate the layout
2. **Visual Hierarchy** - Most critical info should be instantly scannable
3. **Information Density** - Show what matters, hide what doesn't
4. **Gestalt Principles** - Use proximity, similarity, continuity for organization
5. **Progressive Disclosure** - Start compact, reveal details on interaction

### Technical Constraints
- Gallery view: Grid layout, variable widths possible
- Canvas nodes: Fixed size initially, expandable
- Must work in light/dark modes
- Mobile-friendly (touch targets 48px minimum)
- Performance: hundreds of cards on screen

### Content Types to Design For

**Visual Content:**
1. Image nodes
2. Social media posts (Instagram, TikTok, YouTube)
3. Link previews (with metadata)

**Organizational:**
4. Container nodes (Character, Group, Option, Prop)
5. Moodboard links

**Data-Rich:**
6. Color palettes
7. Measurements
8. Fabric swatches
9. Budget items
10. Contacts

**Simple:**
11. Notes

---

## Design Direction 1: "Adaptive Cards"

**Concept:** Each card type has a unique aspect ratio and layout optimized for its content

### Philosophy
- **No uniform grid** - Cards flow naturally based on content
- **Masonry layout** - Pinterest-style stacking
- **High visual interest** - Every card looks distinct
- **Content takes center stage** - Minimal chrome/UI elements

### Pros
✅ Maximum content visibility  
✅ Visually striking and moderne  
✅ Efficient use of space  
✅ Each type instantly recognizable

### Cons
❌ Complex layout logic  
❌ Can feel chaotic with many items  
❌ Harder to scan systematically  
❌ Selection/focus states more complex

### Best For
- Creative, visual-first workflows
- Users who think in images/inspiration
- Smaller moodboards (< 50 items)

---

## Design Direction 2: "Unified System"

**Concept:** Consistent card shell with modular internal content areas

### Philosophy
- **Consistent outer frame** - Same shape, size, corners for all cards
- **Modular internals** - Content areas adapt by type
- **Design system thinking** - Reusable components
- **Professional, organized feel** - Like a well-designed dashboard

### Pros
✅ Easy to scan and navigate  
✅ Predictable, learnable  
✅ Simple implementation  
✅ Clean, professional aesthetic  
✅ Works at any scale

### Cons
❌ Can feel rigid/boring  
❌ Not optimized for each content type  
❌ May waste space on some cards  
❌ Less visually distinctive

### Best For
- Power users who need efficiency
- Large moodboards (100+ items)
- Team collaboration (consistency matters)
- Professional/commercial work

---

## Design Direction 3: "Hybrid Adaptive"

**Concept:** Consistent base with smart content-driven variations

### Philosophy
- **Flexible grid** - 2-3 card sizes (small, medium, large)
- **Content determines size** - Images get more space, notes stay compact
- **Smart grouping** - Similar types cluster together
- **Visual rhythm** - Balanced between order and variety

### Pros
✅ Best of both worlds  
✅ Efficient AND beautiful  
✅ Scalable to hundreds of items  
✅ Content-appropriate sizing  
✅ Maintains visual interest

### Cons
❌ More complex design system  
❌ Requires smart layout algorithm  
❌ Edge cases to handle  
❌ More testing needed

### Best For
- Most use cases (recommended)
- Mix of content types
- Growing moodboards
- Users who want both beauty and function

---

## Card Anatomy Exploration

### Universal Card Elements (All Types)
```
┌─────────────────────────────┐
│ [Type Badge]    [Actions]   │ ← Header bar (always)
├─────────────────────────────┤
│                             │
│   [Content Area]            │ ← Varies by type
│   (Type-specific layout)    │
│                             │
├─────────────────────────────┤
│ [Title]                     │ ← Footer (always)
│ [Metadata Tags]             │
└─────────────────────────────┘
```

### Variation A: Content-First (Minimal chrome)
```
┌─────────────────────────────┐
│                             │
│                             │
│   [Large Content Area]      │
│                             │
│                             │
│──┬──────────────────────┬──│
│▪ │ Title, tags          │⋮ │ ← Compact footer
└──┴──────────────────────┴──┘
```

### Variation B: Metadata-Rich (Info-dense)
```
┌─────────────────────────────┐
│ [Badge] [Tags]      [Icons] │ ← Rich met data header
├─────────────────────────────┤
│                             │
│   [Content]                 │
│                             │
├─────────────────────────────┤
│ Title                       │
│ Description preview         │
│ [Additional metadata]       │ ← Expanded footer
└─────────────────────────────┘
```

### Variation C: Balanced
```
┌─────────────────────────────┐
│ [Type Icon]          [⋮]    │ ← Minimal header
├─────────────────────────────┤
│                             │
│   [Content]                 │
│                             │
├─────────────────────────────┤
│ Title              [Badge]  │ ← Balanced footer
└─────────────────────────────┘
```

---

## Content-Specific Layout Ideas

I'll now generate visual mockups for each content type in different design directions. This will help us compare and decide.

**Mockups to Generate:**
1. Image card (3 variations)
2. Social media card (3 variations)
3. Container card (3 variations)
4. Color palette card (3 variations)
5. Measurements card (3 variations)
6. Fabric swatch card (3 variations)

Each showing:
- Direction 1: Adaptive
- Direction 2: Unified
- Direction 3: Hybrid

**Ready to generate mockups?** This will help visualize the different approaches.

Or would you prefer I first describe in more detail what each content type's card would look like in each direction before generating images?
