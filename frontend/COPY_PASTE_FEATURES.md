# Element Manipulation Features

## Overview
Implemented Figma/Canva-style element manipulation with keyboard shortcuts, visual controls, and comprehensive undo/redo functionality.

## Features

### 1. Undo/Redo (NEW)
- **Undo (Ctrl+Z / Cmd+Z)**: Revert to previous state
- **Redo (Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y)**: Restore undone changes
- Tracks up to 50 history states
- Works for all operations: element add/update/delete, page changes, document settings
- Visual buttons in toolbar (disabled when unavailable)
- Preserves page size, orientation, and all document properties

### 2. Copy Element (Ctrl+C / Cmd+C)
- Copies the currently selected element to clipboard
- Stores element data with source zone and page information
- Works across header, footer, and content zones

### 2. Paste Element (Ctrl+V / Cmd+V)
- Pastes copied element to current page/zone
- Automatically generates new unique ID
- Maintains exact position from copied element
- Paste button appears in properties panel when clipboard has data (animated)
- Automatically selects the newly pasted element

### 3. Duplicate Element (Ctrl+D / Cmd+D)
- Combines copy + paste in one action
- Creates duplicate on same page/zone as original
- Maintains exact position (elements will overlap)
- Automatically selects the new duplicate

### 5. Delete Element (Delete / Backspace)
- Keyboard shortcut for quick deletion
- Also available via button in properties panel

## UI Controls

### Toolbar Header
**Undo/Redo Buttons:**
- ↶ **Undo** - Reverts last change (grayed when at start of history)
- ↷ **Redo** - Restores undone change (grayed when at end of history)

### Properties Panel Header
When an element is selected, the panel header shows:

**Left Side - Action Buttons:**
- 📋 Copy - Copies element to clipboard
- 📑 Duplicate - Creates immediate duplicate
- 📥 Paste - Only visible when clipboard has data (green, animated)

**Right Side:**
- 🗑️ Delete - Removes selected element

**Bottom:**
- Element ID (truncated) for reference

## Cross-Page Support
- Copy element on page 1
- Navigate to page 2
- Paste element (Ctrl+V) → appears on page 2
- Works across all zones (header, footer, content)

## Technical Details

### Clipboard Structure
```javascript
{
  element: { ...elementData },
  sourceZone: 'header' | 'footer' | 'content',
  sourcePageIndex: number | null
}
```

### ID Generation
New elements get unique IDs: `${type}-${timestamp}-${random9chars}`

### Position Behavior
Duplicates/pastes maintain exact X and Y coordinates from the original element
Undo | Ctrl+Z | Cmd+Z | Undo last change |
| Redo | Ctrl+Shift+Z / Ctrl+Y | Cmd+Shift+Z / Cmd+Y | Redo undone change |
| 
## Keyboard Shortcuts

| Shortcut | Windows | Mac | Action |
|----------|---------|-----|--------|
| Copy | Ctrl+C | Cmd+C | Copy selected element |
| Paste | Ctrl+V | Cmd+V | Paste from clipboard |
| Duplicate | Ctrl+D | Cmd+D | Duplicate selected element |
| Delete | Delete/Backspace | Delete/Backspace | Remove selected element |

## UUndo a mistake
1. Make a change (e.g., delete an element)
2. Press `Ctrl+Z` or click "Undo" button
3. Element is restored to previous state

### Redo after undo
1. Undo a change with `Ctrl+Z`
2. Press `Ctrl+Shift+Z` or `Ctrl+Y` or click "Redo" button
3. Change is reapplied

### sage Examples

### Duplicate element on same page
1. Select element
2. Press `Ctrl+D` or click "Duplicate" button
3. New element appears at exact same position (will overlap)

### Copy element to another page
1. Select element on page 1
2. Press `Ctrl+C` or click "Copy" button
3. Navigate to page 2
4. Press `Ctrl+V` or click "Paste" button
5. Element appears on page 2 at exact same coordinates
Undo/Redo buttons disabled (grayed) when unavailable
- History limited to 50 states to optimize performance
- Selected element highlighted with blue border
- Action tooltips show keyboard shortcuts

## History Management
- **Max History**: 50 states (oldest automatically removed)
- **Tracked Operations**:
  - Element creation (text, table, image, line)
  - Element updates (position, style, content)
  - Element deletion
  - Page addition/removal
  - Zone height changes
  - Page size/orientation changes
- **Not Tracked**: Zoom, grid visibility, selection changes
- **State Preservation**: All undo/redo operations preserve page size, orientation, and document structure
1. Select element in header zone
2. Press `Ctrl+C`
3. Click in content zone to make it active
4. Press `Ctrl+V`
5. Element appears in content zone

## Visual Feedback
- Green animated "Paste" button appears when clipboard has data
- Selected element highlighted with blue border
- Action tooltips show keyboard shortcuts
