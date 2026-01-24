# Design Tokens

CSS variables and design system tokens.

---

## Colors

Defined in `tailwind.config.js` via Flowbite preset.

### Primary Palette

```css
--color-primary-50 through --color-primary-900
```

### Semantic Colors

| Token | Usage |
|-------|-------|
| `primary` | Actions, links, active states |
| `gray` | Text, backgrounds, borders |
| `red` | Errors, destructive actions |
| `green` | Success, completed states |
| `yellow` | Warnings, pending states |
| `blue` | Info, links |

### Project Status Colors

| Status | Color | Class |
|--------|-------|-------|
| Idea | Gray | `text-gray-500` |
| Planning | Blue | `text-blue-500` |
| In Progress | Yellow | `text-yellow-500` |
| Post-Production | Purple | `text-purple-500` |
| Archived | Gray | `text-gray-400` |

### Priority Colors

| Priority | Color | Class |
|----------|-------|-------|
| Low | Gray | `bg-gray-100` |
| Medium | Yellow | `bg-yellow-100` |
| High | Red | `bg-red-100` |

---

## Typography

### Font Stack

```css
font-family: Inter, system-ui, sans-serif;
```

### Scale

| Name | Size | Usage |
|------|------|-------|
| `text-xs` | 12px | Labels, badges |
| `text-sm` | 14px | Body small, captions |
| `text-base` | 16px | Body default |
| `text-lg` | 18px | Body large |
| `text-xl` | 20px | Headings |
| `text-2xl` | 24px | Page titles |
| `text-3xl` | 30px | Hero text |

---

## Spacing

Using Tailwind default scale (4px base).

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps |
| `space-2` | 8px | Small gaps |
| `space-3` | 12px | Medium gaps |
| `space-4` | 16px | Standard gaps |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Large sections |

---

## Breakpoints

| Name | Min Width | Description |
|------|-----------|-------------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## Shadows

Flowbite defaults:

```css
shadow-sm   /* Subtle */
shadow      /* Default */
shadow-md   /* Cards */
shadow-lg   /* Dropdowns, modals */
shadow-xl   /* Elevated panels */
```

---

## Z-Index Scale

| Layer | Value | Usage |
|-------|-------|-------|
| Base | 0 | Default content |
| Dropdown | 10 | Dropdowns, tooltips |
| Sticky | 20 | Sticky headers |
| Modal Backdrop | 40 | Modal overlays |
| Modal | 50 | Modal content |
| Toast | 60 | Notifications |

---

## Theme Customization

Users can customize themes via Theme Builder (`/settings/theme`).

- Stored in `localStorage` only (not synced)
- Export/import as JSON
- Undo/redo support (50 history limit)
