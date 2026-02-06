# Canvas Element Snapping Feature

## Overview

The canvas editor now includes intelligent element snapping functionality that helps users align elements precisely. Elements will automatically snap to alignment guides when being dragged near other elements or page boundaries.

## Features

### 1. **Element-to-Element Snapping**

When dragging an element, it will snap to other elements based on:

- **Edge Alignment**
  - Left edge to left edge
  - Right edge to right edge
  - Top edge to top edge
  - Bottom edge to bottom edge

- **Center Alignment**
  - Horizontal center to horizontal center
  - Vertical center to vertical center

- **Adjacent Positioning**
  - Left edge to right edge (side-by-side)
  - Right edge to left edge (side-by-side)
  - Top edge to bottom edge (stacked)
  - Bottom edge to top edge (stacked)

### 2. **Container/Page Boundary Snapping**

Elements snap to page and zone boundaries:

- **Edges**
  - Left edge of page/zone
  - Right edge of page/zone
  - Top edge of zone
  - Bottom edge of zone

- **Centers**
  - Horizontal center of page/zone
  - Vertical center of zone

### 3. **Visual Snap Guides**

When an element snaps to an alignment point, visual guides appear:

- **Blue vertical lines** for horizontal alignment (X-axis)
- **Blue horizontal lines** for vertical alignment (Y-axis)
- **Labels** showing the type of alignment (e.g., "Align Left", "Center", "Edge Adjacent")

### 4. **Zone-Aware Snapping**

Snapping works independently within each zone:

- **Header Zone**: Elements snap relative to other header elements and header boundaries
- **Content Zone**: Elements snap relative to other content elements and content area boundaries
- **Footer Zone**: Elements snap relative to other footer elements and footer boundaries

## Technical Implementation

### Files Modified

1. **`frontend/src/utils/snapping.js`** (New)
   - Core snapping calculation logic
   - Element bounds calculation for all element types
   - Snap point detection algorithms
   - Configurable snap threshold

2. **`frontend/src/components/CanvasPage.jsx`** (Modified)
   - Integrated snapping into drag handlers
   - Added snap guide state and rendering
   - Real-time visual feedback during dragging

### Key Functions

#### `calculateSnap(draggedElement, newX, newY, otherElements, containerWidth, containerHeight, threshold)`

Main snapping calculation function that:
- Compares dragged element position against all other elements
- Checks container boundaries
- Returns snapped coordinates and guide information
- Default snap threshold: 8 pixels

#### `getElementBounds(element)`

Calculates accurate bounds for any element type:
- Text elements
- Image elements
- Table elements (with dynamic cell sizing)
- Line elements

#### `getAllElementsInZone(document, currentPage, zone)`

Retrieves all elements from the specified zone for comparison.

#### `getZoneDimensions(document, pageSize, zone)`

Gets container dimensions for boundary calculations.

## Configuration

### Snap Threshold

The snap threshold (distance at which snapping occurs) can be adjusted in `snapping.js`:

```javascript
const SNAP_THRESHOLD = 8; // pixels
```

Default is 8 pixels, which provides a good balance between precision and ease of use.

### Disabling Snapping

To temporarily disable snapping while dragging, you could:

1. Hold a modifier key (future enhancement)
2. Modify the `SNAP_THRESHOLD` to 0
3. Comment out the snapping calculation in `CanvasPage.jsx`

## User Experience

### How It Works

1. **Select an element** by clicking on it
2. **Click the drag handle** (blue circle icon) or click and drag the element
3. **Move the element** - as you drag near other elements or boundaries:
   - Blue guide lines appear showing alignment points
   - The element "snaps" to the nearest alignment point
   - A label indicates the type of alignment
4. **Release** to place the element at the snapped position

### Visual Feedback

- **Blue guide lines**: Indicate active snap alignment
- **Labels**: Show alignment type (e.g., "Align Left", "Center Align")
- **Smooth snapping**: Elements smoothly transition to snap points
- **Multi-axis snapping**: Can snap horizontally and vertically simultaneously

## Element Type Support

All element types are fully supported:

- ✅ **Text elements** - accurate bounds based on font size and width
- ✅ **Image elements** - based on image dimensions
- ✅ **Table elements** - calculated from rows/columns and cell dimensions
- ✅ **Line elements** - based on line width and stroke width

## Future Enhancements

Potential improvements for the snapping system:

1. **Modifier Keys**
   - Hold `Shift` to disable snapping temporarily
   - Hold `Alt` for more precise (tighter threshold) snapping

2. **Smart Spacing**
   - Detect equal spacing between elements
   - Snap to maintain consistent gaps

3. **Distribution Guides**
   - Evenly distribute selected elements
   - Align multiple elements at once

4. **Snap to Grid**
   - Optional grid overlay
   - Snap elements to grid intersections

5. **Rotation Snapping**
   - Snap to common angles (0°, 45°, 90°, etc.)

6. **Dimension Matching**
   - Snap to make elements same width/height

7. **Margin/Padding Guides**
   - Snap with consistent margins from edges
   - Maintain padding between elements

8. **Snap Preferences**
   - User-configurable snap threshold
   - Enable/disable specific snap types
   - Customize guide colors

## Troubleshooting

### Snapping Not Working

1. Check console for errors in `snapping.js`
2. Verify element has proper x, y coordinates
3. Ensure zoom is being applied correctly
4. Check that `snapGuides` state is updating

### Performance Issues

If snapping causes lag with many elements:

1. Reduce snap threshold for fewer calculations
2. Limit number of other elements checked
3. Add debouncing to mousemove events
4. Cache element bounds calculations

### Incorrect Snap Positions

1. Verify element bounds calculation in `getElementBounds()`
2. Check zone dimension calculations
3. Ensure zoom factor is applied consistently
4. Validate container dimensions for each zone

## Testing

To test the snapping feature:

1. **Create multiple elements** in the canvas
2. **Drag elements** near each other to verify edge and center snapping
3. **Test each zone** (header, content, footer) independently
4. **Try different element types** (text, images, tables, lines)
5. **Test page boundaries** by dragging to edges
6. **Verify visual guides** appear and disappear correctly
7. **Check zoom levels** to ensure snapping works at different scales

## Code Example

Basic usage in a custom component:

```javascript
import { calculateSnap, getElementBounds } from '../utils/snapping';

// During drag operation
const snapResult = calculateSnap(
  draggedElement,
  newX,
  newY,
  otherElements,
  containerWidth,
  containerHeight
);

// Apply snapped position
element.x = snapResult.x;
element.y = snapResult.y;

// Show visual guides
setSnapGuides(snapResult.guides);
```

## API Reference

### `calculateSnap(draggedElement, newX, newY, otherElements, containerWidth, containerHeight, threshold = 8)`

**Parameters:**
- `draggedElement` (Object): The element being dragged
- `newX` (Number): Proposed X position
- `newY` (Number): Proposed Y position
- `otherElements` (Array): Other elements to snap against
- `containerWidth` (Number): Width of the container/zone
- `containerHeight` (Number): Height of the container/zone
- `threshold` (Number, optional): Snap distance threshold in pixels

**Returns:**
```javascript
{
  x: Number,        // Snapped X position
  y: Number,        // Snapped Y position
  guides: [         // Visual guide information
    {
      type: 'vertical' | 'horizontal',
      x?: Number,   // For vertical guides
      y?: Number,   // For horizontal guides
      label: String,
      elementId?: String
    }
  ]
}
```

### `getElementBounds(element)`

**Parameters:**
- `element` (Object): Element with type, position, and dimensions

**Returns:**
```javascript
{
  left: Number,
  right: Number,
  top: Number,
  bottom: Number,
  centerX: Number,
  centerY: Number,
  width: Number,
  height: Number
}
```

## Accessibility

The snapping feature enhances accessibility by:

- Making precise alignment easier without fine motor control
- Providing visual feedback for alignment
- Reducing trial-and-error positioning
- Supporting keyboard shortcuts (future enhancement)

## Performance Considerations

- Snapping calculations occur only during active dragging
- Optimized to check only elements in the current zone
- Guide rendering is minimal (CSS-based lines)
- No performance impact when not dragging

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari

## License

This feature is part of the College Course Syllabus Generator project and follows the same license.
