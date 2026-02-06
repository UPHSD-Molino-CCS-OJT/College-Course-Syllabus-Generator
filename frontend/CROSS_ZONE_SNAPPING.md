# Cross-Zone Snapping Implementation

## Overview

The canvas editor now supports **cross-zone element snapping**, allowing elements to snap relative to other elements across different zones (header, content, footer). This enhancement makes it easy to align elements vertically across page sections.

## What's New

### Cross-Zone Snapping Features

Previously, elements could only snap to other elements within the same zone. Now:

- ✅ **Header elements** can snap to content and footer elements
- ✅ **Content elements** can snap to header and footer elements  
- ✅ **Footer elements** can snap to header and content elements

### Visual Indicators

When snapping to elements in different zones, the snap guide labels indicate which zone the target element is in:
- `"Align Left (header)"` - Aligning with a header element
- `"Center (content)"` - Centering with a content element
- `"Adjacent (footer)"` - Adjacent to a footer element

## Technical Implementation

### Coordinate System Challenge

Each zone has its own coordinate system:
- **Header**: Y coordinates from 0 to `headerHeight`
- **Content**: Y coordinates from 0 to `contentHeight`  
- **Footer**: Y coordinates from 0 to `footerHeight`

To enable cross-zone snapping, we need to compare elements in **absolute page coordinates**.

### New Functions

#### `getAllElementsWithAbsoluteCoords(document, currentPage)`

Retrieves all elements from all zones and converts their coordinates to absolute page positions:

```javascript
// Header elements - already at top (Y = 0 to headerHeight)
headerElements: Y remains the same

// Content elements - below header
contentElements: Y = element.y + headerHeight

// Footer elements - at bottom of page
footerElements: Y = element.y + headerHeight + contentHeight
```

#### `zoneToAbsoluteCoords(x, y, zone, document, pageSize)`

Converts zone-relative coordinates to absolute page coordinates:

```javascript
// Example: Content element at (100, 50)
// With headerHeight = 120
// Absolute position = (100, 170)
```

#### `absoluteToZoneCoords(x, y, zone, document, pageSize)`

Converts absolute page coordinates back to zone-relative coordinates:

```javascript
// Example: Absolute position (100, 170)
// Converting to content zone with headerHeight = 120
// Zone-relative position = (100, 50)
```

#### `getElementBoundsAbsolute(element)`

Calculates element bounds using absolute coordinates:

```javascript
{
  left: absoluteX,
  right: absoluteX + width,
  top: absoluteY,
  bottom: absoluteY + height,
  centerX: absoluteX + width / 2,
  centerY: absoluteY + height / 2
}
```

#### `calculateSnapCrossZone(draggedElement, newX, newY, zone, allElementsAbsolute, document, pageSize, threshold)`

Main snapping function that:
1. Converts dragged element position to absolute coordinates
2. Compares against all elements (all zones) in absolute coordinates
3. Finds snap points across all zones
4. Converts final snapped position back to zone-relative coordinates

## Usage Example

When dragging an element in the content zone:

```javascript
// Get all elements with absolute coordinates
const allElementsAbsolute = getAllElementsWithAbsoluteCoords(document, currentPage);

// Calculate snapping (automatically handles cross-zone)
const snapResult = calculateSnapCrossZone(
  element,
  newX,
  newY,
  'content', // Current zone
  allElementsAbsolute,
  document,
  pageSize
);

// Result coordinates are zone-relative (ready to use)
element.x = snapResult.x;
element.y = snapResult.y;
```

## Snap Guide Visualization

Guides now display across the entire page height, making cross-zone alignments visible:

### Vertical Guides (X-axis alignment)
- Span from top to bottom of page
- Label shows alignment type and source zone if different

### Horizontal Guides (Y-axis alignment)
- Span from left to right of page
- Label shows alignment type and source zone if different

## Examples

### Example 1: Content Element Aligning with Header

```
┌─────────────────────────────────┐
│ HEADER                          │
│   [Logo]  ← Element at x=100   │
│           ↓                     │
├─────────────────────────────────┤
│ CONTENT                         │
│   [Text]  ← Dragging at x=98   │
│           ↓ SNAPS to x=100      │
│   Blue guide shows:             │
│   "Align Left (header)"         │
└─────────────────────────────────┘
```

### Example 2: Header Element Aligning with Footer

```
┌─────────────────────────────────┐
│ HEADER                          │
│         [Title] ← Dragging      │
│           ↓ x=398               │
├─────────────────────────────────┤
│ CONTENT                         │
│                                 │
├─────────────────────────────────┤
│ FOOTER                          │
│         [Page #] at x=400       │
│           ↑                     │
│   SNAPS to x=400                │
│   "Center (footer)"             │
└─────────────────────────────────┘
```

### Example 3: Vertical Center Alignment Across Zones

```
┌─────────────────────────────────┐
│ HEADER                          │
│   [Logo: centerY=60]            │
├─────────────────────────────────┤
│ CONTENT                         │
│   [Text] ← Dragging             │
│   Absolute centerY=58           │
│   SNAPS to centerY=60           │
│   "Center (header)"             │
└─────────────────────────────────┘
```

## Performance Considerations

### Optimizations
- Only active during dragging operations
- Coordinate conversions are simple arithmetic (no overhead)
- No additional DOM queries needed

### Comparison with Single-Zone Snapping
- **Single-zone**: Checks ~10-50 elements (same zone only)
- **Cross-zone**: Checks ~30-150 elements (all zones)
- Impact: Negligible (modern browsers handle easily)

## Backward Compatibility

The original `calculateSnap()` function remains available for use cases that don't need cross-zone snapping. The new `calculateSnapCrossZone()` is a superset that:

- ✅ Includes all single-zone snapping features
- ✅ Adds cross-zone alignment capability
- ✅ Maintains same snap threshold behavior
- ✅ Returns same data structure

## Testing

### Test Cross-Zone Snapping

1. **Header to Content Alignment**
   - Create text element in header at x=100
   - Create text element in content
   - Drag content element near x=100
   - Verify: Snaps to x=100, guide shows "Align Left (header)"

2. **Content to Footer Alignment**
   - Create image in footer centered at x=400
   - Create text in content  
   - Drag text near x=400
   - Verify: Snaps to center, guide shows "Center (footer)"

3. **Footer to Header Alignment**
   - Create table in header with right edge at x=750
   - Create line in footer
   - Drag line near x=750
   - Verify: Snaps to x=750, guide shows "Align Right (header)"

4. **Multiple Zone Snapping**
   - Create elements in all three zones
   - Drag element in content zone
   - Verify: Can snap to both header and footer elements
   - Verify: Closest snap point is chosen

5. **Vertical Center Across Zones**
   - Create header element with centerY at absolute position 60
   - Drag content element near that vertical position
   - Verify: Snaps to align centers vertically
   - Verify: Guide shows "Center (header)"

### Edge Cases

1. **Zone Boundaries**
   - Elements stay within their zone boundaries
   - Can snap to elements outside zone but won't cross boundary

2. **Overlapping Zones**
   - N/A - zones don't overlap by design

3. **Empty Zones**
   - Works correctly even if some zones are empty
   - Only snaps to zones that have elements

## Troubleshooting

### Snapping Not Working Across Zones

**Check:**
1. Verify `getAllElementsWithAbsoluteCoords()` is being called
2. Ensure `calculateSnapCrossZone()` is used (not `calculateSnap()`)
3. Check console for coordinate conversion errors

### Incorrect Snap Positions

**Check:**
1. Header height is correctly set
2. Footer height is correctly set
3. Zone offsets are calculating properly
4. Absolute to zone conversion is working

### Guides Appearing in Wrong Location

**Check:**
1. Guide coordinates use absolute positioning
2. Page container positioning is correct
3. Zoom factor is applied consistently

### Performance Issues

**Solutions:**
1. Limit elements per zone (recommended: <50)
2. Increase snap threshold to reduce calculations
3. Add distance-based filtering (only check nearby elements)

## Future Enhancements

1. **Smart Cross-Zone Snapping**
   - Prioritize same-zone snaps over cross-zone
   - Weight snapping based on distance

2. **Zone-Specific Snap Settings**
   - Enable/disable cross-zone snapping per zone
   - Different thresholds for different zones

3. **Visual Zone Indicators**
   - Highlight target zone when snapping cross-zone
   - Show zone boundaries during drag

4. **Multi-Page Cross-Snapping**
   - Snap elements across different pages
   - Maintain alignment consistency

## API Reference

### `getAllElementsWithAbsoluteCoords(document, currentPage)`

**Returns:** Array of elements with added properties:
```javascript
[{
  ...element,
  absoluteX: Number,  // X in page coordinates
  absoluteY: Number,  // Y in page coordinates  
  zone: 'header' | 'content' | 'footer'
}]
```

### `calculateSnapCrossZone(draggedElement, newX, newY, zone, allElementsAbsolute, document, pageSize, threshold)`

**Parameters:**
- `draggedElement`: Element being dragged
- `newX`: Proposed X position (zone-relative)
- `newY`: Proposed Y position (zone-relative)
- `zone`: Current zone ('header', 'content', 'footer')
- `allElementsAbsolute`: All elements with absolute coords
- `document`: Document structure
- `pageSize`: Page dimensions
- `threshold`: Snap distance (default: 8px)

**Returns:**
```javascript
{
  x: Number,        // Snapped X (zone-relative)
  y: Number,        // Snapped Y (zone-relative)
  guides: [{        // Visual guides
    type: 'vertical' | 'horizontal',
    x?: Number,     // Absolute X for vertical guides
    y?: Number,     // Absolute Y for horizontal guides
    label: String,  // e.g., "Align Left (header)"
    elementId?: String
  }]
}
```

## Summary

Cross-zone snapping enhances the canvas editor by:

✅ Enabling alignment across header, content, and footer zones
✅ Maintaining visual consistency across page sections
✅ Providing clear feedback about cross-zone alignments
✅ Working seamlessly with existing single-zone snapping
✅ No performance impact or breaking changes

This feature makes it much easier to create professionally aligned documents where elements need to line up vertically across different page sections.
