# Canvas Editor - Feature Documentation

## Overview

The Canvas Editor is a powerful document editing tool similar to Figma, designed specifically for customizing syllabus headers and footers with precise control over layout, typography, and tables.

## Features

### 📄 Page Management
- **Multiple Page Sizes:**
  - Long Bond (default): 816×1248 px (portrait), 1248×816 px (landscape)
  - Legal: 816×1344 px (portrait), 1344×816 px (landscape)
  - Letter: 816×1056 px (portrait), 1056×816 px (landscape)
  - A4: 794×1123 px (portrait), 1123×794 px (landscape)

- **Orientation Support:**
  - Landscape (default)
  - Portrait (coming soon)

- **Zoom Controls:**
  - Range: 25% to 200%
  - Quick increment/decrement buttons

### 🎨 Document Zones

The canvas is divided into three editable zones:

1. **Header Zone** (default height: 120px)
   - Top section of the document
   - Configurable background color
   - Perfect for course titles, logos, and institutional branding

2. **Content Zone** (flexible height)
   - Main body area between header and footer
   - Ideal for primary syllabus content

3. **Footer Zone** (default height: 80px)
   - Bottom section of the document
   - Great for page numbers, dates, and disclaimers

### ✏️ Text Elements

Add and style text with comprehensive controls:

**Typography Controls:**
- Font Families: Arial, Times New Roman, Courier New, Georgia, Verdana, Helvetica, Calibri, Comic Sans MS, Impact
- Font Sizes: 8px to 72px (slider + number input)
- Font Weights: Thin (100) to Black (900)
- Text Color: Color picker with hex input
- Alignment: Left, Center, Right, Justify
- Width: Adjustable element width (50-1000px)

**Editing Features:**
- Double-click to edit text inline
- Drag and drop positioning
- Real-time preview
- Precise X/Y positioning controls

### 📊 Table Elements

Create and customize tables with full control:

**Table Structure:**
- Dynamic rows and columns (add/remove)
- Minimum 1×1, no maximum limit
- Customizable cell dimensions

**Table Styling:**
- Cell width and height controls
- Border width (0-10px)
- Border color customization
- Individual cell background colors
- Per-cell text formatting

**Cell Editing:**
- Edit content directly
- Per-cell font size
- Per-cell text alignment (left, center, right)
- First row auto-styled as header (bold + gray background)

### 🛠️ Toolbar

**Zone Selector:**
- Quick zone switching with visual indicators
- Active zone highlighted in blue
- Zone names: Header, Content, Footer

**Tools:**
- Text Tool (T): Add new text elements
- Table Tool (⊞): Insert new tables

### 🎯 Selection & Manipulation

**Element Selection:**
- Click to select any element
- Blue ring indicates selection
- Delete button appears when element is selected

**Drag & Drop:**
- Click and drag elements to reposition
- Real-time position updates
- Snap-free positioning for pixel-perfect placement

**Properties Panel:**
- Opens automatically on element selection
- Context-sensitive (shows text or table controls)
- Right sidebar with scrollable content

## Usage Guide

### Opening the Canvas Editor

1. Navigate to the Syllabi section
2. Click the **Canvas** button (purple) on any syllabus card
3. The editor opens in fullscreen mode

### Adding Text

1. Select a zone (Header, Content, or Footer)
2. Click the **Text Tool** (T) in the left toolbar
3. A new text element appears with default content "Double click to edit"
4. Double-click the text to edit inline
5. Use the right panel to style the text

### Adding Tables

1. Select a zone
2. Click the **Table Tool** (⊞) in the left toolbar
3. A 3×3 table appears with default styling
4. Use the right panel to:
   - Add/remove rows and columns
   - Adjust cell dimensions
   - Edit cell content and styling
   - Change borders and colors

### Styling Elements

**For Text:**
1. Select the text element
2. Right panel displays text properties
3. Adjust font, size, color, alignment, etc.
4. Changes apply instantly

**For Tables:**
1. Select the table element
2. Right panel displays table properties
3. Modify structure, dimensions, borders
4. Click individual cells to edit content and style

### Positioning Elements

**Drag & Drop:**
- Click and hold the element
- Drag to desired position
- Release to place

**Precise Positioning:**
- Select the element
- Use X/Y inputs in the properties panel
- Enter exact pixel values

### Saving Changes

1. Click **Save** in the top toolbar
2. Changes are saved to the syllabus record
3. Editor closes automatically
4. Updated syllabus appears in the list

### Canceling Changes

1. Click **Cancel** in the top toolbar
2. All changes are discarded
3. Editor closes without saving

## Component Architecture

### Main Components

**CanvasEditor.jsx** (Main Container)
- Manages document state
- Handles page size/orientation
- Coordinates all child components
- Saves document to backend

**CanvasToolbar.jsx** (Left Sidebar)
- Zone selection UI
- Tool buttons (Text, Table)
- Visual tool indicators

**CanvasPage.jsx** (Canvas Area)
- Renders the document
- Handles element dragging
- Manages inline text editing
- Displays zone boundaries

**TextStylePanel.jsx** (Right Sidebar - Text)
- Font family selector
- Size and weight controls
- Color picker
- Alignment buttons
- Position inputs

**TableEditor.jsx** (Right Sidebar - Tables)
- Row/column management
- Cell dimension controls
- Border styling
- Cell-level editing
- Background colors

### Data Structure

```javascript
{
  header: {
    height: 120,
    elements: [
      {
        id: 'unique-id',
        type: 'text',
        content: 'Text content',
        x: 40,
        y: 30,
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        color: '#1f2937',
        align: 'left',
        width: 200
      }
    ]
  },
  footer: {
    height: 80,
    elements: [...]
  },
  content: {
    elements: [...]
  },
  styles: {
    defaultFont: 'Arial',
    defaultSize: 14,
    headerBg: '#f8f9fa',
    footerBg: '#f8f9fa'
  }
}
```

## Future Enhancements

### Planned Features

1. **More Page Sizes**
   - Custom page dimensions
   - Additional standard sizes (A3, Tabloid, etc.)

2. **Portrait Orientation**
   - Full portrait mode support
   - Auto-rotation of elements

3. **Additional Elements**
   - Images/logos
   - Shapes (rectangles, circles, lines)
   - Icons from icon libraries
   - QR codes

4. **Advanced Styling**
   - Text shadows
   - Gradients
   - Opacity controls
   - Transform/rotate elements

5. **Template System**
   - Save custom templates
   - Template library
   - One-click template application

6. **Collaboration Features**
   - Multi-user editing
   - Comments and annotations
   - Version history

7. **Export Options**
   - PDF export with canvas design
   - PNG/JPG image export
   - HTML export

8. **Accessibility**
   - Keyboard shortcuts
   - Screen reader support
   - High contrast mode

## Integration with Syllabus System

The Canvas Editor integrates seamlessly with the existing syllabus workflow:

1. **Auto-initialization**: Opens with syllabus data pre-populated in header/footer
2. **Persistent Storage**: Canvas document saved to MongoDB via syllabus API
3. **Field Mapping**: 
   - Header: Course title, course code
   - Footer: Department, semester, year, page numbers

## Technical Requirements

- React 18+
- Tailwind CSS for styling
- lucide-react for icons (Palette icon)
- Modern browser with ES6+ support

## Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

## Performance Considerations

- Optimized drag & drop with RAF (Request Animation Frame)
- Efficient re-renders using React state management
- Minimal DOM manipulations
- Zoom implemented with CSS transforms for smooth scaling

## Troubleshooting

### Element not appearing
- Ensure a zone is selected before adding elements
- Check element position (might be off-screen)
- Verify element is in the correct zone

### Drag & drop not working
- Click directly on the element (not the background)
- Release mouse button to complete the drag
- Check browser console for errors

### Styling not applying
- Ensure element is selected
- Check property panel for current values
- Verify color hex codes are valid (#000000 format)

### Save not working
- Check network tab for API errors
- Ensure syllabus ID is valid
- Verify backend is running

## Support

For issues or feature requests, please contact the development team or file an issue in the project repository.
