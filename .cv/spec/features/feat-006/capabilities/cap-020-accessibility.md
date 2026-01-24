# CAP-020: Accessibility Strategy

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** High  
**Checkpoint:** CP-008 (Accessibility Compliance)

## Intent

Ensure moodboard features achieve WCAG 2.1 Level AA compliance through alternative views (List/Gallery) and assistive technology support, acknowledging canvas limitations while providing equivalent non-visual experiences.

## Functional Requirements

1. **View Accessibility Levels**
   - **Canvas View**: Limited accessibility (primarily visual, Level A at best)
   - **Gallery View**: Good accessibility (keyboard nav, screen reader support, Level AA)
   - **List View**: Excellent accessibility (fully keyboard navigable, screen reader optimized, Level AA)
   - Honest disclosure: Canvas accessibility notice "For better accessibility, use List or Gallery view"

2. **Keyboard Navigation**
   - All views: Full keyboard navigation (no mouse required)
   - Tab order: Logical, follows visual layout
   - Shortcuts: Documented, discoverable (? key shows help)
   - Focus indicators: Visible, high contrast (3:1 ratio minimum)
   - Focus trap: Modals/dialogs trap focus while open

3. **Screen Reader Support**
   - Semantic HTML: Proper heading hierarchy, landmarks, roles
   - ARIA labels: Descriptive labels for interactive elements
   - Live regions: Announce dynamic updates (toast notifications, filter results)
   - Status messages: Non-interruptive announcements (e.g., "5 nodes selected")
   - Image alternatives: Alt text for all meaningful images

4. **Visual Accessibility**
   - Color contrast: 4.5:1 for text, 3:1 for UI components (WCAG AA)
   - Color independence: Don't rely on color alone (use icons/text)
   - Focus indicators: Visible in all themes (high contrast mode)
   - Text sizing: Support browser zoom up to 200%
   - Motion: Respect `prefers-reduced-motion` (disable animations)

5. **Assistive Technology Testing**
   - Screen readers: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS), TalkBack (Android)
   - Keyboard only: Test all workflows without mouse
   - Voice control: Dragon NaturallySpeaking, Voice Control (macOS)
   - Magnification: ZoomText, macOS Zoom

6. **Accessibility Features**
   - Skip links: "Skip to main content", "Skip to navigation"
   - Landmark regions: `<header>`, `<nav>`, `<main>`, `<footer>`
   - Headings: Hierarchical (h1 → h2 → h3, no skips)
   - Lists: Proper `<ul>`/`<ol>` for list-like content
   - Tables: Proper `<table>` with `<th>` headers (List view)
   - Forms: Labels associated with inputs, error messages linked

## Data Model

### Accessibility State
```typescript
interface AccessibilityPreferences {
  preferredView: 'canvas' | 'gallery' | 'list'; // Default view for new users
  reduceMotion: boolean; // From prefers-reduced-motion
  highContrast: boolean; // From prefers-contrast
  keyboardOnly: boolean; // User preference
  screenReaderMode: boolean; // Auto-detected or user-set
}

interface A11yMetadata {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
}
```

## UI/UX Requirements

1. **Accessibility Notice (Canvas View)**
   - Banner: "Canvas view has limited accessibility. For better experience, use [List View] or [Gallery View]"
   - Dismissible: User can close (don't show again)
   - Links: Direct to List/Gallery view

2. **Keyboard Shortcuts**
   - Global: `?` (Help), `Ctrl+F` (Search), `Esc` (Close/Cancel), `Ctrl+Z` (Undo)
   - Navigation: `Tab` (Next), `Shift+Tab` (Previous), `Arrow Keys` (Move focus)
   - Views: `Ctrl+1` (Canvas), `Ctrl+2` (Gallery), `Ctrl+3` (List)
   - Selection: `Space` (Select), `Ctrl+A` (Select All), `Shift+Click` (Range select)
   - Actions: `Enter` (Open/Edit), `Delete` (Delete), `Ctrl+C/V` (Copy/Paste)
   - Help overlay: Shows all shortcuts (press `?`)

3. **Focus Management**
   - Visible focus ring: 2px solid, high contrast color
   - Focus within: Dialogs, menus, dropdowns trap focus
   - Focus return: After closing dialog, focus returns to trigger element
   - Skip links: First focusable element (hidden until focused)

4. **Screen Reader Announcements**
   - Page load: "Moodboard loaded with X nodes"
   - Filter applied: "Showing 12 of 45 nodes"
   - Node selected: "Node 'Character Sheet' selected"
   - Action completed: "Node deleted"
   - Error: "Error: Could not save changes"

5. **Alternative Text**
   - Node thumbnails: Alt text = node name + type (e.g., "Character Sheet - Container")
   - Icons: ARIA labels (e.g., "Edit", "Delete", "More actions")
   - Decorative images: `alt=""` (announced as decorative)

6. **High Contrast Mode**
   - Detect: `@media (prefers-contrast: high)`
   - Adjustments: Increase border widths, use solid colors, remove subtle shadows
   - Test: Windows High Contrast Mode, macOS Increase Contrast

## Components

### Reuse from Registry
- All components must follow accessibility guidelines
- Review existing components for ARIA compliance

### New Components Required
- `AccessibilityNotice.svelte` - Canvas accessibility notice
- `KeyboardShortcutsHelp.svelte` - Shortcuts overlay
- `SkipLinks.svelte` - Skip navigation links

## Edge Cases

1. **Canvas-Only Features**: Some features (drag-drop layout) inherently visual - provide alternative via List/Gallery
2. **Complex Interactions**: Multi-step workflows have keyboard equivalents
3. **Real-Time Updates**: Screen reader announcements don't overwhelm (rate-limit to 1 per 3 seconds)
4. **Third-Party Components**: Ensure all imported components (e.g., xyflow) are accessible
5. **Dynamic Content**: ARIA live regions announce changes (politeness level: assertive vs polite)

## Performance Considerations

- Screen reader mode: Disable animations, simplify rendering
- Keyboard nav: Debounce rapid key presses (avoid performance degradation)
- Focus management: Efficient focus trap (avoid layout thrashing)

## Testing Strategy

**Manual Testing:**
- Keyboard only: Complete all workflows without mouse
- Screen reader: Test with NVDA, JAWS, VoiceOver
- High contrast: Enable Windows High Contrast, verify visibility
- Zoom: Test at 200% zoom, ensure layout doesn't break
- Reduced motion: Enable, ensure animations respect preference

**Automated Testing:**
- Axe DevTools: Run on every page/view (catch common issues)
- Pa11y CI: Automated accessibility testing in CI/CD
- Lighthouse: Accessibility score > 90
- ESLint plugin: jsx-a11y rules enforced

**User Testing:**
- Recruit users with disabilities: Screen reader users, keyboard-only users
- Feedback: Document issues, prioritize fixes
- Iterative: Test, fix, re-test

## Success Metrics

- WCAG 2.1 Level AA compliance: 100% in List/Gallery views
- Keyboard navigation: 100% of features accessible
- Screen reader: All critical information announced
- Lighthouse accessibility score: > 90
- Axe DevTools: 0 critical/serious issues
- User feedback: Positive feedback from assistive technology users

## Dependencies

- **Requires:** All views (Canvas, Gallery, List), all components
- **Required By:** None (cross-cutting concern)
- **Related:** CAP-018 (List view is primary accessible view)

## Compliance Checklist

### Perceivable
- [x] Text alternatives for non-text content (alt text, ARIA labels)
- [x] Captions and alternatives for multimedia (if video added later)
- [x] Content adaptable (semantic HTML, proper structure)
- [x] Distinguishable (color contrast, text sizing, no color-only information)

### Operable
- [x] Keyboard accessible (all functionality available via keyboard)
- [x] Enough time (no time limits on interactions)
- [x] Seizures and physical reactions (no flashing content > 3 per second)
- [x] Navigable (skip links, headings, focus order, link purpose clear)
- [x] Input modalities (support beyond keyboard - touch, voice)

### Understandable
- [x] Readable (language declared, unusual words defined if needed)
- [x] Predictable (consistent navigation, consistent identification)
- [x] Input assistance (labels, error messages, suggestions)

### Robust
- [x] Compatible (valid HTML, proper ARIA usage)
- [x] Name, role, value (all custom components have proper ARIA)

## Open Questions

1. **WCAG 2.2**: Target WCAG 2.2 AAA for List view? → Phase 2 (AA first, then AAA)
2. **Certification**: Get third-party accessibility certification? → Phase 2 (self-assessment first)
3. **Accessibility Statement**: Publish public accessibility statement? → Yes (required for compliance)

## References

- Council Decision 8: "yes, canvas is a primarily visual system where gallery and list are better for visually impaired"
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Keyboard shortcuts, accessibility)
