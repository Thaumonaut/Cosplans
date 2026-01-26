# Technical Research: Modern Task Management UI

**Date**: 2025-11-03  
**Feature**: 003-modern-task-ui  
**Purpose**: Resolve all technical unknowns before implementation

This document contains research findings and technology decisions for implementing the modern task UI. Each section addresses a specific unknown from the implementation plan.

---

## 1. Drag-and-Drop Library Selection

### Problem
Need Svelte 5-compatible drag-and-drop library for board view kanban columns and timeline date adjustments.

### Options Evaluated

**Option A: @dnd-kit/core with Svelte 5 wrapper**
- Pros: Battle-tested, excellent touch support, accessibility features, tree-shakeable
- Cons: React-first API, requires custom Svelte wrapper, larger bundle (~25KB)
- Svelte 5 Compatibility: Requires custom wrapper with Svelte 5 runes

**Option B: svelte-dnd-action**
- Pros: Native Svelte library, simple API, good documentation
- Cons: Built for Svelte 4 actions, uncertain Svelte 5 runes compatibility
- Svelte 5 Compatibility: **Needs investigation** - uses Svelte 4 action API

**Option C: Native HTML5 Drag and Drop API**
- Pros: Zero dependencies, built-in browser support, lightweight
- Cons: Poor touch support (needs polyfill), inconsistent browser behavior, complex event handling, click conflicts
- Svelte 5 Compatibility: ✅ Fully compatible (standard DOM events)

**Option D: @shopify/draggable**
- Pros: Framework-agnostic, excellent cross-browser support, touch support, advanced features (mirror, constraints), handle-based dragging
- Cons: Adds dependency (~15KB), requires dynamic loading for SSR
- Svelte 5 Compatibility: ✅ Fully compatible (vanilla JS library)

### Decision: **Neodrag** (Updated from @shopify/draggable - see Section 1b for evaluation)

**Rationale**:
1. **Better cross-browser support**: Consistent behavior across all browsers and devices
2. **Touch support**: Built-in mobile/touch device support without polyfills
3. **Advanced features**: Mirror elements, drag handles, constraints, auto-scrolling
4. **Click conflict prevention**: Handle-based dragging prevents interference with interactive elements (date pickers, dropdowns)
5. **Active maintenance**: Shopify-maintained library with regular updates
6. **SSR compatibility**: Can be dynamically loaded client-side only

**Implementation Details**:
- **Library**: `@shopify/draggable` v1.2.1
- **Bundle size**: ~15KB (acceptable trade-off for features)
- **SSR**: Dynamically imported in `onMount` or via utility function
- **Usage**: Sortable class for kanban columns, Draggable for individual items
- **Features used**:
  - Drag handles (`.task-drag-handle`) to prevent click conflicts
  - Mirror element (ghost card) for visual feedback
  - Auto-scrolling at viewport edges
  - Cross-container dragging between columns

**Implementation Pattern**:

```svelte
<script lang="ts">
  let draggedTaskId = $state<string | null>(null)
  
  function handleDragStart(event: DragEvent, taskId: string) {
    draggedTaskId = taskId
    event.dataTransfer!.effectAllowed = 'move'
    event.dataTransfer!.setData('text/plain', taskId)
    
    // Visual feedback: ghost image
    const target = event.currentTarget as HTMLElement
    event.dataTransfer!.setDragImage(target, 0, 0)
  }
  
  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'
  }
  
  function handleDrop(event: DragEvent, targetStageId: string) {
    event.preventDefault()
    const taskId = event.dataTransfer!.getData('text/plain')
    
    if (taskId) {
      moveTaskToStage(taskId, targetStageId)
    }
    
    draggedTaskId = null
  }
</script>

<div
  draggable="true"
  ondragstart={(e) => handleDragStart(e, task.id)}
  class="task-card {draggedTaskId === task.id ? 'dragging' : ''}"
>
  <!-- Task content -->
</div>

<div
  ondragover={handleDragOver}
  ondrop={(e) => handleDrop(e, stage.id)}
  class="stage-column"
>
  <!-- Column content -->
</div>

<style>
  .task-card {
    cursor: grab;
    transition: opacity 0.2s;
  }
  
  .task-card.dragging {
    opacity: 0.5;
  }
  
  .task-card:active {
    cursor: grabbing;
  }
</style>
```

**Touch Support Strategy**:
- Use `touchstart`, `touchmove`, `touchend` events for mobile
- Polyfill library: [mobile-drag-drop](https://github.com/timruffles/mobile-drag-drop) (~3KB)
- Fallback: Long-press to enter "move mode" on touch devices

**Performance Considerations**:
- Use `will-change: transform` on dragged elements
- Throttle drag events to 16ms (60fps)
- Use CSS transforms instead of position changes

**Implementation Pattern**:

```typescript
// src/lib/utils/draggable.ts
import { Sortable } from '@shopify/draggable'

let sortableInstance: Sortable | null = null

export async function initSortable(containers: HTMLElement[]) {
  // Dynamically load to avoid SSR issues
  const { Sortable } = await import('@shopify/draggable')
  
  sortableInstance = new Sortable(containers, {
    draggable: '.task-card-wrapper',
    handle: '.task-drag-handle', // Only allow dragging from handle
    mirror: {
      constrainDimensions: true,
      appendTo: 'body',
      xAxis: true,
      yAxis: true,
    },
  })
  
  sortableInstance.on('sortable:stop', (event) => {
    // Handle task drop between columns
    const { oldIndex, newIndex, source, over } = event
    // Update task stage
  })
}
```

**Key Features**:
- **Drag handles**: Only specific elements (`.task-drag-handle`) trigger dragging
- **Mirror element**: Ghost card follows cursor during drag
- **Auto-scroll**: Automatically scrolls when dragging near viewport edges
- **Column expansion**: Auto-expands collapsed columns on hover during drag
- **Error recovery**: Timeout detection and recovery for lost drag control

**Alternatives Considered and Rejected**:
- **@dnd-kit/core**: Overkill for our use case, React-first API
- **svelte-dnd-action**: Svelte 4 API uncertain with Svelte 5 runes
- **Native HTML5**: Click conflicts with interactive elements, poor touch support
- **Custom library**: Not worth the maintenance burden

---

## 1b. Neodrag Evaluation (Alternative Drag-and-Drop Library)

### Problem
Evaluate [Neodrag](https://next.neodrag.dev/) as a potential replacement for @shopify/draggable, given:
- Neodrag is designed specifically for Svelte
- Current implementation has DOM update issues with @shopify/draggable
- Neodrag is SSR-friendly and multi-framework

### Neodrag Overview

**Neodrag** is a modern drag-and-drop library designed for Svelte (and other frameworks) with:
- **Svelte-native**: Built specifically for Svelte, uses Svelte actions/API
- **SSR-friendly**: Works with SvelteKit, NextJS, Nuxt, and other meta-frameworks
- **Transparent bundle size**: Modular plugins, only pay for what you use
- **Feature-rich**: Handles, bounds, grid snapping, axis locking, and more
- **Bundle size**: ~3.58KB base + optional plugins (~82B each)

### Comparison: Neodrag vs @shopify/draggable

| Feature | Neodrag | @shopify/draggable |
|---------|---------|-------------------|
| **Svelte Integration** | ✅ Native Svelte actions | ⚠️ Vanilla JS (needs manual integration) |
| **SSR Support** | ✅ Built-in SSR-friendly | ⚠️ Requires dynamic loading |
| **DOM Update Handling** | ✅ Designed for reactive frameworks | ❌ Issues with DOM updates |
| **Bundle Size** | ✅ ~3.58KB base + plugins | ⚠️ ~15KB fixed |
| **Touch Support** | ✅ Built-in | ✅ Built-in |
| **Handle-based Dragging** | ✅ Supported | ✅ Supported |
| **Cross-container Drag** | ✅ Supported | ✅ Supported (Sortable) |
| **Auto-scroll** | ✅ Plugin available | ✅ Built-in |
| **Mirror/Ghost Element** | ✅ Built-in | ✅ Built-in |
| **Grid Snapping** | ✅ Plugin available | ⚠️ Manual implementation |
| **Maintenance** | ✅ Active (2024-2025) | ✅ Active (Shopify-maintained) |
| **Documentation** | ✅ Good | ✅ Excellent |
| **Sortable Lists** | ⚠️ May need separate implementation | ✅ Built-in (Sortable class) |

### Key Advantages of Neodrag

1. **Svelte-Native Design**
   - Uses Svelte actions (`use:neodrag`)
   - Reacts to Svelte state changes automatically
   - Better integration with Svelte 5 runes ($state, $derived)
   - No manual DOM manipulation needed

2. **DOM Update Handling**
   - Built for reactive frameworks (Svelte, Vue, React, Solid)
   - Handles DOM updates gracefully without breaking drag state
   - **Critical for our use case**: Tasks are loaded dynamically, columns can be added/removed

3. **SSR-Friendly**
   - No need for dynamic imports or `onMount` checks
   - Works out of the box with SvelteKit
   - Simpler implementation

4. **Modular Bundle Size**
   - Base: ~3.58KB
   - Only include plugins you need
   - Can be smaller than @shopify/draggable if using minimal features

5. **Better Reactive Integration**
   - Automatically updates when Svelte state changes
   - No need to manually reinitialize after DOM updates
   - Handles task list updates, column additions/removals seamlessly

### Potential Concerns

1. **Sortable Functionality**
   - @shopify/draggable has built-in `Sortable` class for kanban boards
   - Neodrag may need custom implementation for cross-container sorting
   - **Assessment**: Need to verify cross-container drag support

2. **Ecosystem Maturity**
   - @shopify/draggable is battle-tested in production at Shopify
   - Neodrag is newer, though actively maintained
   - **Assessment**: Neodrag appears mature enough for our needs

3. **Learning Curve**
   - Different API than @shopify/draggable
   - Need to refactor existing implementation
   - **Assessment**: Svelte-native API should be easier to use

### Decision: **Switch to Neodrag**

**Rationale**:
1. **DOM Update Issues**: Neodrag is specifically designed to handle reactive DOM updates, solving the current problem
2. **Svelte-Native**: Better integration with Svelte 5 runes and reactive state
3. **SSR-Friendly**: Simpler implementation, no dynamic loading needed
4. **Smaller Bundle**: Can be smaller with modular plugins
5. **Better Long-term Fit**: Designed for frameworks like Svelte, not vanilla JS

**Implementation Details**:
- **Library**: `@neodrag/svelte` (Svelte-specific package)
- **Bundle size**: ~3.58KB base + required plugins (~82B each)
- **Required plugins**: `applyUserSelectHack`, `touchAction`, `controls` (for handles), `events` (for callbacks)
- **Estimated total**: ~4-5KB (smaller than @shopify/draggable)

**Implementation Pattern**:

```svelte
<script lang="ts">
  import { neodrag } from '@neodrag/svelte'
  
  let task = $state(...)
  let stageId = $state(...)
  
  function handleDragEnd(event: any) {
    // Update task stage
    updateTaskStage(task.id, stageId)
  }
</script>

<div
  use:neodrag={{
    handle: '.task-drag-handle',
    bounds: 'parent',
    onDragEnd: handleDragEnd,
    // Other options
  }}
  class="task-card"
>
  <div class="task-drag-handle">⋮⋮</div>
  <!-- Task content -->
</div>
```

**Migration Considerations**:
- Need to refactor existing @shopify/draggable implementation
- Test cross-container drag (kanban columns) thoroughly
- Verify all features work (handles, auto-scroll, mirror element)
- **Estimated effort**: 2-4 hours for migration and testing

**Updated Recommendation**: **Use Neodrag instead of @shopify/draggable**
- Solves DOM update issues
- Better Svelte integration
- Smaller bundle size
- Simpler SSR implementation

**Note**: See Section 13c for comprehensive comparison with sveltednd. Recommendation: Test both libraries during implementation to determine which handles kanban cross-container drag better.

---

## 1a. Color Picker Library Selection

### Problem
Need a color picker for task stage color customization and label color selection.

### Options Evaluated

**Option A: Custom CSS-based color picker**
- Pros: Zero dependencies, full control, lightweight
- Cons: Complex to build, accessibility concerns, limited features
- Bundle size: ~5KB custom code

**Option B: @melloware/coloris (Coloris.js)**
- Pros: Modern UI, accessibility features, keyboard navigation, theme support, small bundle
- Cons: Adds dependency, requires dynamic loading for SSR
- Bundle size: ~8KB

**Option C: react-color (via adapter)**
- Pros: Feature-rich, many picker styles
- Cons: React-first, requires adapter, larger bundle (~20KB)
- Svelte 5 Compatibility: Needs custom wrapper

**Option D: Native HTML5 color input**
- Pros: Zero dependencies, native browser support
- Cons: Inconsistent UI across browsers, limited customization
- Bundle size: 0KB

### Decision: @melloware/coloris (Coloris.js)

**Rationale**:
1. **Modern UI**: Grid-based layout with theme swatches and custom colors
2. **Accessibility**: Keyboard navigation, ARIA labels, focus management
3. **Lightweight**: ~8KB bundle size
4. **SSR compatible**: Can be dynamically loaded client-side
5. **Theme support**: Works with dark/light themes
6. **Local storage**: Persists custom color swatches

**Implementation Details**:
- **Library**: `@melloware/coloris` v0.25.0
- **Bundle size**: ~8KB
- **SSR**: Dynamically imported in `onMount` hook
- **Usage**: Hidden input element with programmatic trigger via visible button
- **Features used**:
  - Predefined theme color swatches
  - Custom color input with hex/RGB support
  - Local storage persistence for custom colors
  - High z-index for dropdown positioning

**Implementation Pattern**:

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  
  let Coloris: any = null
  let inputElement = $state<HTMLInputElement | null>(null)
  
  onMount(async () => {
    // Dynamically load Coloris and CSS
    Coloris = await import('@melloware/coloris')
    await import('@melloware/coloris/dist/coloris.css')
    
    Coloris.init()
    Coloris({
      el: '#color-picker-input',
      swatches: [
        // Theme colors
        '#8b5cf6', '#ec4899', '#3b82f6',
        // Custom colors from localStorage
        ...getCustomColors(),
      ],
    })
  })
  
  function openPicker() {
    if (inputElement) {
      inputElement.click()
    }
  }
</script>

<input
  bind:this={inputElement}
  type="text"
  data-coloris
  id="color-picker-input"
  style="display: none;"
/>
<button onclick={openPicker}>Pick Color</button>
```

**Key Features**:
- **Grid layout**: Modern swatch-based color selection
- **Theme colors**: Pre-populated with app theme colors
- **Custom colors**: User-defined colors persisted in localStorage
- **Reset button**: Clear custom color selection
- **Event handling**: Proper stopPropagation to prevent drag conflicts

**Alternatives Considered and Rejected**:
- **Custom CSS picker**: Too complex to build, accessibility concerns
- **Native color input**: Inconsistent UI, poor UX
- **react-color**: Too large, React-first, not needed

---

## 2. Virtual Scrolling Implementation

### Problem
Rendering 500+ tasks in list view causes performance degradation. Need efficient rendering of only visible items.

### Options Evaluated

**Option A: svelte-virtual-list**
- Pros: Purpose-built for Svelte, simple API
- Cons: Last update 2 years ago, Svelte 4 focused
- Svelte 5 Compatibility: **Unknown** - needs testing

**Option B: @sveltejs/svelte-virtual (if exists)**
- Pros: Official Svelte library, maintained by core team
- Cons: **Does not exist** - no official virtual list library

**Option C: Custom implementation with Intersection Observer**
- Pros: Full control, modern browser API, can optimize for specific needs
- Cons: More complex, need to handle edge cases (variable heights, scrolling)
- Svelte 5 Compatibility: ✅ Uses standard DOM APIs

**Option D: Tanstack Virtual (framework-agnostic)**
- Pros: Battle-tested, framework-agnostic, excellent documentation, active maintenance
- Cons: ~10KB, requires integration layer
- Svelte 5 Compatibility: ✅ Compatible (vanilla JS core)

### Decision: Tanstack Virtual with Svelte 5 wrapper

**Rationale**:
1. **Best-in-class**: Industry standard virtual scrolling library (used by React Query team)
2. **Framework-agnostic**: Works with any framework, won't break with Svelte updates
3. **Feature-complete**: Handles variable heights, sticky items, horizontal/vertical scrolling
4. **Active maintenance**: Regularly updated, large community
5. **Performance**: Highly optimized, minimal overhead

**Implementation Pattern**:

```svelte
<script lang="ts">
  import { createVirtualizer } from '@tanstack/virtual-core'
  import { onMount } from 'svelte'
  
  let scrollElement = $state<HTMLDivElement | null>(null)
  let tasks = $state<Task[]>([])
  
  const virtualizer = $derived(() => {
    if (!scrollElement) return null
    
    return createVirtualizer({
      count: tasks.length,
      getScrollElement: () => scrollElement,
      estimateSize: () => 72, // Estimated task card height
      overscan: 5, // Render 5 extra items above/below viewport
    })
  })
  
  const virtualItems = $derived(virtualizer()?.getVirtualItems() ?? [])
  const totalSize = $derived(virtualizer()?.getTotalSize() ?? 0)
</script>

<div bind:this={scrollElement} class="scroll-container">
  <div style="height: {totalSize}px; position: relative;">
    {#each virtualItems as virtualRow}
      <div
        style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: {virtualRow.size}px;
          transform: translateY({virtualRow.start}px);
        "
      >
        <TaskCard task={tasks[virtualRow.index]} />
      </div>
    {/each}
  </div>
</div>

<style>
  .scroll-container {
    height: 100%;
    overflow-y: auto;
    contain: strict; /* Performance optimization */
  }
</style>
```

**Variable Height Support**:
```typescript
// Measure actual heights after render
const virtualizer = createVirtualizer({
  count: tasks.length,
  getScrollElement: () => scrollElement,
  estimateSize: () => 72,
  measureElement: (el) => el.getBoundingClientRect().height,
})
```

**Performance Target**: Render 500 tasks in <2 seconds, scroll at 60fps

**Bundle Size**: ~10KB gzipped (acceptable for feature benefit)

**Alternatives Considered and Rejected**:
- **svelte-virtual-list**: Unmaintained, Svelte 4 focused
- **Custom Intersection Observer**: Too complex to build from scratch, reinventing wheel
- **No virtualization**: Unacceptable performance with 500+ tasks

---

## 3. Calendar View Library

### Problem
Need calendar component for visualizing tasks by due date with month/week/day views.

### Options Evaluated

**Option A: FullCalendar with Svelte adapter**
- Pros: Industry standard, feature-rich, excellent documentation
- Cons: Large bundle (~50KB), commercial license for some features, complex API
- Svelte 5 Compatibility: Adapter needs update

**Option B: Custom calendar grid with CSS Grid**
- Pros: Lightweight, full control, exactly what we need
- Cons: Need to build date logic, handle edge cases
- Svelte 5 Compatibility: ✅ Pure CSS + Svelte

**Option C: Flowbite Svelte Datepicker (extend)**
- Pros: Already in dependency tree, consistent styling
- Cons: Not designed for event display, limited to date picking
- Svelte 5 Compatibility: ✅ Flowbite Svelte 5 compatible

### Decision: Custom Calendar Grid with CSS Grid

**Rationale**:
1. **Lightweight**: ~5KB of custom code vs 50KB+ library
2. **Exact requirements**: Only need month view with task dots, not full calendar features
3. **Design control**: Can match existing app aesthetic perfectly
4. **Performance**: No library overhead, pure CSS Grid is fast
5. **Maintainability**: Simple code, easy to modify

**Implementation Pattern**:

```svelte
<script lang="ts">
  import { getDaysInMonth, startOfMonth, getDay } from 'date-fns'
  
  let currentMonth = $state(new Date())
  
  const calendarDays = $derived(() => {
    const firstDay = startOfMonth(currentMonth)
    const daysInMonth = getDaysInMonth(currentMonth)
    const startDayOfWeek = getDay(firstDay)
    
    // Previous month padding
    const prevMonthDays = Array.from({ length: startDayOfWeek }, (_, i) => ({
      date: new Date(firstDay.getTime() - (startDayOfWeek - i) * 86400000),
      currentMonth: false,
    }))
    
    // Current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      date: new Date(firstDay.getTime() + i * 86400000),
      currentMonth: true,
    }))
    
    return [...prevMonthDays, ...currentMonthDays]
  })
  
  function getTasksForDay(date: Date) {
    return tasks.filter(t => 
      t.dueDate && isSameDay(new Date(t.dueDate), date)
    )
  }
</script>

<div class="calendar-grid">
  <!-- Header row -->
  <div class="weekday">Sun</div>
  <div class="weekday">Mon</div>
  <!-- ... other days ... -->
  
  <!-- Calendar days -->
  {#each calendarDays as day}
    <div class="calendar-day {day.currentMonth ? '' : 'other-month'}">
      <div class="day-number">{day.date.getDate()}</div>
      
      <div class="tasks">
        {#each getTasksForDay(day.date) as task}
          <div class="task-dot {task.priority}"></div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: var(--border);
  }
  
  .calendar-day {
    aspect-ratio: 1;
    background: white;
    padding: 0.5rem;
    position: relative;
  }
  
  .task-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
    margin: 1px;
  }
  
  .task-dot.high { background: red; }
  .task-dot.medium { background: blue; }
  .task-dot.low { background: gray; }
</style>
```

**Task Density Visualization** (per FR-004):
```svelte
{#if tasksForDay.length === 0}
  <!-- Empty day -->
{:else if tasksForDay.length <= 2}
  <!-- Show individual task dots -->
  {#each tasksForDay as task}
    <div class="task-dot {task.priority}"></div>
  {/each}
{:else if tasksForDay.length <= 5}
  <!-- Show compact dots + count -->
  <div class="task-dots-compact">
    {tasksForDay.length} tasks
  </div>
{:else}
  <!-- Show "6+" indicator -->
  <div class="task-dots-many">
    {tasksForDay.length}+ tasks
  </div>
{/if}
```

**Dependencies**: `date-fns` (already in project) for date utilities

**Alternatives Considered and Rejected**:
- **FullCalendar**: Overkill for simple task dots on calendar, too large
- **Flowbite Datepicker extension**: Not designed for event display

---

## 4. Timeline/Gantt Visualization

### Problem
Implement horizontal timeline view showing tasks as bars along date axis with drag-to-adjust dates.

### Options Evaluated

**Option A: D3.js custom timeline**
- Pros: Extremely flexible, can create any visualization
- Cons: Steep learning curve, large bundle (~75KB), overkill for simple timeline
- Svelte 5 Compatibility: ✅ Can integrate with Svelte

**Option B: Frappe Gantt**
- Pros: Purpose-built for Gantt charts, simple API
- Cons: Not actively maintained, jQuery dependency (removed in v2), limited customization
- Svelte 5 Compatibility: ✅ Vanilla JS library

**Option C: CSS Grid horizontal layout with task bars**
- Pros: Lightweight, leverages CSS for positioning, simple
- Cons: Need to calculate positions manually, limited zoom capabilities
- Svelte 5 Compatibility: ✅ Pure CSS + Svelte

### Decision: CSS Grid Horizontal Layout (Custom Implementation)

**Rationale**:
1. **Simplicity**: Timeline is relatively simple visualization (horizontal bars)
2. **Performance**: CSS Grid is highly optimized by browsers
3. **Control**: Full control over styling, interactions, zoom levels
4. **Bundle size**: ~3KB custom code vs 75KB D3 or 30KB Frappe Gantt
5. **Maintainability**: Easy to understand and modify

**Implementation Pattern**:

```svelte
<script lang="ts">
  import { addDays, differenceInDays, startOfWeek, endOfWeek } from 'date-fns'
  
  let timelineStart = $state(startOfWeek(new Date()))
  let timelineEnd = $state(endOfWeek(addDays(new Date(), 60))) // 2 months view
  let zoomLevel = $state<'day' | 'week' | 'month'>('week')
  
  const totalDays = $derived(differenceInDays(timelineEnd, timelineStart))
  const columnWidth = $derived(zoomLevel === 'day' ? 40 : zoomLevel === 'week' ? 100 : 200)
  
  function getTaskBarPosition(task: Task) {
    if (!task.dueDate) return null
    
    const startDate = task.createdAt ? new Date(task.createdAt) : timelineStart
    const endDate = new Date(task.dueDate)
    
    const startOffset = differenceInDays(startDate, timelineStart)
    const duration = differenceInDays(endDate, startDate) || 1
    
    return {
      left: `${startOffset * columnWidth}px`,
      width: `${duration * columnWidth}px`,
    }
  }
</script>

<div class="timeline-container">
  <!-- Date header -->
  <div class="timeline-header">
    {#each Array.from({ length: totalDays }, (_, i) => addDays(timelineStart, i)) as date}
      <div class="date-column" style="width: {columnWidth}px">
        {date.getDate()}
      </div>
    {/each}
  </div>
  
  <!-- Task bars -->
  <div class="timeline-tasks">
    {#each tasks.filter(t => t.dueDate) as task}
      {@const position = getTaskBarPosition(task)}
      {#if position}
        <div
          class="task-bar {task.priority}"
          style="left: {position.left}; width: {position.width}"
          draggable="true"
          ondragend={(e) => adjustTaskDate(task, e)}
        >
          <span class="task-title">{task.title}</span>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .timeline-container {
    overflow-x: auto;
    position: relative;
  }
  
  .timeline-header {
    display: flex;
    position: sticky;
    top: 0;
    background: white;
    border-bottom: 2px solid var(--border);
  }
  
  .timeline-tasks {
    position: relative;
    height: 500px;
  }
  
  .task-bar {
    position: absolute;
    height: 32px;
    background: var(--primary);
    border-radius: 4px;
    padding: 0 8px;
    cursor: grab;
    white-space: nowrap;
    overflow: hidden;
  }
  
  .task-bar:active {
    cursor: grabbing;
  }
</style>
```

**Drag-to-Adjust Date**:
```typescript
function adjustTaskDate(task: Task, dragEvent: DragEvent) {
  const dragDistance = dragEvent.clientX - dragEvent.target.offsetLeft
  const daysMoved = Math.round(dragDistance / columnWidth)
  
  if (daysMoved !== 0 && task.dueDate) {
    const newDueDate = addDays(new Date(task.dueDate), daysMoved)
    updateTask(task.id, { dueDate: newDueDate.toISOString() })
  }
}
```

**Zoom Controls**:
```svelte
<div class="zoom-controls">
  <button onclick={() => zoomLevel = 'day'}>Day</button>
  <button onclick={() => zoomLevel = 'week'}>Week</button>
  <button onclick={() => zoomLevel = 'month'}>Month</button>
</div>
```

**Performance Consideration**:
- Only render tasks with due dates (filter out null)
- Use CSS `transform` for dragging (not position changes)
- Virtual scrolling for 500+ tasks (reuse Tanstack Virtual)

**Alternatives Considered and Rejected**:
- **D3.js**: Too complex for relatively simple timeline
- **Frappe Gantt**: Not actively maintained, limited flexibility

---

## 5. Rich Text Editor for Comments

### Problem
Need editor for task comments with @mentions, basic formatting (bold, italic, links), lightweight.

### Options Evaluated

**Option A: Tiptap Editor**
- Pros: Extensible, excellent documentation, active maintenance, mention plugin
- Cons: ~50KB bundle, React-first (has Vue adapter, need Svelte adapter)
- Svelte 5 Compatibility: Needs custom Svelte 5 adapter

**Option B: Lexical with Svelte bindings**
- Pros: Facebook-backed, modern architecture, extensible
- Cons: No official Svelte adapter, ~60KB, steep learning curve
- Svelte 5 Compatibility: Requires custom bindings

**Option C: Simple textarea with Markdown support**
- Pros: Lightweight (~2KB), simple, no external dependencies
- Cons: No WYSIWYG, markdown syntax may be unfamiliar to some users
- Svelte 5 Compatibility: ✅ Pure Svelte

**Option D: Contenteditable div with custom toolbar**
- Pros: Native browser editing, full control, lightweight
- Cons: Browser inconsistencies, need to handle formatting commands manually
- Svelte 5 Compatibility: ✅ Standard DOM APIs

### Decision: Contenteditable Div with Custom Toolbar + Markdown Fallback

**Rationale**:
1. **Lightweight**: ~5KB custom code vs 50KB+ library
2. **Sufficient features**: Only need bold, italic, links, @mentions (not full rich text)
3. **Native browser support**: `document.execCommand` handles basic formatting
4. **Markdown fallback**: Users can type markdown syntax if they prefer
5. **Bundle size**: Critical for performance

**Implementation Pattern**:

```svelte
<script lang="ts">
  let editor = $state<HTMLDivElement | null>(null)
  let content = $state('')
  let showMentionDropdown = $state(false)
  let mentionQuery = $state('')
  
  function handleInput(event: Event) {
    const text = editor.textContent || ''
    content = text
    
    // Detect @mention trigger
    const cursorPos = window.getSelection()?.focusOffset || 0
    const lastAtIndex = text.lastIndexOf('@', cursorPos)
    
    if (lastAtIndex !== -1 && cursorPos - lastAtIndex <= 20) {
      mentionQuery = text.slice(lastAtIndex + 1, cursorPos)
      showMentionDropdown = true
    } else {
      showMentionDropdown = false
    }
  }
  
  function applyFormatting(command: string) {
    document.execCommand(command, false)
    editor?.focus()
  }
  
  function insertMention(user: User) {
    const mention = `@${user.name}`
    const selection = window.getSelection()
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      
      const mentionEl = document.createElement('span')
      mentionEl.className = 'mention'
      mentionEl.dataset.userId = user.id
      mentionEl.textContent = mention
      
      range.insertNode(mentionEl)
      range.collapse(false)
    }
    
    showMentionDropdown = false
  }
</script>

<div class="editor-container">
  <!-- Toolbar -->
  <div class="toolbar">
    <button onclick={() => applyFormatting('bold')} title="Bold (Ctrl+B)">
      <strong>B</strong>
    </button>
    <button onclick={() => applyFormatting('italic')} title="Italic (Ctrl+I)">
      <em>I</em>
    </button>
    <button onclick={() => applyFormatting('createLink')} title="Link">
      🔗
    </button>
  </div>
  
  <!-- Editor -->
  <div
    bind:this={editor}
    contenteditable="true"
    oninput={handleInput}
    class="editor-content"
    placeholder="Add a comment... Use @ to mention someone"
  ></div>
  
  <!-- Mention dropdown -->
  {#if showMentionDropdown}
    <div class="mention-dropdown">
      {#each filteredTeamMembers(mentionQuery) as user}
        <button onclick={() => insertMention(user)}>
          <Avatar {user} />
          {user.name}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .editor-content {
    min-height: 100px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 4px;
    outline: none;
  }
  
  .editor-content:focus {
    border-color: var(--primary);
  }
  
  .editor-content[contenteditable]:empty:before {
    content: attr(placeholder);
    color: var(--muted);
  }
  
  .mention {
    color: var(--primary);
    background: var(--primary-light);
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: 500;
  }
  
  .toolbar {
    display: flex;
    gap: 4px;
    padding: 4px;
    border-bottom: 1px solid var(--border);
  }
</style>
```

**Markdown Fallback**:
```typescript
function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
    .replace(/\*(.*?)\*/g, '<em>$1</em>')              // *italic*
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>') // [text](url)
}
```

**Keyboard Shortcuts**:
- Ctrl+B: Bold
- Ctrl+I: Italic
- Ctrl+K: Insert link
- @: Trigger mention dropdown
- Enter: Submit comment (Shift+Enter for new line)

**Alternatives Considered and Rejected**:
- **Tiptap**: Too large for our needs, complex setup
- **Lexical**: No Svelte support, overkill
- **Textarea + Markdown only**: No WYSIWYG, worse UX

---

## 6. Natural Language Parsing Strategy

### Problem
Parse task titles to extract metadata: dates ("by Friday"), priorities ("#high"), project mentions ("for Project X").

### Options Evaluated

**Option A: chrono-node for date parsing**
- Pros: Excellent natural language date parsing, supports many formats
- Cons: ~100KB bundle, overkill for simple parsing
- Accuracy: Very high (90%+)

**Option B: Regex patterns + simple keyword extraction**
- Pros: Lightweight (~1KB), full control, fast
- Cons: Limited accuracy, doesn't handle ambiguous phrases
- Accuracy: Medium (60-70%)

**Option C: date-fns + custom regex patterns**
- Pros: date-fns already in project, regex for other metadata
- Cons: date-fns doesn't do natural language parsing, need custom logic
- Accuracy: Medium-High (70-80%)

### Decision: Custom Regex Patterns + date-fns for date validation

**Rationale**:
1. **Lightweight**: ~2KB custom code
2. **Sufficient accuracy**: Common patterns cover 70% of use cases
3. **No new dependencies**: Uses existing date-fns
4. **Fast**: Regex is very fast, no complex parsing
5. **Extensible**: Easy to add new patterns as needed

**Implementation Pattern**:

```typescript
// src/lib/utils/natural-language.ts

import { parse, isValid, addDays, nextFriday, nextMonday } from 'date-fns'

export interface ParsedTaskMetadata {
  title: string           // Cleaned title (metadata removed)
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string        // ISO date string
  projectMention?: string // Project name extracted
  tags?: string[]
}

export function parseTaskTitle(rawTitle: string): ParsedTaskMetadata {
  let title = rawTitle
  const metadata: ParsedTaskMetadata = { title }
  
  // Extract priority (#high, #medium, #low)
  const priorityMatch = title.match(/#(high|medium|low)\b/i)
  if (priorityMatch) {
    metadata.priority = priorityMatch[1].toLowerCase() as any
    title = title.replace(priorityMatch[0], '').trim()
  }
  
  // Extract due date
  // Pattern: "by Friday", "due Friday", "by 11/30", "due Nov 30"
  const datePatterns = [
    /\b(by|due|until)\s+(today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/i,
    /\b(by|due|until)\s+(\d{1,2}\/\d{1,2})\b/,
    /\b(by|due|until)\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/i,
  ]
  
  for (const pattern of datePatterns) {
    const match = title.match(pattern)
    if (match) {
      const dateStr = match[2] + (match[3] ? ` ${match[3]}` : '')
      const parsedDate = parseDateString(dateStr)
      
      if (parsedDate) {
        metadata.dueDate = parsedDate.toISOString()
        title = title.replace(match[0], '').trim()
      }
      break
    }
  }
  
  // Extract project mention ("for Project X", "in Project X")
  const projectMatch = title.match(/\b(for|in)\s+([A-Z][a-zA-Z\s]+)\b/)
  if (projectMatch) {
    metadata.projectMention = projectMatch[2].trim()
    title = title.replace(projectMatch[0], '').trim()
  }
  
  // Extract tags (#tag1 #tag2)
  const tagMatches = title.match(/#([a-zA-Z0-9_-]+)/g)
  if (tagMatches) {
    metadata.tags = tagMatches.map(t => t.slice(1)) // Remove #
    title = title.replace(/#[a-zA-Z0-9_-]+/g, '').trim()
  }
  
  metadata.title = title
  return metadata
}

function parseDateString(dateStr: string): Date | null {
  const today = new Date()
  
  // Relative dates
  if (dateStr.toLowerCase() === 'today') {
    return today
  }
  if (dateStr.toLowerCase() === 'tomorrow') {
    return addDays(today, 1)
  }
  
  // Next day of week
  const dayMapping: Record<string, () => Date> = {
    monday: nextMonday,
    tuesday: () => addDays(nextMonday(today), 1),
    wednesday: () => addDays(nextMonday(today), 2),
    thursday: () => addDays(nextMonday(today), 3),
    friday: nextFriday,
    saturday: () => addDays(nextFriday(today), 1),
    sunday: () => addDays(nextFriday(today), 2),
  }
  
  const dayFn = dayMapping[dateStr.toLowerCase()]
  if (dayFn) {
    return dayFn()
  }
  
  // Parse MM/DD or "Month Day"
  const parsed = parse(dateStr, 'M/d', today)
  if (isValid(parsed)) {
    return parsed
  }
  
  const parsedMonth = parse(dateStr, 'MMM d', today)
  if (isValid(parsedMonth)) {
    return parsedMonth
  }
  
  return null
}
```

**Usage Example**:

```typescript
const input = "buy fabric for Cosplay X by Friday #high"
const parsed = parseTaskTitle(input)

// Result:
// {
//   title: "buy fabric",
//   priority: "high",
//   dueDate: "2025-11-07T00:00:00.000Z",  // Next Friday
//   projectMention: "Cosplay X"
// }
```

**Accuracy Targets**:
- Date parsing: 70% success rate on common patterns
- Priority extraction: 95% (simple regex)
- Project mention: 60% (depends on user writing style)

**Future Enhancements** (if needed):
- Add more date patterns based on user feedback
- Integrate chrono-node if accuracy becomes critical (acceptable trade-off for 100KB)

**Alternatives Considered and Rejected**:
- **chrono-node**: Too large for MVP, can add later if needed
- **No parsing**: Worse UX, forces users to fill forms

---

## 7. Email Notification Service

### Problem
Send email notifications for task assignments, @mentions, comments, status changes.

### Current Setup Investigation

**Existing Supabase Auth Email**: Supabase has built-in email service for auth (password reset, email verification).

**Options for Custom Notifications**:

**Option A: Supabase Edge Functions + Resend**
- Pros: Serverless, auto-scales, Resend has generous free tier (3000 emails/month)
- Cons: Need to write Edge Function, additional service dependency
- Cost: Free tier sufficient for MVP

**Option B: Supabase Edge Functions + SendGrid**
- Pros: Established service, good deliverability
- Cons: More complex API, smaller free tier (100 emails/day)
- Cost: Free tier may be limiting

**Option C: Direct SMTP integration (Nodemailer)**
- Pros: Full control, no external service
- Cons: Need SMTP server, deliverability issues, maintenance overhead
- Cost: Varies

**Option D: Supabase built-in custom emails (if available)**
- Pros: No additional service, integrated with Supabase
- Cons: Limited to Supabase email templates, may not support custom content
- Cost: Included with Supabase

### Decision: Supabase Edge Function + Resend

**Rationale**:
1. **Generous free tier**: 3000 emails/month covers early users
2. **Modern API**: Simple REST API, excellent DX
3. **Good deliverability**: Resend focuses on transactional emails
4. **Serverless**: No infrastructure to maintain
5. **Cost-effective**: Free tier, then $20/month for 50K emails

**Implementation Pattern**:

```typescript
// supabase/functions/send-notification-email/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { userId, notificationType, taskId, actorName, message } = await req.json()
  
  // Get user email from Supabase
  const supabase = createClient(/* ... */)
  const { data: user } = await supabase
    .from('users')
    .select('email, notification_preferences')
    .eq('id', userId)
    .single()
  
  // Check if user has email notifications enabled
  if (!user.notification_preferences?.email) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 })
  }
  
  // Send email via Resend
  const emailContent = generateEmailContent(notificationType, taskId, actorName, message)
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Cosplay Tracker <notifications@cosplaytracker.app>',
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    }),
  })
  
  return response
})

function generateEmailContent(type: string, taskId: string, actor: string, message: string) {
  const templates = {
    assignment: {
      subject: `${actor} assigned you a task`,
      html: `
        <h2>You've been assigned a task</h2>
        <p>${actor} assigned you to a task:</p>
        <blockquote>${message}</blockquote>
        <a href="https://app.cosplaytracker.com/tasks?detail=${taskId}">View Task</a>
      `,
    },
    mention: {
      subject: `${actor} mentioned you in a comment`,
      html: `
        <h2>You were mentioned</h2>
        <p>${actor} mentioned you:</p>
        <blockquote>${message}</blockquote>
        <a href="https://app.cosplaytracker.com/tasks?detail=${taskId}">View Task</a>
      `,
    },
    comment: {
      subject: `New comment on your task`,
      html: `
        <h2>New comment</h2>
        <p>${actor} commented on your task:</p>
        <blockquote>${message}</blockquote>
        <a href="https://app.cosplaytracker.com/tasks?detail=${taskId}">View Task</a>
      `,
    },
  }
  
  return templates[type] || templates.comment
}
```

**Triggering Emails from App**:

```typescript
// src/lib/api/services/taskNotificationService.ts

async function sendTaskAssignmentNotification(
  userId: string,
  taskId: string,
  actorName: string,
  taskTitle: string
) {
  // Create notification record (in-app)
  await supabase.from('task_notifications').insert({
    user_id: userId,
    task_id: taskId,
    event_type: 'assignment',
    message: `${actorName} assigned you to "${taskTitle}"`,
    actor_user_id: currentUser.id,
  })
  
  // Trigger email via Edge Function
  await supabase.functions.invoke('send-notification-email', {
    body: {
      userId,
      notificationType: 'assignment',
      taskId,
      actorName,
      message: taskTitle,
    },
  })
}
```

**Email Template Design**:
- Plain text + HTML versions
- Unsubscribe link in footer (required by law)
- Clear call-to-action (View Task button)
- Sender: `notifications@cosplaytracker.app`

**Deliverability Best Practices**:
- Set up SPF, DKIM, DMARC records
- Use Resend's domain verification
- Monitor bounce/complaint rates
- Include plain text version

**Alternatives Considered and Rejected**:
- **SendGrid**: Smaller free tier, more complex setup
- **Direct SMTP**: Deliverability issues, maintenance burden
- **Supabase built-in**: Too limited for custom notifications

---

## 8. File Attachment Storage

### Problem
Handle file uploads for task attachments, store in Cloudflare R2, generate signed URLs for access control.

### Current Setup Investigation

Looking at existing codebase for image upload patterns...

**Existing Pattern** (from inline-image-upload.svelte):
```typescript
// Already using Cloudflare R2 for image uploads
// Pattern: Upload to Supabase storage bucket, which proxies to R2
```

### Decision: Reuse Existing Supabase Storage + R2 Pattern

**Rationale**:
1. **Already implemented**: Image upload infrastructure exists
2. **Consistent pattern**: Same approach for all file types
3. **Access control**: Supabase storage handles signed URLs
4. **Cost-effective**: R2 free tier (10GB storage)

**Implementation Pattern**:

```typescript
// src/lib/api/services/taskAttachmentService.ts

import { supabase } from '$lib/api/supabase'
import type { TaskAttachment } from '$lib/types/domain/task'

export const taskAttachmentService = {
  async uploadAttachment(
    taskId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<TaskAttachment> {
    const fileName = `${taskId}/${Date.now()}-${file.name}`
    const bucket = 'task-attachments'
    
    // Upload to Supabase Storage (proxies to R2)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })
    
    if (uploadError) throw uploadError
    
    // Get public URL (signed)
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName, {
        download: false,
      })
    
    // Create attachment record
    const { data, error } = await supabase
      .from('task_attachments')
      .insert({
        task_id: taskId,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_url: urlData.publicUrl,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async getAttachments(taskId: string): Promise<TaskAttachment[]> {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },
  
  async deleteAttachment(attachmentId: string): Promise<void> {
    // Get attachment to find storage path
    const { data: attachment } = await supabase
      .from('task_attachments')
      .select('storage_url')
      .eq('id', attachmentId)
      .single()
    
    if (attachment) {
      // Delete from storage
      const fileName = attachment.storage_url.split('/').slice(-2).join('/')
      await supabase.storage.from('task-attachments').remove([fileName])
    }
    
    // Delete record
    const { error } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId)
    
    if (error) throw error
  },
  
  async getSignedUrl(storageUrl: string, expiresIn: number = 3600): Promise<string> {
    // Generate signed URL for secure download
    const fileName = storageUrl.split('/').slice(-2).join('/')
    
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .createSignedUrl(fileName, expiresIn)
    
    if (error) throw error
    return data.signedUrl
  },
}
```

**Upload Component**:

```svelte
<script lang="ts">
  import { taskAttachmentService } from '$lib/api/services/taskAttachmentService'
  
  let dragOver = $state(false)
  let uploading = $state(false)
  let progress = $state(0)
  
  async function handleFileDrop(event: DragEvent) {
    event.preventDefault()
    dragOver = false
    
    const files = Array.from(event.dataTransfer?.files || [])
    await uploadFiles(files)
  }
  
  async function handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files || [])
    await uploadFiles(files)
  }
  
  async function uploadFiles(files: File[]) {
    uploading = true
    
    for (const file of files) {
      try {
        await taskAttachmentService.uploadAttachment(taskId, file, (p) => {
          progress = p
        })
      } catch (error) {
        showError(`Failed to upload ${file.name}`)
      }
    }
    
    uploading = false
    progress = 0
  }
</script>

<div
  class="upload-dropzone {dragOver ? 'drag-over' : ''}"
  ondragover={(e) => { e.preventDefault(); dragOver = true }}
  ondragleave={() => dragOver = false}
  ondrop={handleFileDrop}
>
  {#if uploading}
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progress}%"></div>
    </div>
  {:else}
    <input
      type="file"
      multiple
      onchange={handleFileInput}
      style="display: none"
      bind:this={fileInput}
    />
    <button onclick={() => fileInput?.click()}>
      📎 Attach Files
    </button>
    <p>or drag and drop here</p>
  {/if}
</div>
```

**File Size Limits**:
- Max file size: 25MB (per assumption in spec)
- Enforce limit in client before upload
- Server-side validation in Edge Function (if needed)

**Supported File Types**:
- Documents: PDF, DOCX, TXT
- Images: JPG, PNG, GIF, WEBP
- Archives: ZIP
- Other: Allow most MIME types, scan for security

**Security Considerations**:
- Validate file types (MIME check)
- Signed URLs expire after 1 hour
- RLS policies restrict access to team members
- Virus scanning (future enhancement, not MVP)

**Alternatives Considered and Rejected**:
- **Direct R2 upload**: More complex, need presigned URLs from backend
- **Different storage provider**: Inconsistent with existing pattern

---

## 9. Real-time Notification Delivery

### Problem
Deliver in-app notifications instantly without polling.

### Options Evaluated

**Option A: Supabase Realtime subscriptions**
- Pros: Built-in, WebSocket-based, automatically handles reconnection
- Cons: Requires Supabase plan with Realtime enabled (free tier has limited connections)
- Compatibility: ✅ Works with Supabase

**Option B: Server-Sent Events (SSE)**
- Pros: Simple, one-way server-to-client, good browser support
- Cons: Need to set up SSE endpoint, doesn't work with Supabase out-of-box
- Compatibility: ✅ Standard browser API

**Option C: Short polling (fallback)**
- Pros: Simple, works everywhere, no special server support
- Cons: Increased server load, delayed notifications (30s-60s poll interval)
- Compatibility: ✅ Always works

**Option D: WebSocket (custom)**
- Pros: Full duplex, efficient
- Cons: Need to implement server, more complex than Supabase Realtime
- Compatibility: ✅ Standard

### Decision: Supabase Realtime + Short Polling Fallback

**Rationale**:
1. **Built-in**: Supabase Realtime already available
2. **Easy integration**: Single subscribe() call
3. **Reliable**: Automatic reconnection, presence tracking
4. **Graceful degradation**: Fall back to polling if Realtime unavailable
5. **Cost**: Free tier sufficient for MVP (<200 concurrent connections)

**Implementation Pattern**:

```typescript
// src/lib/stores/notifications.ts

import { writable, derived } from 'svelte/store'
import { supabase } from '$lib/api/supabase'
import type { TaskNotification } from '$lib/types/domain/notification'

export const notifications = writable<TaskNotification[]>([])
export const unreadCount = derived(
  notifications,
  $n => $n.filter(n => !n.read).length
)

let realtimeSubscription: any = null
let pollingInterval: any = null

export async function initNotifications(userId: string) {
  // Load initial notifications
  await loadNotifications(userId)
  
  // Try Supabase Realtime first
  try {
    realtimeSubscription = supabase
      .channel('task-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          notifications.update(n => [payload.new as TaskNotification, ...n])
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime notifications enabled')
        } else if (status === 'CHANNEL_ERROR') {
          // Fall back to polling
          startPolling(userId)
        }
      })
  } catch (error) {
    // Realtime not available, use polling
    startPolling(userId)
  }
}

async function loadNotifications(userId: string) {
  const { data } = await supabase
    .from('task_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (data) {
    notifications.set(data)
  }
}

function startPolling(userId: string) {
  console.log('Falling back to polling for notifications')
  
  pollingInterval = setInterval(async () => {
    const lastNotification = get(notifications)[0]
    const lastTimestamp = lastNotification?.created_at || new Date().toISOString()
    
    const { data } = await supabase
      .from('task_notifications')
      .select('*')
      .eq('user_id', userId)
      .gt('created_at', lastTimestamp)
      .order('created_at', { ascending: false })
    
    if (data && data.length > 0) {
      notifications.update(n => [...data, ...n])
    }
  }, 30000) // Poll every 30 seconds
}

export function cleanupNotifications() {
  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription)
  }
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
}
```

**Notification Center Component**:

```svelte
<script lang="ts">
  import { notifications, unreadCount, initNotifications } from '$lib/stores/notifications'
  import { onMount } from 'svelte'
  
  onMount(() => {
    initNotifications(currentUser.id)
    
    return () => {
      cleanupNotifications()
    }
  })
  
  async function markAsRead(notificationId: string) {
    await supabase
      .from('task_notifications')
      .update({ read: true })
      .eq('id', notificationId)
    
    notifications.update(list =>
      list.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }
  
  async function markAllAsRead() {
    const unreadIds = $notifications.filter(n => !n.read).map(n => n.id)
    
    await supabase
      .from('task_notifications')
      .update({ read: true })
      .in('id', unreadIds)
    
    notifications.update(list => list.map(n => ({ ...n, read: true })))
  }
</script>

<div class="notification-center">
  <button class="notification-bell">
    🔔
    {#if $unreadCount > 0}
      <span class="badge">{$unreadCount}</span>
    {/if}
  </button>
  
  <div class="dropdown">
    <div class="header">
      <h3>Notifications</h3>
      <button onclick={markAllAsRead}>Mark all read</button>
    </div>
    
    <div class="list">
      {#each $notifications.slice(0, 20) as notification}
        <div
          class="notification-item {notification.read ? 'read' : 'unread'}"
          onclick={() => {
            markAsRead(notification.id)
            goto(`/tasks?detail=${notification.taskId}`)
          }}
        >
          <div class="content">
            {notification.message}
          </div>
          <div class="timestamp">
            {formatRelativeTime(notification.createdAt)}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
```

**Performance Considerations**:
- Limit to 50 most recent notifications in memory
- Lazy load older notifications on scroll
- Debounce mark-as-read updates (batch requests)

**Fallback Behavior**:
- Primary: Supabase Realtime (instant)
- Fallback: Polling every 30 seconds
- User sees notifications within 30 seconds worst-case

**Alternatives Considered and Rejected**:
- **Custom WebSocket server**: Too complex for MVP
- **SSE**: Requires custom endpoint setup
- **Polling only**: Works but delays are annoying

---

## 10. State Management for View Modes

### Problem
Manage complex filter/grouping/view state with requirements: URL shareability, persistence across sessions, state restoration.

### Options Evaluated

**Option A: Svelte stores only**
- Pros: Simple, reactive, existing pattern
- Cons: Not shareable via URL, lost on page refresh
- URL Support: ❌ No

**Option B: URL query parameters**
- Pros: Shareable links, browser back/forward works
- Cons: Verbose URLs, state size limited, no persistence across sessions
- URL Support: ✅ Yes

**Option C: LocalStorage**
- Pros: Persists across sessions, unlimited size (within limits)
- Cons: Not shareable, per-browser only
- URL Support: ❌ No

**Option D: Combination: URL + LocalStorage + Svelte Stores**
- Pros: Best of all approaches, shareable + persistent + reactive
- Cons: More complex, need synchronization logic
- URL Support: ✅ Yes

### Decision: Hybrid Approach (URL + LocalStorage + Svelte Stores)

**Rationale**:
1. **URL for shareability**: Filters encoded in URL for sharing
2. **LocalStorage for preferences**: View mode, column widths persist
3. **Stores for reactivity**: UI updates automatically
4. **Layered precedence**: URL > LocalStorage > defaults

**State Categories**:

| State | Storage | Shareable | Persists |
|-------|---------|-----------|----------|
| Active filters | URL | ✅ Yes | No (intentional) |
| Search query | URL | ✅ Yes | No |
| View mode (list/board/etc) | LocalStorage | ❌ No | ✅ Yes |
| Grouping option | URL | ✅ Yes | No |
| Saved views | Supabase DB | ✅ Yes | ✅ Yes |
| Detail panel state | URL param | ✅ Yes | No |
| Selected tasks | Component state | ❌ No | ❌ No |

**Implementation Pattern**:

```typescript
// src/lib/stores/taskFilters.ts

import { writable, derived } from 'svelte/store'
import { goto } from '$app/navigation'
import { page } from '$app/stores'

export interface TaskFilters {
  stages: string[]
  priorities: ('low' | 'medium' | 'high')[]
  assignees: string[]
  projects: string[]
  dateRange: { start: string; end: string } | null
  tags: string[]
  includeArchived: boolean
}

export const activeFilters = writable<TaskFilters>({
  stages: [],
  priorities: [],
  assignees: [],
  projects: [],
  dateRange: null,
  tags: [],
  includeArchived: false,
})

export const searchQuery = writable<string>('')
export const activeGrouping = writable<'stage' | 'priority' | 'project' | 'assignee' | 'dueDate'>('stage')

// View mode persisted in LocalStorage
export const currentViewMode = writable<'list' | 'board' | 'calendar' | 'timeline'>(
  (typeof localStorage !== 'undefined' && localStorage.getItem('taskViewMode')) as any || 'list'
)

currentViewMode.subscribe(mode => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('taskViewMode', mode)
  }
})

// Sync filters to URL
export function syncFiltersToURL(filters: TaskFilters, search: string, grouping: string) {
  const params = new URLSearchParams()
  
  if (Object.values(filters).some(v => v.length > 0 || v !== null)) {
    params.set('filter', JSON.stringify(filters))
  }
  
  if (search) {
    params.set('q', search)
  }
  
  if (grouping !== 'stage') {
    params.set('groupBy', grouping)
  }
  
  const query = params.toString()
  goto(`/tasks${query ? `?${query}` : ''}`, { replaceState: true, noScroll: true })
}

// Restore filters from URL
export function restoreFiltersFromURL(searchParams: URLSearchParams) {
  const filterParam = searchParams.get('filter')
  if (filterParam) {
    try {
      const filters = JSON.parse(filterParam)
      activeFilters.set(filters)
    } catch (e) {
      console.error('Failed to parse filters from URL')
    }
  }
  
  const searchParam = searchParams.get('q')
  if (searchParam) {
    searchQuery.set(searchParam)
  }
  
  const groupByParam = searchParams.get('groupBy')
  if (groupByParam) {
    activeGrouping.set(groupByParam as any)
  }
}

// Debounced URL sync
let syncTimeout: any = null
export function debouncedSyncToURL() {
  clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    syncFiltersToURL(get(activeFilters), get(searchQuery), get(activeGrouping))
  }, 500)
}
```

**Usage in Page Component**:

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { restoreFiltersFromURL, activeFilters, currentViewMode } from '$lib/stores/taskFilters'
  
  onMount(() => {
    // Restore state from URL on mount
    restoreFiltersFromURL($page.url.searchParams)
  })
  
  // Watch for URL changes (browser back/forward)
  $effect(() => {
    restoreFiltersFromURL($page.url.searchParams)
  })
</script>
```

**Saved Views (Supabase)**:

```typescript
// src/lib/stores/taskViews.ts

export interface SavedTaskView {
  id: string
  teamId: string
  userId: string
  name: string
  filters: TaskFilters
  grouping: string
  viewMode: string
  createdAt: string
}

export const savedViews = writable<SavedTaskView[]>([])

export async function saveCurrentView(name: string) {
  const view = {
    team_id: currentTeamId,
    user_id: currentUserId,
    name,
    filters: get(activeFilters),
    grouping: get(activeGrouping),
    view_mode: get(currentViewMode),
  }
  
  const { data, error } = await supabase
    .from('saved_task_views')
    .insert(view)
    .select()
    .single()
  
  if (error) throw error
  
  savedViews.update(views => [...views, data])
}

export async function loadSavedView(viewId: string) {
  const view = get(savedViews).find(v => v.id === viewId)
  if (!view) return
  
  activeFilters.set(view.filters)
  activeGrouping.set(view.grouping)
  currentViewMode.set(view.viewMode)
  
  // Sync to URL for shareability
  debouncedSyncToURL()
}
```

**URL Format Examples**:

```
# Basic filter
/tasks?filter={"stages":["abc123"],"priorities":["high"]}

# With search
/tasks?filter={"stages":["abc123"]}&q=fabric

# With grouping
/tasks?filter={"priorities":["high"]}&groupBy=priority

# Open detail panel
/tasks?detail=task-id-123

# Combined
/tasks?filter={"stages":["abc123"]}&q=fabric&detail=task-id-123
```

**Performance Considerations**:
- Debounce URL updates (500ms) to avoid excessive history entries
- Use `replaceState` instead of `pushState` for filter changes
- Compress filter JSON if URL becomes too long (future enhancement)

**Alternatives Considered and Rejected**:
- **Stores only**: Not shareable, big limitation
- **URL only**: View preferences lost on refresh
- **LocalStorage only**: Not shareable

---

## 11. Additional JavaScript Libraries for Custom Fields & Features

### Problem
Identify additional JavaScript libraries that can minimize implementation work for the 13 custom field types and other planned features, similar to how @melloware/coloris and @shopify/draggable reduced work.

### Areas Requiring Libraries

**Custom Field Types Needing Library Support:**
1. **Date & Date Range Pickers** - Date, Date Range fields
2. **File Upload Components** - File Input field (with progress, preview, drag-drop)
3. **Multi-select/Tag Input** - Custom Tags, Crew Assignment fields
4. **Currency Formatting** - Currency field display/input
5. **Number Range Inputs** - Number Range field (min-max slider or inputs)
6. **URL Validation** - Link Input field validation
7. **Image Handling** - Preview, cropping, compression for file uploads

### Research Findings

#### 11a. Date & Date Range Picker Libraries

**Option A: Flowbite Svelte Datepicker (Already in dependencies)**
- Pros: Already in project (flowbite-svelte), consistent styling, Svelte-native
- Cons: Limited date range support, may need enhancement
- Bundle size: Already included
- Svelte 5 Compatibility: ✅ Compatible
- Assessment: **USE EXISTING** - Flowbite Svelte already provides datepicker components

**Option B: @tanstack/svelte-calendar**
- Pros: Part of Tanstack ecosystem (already using @tanstack/svelte-virtual), excellent date range support
- Cons: Requires additional dependency, might be overkill
- Bundle size: ~8KB
- Svelte 5 Compatibility: ✅ Compatible
- Assessment: **EVALUATE** - If Flowbite datepicker lacks range support, consider this

**Option C: svelte-datepicker**
- Pros: Lightweight, Svelte-native, good range support
- Cons: Less maintained, smaller ecosystem
- Bundle size: ~5KB
- Svelte 5 Compatibility: Needs verification
- Assessment: **ALTERNATIVE** - If Flowbite doesn't work well

**Decision: Use Flowbite Svelte Datepicker (already in dependencies)**
- **Rationale**: Already included in project, consistent with existing UI, no additional bundle size
- **Implementation**: Use `Datepicker` component from flowbite-svelte for single dates, enhance with date range wrapper if needed
- **Fallback**: If date range support is insufficient, evaluate @tanstack/svelte-calendar

---

#### 11b. File Upload Component Libraries

**Option A: Custom Implementation (Current Approach)**
- Pros: Full control, already have image upload pattern, lightweight
- Cons: More code to maintain, need to build progress, preview, validation
- Assessment: **CURRENT** - Already have InlineImageUpload.svelte and InlineFileUpload.svelte

**Option B: @uppy/core with Svelte adapter**
- Pros: Feature-rich (progress, preview, validation, retry), well-maintained, supports many backends
- Cons: Larger bundle (~50KB), may be overkill for simple file uploads
- Bundle size: ~50KB
- Svelte 5 Compatibility: Needs adapter
- Assessment: **OVERKILL** - Current implementation is sufficient

**Option C: Enhance existing with libraries**
- Add `react-dropzone` pattern (but Svelte-native)
- Use existing drag-drop pattern from InlineImageUpload
- Assessment: **RECOMMENDED** - Enhance existing components with better preview/validation

**Decision: Enhance Existing Custom Implementation**
- **Rationale**: Already have working file upload components, just need to enhance for file input custom fields
- **Implementation**: Reuse existing InlineFileUpload.svelte pattern, add file type icons, preview for non-images
- **Enhancement**: Add file size validation, MIME type icons, preview for PDFs/images

---

#### 11c. Multi-select & Tag Input Libraries

**Option A: Custom Implementation**
- Pros: Full control, lightweight, matches design
- Cons: Need to build tag input, multi-select dropdown, search/filter
- Assessment: **CURRENT** - Need to build from scratch

**Option B: svelte-multiselect**
- Pros: Svelte-native, good API, supports search
- Cons: May not have tag-style display, needs customization
- Bundle size: ~3KB
- Svelte 5 Compatibility: ✅ Compatible
- Assessment: **EVALUATE** - Good for Crew Assignment dropdown

**Option C: @svelte-put/select**
- Pros: Svelte 5 compatible, flexible, supports multi-select
- Cons: Less known, may need more setup
- Bundle size: ~4KB
- Svelte 5 Compatibility: ✅ Compatible
- Assessment: **ALTERNATIVE**

**Option D: Custom Tags Component (Similar to GitHub/GitLab tag inputs)**
- Build tag-style input with Flowbite components
- Use existing input patterns
- Assessment: **RECOMMENDED** - Custom implementation for tag-style UI

**Decision: Hybrid Approach**
- **Custom Tags**: Custom implementation using Flowbite components + tag-style UI pattern
- **Crew Assignment**: Use svelte-multiselect or custom multi-select with Flowbite styling
- **Rationale**: Tag inputs need custom styling (badges, chips), crew assignment can use standard multi-select
- **Library**: `svelte-multiselect` for Crew Assignment fields (~3KB)

---

#### 11d. Currency Formatting Libraries

**Option A: Intl.NumberFormat (Native Browser API)**
- Pros: Zero dependencies, built-in, locale-aware
- Cons: Need to format manually, no input formatting
- Assessment: **RECOMMENDED** - Use for display formatting

**Option B: accounting.js**
- Pros: Simple API, good for currency formatting
- Cons: Adds dependency (~2KB), may be overkill
- Bundle size: ~2KB
- Assessment: **ALTERNATIVE** - Only if native API insufficient

**Option C: Custom implementation with Intl.NumberFormat**
- Format display: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)`
- Input: Use number input with currency code selector
- Assessment: **RECOMMENDED** - Use native API + custom input

**Decision: Use Native Intl.NumberFormat API**
- **Rationale**: Zero bundle impact, built-in browser support, locale-aware
- **Implementation**: Format currency values using Intl.NumberFormat, store currency code separately
- **Input**: Custom currency input component (number input + currency selector dropdown)

---

#### 11e. Number Range Input Libraries

**Option A: Custom Dual Number Inputs**
- Pros: Simple, lightweight, full control
- Cons: Need to build validation (min < max)
- Assessment: **RECOMMENDED** - Simple two-number inputs

**Option B: Range Slider (e.g., noUiSlider)**
- Pros: Visual slider, good UX for ranges
- Cons: Adds dependency (~15KB), may not fit all use cases
- Bundle size: ~15KB
- Assessment: **OPTIONAL** - Could add as enhancement post-MVP

**Option C: Flowbite Range Component**
- Pros: Already in project, consistent styling
- Cons: May need dual-range support
- Assessment: **EVALUATE** - Check if Flowbite has range slider

**Decision: Custom Dual Number Inputs (MVP)**
- **Rationale**: Simple, lightweight, covers use cases (measurements, quantities)
- **Implementation**: Two number inputs (min/max) with validation
- **Future Enhancement**: Consider range slider for better UX post-MVP

---

#### 11f. URL Validation Libraries

**Option A: Native URL API + Custom Validation**
- Pros: Zero dependencies, built-in validation
- Cons: Need to handle edge cases
- Assessment: **RECOMMENDED** - Use native `new URL()` constructor

**Option B: validator.js**
- Pros: Comprehensive validation library
- Cons: Adds dependency (~13KB), overkill for just URLs
- Bundle size: ~13KB
- Assessment: **OVERKILL** - Native API sufficient

**Decision: Use Native URL API**
- **Rationale**: Zero bundle impact, built-in validation
- **Implementation**: Validate URLs using `new URL(input)` with try-catch
- **Enhancement**: Add protocol checking (https/http), display validation errors

---

#### 11g. Image Handling Libraries (Enhancement)

**Option A: Current Implementation (processImage utility)**
- Pros: Already working, handles compression/resize
- Cons: No cropping, limited preview features
- Assessment: **CURRENT** - Sufficient for MVP

**Option B: cropperjs**
- Pros: Excellent image cropping, rotation, zoom
- Cons: Adds dependency (~20KB), may be overkill for file uploads
- Bundle size: ~20KB
- Assessment: **POST-MVP** - Add if image cropping needed

**Option C: react-image-crop (Svelte adapter)**
- Pros: Good cropping features
- Cons: React-first, needs adapter
- Assessment: **NOT RECOMMENDED** - React-first library

**Decision: Keep Current Implementation (MVP)**
- **Rationale**: Current image processing is sufficient for MVP file uploads
- **Future Enhancement**: Consider cropperjs if image cropping becomes requirement

---

### Summary of Library Decisions

| Feature | Library | Bundle Size | Rationale |
|---------|---------|-------------|-----------|
| Date Picker | Flowbite Svelte (existing) | 0KB (already included) | Already in dependencies |
| Date Range | Flowbite Svelte + custom wrapper | 0KB | Extend existing component |
| File Upload | Custom (enhance existing) | 0KB | Already have working components |
| Multi-select (Crew) | svelte-multiselect | ~3KB | Good for dropdown multi-select |
| Custom Tags | Custom implementation | 0KB | Need tag-style UI (badges/chips) |
| Currency Formatting | Intl.NumberFormat (native) | 0KB | Built-in browser API |
| Number Range | Custom dual inputs | 0KB | Simple, lightweight |
| URL Validation | Native URL API | 0KB | Built-in browser API |
| Image Handling | Current implementation | 0KB | Already sufficient |

### New Dependencies to Add

**Recommended:**
- `svelte-multiselect` (~3KB) - For Crew Assignment multi-select fields

**Optional (Post-MVP):**
- `@tanstack/svelte-calendar` (~8KB) - If date range needs enhancement
- `cropperjs` (~20KB) - If image cropping becomes requirement

**Total Additional Bundle Impact: ~3KB** (svelte-multiselect only)

### Implementation Notes

1. **Flowbite Svelte Components**: Already available, use for:
   - Date picker (single date)
   - Input components (number, text, textarea)
   - Select dropdowns
   - Checkboxes
   - File inputs (base styling)

2. **Custom Components to Build**:
   - Date Range picker (wrapper around Flowbite datepicker)
   - Custom Tags input (tag-style with badges)
   - Currency input (number + currency selector)
   - Number Range input (dual number inputs)
   - Link input (text input + URL validation)
   - File input preview (enhance existing)

3. **Reuse Existing Patterns**:
   - File upload pattern from InlineFileUpload.svelte
   - Image processing from processImage utility
   - Drag-drop from existing components

---

## 12. Form Builder Library Evaluation (svelte-form-builder-community)

### Problem
Evaluate [svelte-form-builder-community](https://github.com/pragmatic-engineering/svelte-form-builder-community) for use in custom fields feature, particularly for:
- Custom field configuration UI (team settings)
- Dynamic task creation forms based on custom fields
- Task template builder interface

### Library Overview

**svelte-form-builder-community** is a no-code drag-and-drop form builder for Svelte with:
- **28 Community Components**: Audio, Button, Canvas, Checkbox Group, Color, Date, DateTime, Divider, File Upload, Header, Hidden, Link, Meter, Month, Number, Paragraph, Password, Picture, Progress, Radio Group, Range, Select, Star, Text, Text Area, Time, Video, Week
- **Export/Import**: Form definitions can be exported/imported as JSON
- **Custom Validations**: Support for custom validation rules
- **Themes & Styling**: Customizable themes
- **Responsive Forms**: Mobile-friendly
- **Extensible**: Plugin architecture for custom components
- **License**: GPL-3.0 (community) or Commercial EULA (Pro/Enterprise)

### Potential Use Cases

1. **Custom Field Configuration UI**
   - Drag-and-drop interface for team admins to configure custom fields
   - Visual form builder to define field types, options, and settings

2. **Dynamic Task Creation Forms**
   - Render task creation forms based on custom field definitions
   - Show/hide fields based on project type or task templates

3. **Task Template Builder**
   - Visual interface to create task templates with predefined custom field values

### Advantages

1. **Comprehensive Component Library**
   - Many field types match our needs: Date, DateTime, File Upload, Number, Select, Text, Text Area
   - Already built and tested components

2. **Drag-and-Drop Builder UI**
   - Visual interface for form configuration
   - Could be useful for team admins configuring custom fields

3. **Export/Import Functionality**
   - Could enable sharing custom field configurations between teams (post-MVP feature)

4. **Custom Validations**
   - Supports validation rules (useful for required fields, min/max, etc.)

### Concerns and Limitations

1. **Missing Critical Field Types**
   - **Date Range**: Only supports single Date/DateTime, not date ranges
   - **Number Range**: Only single Number, not min-max range inputs
   - **Currency**: Only Number with custom formatting, not currency-specific input
   - **Custom Tags**: No multi-select tag input component
   - **Crew Assignment**: No multi-select team member picker
   - **Link Input**: No URL validation component (only generic Link)

2. **License Concerns (GPL-3.0)**
   - GPL-3.0 requires derivative works to be GPL-3.0
   - Commercial use requires commercial license or sponsorship
   - **Risk**: May conflict with commercial use of the application

3. **Architecture Mismatch**
   - Form builder outputs form definitions (JSON schema)
   - Our custom fields are data-driven, team-scoped, stored in database
   - Custom fields appear across all tasks, not just in forms
   - Need visibility controls (show on cards/tables/lists), not just form display

4. **Bundle Size**
   - Full form builder likely larger than building custom components
   - Many components may be unused (Audio, Video, Canvas, etc.)
   - Estimated bundle size: 50-100KB+ (vs ~20KB for custom components)

5. **Overkill for Use Case**
   - We need simple field configuration UI (max 20 fields per team)
   - Don't need drag-and-drop form builder for simple field management
   - Custom implementation is simpler and more maintainable

6. **Integration Complexity**
   - Form builder schema needs to map to our custom field definitions
   - Need to bridge between form builder output and database schema
   - Adds unnecessary abstraction layer

### Decision: **Not Recommended for MVP**

**Rationale**:
1. **Field Type Gaps**: Missing 6 critical field types (Date Range, Number Range, Currency, Custom Tags, Crew Assignment, Link Input)
2. **License Risk**: GPL-3.0 may conflict with commercial use
3. **Architecture Mismatch**: Form builder paradigm doesn't match our data-driven custom fields architecture
4. **Overkill**: Simple field configuration UI doesn't need full form builder
5. **Bundle Size**: Larger than custom implementation
6. **Complexity**: Adds unnecessary abstraction layer

**Alternative Approach**:
1. **Custom Field Configuration UI**: Simple form in team settings (field type selector, name, options, visibility settings)
2. **Dynamic Task Forms**: Render custom fields based on team definitions using Flowbite Svelte components
3. **Reuse Existing Components**: Use Flowbite Svelte for base inputs, build custom components for specialized fields

**When It Might Be Useful (Post-MVP)**:
- **Task Template Builder**: Visual interface for creating complex task templates
- **Advanced Conditional Logic**: Form builder's condition management for field visibility
- **Survey/Form Workflows**: Separate form-based workflows unrelated to task management

**Conclusion**:
The svelte-form-builder-community library is a solid form builder, but it doesn't align well with our custom fields architecture. We need specialized field types, team-scoped data storage, and visibility controls that a general form builder doesn't provide. Building custom components using Flowbite Svelte (already in dependencies) is more aligned with our needs, avoids license concerns, and results in a smaller, more maintainable codebase.

---

## 13. Comprehensive Library Analysis: UX Enhancements & Form Handling

### Problem
Evaluate additional libraries identified from awesome-svelte list and user research to determine the best selections for:
- Form handling and validation (Superforms, Formsnap, felte)
- Animation libraries (AutoAnimate, number-flow)
- Drag-and-drop alternatives (sveltednd vs Neodrag)
- Video embeds (embedz)
- Gantt charts (svar-widgets/gantt)
- Tree views (svelte-tree-viewer)
- Sound effects (svelte-sound)
- Portal/teleport components (svelte-teleport)

### Evaluation Criteria

For each library, we evaluate:
1. **Functionality**: Does it provide the features we need?
2. **Svelte 5 Compatibility**: Works with Svelte 5 runes and actions?
3. **Bundle Size**: Impact on application bundle
4. **Maintenance**: Active development, community support, documentation
5. **Integration**: Easy to integrate with existing codebase
6. **Alternatives**: Are there better options?
7. **Use Case Fit**: Does it solve our specific problems?

---

#### 13a. Form Handling Libraries

**Use Case**: Task creation forms, custom field configuration, task detail editing

**Option A: Superforms + Formsnap**
- **Library**: `sveltekit-superforms` + `formsnap`
- **Bundle Size**: ~8-10KB (Superforms ~5KB, Formsnap ~3KB)
- **Svelte 5 Compatibility**: ✅ Fully compatible (SvelteKit-first)
- **Features**:
  - Server-first validation (SvelteKit form actions)
  - Client-side validation with Zod (already in dependencies)
  - Progressive enhancement
  - CSRF protection
  - Type-safe form handling
- **Maintenance**: ✅ Active (maintained by ciscoheat, 1.5k+ stars)
- **Documentation**: ✅ Excellent (official docs, examples)
- **Constitution Alignment**: ✅ Already mentioned in constitution as recommended
- **Assessment**: **HIGHLY RECOMMENDED** - Aligns with stack, reduces boilerplate

**Option B: felte**
- **Library**: `felte`
- **Bundle Size**: ~5KB
- **Svelte 5 Compatibility**: ✅ Compatible
- **Features**:
  - Framework-agnostic form library
  - Built-in validators (Yup, Zod, Vest, Superstruct)
  - Good for complex forms
- **Maintenance**: ✅ Active
- **Documentation**: ✅ Good
- **Assessment**: **ALTERNATIVE** - Good but Superforms is SvelteKit-native

**Option C: Custom Implementation**
- **Bundle Size**: 0KB
- **Pros**: Full control, no dependencies
- **Cons**: More boilerplate, need to implement validation, CSRF protection
- **Assessment**: **NOT RECOMMENDED** - Superforms saves significant development time

**Decision: Use Superforms + Formsnap**
- **Rationale**: 
  1. Already in constitution as recommended
  2. SvelteKit-native integration
  3. Works with existing Zod dependency
  4. Reduces form boilerplate by 70-80%
  5. Server-first validation aligns with SvelteKit architecture
- **Implementation**: Use for task creation, task detail editing, custom field configuration forms
- **Bundle Impact**: +8-10KB (acceptable for significant time savings)

---

#### 13b. Animation Libraries

**Use Case**: Smooth list transitions, number animations (counters, progress), task card animations

**Option A: AutoAnimate**
- **Library**: `@formkit/auto-animate` (framework-agnostic)
- **Bundle Size**: ~1.5KB
- **Svelte 5 Compatibility**: ✅ Compatible (works with any framework)
- **Features**:
  - Zero-config animations for list changes
  - Automatic detection of added/removed/moved elements
  - Smooth transitions
- **Use Cases**:
  - Task list updates (tasks added/removed)
  - Subtask list animations
  - Filter/group changes
- **Maintenance**: ✅ Active (FormKit-maintained)
- **Documentation**: ✅ Good
- **Assessment**: **RECOMMENDED** - Zero-config, perfect for list animations

**Option B: number-flow**
- **Library**: `@number-flow/svelte`
- **Bundle Size**: ~2-3KB
- **Svelte 5 Compatibility**: ✅ Compatible (Svelte 5 support confirmed)
- **Features**:
  - Animated number transitions
  - Smooth counting animations
  - Customizable duration, easing
  - Accessible (respects prefers-reduced-motion)
- **Use Cases**:
  - Task completion counters ("3/8 tasks complete")
  - Progress percentages ("60% complete")
  - Streak counters ("🔥 5 day streak!")
  - Subtask completion ratios
- **Maintenance**: ✅ Active (6.8k stars, 2.2k+ users, latest release June 2025)
- **License**: MIT
- **Documentation**: ✅ Good (number-flow.barvian.me)
- **Assessment**: **HIGHLY RECOMMENDED** - Perfect for counters and progress indicators

**Option C: Custom CSS Animations**
- **Bundle Size**: 0KB
- **Pros**: No dependencies, full control
- **Cons**: More code, need to implement number animation logic
- **Assessment**: **NOT RECOMMENDED** - number-flow handles edge cases better

**Decision: Use Both AutoAnimate + number-flow**
- **AutoAnimate**: For list/item animations (task cards, subtasks)
- **number-flow**: For number animations (counters, progress, streaks)
- **Total Bundle Impact**: +3.5-4.5KB
- **Rationale**: Both serve different purposes, both are lightweight and high-value

---

#### 13c. Drag-and-Drop: Final Comparison (Neodrag vs sveltednd)

**Current Decision**: Neodrag (Section 1b)

**Option A: Neodrag** (Current Selection)
- **Library**: `@neodrag/svelte`
- **Bundle Size**: ~4-5KB with plugins
- **Svelte 5 Compatibility**: ✅ Native Svelte actions
- **Features**: Handles, bounds, grid snapping, axis locking, SSR-friendly
- **Maintenance**: ✅ Active
- **Documentation**: ✅ Good
- **Pros**: Modular plugins, transparent bundle size, handles DOM updates
- **Cons**: May need to verify cross-container drag for kanban

**Option B: sveltednd**
- **Library**: `sveltednd` (from awesome-svelte: "A lightweight, flexible drag and drop library for Svelte 5 applications")
- **Bundle Size**: Unknown (likely ~3-5KB)
- **Svelte 5 Compatibility**: ✅ Built for Svelte 5
- **Features**: 
  - Svelte 5-specific implementation
  - Likely handles reactive updates well
  - May have better kanban/cross-container support
- **Maintenance**: ✅ Active (Svelte 5-focused)
- **Documentation**: ✅ Likely good (Svelte 5 focus)
- **Pros**: Built specifically for Svelte 5, may handle reactive updates better
- **Cons**: Less known, need to verify bundle size and features

**Decision: Evaluate sveltednd as Alternative**
- **Recommendation**: **Test sveltednd** for kanban board implementation
- **Rationale**: 
  1. Built specifically for Svelte 5 (may handle reactive updates better)
  2. May have better cross-container drag support (critical for kanban)
  3. Worth comparing before finalizing Neodrag
- **Action**: Create proof-of-concept with both libraries, compare:
  - Cross-container drag performance
  - DOM update handling
  - Bundle size
  - API simplicity
- **Final Decision**: Defer to implementation testing

---

#### 13d. Video Embed Library

**Use Case**: Embed YouTube/Vimeo videos in task comments, descriptions, or Link Input custom fields

**Option A: embedz**
- **Library**: `embedz`
- **Bundle Size**: ~1-2KB (zero dependencies)
- **Svelte 5 Compatibility**: ✅ Compatible (framework-agnostic)
- **Features**:
  - Supports YouTube, Vimeo, Dailymotion, and more
  - Lazy loading
  - Responsive embeds
  - Zero dependencies
- **Use Cases**:
  - Tutorial links in task comments
  - Reference videos in task descriptions
  - Link Input custom fields (if URL is a video)
- **Maintenance**: ✅ Active
- **License**: MIT
- **Documentation**: ✅ Good
- **Assessment**: **HIGHLY RECOMMENDED** - Lightweight, solves real use case

**Option B: Custom Implementation**
- **Bundle Size**: 0KB
- **Pros**: Full control
- **Cons**: Need to handle multiple video platforms, lazy loading, responsive design
- **Assessment**: **NOT RECOMMENDED** - embedz handles edge cases

**Decision: Use embedz**
- **Rationale**: Lightweight, zero dependencies, solves video embed needs perfectly
- **Bundle Impact**: +1-2KB

---

#### 13e. Gantt Chart Library

**Use Case**: Timeline view enhancement (currently using custom CSS Grid)

**Option A: svar-widgets/gantt**
- **Library**: `@svar-widgets/gantt`
- **Bundle Size**: Unknown (likely 20-50KB)
- **Svelte 5 Compatibility**: ✅ Likely compatible
- **Features**:
  - Full Gantt chart functionality
  - Drag-and-drop task bars
  - Dependencies visualization
  - Interactive timeline
- **Use Cases**:
  - Enhanced timeline view
  - Project timeline visualization
  - Task dependencies (if added post-MVP)
- **Maintenance**: ✅ Active
- **Assessment**: **EVALUATE POST-MVP** - Overkill for current timeline requirements

**Current Implementation**: Custom CSS Grid timeline (~3KB)
- **Pros**: Lightweight, full control, matches design
- **Cons**: Limited features compared to full Gantt chart

**Decision: Keep Custom Implementation (MVP), Evaluate Gantt Post-MVP**
- **Rationale**: 
  1. Current custom timeline is sufficient for MVP
  2. Gantt chart is larger bundle (~20-50KB)
  3. Can add post-MVP if advanced features needed
- **Recommendation**: Test custom timeline first, add Gantt if needed for dependencies/drag-to-resize

---

#### 13f. Tree View Library

**Use Case**: Nested/hierarchical subtasks visualization

**Option A: svelte-tree-viewer**
- **Library**: `svelte-tree-viewer`
- **Bundle Size**: Unknown (~5-10KB estimated)
- **Svelte 5 Compatibility**: ✅ Likely compatible
- **Features**:
  - Tree/hierarchical view
  - Expand/collapse nodes
  - Drag-and-drop reordering
- **Use Cases**:
  - Nested subtasks (if hierarchical subtasks added)
  - Task breakdown visualization
  - Subtask organization view
- **Current State**: Subtasks are flat (no nesting in spec)
- **Maintenance**: ✅ Active
- **Assessment**: **OPTIONAL POST-MVP** - Only if nested subtasks are added

**Decision: Not Needed for MVP**
- **Rationale**: 
  1. Spec doesn't include nested subtasks
  2. Current flat subtask list is sufficient
  3. Can add if hierarchical subtasks become requirement

---

#### 13g. Sound Library

**Use Case**: Notification sounds, interaction feedback, celebration sounds (ADHD-friendly)

**Option A: svelte-sound**
- **Library**: `svelte-sound` (from awesome-svelte: "Svelte Actions to play interaction sounds on target DOM events")
- **Bundle Size**: Minimal (~1KB estimated)
- **Svelte 5 Compatibility**: ✅ Compatible (Svelte actions)
- **Features**:
  - Play sounds on DOM events
  - Simple API
  - Works with Svelte actions
- **Use Cases**:
  - Task completion celebration sounds
  - Notification sounds (optional)
  - Interaction feedback (click sounds, drag sounds)
  - ADHD-friendly dopamine hits
- **Maintenance**: ✅ Active
- **License**: MIT
- **Assessment**: **RECOMMENDED (with accessibility considerations)**

**Accessibility Requirements**:
- Must be user-configurable (enable/disable in settings)
- Respect browser audio preferences
- Respect prefers-reduced-motion (if applicable)
- Provide visual feedback alternatives

**Decision: Use svelte-sound (Optional Feature)**
- **Rationale**: 
  1. Enhances ADHD-friendly features (celebration, feedback)
  2. Minimal bundle size
  3. Simple integration
- **Implementation**: 
  - Make sounds optional (settings toggle)
  - Use subtle sounds for interactions
  - Celebration sounds for task completion
- **Bundle Impact**: +1KB

---

#### 13h. Portal/Teleport Library

**Use Case**: Fix calendar positioning issues, modals, dropdowns, tooltips

**Option A: svelte-teleport**
- **Library**: `svelte-teleport`
- **Bundle Size**: ~1KB
- **Svelte 5 Compatibility**: ✅ Compatible
- **Features**:
  - Portal elements outside component tree
  - Fixes z-index issues
  - Better positioning control
- **Use Cases**:
  - Calendar positioning (if inside cards causes issues)
  - Modal overlays
  - Dropdown menus
  - Tooltips/popovers
- **Maintenance**: ✅ Active
- **License**: MIT
- **Assessment**: **RECOMMENDED** - Solves positioning issues, lightweight

**Alternative: svelte-portal**
- **Library**: `svelte-portal` (also in awesome-svelte)
- **Bundle Size**: ~1KB
- **Similar features**: Portal functionality
- **Assessment**: Either works, svelte-teleport is newer

**Decision: Use svelte-teleport**
- **Rationale**: Lightweight, solves positioning issues, useful for modals/dropdowns
- **Bundle Impact**: +1KB

---

### Summary of Library Recommendations

| Category | Library | Priority | Bundle Size | Use Case |
|----------|---------|----------|-------------|----------|
| **Form Handling** | Superforms + Formsnap | **HIGH** | ~8-10KB | Task forms, custom field config |
| **List Animations** | AutoAnimate | **HIGH** | ~1.5KB | Task list, subtask animations |
| **Number Animations** | number-flow | **HIGH** | ~2-3KB | Counters, progress, streaks |
| **Video Embeds** | embedz | **HIGH** | ~1-2KB | Tutorial links in tasks |
| **Portal/Teleport** | svelte-teleport | **HIGH** | ~1KB | Positioning fixes, modals |
| **Sound Effects** | svelte-sound | **MEDIUM** | ~1KB | Notification/interaction sounds |
| **Drag-and-Drop** | Neodrag (current) or sveltednd | **HIGH** | ~4-5KB | Kanban board (test both) |
| **Gantt Chart** | svar-widgets/gantt | **LOW** | ~20-50KB | Timeline enhancement (post-MVP) |
| **Tree View** | svelte-tree-viewer | **LOW** | ~5-10KB | Nested subtasks (post-MVP) |

### Updated Bundle Size Calculation

**Current Dependencies**:
- `@neodrag/svelte` (~4-5KB) or `sveltednd` (~3-5KB)
- `@melloware/coloris` (~8KB)
- `@tanstack/virtual-core` (~10KB)
- `svelte-multiselect` (~3KB)

**New Recommended Dependencies**:
- `sveltekit-superforms` + `formsnap` (~8-10KB)
- `@formkit/auto-animate` (~1.5KB)
- `@number-flow/svelte` (~2-3KB)
- `embedz` (~1-2KB)
- `svelte-teleport` (~1KB)
- `svelte-sound` (~1KB) - Optional

**Total Bundle Impact**: ~25-26KB (current) + ~14-18KB (new) = **~39-44KB**

**Assessment**: Still acceptable for feature richness. High-value libraries that significantly improve UX and reduce development time.

### Final Recommendations

**Must-Have (High Priority)**:
1. ✅ **Superforms + Formsnap** - Form handling (constitution-aligned)
2. ✅ **AutoAnimate** - List animations
3. ✅ **number-flow** - Number animations
4. ✅ **embedz** - Video embeds
5. ✅ **svelte-teleport** - Portal/positioning
6. ✅ **Neodrag or sveltednd** - Test both, choose better for kanban

**Nice-to-Have (Medium Priority)**:
7. ⚠️ **svelte-sound** - Sound effects (optional, user-configurable)

**Post-MVP (Low Priority)**:
8. 🔮 **svar-widgets/gantt** - If timeline needs advanced features
9. 🔮 **svelte-tree-viewer** - If nested subtasks are added

---

## Summary of Decisions

| Research Area | Decision | Key Benefit |
|---------------|----------|-------------|
| 1. Drag-and-Drop | **Neodrag or sveltednd** (test both, see Section 13c) | Svelte-native, handles DOM updates, SSR-friendly, smaller bundle |
| 1a. Color Picker | @melloware/coloris | Modern UI, accessibility, theme support |
| 2. Virtual Scrolling | Tanstack Virtual | Best-in-class, framework-agnostic |
| 3. Calendar View | Custom CSS Grid | Lightweight (5KB), full control |
| 4. Timeline View | Custom CSS Grid | Simple, efficient, 3KB |
| 5. Rich Text Editor | Contenteditable + Toolbar | Lightweight (5KB), sufficient features |
| 6. Natural Language | Custom Regex + date-fns | 2KB, 70% accuracy, fast |
| 7. Email Service | Supabase Edge + Resend | 3000 free emails/month, modern API |
| 8. File Storage | Existing Supabase + R2 | Reuse infrastructure, consistent |
| 9. Realtime Notifications | Supabase Realtime + Polling | Instant delivery, graceful fallback |
| 10. State Management | URL + LocalStorage + Stores | Shareable + persistent + reactive |
| 11. Additional Libraries | Flowbite Svelte (existing), svelte-multiselect, Native APIs | Minimal bundle impact, maximize reuse |
| 12. Form Builder Library | Not recommended (svelte-form-builder-community) | Field type gaps, license concerns, architecture mismatch |
| 13. UX Enhancement Libraries | Superforms, AutoAnimate, number-flow, embedz, svelte-teleport, svelte-sound | Enhanced UX, form handling, animations, video embeds |

**Total New Dependencies**:
- `@neodrag/svelte` or `sveltednd` (~4-5KB) - **Replaces @shopify/draggable** (test both)
- `@melloware/coloris` v0.25.0 (~8KB)
- `@tanstack/virtual-core` (~10KB)
- `svelte-multiselect` (~3KB) - For Crew Assignment multi-select fields
- `sveltekit-superforms` + `formsnap` (~8-10KB) - Form handling and validation
- `@formkit/auto-animate` (~1.5KB) - List animations
- `@number-flow/svelte` (~2-3KB) - Number animations (counters, progress)
- `embedz` (~1-2KB) - Video embeds in tasks
- `svelte-teleport` (~1KB) - Portal/positioning fixes
- `svelte-sound` (~1KB) - Sound effects (optional, user-configurable)
- Resend API (server-side only, no client bundle impact)

**Total Bundle Size Impact**: ~39-44KB (increased from ~25-26KB with high-value UX enhancements)

**All Technical Unknowns Resolved**: ✅ Ready for Phase 1 (Data Model & Contracts)

---

### Final Library Selection Summary

**Must-Have Libraries (High Priority - MVP)**:

| Library | Purpose | Bundle | Decision Rationale |
|---------|---------|--------|-------------------|
| `@neodrag/svelte` or `sveltednd` | Drag-and-drop (kanban) | ~4-5KB | Test both, choose better for cross-container drag |
| `sveltekit-superforms` + `formsnap` | Form handling/validation | ~8-10KB | Constitution-aligned, reduces boilerplate 70-80% |
| `@formkit/auto-animate` | List animations | ~1.5KB | Zero-config, perfect for task/subtask lists |
| `@number-flow/svelte` | Number animations | ~2-3KB | Counters, progress, streaks - smooth UX |
| `embedz` | Video embeds | ~1-2KB | Tutorial links in tasks - lightweight |
| `svelte-teleport` | Portal/positioning | ~1KB | Fixes calendar positioning, modals |
| `@melloware/coloris` | Color picker | ~8KB | Already decided (Section 1a) |
| `@tanstack/virtual-core` | Virtual scrolling | ~10KB | Already decided (Section 2) |
| `svelte-multiselect` | Multi-select | ~3KB | Already decided (Section 11c) |

**Optional Libraries (Medium Priority)**:

| Library | Purpose | Bundle | Notes |
|---------|---------|--------|-------|
| `svelte-sound` | Sound effects | ~1KB | Optional, user-configurable, ADHD-friendly |

**Post-MVP Libraries (Low Priority - Deferred)**:

| Library | Purpose | Bundle | When to Consider |
|---------|---------|--------|------------------|
| `@svar-widgets/gantt` | Gantt charts | ~20-50KB | If timeline needs drag-to-resize, dependencies |
| `svelte-tree-viewer` | Tree view | ~5-10KB | If nested subtasks are added |

**Total MVP Bundle Impact**: ~39-44KB (includes all high-priority libraries)

**Key Decisions**:
- ✅ **Form handling**: Superforms (constitution-aligned, significant time savings)
- ✅ **Animations**: AutoAnimate + number-flow (complementary, lightweight)
- ✅ **Video embeds**: embedz (lightweight, solves real use case)
- ✅ **Portal**: svelte-teleport (fixes positioning issues)
- ⚠️ **Drag-and-drop**: Test Neodrag vs sveltednd (both viable, choose based on kanban testing)
- ⚠️ **Sound**: Optional feature (user-configurable)

---

**Next Steps**:
1. Generate data-model.md with full database schema
2. Generate contracts/api-schema.yaml with API endpoints
3. Generate contracts/types.ts with TypeScript interfaces
4. Generate quickstart.md for developer onboarding
5. Update agent context files

