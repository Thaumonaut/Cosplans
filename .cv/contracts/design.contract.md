# Design Contract

> Source: Constitution Technical Standards, Component Standards
> Mapping: See `.cv/ledger/constitution-mapping.md`

## ADHD-Friendly Design (NON-NEGOTIABLE)

This is a core design philosophy, not a feature checkbox. Every design decision should consider:

| Principle | Implementation |
|-----------|----------------|
| Progressive disclosure | Simple by default, complexity reveals when needed |
| Reduce choice paralysis | "What should I do now" suggestions, smart defaults |
| Avoid blank-page syndrome | Templates, starter content, guided flows |
| Organized chaos | Moodboard "piles," spatial grouping, flexible organization |
| Celebrate wins | Task completion animations, streaks, milestones |
| Prevent overwhelm | Deadline calculators, pace suggestions, chunked tasks |
| Quick capture | Minimize friction for saving inspiration (Share Target, quick-add) |

### Questions to ask for every feature

1. Can a distracted user figure this out in 5 seconds?
2. Does this help someone finish, or just add complexity?
3. Is there a simpler default we can offer?
4. Can we celebrate progress here?

## Component Standards

### Flowbite First

Use Flowbite Svelte components as the foundation. Custom components only when Flowbite is insufficient.

### Hierarchy

1. **Flowbite Svelte** - Use directly when possible
2. **Wrapped Flowbite** - Thin wrapper adding project-specific defaults
3. **Custom Components** - Only when Flowbite cannot achieve the design

### When to Create Custom

- Flowbite doesn't have the component type
- Flowbite's API doesn't support required behavior
- Performance requirements exceed Flowbite's capabilities

## Responsive Design

Mobile-first approach. All features MUST work on mobile.

### Breakpoints

| Name | Width | Description |
|------|-------|-------------|
| Mobile | ≤768px | Touch-optimized, single column |
| Tablet | 769-1024px | Hybrid layout |
| Desktop | 1025-1920px | Full feature set |
| Large Desktop | ≥1921px | Extended workspace |

## Accessibility Requirements

- Semantic HTML throughout
- ARIA labels where needed
- Keyboard navigation for interactive elements
- Focus indicators visible
- Color contrast meets WCAG AA

## Performance Standards

- Code splitting by route
- Lazy loading for images
- Bundle size monitoring
- No blocking resources above the fold

## Naming Conventions

### Component Files

```
PascalCase.svelte           # Component files
kebab-case.svelte           # Legacy (deprecated, migrate)
```

### CSS Classes

```
Tailwind utilities          # Primary styling
.component-name             # Custom scoped styles (rare)
```

### TypeScript

```typescript
// Types/Interfaces
type ProjectStatus = 'idea' | 'planning' | 'active' | 'post-production' | 'archived';
interface Project { ... }

// Functions
function getProjectById(id: string): Promise<Project>

// Constants
const MAX_TEAM_MEMBERS = 50;
```

## Color System

Use Tailwind + Flowbite color tokens. Custom colors defined in `tailwind.config.js`.

Theme customization available via Theme Builder (localStorage only, not synced).
