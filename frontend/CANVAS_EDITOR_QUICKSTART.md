# Canvas Editor - Quick Start Guide

## Getting Started

### 1. Access the Canvas Editor

From any syllabus card in the syllabus list:
- Click the purple **Canvas** button
- The editor opens in fullscreen mode

### 2. First Look

When the editor opens, you'll see:
- **Top Toolbar**: Page settings, zoom controls, save/cancel buttons
- **Left Sidebar**: Zone selector (Header/Content/Footer) and tools
- **Center Canvas**: Your document with visible zones
- **Right Panel**: Properties editor (appears when element is selected)

## Basic Workflow

### Creating a Custom Header

1. **Select the Header Zone**
   - Click the "Header" button in the left sidebar
   - The header zone highlights in blue on the canvas

2. **Add a Title**
   - Click the Text tool (T) in the left sidebar
   - A new text element appears: "Double click to edit"
   - Double-click the text to edit it
   - Type: "Advanced Programming Course"

3. **Style the Title**
   - Select the text element (click it once)
   - In the right panel, adjust:
     - Font Family: Arial
     - Font Size: 32
     - Font Weight: Bold
     - Color: #1f2937 (dark gray)
     - Alignment: Center
   
4. **Position the Title**
   - Drag the text to the center of the header
   - Or use X/Y inputs in the right panel for precise positioning
   - Example: X: 500, Y: 45

### Creating a Footer with Page Numbers

1. **Select the Footer Zone**
   - Click "Footer" in the left sidebar

2. **Add Page Number**
   - Click the Text tool (T)
   - Double-click and type: "Page {page}"
   - Style it:
     - Font Size: 12
     - Color: #6b7280 (gray)
     - Alignment: Right
   - Position at right side: X: 1100, Y: 30

3. **Add Copyright Info**
   - Add another text element
   - Type: "© 2026 University Name"
   - Style:
     - Font Size: 10
     - Color: #9ca3af
     - Alignment: Left
   - Position at left: X: 40, Y: 40

### Adding a Course Schedule Table

1. **Select the Content Zone**
   - Click "Content" in the left sidebar

2. **Insert a Table**
   - Click the Table tool (⊞)
   - A 3×3 table appears

3. **Configure Table Structure**
   - In the right panel:
     - Click "+" next to Rows until you have 5 rows
     - Keep 3 columns
   - Adjust dimensions:
     - Cell Width: 250
     - Cell Height: 50

4. **Edit Table Content**
   - Click "Edit Cell" section in right panel
   - Select Row 1, Cell 0:
     - Content: "Week"
     - Font Size: 14
     - Alignment: Center
     - Background: #e5e7eb
   - Select Row 1, Cell 1:
     - Content: "Topic"
   - Select Row 1, Cell 2:
     - Content: "Reading"
   - Continue for remaining cells

5. **Style the Table**
   - Border Width: 2
   - Border Color: #000000
   - Adjust cell backgrounds as needed

### Page Size & Orientation

**Change Page Size:**
1. Click the page size dropdown in top toolbar
2. Select from: Long Bond, Legal, Letter, A4
3. Canvas updates immediately

**Change Orientation:**
1. Click the orientation dropdown
2. Currently: Landscape (portrait coming soon)

**Zoom In/Out:**
1. Use + and - buttons in top toolbar
2. Or use the percentage dropdown
3. Range: 25% to 200%

## Advanced Techniques

### Precise Element Positioning

**Using the Grid Method:**
1. Estimate canvas dimensions
   - Long Bond Landscape: 1248 × 816 px
2. Calculate center: Width / 2 = 624px
3. Enter exact X position: 624
4. For vertical center: Height / 2 = 408px

**Alignment Shortcuts:**
- Left align at X: 40
- Right align at X: (canvas width - element width - 40)
- Top of header: Y: 20
- Bottom of footer: Y: 60

### Multi-Element Layouts

**Creating a Three-Column Header:**

1. Add three text elements
2. Position them:
   - Left: X: 40, Y: 50
   - Center: X: 500, Y: 50, Align: center
   - Right: X: 1100, Y: 50, Align: right

**Creating a Data Table:**

1. Insert table with rows = data count + 1
2. Style first row as header (bold, gray background)
3. Alternate row backgrounds for readability:
   - Even rows: #ffffff
   - Odd rows: #f9fafb

### Working with Colors

**Color Schemes:**

Professional Blue:
- Primary: #2563eb
- Dark: #1e40af
- Light: #3b82f6

Academic Green:
- Primary: #059669
- Dark: #047857
- Light: #10b981

Neutral Grays:
- Very Dark: #1f2937
- Dark: #4b5563
- Medium: #6b7280
- Light: #9ca3af
- Very Light: #e5e7eb

**Using the Color Picker:**
1. Click the color square in right panel
2. Choose from picker
3. Or enter hex code directly: #2563eb

### Typography Best Practices

**Header Text:**
- Title: 28-36px, Bold
- Subtitle: 18-24px, Semi-Bold
- Details: 14-16px, Normal

**Body Text:**
- Main content: 14-16px
- Captions: 12px
- Fine print: 10px

**Font Pairing:**
- Formal: Times New Roman (headers) + Georgia (body)
- Modern: Helvetica (headers) + Arial (body)
- Classic: Arial (all)

## Common Tasks

### Task: Create a Professional Letterhead

1. **Header Setup:**
   - Height: 150px
   - Background: #f8f9fa
   
2. **University Logo Area (placeholder text):**
   - Text: "[LOGO]"
   - Font Size: 48
   - Position: X: 40, Y: 50
   
3. **Institution Name:**
   - Text: "University of Technology"
   - Font: Arial, 24px, Bold
   - Position: X: 150, Y: 50
   
4. **Department:**
   - Text: "Department of Computer Science"
   - Font: Arial, 16px
   - Color: #6b7280
   - Position: X: 150, Y: 90

### Task: Add a Weekly Schedule Table

1. **Table Dimensions:**
   - Rows: 16 (1 header + 15 weeks)
   - Columns: 4 (Week, Date, Topic, Assignment)
   
2. **Header Row:**
   - Background: #1f2937
   - Text Color: #ffffff
   - Font Weight: Bold
   
3. **Content Cells:**
   - Font Size: 12
   - Alternate backgrounds: white and light gray
   - Left alignment for text columns
   - Center alignment for week numbers

### Task: Design a Footer with Multiple Elements

1. **Left Section:**
   - Institution name (10px)
   - Course code (10px)
   
2. **Center Section:**
   - Semester and year (10px)
   
3. **Right Section:**
   - Page number template: "Page {page}"
   - Date: "Printed: {date}"

## Keyboard Shortcuts (Future Feature)

Coming soon:
- Delete: Remove selected element
- Ctrl+Z: Undo
- Ctrl+Y: Redo
- Ctrl+D: Duplicate element
- Arrow keys: Move element 1px
- Shift+Arrow: Move element 10px

## Troubleshooting Tips

### Element Disappeared
- Check if it's outside the canvas bounds
- Use X/Y inputs to bring it back: X: 100, Y: 100
- Zoom out to see more of the canvas

### Can't Select Element
- Ensure you're clicking directly on the element
- Try clicking the text/table content
- Check if another element is overlapping

### Text Not Editing
- Double-click (not single-click) to edit
- Click outside the text to exit edit mode
- Save changes by clicking elsewhere

### Drag Not Working
- Click and hold, then drag
- Don't double-click while dragging
- Release mouse to complete drag

### Table Cells Too Small
- Use Cell Width/Height controls in right panel
- Minimum recommended: Width 100px, Height 30px
- Adjust borders if they're taking too much space

## Tips & Tricks

1. **Start with Structure**: Set up zones and major elements first, style later
2. **Use Consistent Spacing**: Maintain 40px margins from edges
3. **Test Zoom Levels**: View at 50%, 100%, and 150% to ensure readability
4. **Save Often**: Click save periodically to avoid losing work
5. **Preview Before Saving**: Check all three zones before final save
6. **Mobile Note**: Canvas editor works best on desktop (1280px+ screen width)

## Need Help?

- Check the [CANVAS_EDITOR_README.md](./CANVAS_EDITOR_README.md) for full documentation
- Contact support for technical issues
- Report bugs via the issue tracker

---

**Happy Designing! 🎨**
