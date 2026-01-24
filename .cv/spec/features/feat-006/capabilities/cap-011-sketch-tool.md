# CAP-011: Enhanced Sketch Tool (Image Annotation)

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Medium  
**Checkpoint:** CP-004 (Progress Tracking & Comparison)

## Intent

Enable prop makers and cosplayers to import reference images and annotate them with drawings, arrows, notes, and measurements directly on the canvas, supporting design iteration and construction planning.

## Functional Requirements

1. **Sketch Node Creation**
   - Canvas context menu → "Create Sketch"
   - Import image: File upload or URL
   - Supported formats: JPG, PNG, WebP, SVG
   - Max size: 10MB (client-side warning), 20MB (hard limit)
   - Image stored in Supabase Storage

2. **Drawing Tools**
   - Pencil: Freehand drawing (various sizes)
   - Pen: Smooth bezier curves
   - Line: Straight lines with arrows (optional)
   - Rectangle: Outlined or filled
   - Circle/Ellipse: Outlined or filled
   - Text: Click to place text labels
   - Eraser: Erase strokes/shapes

3. **Tool Properties**
   - Color picker: Standard colors + custom hex
   - Stroke width: 1-20px
   - Opacity: 0-100%
   - Fill: None, Solid, or semi-transparent
   - Arrow heads: None, Start, End, Both

4. **Annotation Layers**
   - Base layer: Original image (locked, can be hidden)
   - Annotation layer: All drawings/notes (editable)
   - Layer opacity control
   - Toggle layer visibility (show/hide annotations)

5. **Notes & Measurements**
   - Text tool: Click to place note
   - Measurement tool: Draw line, auto-calculate length (pixels)
   - Unit conversion: Pixels to cm/inches (if scale set)
   - Scale reference: "This line = X cm" to calibrate

6. **Sketch Display**
   - Node shows image with annotations overlayed
   - Thumbnail view: Shows full sketch (annotations visible)
   - Click to open full editor (modal or dedicated view)
   - Annotations saved as vector data (SVG paths)

7. **Export Options**
   - Export as PNG (with annotations baked in)
   - Export annotations as separate SVG layer
   - Export with/without original image

## Data Model

### Database Schema
```sql
-- Add to moodboard_nodes table
ALTER TABLE moodboard_nodes ADD COLUMN sketch_data JSONB DEFAULT NULL;

-- Sketch data structure
-- {
--   "image_url": "storage/sketches/uuid.jpg",
--   "image_width": 1920,
--   "image_height": 1080,
--   "annotations": [...], // SVG paths and shapes
--   "scale": { "reference_pixels": 100, "real_units": 10, "unit": "cm" }
-- }
```

### Type Definitions
```typescript
interface SketchNode extends BaseMoodboardNode {
  node_type: 'sketch';
  sketch_data: {
    image_url: string; // Supabase Storage URL
    image_width: number;
    image_height: number;
    annotations: SketchAnnotation[];
    scale?: ScaleReference;
  };
}

interface SketchAnnotation {
  id: string;
  type: 'path' | 'line' | 'rect' | 'circle' | 'text';
  data: PathData | LineData | RectData | CircleData | TextData;
  style: {
    color: string;
    stroke_width: number;
    opacity: number;
    fill?: string;
  };
  created_at: string;
}

interface PathData {
  points: { x: number; y: number }[]; // For freehand
  svg_path?: string; // For bezier curves
}

interface LineData {
  start: { x: number; y: number };
  end: { x: number; y: number };
  arrow_start: boolean;
  arrow_end: boolean;
}

interface TextData {
  position: { x: number; y: number };
  text: string;
  font_size: number;
}

interface ScaleReference {
  reference_pixels: number; // Length in pixels
  real_units: number; // Length in real units
  unit: 'cm' | 'in' | 'mm';
}
```

## UI/UX Requirements

1. **Sketch Editor Layout**
   - Desktop: Full-screen modal with toolbar
   - Mobile: Full-screen view with bottom toolbar
   - Toolbar: Tool buttons, color picker, stroke size, undo/redo
   - Canvas: Image with annotation overlay
   - Zoom/pan controls: Mouse wheel or pinch gesture

2. **Toolbar Design**
   - Tool selector: Icon buttons (pencil, pen, line, rect, circle, text, eraser)
   - Active tool: Highlighted
   - Properties panel: Expands below toolbar (color, size, opacity)
   - Undo/redo: Ctrl+Z / Ctrl+Y
   - Save/Cancel buttons

3. **Drawing Interactions**
   - Pencil: Click-drag to draw freehand
   - Line: Click start, click end (show preview line)
   - Rectangle: Click-drag to size
   - Circle: Click-drag to size
   - Text: Click to place, type text, click outside to finish
   - Eraser: Click-drag to erase strokes

4. **Touch Gestures (Mobile/Tablet)**
   - Single finger: Draw
   - Two fingers: Pan/zoom
   - Apple Pencil support: Pressure-sensitive stroke width

5. **Annotation Display on Node**
   - Thumbnail: Shows image with annotations (static)
   - Hover: "Edit" button appears
   - Click: Opens full editor

## Components

### Reuse from Registry
- `ui/dialog.svelte` - Sketch editor modal
- `ui/button.svelte` - Tool buttons
- `ui/slider.svelte` - Stroke size, opacity
- `ui/input.svelte` - Text tool input

### New Components Required
- `moodboard/nodes/SketchNode.svelte` - Sketch node display
- `moodboard/SketchEditor.svelte` - Full sketch editor
- `moodboard/SketchToolbar.svelte` - Drawing tools toolbar
- `moodboard/SketchCanvas.svelte` - Canvas with annotation layer
- `moodboard/ColorPicker.svelte` - Color selection

## Edge Cases

1. **Large Image (>5000px)**: Scale down for display, maintain original resolution for export
2. **Many Annotations (>500)**: Virtualize or warn about performance
3. **Undo History (>100 actions)**: Limit to 100, warn if exceeded
4. **Image Upload Failure**: Show error, allow retry
5. **Unsaved Changes**: Warn on close if unsaved annotations
6. **Corrupted Image**: Show placeholder "Image could not be loaded"
7. **Mobile Storage**: Warn if device storage low before upload
8. **Scale Not Set**: Measurement tool shows pixels only, prompt to set scale

## Performance Considerations

- Canvas rendering: Use HTML Canvas API for smooth drawing
- Annotations: Store as vector data (scalable, small file size)
- Image optimization: Compress uploads to WebP (reduce storage)
- Lazy-load: Load image only when editor opened
- Undo/redo: Implement efficient command pattern (avoid cloning entire state)
- Throttle drawing: Capture points at 60fps max (reduce data)

## Security Considerations

- File upload validation: Check MIME type (not just extension)
- Image scanning: Malware scan on upload (Supabase function)
- Storage permissions: User can only access own images
- File size limits: Enforce 20MB hard limit
- SVG sanitization: If SVG upload, sanitize to prevent XSS

## Testing Strategy

**Unit Tests:**
- Annotation data structure validation
- SVG path generation from points
- Scale calculation (pixels to real units)
- Undo/redo command history

**Integration Tests:**
- Upload image → stored in Supabase
- Draw annotation → saved to sketch_data
- Undo annotation → state restored
- Export PNG → image with annotations

**E2E Tests:**
- User creates sketch, uploads image
- User draws line, adds text annotation
- User sets scale reference, measures distance
- User exports PNG with annotations

## Success Metrics

- Image upload time < 3s (2MB image)
- Drawing latency < 16ms (60fps)
- Annotation save time < 500ms
- Export generation time < 2s (1920x1080)

## Dependencies

- **Requires:** Supabase Storage, Canvas API (HTML5)
- **Required By:** CAP-012 (Compare Nodes can compare sketches)
- **Related:** Base node system

## Open Questions

1. **Collaborative Editing**: Multiple users annotating same image? → Phase 2 (real-time sync complex)
2. **Layers**: Multiple annotation layers? → Phase 2 (start with single layer)
3. **3D Models**: Support 3D model annotation? → Phase 2 (requires Three.js)

## References

- Council Decision 6: "so for annotation, i can see having a sketch tool where you import an image and then have tools to draw on top of it and beside it for notes"
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Sketch interactions)
