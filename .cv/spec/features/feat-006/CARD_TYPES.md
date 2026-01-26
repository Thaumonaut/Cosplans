# FEAT-006: Complete Card/Node Types Reference

**Status:** Consolidated Source of Truth  
**Last Updated:** 2026-01-25  
**Purpose:** Single reference for all moodboard card/node types across all specification documents

---

## Overview

This document consolidates all card/node types from:
- `.cv/spec.md` (master product spec - defines resource categories)
- `.cv/contracts/product.contract.md` (product contract - resource management)
- `.cv/spec/features/FEAT-006.md` (original v1.0 spec)
- `.cv/spec/features/feat-006/spec.md` (enhanced spec)
- `.cv/spec/features/feat-006/capabilities/` (20 capability specs)
- `.cv/spec/features/feat-006/COMPONENTS.md` (component specs)
- `specs [deprecated]/006-brainstorming-moodboard/COUNCIL_DECISIONS.md` (design decisions)
- `supabase/migrations/20250000000003_resources_table.sql` (database schema)

---

## Node Type Categories

### 1. Grouping Nodes

| Node Type | Icon | Behavior | Description | Source |
|-----------|------|----------|-------------|--------|
| **Pile** | 📚 | Expand in-place | Single-layer grouping that expands on current canvas without navigation. Shows 2-4 preview thumbnails. Best for 2-20 items, quick comparison. | Council Decision 3 |
| **Container** | 📁 | Drill-in | Deep nesting with dedicated canvas per container. Double-click navigates to new canvas with breadcrumb path. Best for 20+ items, complex organization. | Council Decision 3, CAP-002 |
| **Stack/Group** | 📁 | Legacy term | Original spec term - now split into Pile (shallow) and Container (deep). | FEAT-006.md v1.0 |

### 2. Container Subtypes

| Container Type | Icon | Description | Source |
|----------------|------|-------------|--------|
| **Character** | 👤 | Character being cosplayed. Contains references, budget, notes for one character. | FEAT-006.md, CAP-002 |
| **Option/Variant** | 🎭 | Variant of character (e.g., Base Goku vs SSJ Goku, Archon Form). | FEAT-006.md |
| **Prop** | 🔧 | Prop with sub-items (blueprints, materials, WIP photos). | FEAT-006.md |
| **Group** | 📁 | Generic grouping container (events, phases, equipment setups). | CAP-002 |
| **Moodboard Link** | 📋 | Portal to another moodboard (cross-board navigation). | FEAT-006.md |

### 3. Reference Nodes

| Node Type | Icon | Description | Source |
|-----------|------|-------------|--------|
| **Image** | 🖼️ | Uploaded image with optional caption and tags. Preserves aspect ratio. | FEAT-006.md, Design HTML |
| **Social Media** | 📱 | Auto-detected platform (Instagram, TikTok, YouTube, Pinterest, Twitter/X). Shows platform badge and embed. | FEAT-006.md |
| **Link** | 🔗 | Generic URL with Open Graph metadata preview. | FEAT-006.md |
| **Note** | 📝 | Text note with markdown support. Yellow sticky-note style. | FEAT-006.md, Design HTML |

### 4. Social Media Platform Variants

| Platform | Detection Pattern | Display | Source |
|----------|-------------------|---------|--------|
| **Instagram Post** | `instagram.com/p/` | Square 1:1, gradient badge | Design HTML |
| **Instagram Reel** | `instagram.com/reel/` | Vertical 9:16, play badge | Design HTML |
| **TikTok** | `tiktok.com/@`, `vm.tiktok.com` | Vertical 9:16, black badge | FEAT-006.md |
| **YouTube Video** | `youtube.com/watch`, `youtu.be` | Horizontal 16:9, red play button | FEAT-006.md |
| **YouTube Short** | `youtube.com/shorts/` | Vertical 9:16, "SHORT" badge | Design HTML |
| **Pinterest** | `pinterest.com/pin/` | Image with pin badge | FEAT-006.md |
| **Twitter/X** | `twitter.com`, `x.com` | Embed with bird badge | FEAT-006.md |
| **Etsy** | `etsy.com/listing` | Product card with price | FEAT-006.md |
| **Amazon** | `amazon.com/dp/` | Product card with price | FEAT-006.md |
| **Arda Wigs** | `ardawigs.com` | Wig card with price | FEAT-006.md |

### 5. Design Nodes

| Node Type | Icon | Description | Source |
|-----------|------|-------------|--------|
| **Color Palette** | 🎨 | Color swatch collection. Horizontal strip or grid. Click to copy hex. | FEAT-006.md, Design HTML |
| **Measurements** | 📏 | Body or garment measurements with unit conversion (cm/in). | FEAT-006.md, Design HTML |
| **Sketch** | ✏️ | Annotated image with drawing tools. Has background image + annotation layer + side notes. | CAP-011, Council Decision 6 |

### 6. Material Nodes

Material nodes represent physical materials used in cosplay construction. Each material type has specialized properties relevant to that material.

| Node Type | Icon | Properties | Example Uses | Source |
|-----------|------|------------|--------------|--------|
| **Fabric** | 🧵 | Width, stretch %, weight (gsm), fiber content, price/yard | Spandex, cotton, satin, organza | FEAT-006.md, DB schema |
| **Foam/EVA** | 🧱 | Thickness (mm), density, shore hardness, price/sheet | EVA foam, craft foam, L200, plastazote | Master spec |
| **Thermoplastic** | 🔥 | Activation temp, thickness, reusability | Worbla, Wonderflex, Thibra, Fosshape | Master spec |
| **Resin** | 🧪 | Cure time, mix ratio, shore hardness, UV stable | Epoxy, polyurethane, UV resin | Master spec |
| **Metal** | ⚙️ | Gauge, alloy, finish | Aluminum, brass, steel wire, chainmail rings | Master spec |
| **Wood** | 🪵 | Type, thickness, weight | Basswood, MDF, plywood, dowels | Master spec |
| **Leather** | 🐄 | Weight (oz), type, finish | Veg-tan, chrome-tan, faux leather, vinyl | Master spec |
| **3D Print Filament** | 🖨️ | Material type, diameter, print temp, properties | PLA, PETG, TPU, ABS | Master spec |

### 7. Resource Nodes

The master product spec (`.cv/spec.md`) defines a **resources** system for tracking materials, props, and equipment. These are team-scoped and stored in the `resources` table with category metadata.

#### Resource Categories (from `resources` table)

| Category | Icon | Description | Source |
|----------|------|-------------|--------|
| **Prop** | 🔧 | Physical props (weapons, accessories, items). | Master spec, DB schema |
| **Fabric** | 🧵 | Fabric with properties. | Master spec, DB schema |
| **Wig** | 💇 | Wigs with styling info. | Master spec, DB schema |
| **Pattern** | 📐 | Sewing patterns and templates. | Master spec, DB schema |
| **Costume-Piece** | 👗 | Individual costume components. | Master spec, DB schema |
| **Accessory** | 💍 | Accessories (jewelry, belts, etc.). | Master spec, DB schema |
| **Material** | 🧱 | Generic materials (foam, thermoplastics, resin, etc.). | Master spec, DB schema |

#### Hardware (construction supplies)

| Hardware Type | Icon | Description | Examples | Source |
|---------------|------|-------------|----------|--------|
| **Magnets** | 🧲 | Magnetic closures and fasteners. | Neodymium magnets, magnetic snaps | Design HTML |
| **Fasteners** | 🔘 | Buttons, snaps, hooks, closures. | Snap buttons, hook & eye, buckles | Design HTML |
| **Structural** | 📏 | Structural support materials. | Steel boning, plastic boning, interfacing | Design HTML |
| **Zippers** | 🤐 | Zippers and zipper hardware. | Invisible zippers, separating zippers | Design HTML |

#### Tools (crafting tools)

| Tool Type | Icon | Description | Examples | Source |
|-----------|------|-------------|----------|--------|
| **Heat Tools** | 🔥 | Heat-based shaping tools. | Heat gun, heat press, soldering iron | Design HTML |
| **Cutting Tools** | ✂️ | Cutting and trimming tools. | Rotary cutter, Dremel, craft knife | Design HTML |
| **Sewing Tools** | 🧵 | Sewing machines and accessories. | Sewing machine, serger, bias tape maker | Design HTML |
| **Finishing Tools** | 🖌️ | Painting and finishing tools. | Airbrush, spray booth, sanding tools | Design HTML |

#### Equipment (photography gear)

| Equipment Type | Icon | Description | Examples | Target User | Source |
|----------------|------|-------------|----------|-------------|--------|
| **Cameras** | 📷 | Camera bodies and video equipment. | Sony A7IV, Canon R5, GoPro | Photographers | Product contract |
| **Lenses** | 🔭 | Camera lenses. | 85mm portrait, 24-70mm zoom, macro | Photographers | Product contract |
| **Lighting** | 💡 | Continuous and flash lighting. | Godox lights, softboxes, reflectors | Photographers | Product contract |
| **Audio** | 🎤 | Audio recording equipment. | Lav mics, shotgun mics, recorders | Content creators | Product contract |

#### Moodboard Node Representations

When resources appear on moodboards, they use these node types:

| Node Type | Icon | Description | Source |
|-----------|------|-------------|--------|
| **Material Card** | 🧱 | Material with type-specific properties, image, supplier link. Adapts display based on material type. | Updated |
| **Hardware Card** | 🧲 | Hardware/fastener with specs, quantity, price. | Design HTML |
| **Tool Card** | 🔧 | Tool with owned/need status, notes on usage. | Design HTML |
| **Equipment Card** | 📷 | Photography equipment with owned/need status. | Design HTML |
| **Resource Reference** | 📦 | Link to a resource in the team's resource library. Shows resource card inline. | Design HTML |

### 8. Planning Nodes

| Node Type | Icon | Description | Source |
|-----------|------|-------------|--------|
| **Event** | 📅 | Calendar event with date/time/location. Syncs with Google/Apple/Outlook. Shows countdown. | CAP-007, Council Decision 4 |
| **Contact** | 👤 | Person or business (cosplayer, photographer, vendor, commissioner). Has profile photo, social links, contact methods. | CAP-008, Council Decision 4 |
| **Checklist** | ☑️ | Task list with checkable items, progress bar, nested items, attachments. | CAP-009, Council Decision 4 |
| **Budget Item** | 💰 | Individual cost with status (planned/purchased), supplier link, price. | FEAT-006.md |
| **Budget Summary** | 💼 | Aggregated budget with expenses/income breakdown, progress bar. | Design HTML |

### 9. Comparison & Progress Nodes

| Node Type | Icon | Description | Source |
|-----------|------|-------------|--------|
| **Compare** | ⚖️ | Side-by-side comparison of 2-4 nodes. Modes: side-by-side, slider, overlay. | CAP-012, Council Decision 6 |
| **Ghost** | 👻 | Virtual clone appearing in containers when edges connect. 40% opacity, read-only, synced with real node. | CAP-003, Council Decision 5 |

### 10. Special Nodes

| Node Type | Icon | Description | Source |
|-----------|------|-------------|--------|
| **Template** | 📋 | Reusable structure (checklist template, container template). Stored in `node_templates` table. | CAP-014, Council Decision 5 |

---

## Version Roadmap

### v1.0 - Core (14 types from original spec)

**Containers (5):**
- Group/Stack → Now split into Pile + Container
- Character
- Option/Variant
- Prop
- Moodboard Link

**References (4):**
- Image
- Social Media (multi-platform)
- Link
- Note

**Design (2):**
- Color Palette
- Measurements

**Materials (1):**
- Material Card (fabric, foam/EVA, thermoplastic, resin, metal, wood, leather, 3D filament)

**People & Money (2):**
- Contact
- Budget Item

### v1.5 - Enhanced Planning (from Council Decisions)

**New Node Types:**
- Pile (explicit separate from Container)
- Event (with calendar sync)
- Checklist (with nested items)
- Sketch (with annotation tools)
- Compare (multi-mode comparison)
- Ghost (computed from edges)

**Enhanced Nodes:**
- Contact (expanded with social links, profile)
- Budget Item (with supplier connections)

### v2.0+ - Advanced Features

**Future Nodes (Out of Scope):**
- Shot List (specialized checklist for photographers)
- Location/Map (with map embed)
- Video (uploaded video, not social media embed)
- Pattern (sewing pattern reference)
- Outfit (complete outfit grouping)
- Purchase (transaction record)
- Vendor (business entity)
- Material (generic material beyond fabric)

**Auto Cards (Require Edges):**
- Auto Budget (computed from children)
- Auto Palette (extracted from images)
- Auto Materials (aggregated list)
- Auto Comparison (diff between linked nodes)

---

## Data Model Reference

### Node Types Enum

```typescript
type NodeType = 
  // Grouping
  | 'pile'
  | 'container'
  
  // References
  | 'image'
  | 'social_media'
  | 'link'
  | 'note'
  
  // Design
  | 'color_palette'
  | 'measurements'
  | 'sketch'
  
  // Materials
  | 'material'
  
  // Planning
  | 'event'
  | 'contact'
  | 'checklist'
  | 'budget_item'
  
  // Comparison
  | 'compare';

// Ghost nodes are computed, not stored
```

### Material Types Enum

```typescript
type MaterialType = 
  | 'fabric'           // Textiles (spandex, cotton, satin)
  | 'foam'             // EVA, craft foam, L200, plastazote
  | 'thermoplastic'    // Worbla, Wonderflex, Thibra, Fosshape
  | 'resin'            // Epoxy, polyurethane, UV resin
  | 'metal'            // Aluminum, brass, steel, wire
  | 'wood'             // Basswood, MDF, plywood, dowels
  | 'leather'          // Veg-tan, chrome-tan, faux leather, vinyl
  | 'filament'         // 3D print: PLA, PETG, TPU, ABS
  | 'other';           // Catch-all for unlisted materials
```

### Container Types Enum

```typescript
type ContainerType = 
  | 'character'
  | 'option'      // variant
  | 'prop'
  | 'group'
  | 'moodboard_link';
```

### Social Media Platform Enum

```typescript
type SocialPlatform = 
  | 'instagram'
  | 'instagram_reel'
  | 'tiktok'
  | 'youtube'
  | 'youtube_short'
  | 'pinterest'
  | 'twitter'
  | 'etsy'
  | 'amazon'
  | 'arda_wigs'
  | 'generic';
```

---

## Visual Distinctions

### Pile vs Container

| Aspect | Pile | Container |
|--------|------|-----------|
| **Border** | Dashed blue | Solid colored (by type) |
| **Interaction** | Click to expand in-place | Double-click to drill in |
| **Navigation** | Stays on canvas | New canvas with breadcrumb |
| **Button** | "Expand ▼" / "Collapse ▲" | "Open →" |
| **Best for** | 2-20 items, quick comparison | 20+ items, deep organization |

### Container Type Colors

| Type | Border Color | Icon |
|------|--------------|------|
| Character | Purple | 👤 |
| Option/Variant | Teal | 🎭 |
| Prop | Orange | 🔧 |
| Group | Blue | 📁 |
| Moodboard Link | Pink | 📋 |

### Ghost Node Styling

- Opacity: 40%
- Border: Dashed
- Badge: 👻 icon in corner
- Tooltip: "Linked from [source location]"
- Grayscale or desaturated color

---

## Related Documents

- **Original Spec:** `.cv/spec/features/FEAT-006.md`
- **Enhanced Spec:** `.cv/spec/features/feat-006/spec.md`
- **Capabilities:** `.cv/spec/features/feat-006/capabilities/`
- **Components:** `.cv/spec/features/feat-006/COMPONENTS.md`
- **Design HTML:** `.cv/design/card-system-v2.html`
- **Council Decisions:** `specs [deprecated]/006-brainstorming-moodboard/COUNCIL_DECISIONS.md`

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-25 | Initial consolidation from all sources | Assistant |
