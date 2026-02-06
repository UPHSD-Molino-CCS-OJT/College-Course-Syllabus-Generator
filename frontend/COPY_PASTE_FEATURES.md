# Copy/Paste/Duplicate Features

## Overview
Implemented Figma/Canva-style element manipulation with keyboard shortcuts and visual controls.

## Features

### 1. Copy Element (Ctrl+C / Cmd+C)
- Copies the currently selected element to clipboard
- Stores element data with source zone and page information
- Works across header, footer, and content zones

### 2. Paste Element (Ctrl+V / Cmd+V)
- Pastes copied element to current page/zone
- Automatically generates new unique ID
- Applies 20px offset to avoid overlap with original
- Paste button appears in properties panel when clipboard has data (animated)
- Automatically selects the newly pasted element

### 3. Duplicate Element (Ctrl+D / Cmd+D)
- Combines copy + paste in one action
- Creates duplicate on same page/zone as original
- Applies 20px offset for visibility
- Automatically selects the new duplicate

### 4. Delete Element (Delete / Backspace)
- Keyboard shortcut for quick deletion
- Also available via button in properties panel

## UI Controls

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

### Position Offset
Duplicates/pastes appear at `original + 20px` in both X and Y directions

## Keyboard Shortcuts

| Shortcut | Windows | Mac | Action |
|----------|---------|-----|--------|
| Copy | Ctrl+C | Cmd+C | Copy selected element |
| Paste | Ctrl+V | Cmd+V | Paste from clipboard |
| Duplicate | Ctrl+D | Cmd+D | Duplicate selected element |
| Delete | Delete/Backspace | Delete/Backspace | Remove selected element |

## Usage Examples

### Duplicate element on same page
1. Select element
2. Press `Ctrl+D` or click "Duplicate" button
3. New element appears offset by 20px

### Copy element to another page
1. Select element on page 1
2. Press `Ctrl+C` or click "Copy" button
3. Navigate to page 2
4. Press `Ctrl+V` or click "Paste" button
5. Element appears on page 2 at offset position

### Copy from header to content
1. Select element in header zone
2. Press `Ctrl+C`
3. Click in content zone to make it active
4. Press `Ctrl+V`
5. Element appears in content zone

## Visual Feedback
- Green animated "Paste" button appears when clipboard has data
- Selected element highlighted with blue border
- Action tooltips show keyboard shortcuts
