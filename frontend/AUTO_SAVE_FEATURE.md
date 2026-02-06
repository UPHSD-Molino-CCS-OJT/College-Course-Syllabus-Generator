# Auto-Save Feature Documentation

## Overview

The auto-save functionality automatically saves changes made to templates and syllabi, preventing data loss and reducing the need for manual save actions. This feature uses a debounced approach to optimize API calls while providing real-time feedback.

## Features

### 1. **Automatic Saving**
- Changes are automatically saved after a configurable delay
- Debounced to avoid excessive API requests
- Only saves when required fields are present

### 2. **Visual Feedback**
- Real-time status indicator shows save state
- Clear visual cues for saving, saved, and error states
- Timestamp shows when content was last saved

### 3. **User Control**
- Toggle auto-save on/off with checkbox
- Manual save option available
- Graceful handling of save failures

### 4. **Smart Saving**
- Only saves when data actually changes
- Validates required fields before saving
- Prevents duplicate save operations

## Components

### Custom Hook: `useAutoSave`

Located in: `frontend/src/utils/useAutoSave.js`

#### Parameters

```javascript
useAutoSave(saveFunction, data, options)
```

- **`saveFunction`** (Function): Async function that performs the save operation
- **`data`** (Any): The data to be saved
- **`options`** (Object):
  - `delay` (Number): Milliseconds to wait before saving (default: 2000)
  - `enabled` (Boolean): Whether auto-save is active (default: true)
  - `shouldSave` (Function): Function to determine if save should occur

#### Return Values

```javascript
{
  saveStatus: 'idle' | 'saving' | 'saved' | 'error',
  lastSaved: Date | null,
  error: String | null,
  manualSave: Function,
  resetStatus: Function,
  isSaving: Boolean
}
```

### Visual Component: `AutoSaveIndicator`

Displays the current save status with appropriate icon and message.

#### Props

```javascript
<AutoSaveIndicator 
  saveStatus={saveStatus} 
  lastSaved={lastSaved} 
  error={error} 
/>
```

## Implementation

### Template Form Auto-Save

**Location**: `frontend/src/components/TemplateForm.jsx`

```javascript
// Auto-save setup
const autoSaveFunction = useCallback(async (data) => {
  if (editTemplate && editTemplate._id) {
    await templateAPI.updateTemplate(editTemplate._id, data);
  }
}, [editTemplate]);

const { saveStatus, lastSaved, error: autoSaveError } = useAutoSave(
  autoSaveFunction,
  formData,
  {
    delay: 2000,
    enabled: autoSaveEnabled,
    shouldSave: (data) => !!data.name && !!editTemplate?._id
  }
);
```

**Features**:
- ✅ Only enabled when editing existing templates
- ✅ 2-second delay after last change
- ✅ Requires template name to be filled
- ✅ User can toggle on/off

### Syllabus Form Auto-Save

**Location**: `frontend/src/components/SyllabusForm.jsx`

```javascript
// Auto-save setup
const autoSaveFunction = useCallback(async (data) => {
  if (editSyllabus && editSyllabus._id) {
    await syllabusAPI.updateSyllabus(editSyllabus._id, data);
  }
}, [editSyllabus]);

const { saveStatus, lastSaved, error: autoSaveError } = useAutoSave(
  autoSaveFunction,
  formData,
  {
    delay: 3000,
    enabled: autoSaveEnabled,
    shouldSave: (data) => !!data.courseCode && !!data.courseTitle && !!editSyllabus?._id
  }
);
```

**Features**:
- ✅ Only enabled when editing existing syllabi
- ✅ 3-second delay (more data than templates)
- ✅ Requires course code and title
- ✅ User can toggle on/off

### Canvas Editor Auto-Save

**Location**: `frontend/src/components/CanvasEditor.jsx`

```javascript
// Auto-save setup
const autoSaveFunction = useCallback(async () => {
  if (onSave && template) {
    onSave({
      ...template,
      canvasDocument: canvasDocument,
      pageSize,
      orientation
    });
  }
}, [onSave, template, canvasDocument, pageSize, orientation]);

const { saveStatus, lastSaved, error: autoSaveError } = useAutoSave(
  autoSaveFunction,
  { canvasDocument, pageSize, orientation },
  {
    delay: 2000,
    enabled: autoSaveEnabled && !!template
  }
);
```

**Features**:
- ✅ Auto-saves canvas document changes
- ✅ Tracks page size and orientation
- ✅ 2-second delay after modifications
- ✅ Visual indicator in toolbar

## User Experience

### Status Indicators

#### Idle State
No indicator shown (or very subtle)

#### Saving State
```
🔄 Saving...
```
- Blue spinning icon
- "Saving..." text in blue

#### Saved State
```
✓ Saved 5s ago
```
- Green checkmark
- Timestamp showing recency
- Automatically hides after 3 seconds

#### Error State
```
⚠ Save failed
```
- Red warning icon
- Error message displayed
- Persists until next save attempt

### Time Format

- **< 10 seconds**: "just now"
- **< 60 seconds**: "Xs ago" (e.g., "23s ago")
- **< 60 minutes**: "Xm ago" (e.g., "5m ago")
- **< 24 hours**: "Xh ago" (e.g., "2h ago")
- **> 24 hours**: Full date (e.g., "2/6/2026")

## Configuration

### Adjusting Delay Times

Change the `delay` parameter in `useAutoSave`:

```javascript
// Shorter delay (1 second)
{ delay: 1000 }

// Longer delay (5 seconds)
{ delay: 5000 }
```

### Enabling/Disabling by Default

```javascript
const [autoSaveEnabled, setAutoSaveEnabled] = useState(true); // Enabled
const [autoSaveEnabled, setAutoSaveEnabled] = useState(false); // Disabled
```

### Custom Save Conditions

```javascript
shouldSave: (data) => {
  // Custom validation logic
  return data.someField && data.anotherField && someOtherCondition;
}
```

## Technical Details

### Debouncing Mechanism

The hook uses a timeout-based debouncing approach:

1. User makes a change
2. Timer starts (e.g., 2 seconds)
3. If another change occurs, timer resets
4. When timer completes, save is triggered
5. While saving, new changes queue up

### Preventing Duplicate Saves

- `isSavingRef` tracks if save is in progress
- New saves blocked while current save is active
- Data comparison checks if content actually changed

### Memory Management

- Cleanup functions clear timers on unmount
- `mountedRef` prevents state updates after unmount
- References properly cleaned up in useEffect returns

### Error Handling

```javascript
try {
  await saveFunction(data);
  setSaveStatus('saved');
} catch (err) {
  setSaveStatus('error');
  setError(err.message);
  console.error('Auto-save error:', err);
}
```

## Best Practices

### 1. **Only Enable for Edits**

Auto-save should only be active when editing existing records:

```javascript
const [autoSaveEnabled, setAutoSaveEnabled] = useState(!!editTemplate);
```

### 2. **Validate Before Saving**

Always validate required fields:

```javascript
shouldSave: (data) => {
  return !!data.requiredField1 && !!data.requiredField2;
}
```

### 3. **Provide User Control**

Let users disable auto-save if desired:

```jsx
<label>
  <input
    type="checkbox"
    checked={autoSaveEnabled}
    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
  />
  Auto-save
</label>
```

### 4. **Show Clear Feedback**

Always display the save status:

```jsx
<AutoSaveIndicator 
  saveStatus={saveStatus} 
  lastSaved={lastSaved} 
  error={autoSaveError} 
/>
```

### 5. **Optimize Delay Times**

- **Small forms**: 1-2 seconds
- **Medium forms**: 2-3 seconds
- **Large forms/canvas**: 3-5 seconds

## Troubleshooting

### Auto-Save Not Triggering

**Check**:
1. `enabled` prop is true
2. `shouldSave` function returns true
3. Data is actually changing (not same object)
4. No errors in console
5. Save function is properly defined

### Save Keeps Failing

**Check**:
1. Network connectivity
2. API endpoint is working
3. Authentication is valid
4. Data format matches API expectations
5. Required fields are present

### Performance Issues

**Solutions**:
1. Increase delay time
2. Add more specific `shouldSave` conditions
3. Throttle rapid changes at component level
4. Consider pagination for large datasets

### Multiple Saves Firing

**Check**:
1. Component isn't re-rendering unnecessarily
2. `useCallback` is used for save function
3. Dependencies array is correct
4. No duplicate useAutoSave hooks

## Examples

### Basic Usage

```javascript
import { useAutoSave, AutoSaveIndicator } from '../utils/useAutoSave';

function MyForm({ editMode, data, updateData }) {
  const [formData, setFormData] = useState(data);
  
  const saveFunction = useCallback(async (data) => {
    await api.update(data.id, data);
  }, []);
  
  const { saveStatus, lastSaved, error } = useAutoSave(
    saveFunction,
    formData,
    { enabled: editMode }
  );
  
  return (
    <div>
      <AutoSaveIndicator 
        saveStatus={saveStatus} 
        lastSaved={lastSaved} 
        error={error} 
      />
      {/* Form fields */}
    </div>
  );
}
```

### Advanced Usage with Custom Validation

```javascript
const { saveStatus, lastSaved, manualSave } = useAutoSave(
  saveFunction,
  formData,
  {
    delay: 2500,
    enabled: isEditMode && hasChanges,
    shouldSave: (data) => {
      // Complex validation
      if (!data.title || data.title.length < 3) return false;
      if (!data.content || data.content.length < 10) return false;
      if (data.tags && data.tags.length === 0) return false;
      return true;
    }
  }
);

// Manual save button for user control
<button onClick={manualSave}>Save Now</button>
```

## Testing

### Unit Testing the Hook

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useAutoSave } from './useAutoSave';

test('should save after delay', async () => {
  const mockSave = jest.fn();
  const { result, waitForNextUpdate } = renderHook(() =>
    useAutoSave(mockSave, { data: 'test' }, { delay: 100 })
  );
  
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
  });
  
  expect(mockSave).toHaveBeenCalled();
  expect(result.current.saveStatus).toBe('saved');
});
```

### Integration Testing

```javascript
test('auto-save in template form', async () => {
  const mockUpdate = jest.fn();
  render(<TemplateForm editTemplate={template} onTemplateUpdated={mockUpdate} />);
  
  // Change form field
  fireEvent.change(screen.getByLabelText('Template Name'), {
    target: { value: 'New Name' }
  });
  
  // Wait for auto-save delay
  await waitFor(() => {
    expect(mockUpdate).toHaveBeenCalled();
  }, { timeout: 3000 });
});
```

## Future Enhancements

1. **Conflict Resolution**
   - Detect concurrent edits
   - Merge strategies
   - User notification of conflicts

2. **Offline Support**
   - Queue saves when offline
   - Sync when connection restored
   - IndexedDB backup

3. **Version History**
   - Track save history
   - Revert to previous versions
   - Compare versions

4. **Advanced Status**
   - Show what's being saved
   - Progress indicator for large saves
   - Save queue visualization

5. **Optimistic Updates**
   - Update UI immediately
   - Rollback on failure
   - Retry failed saves

## API Impact

### Request Frequency

With default settings:
- **2-second delay**: Max 30 requests/minute per form
- **3-second delay**: Max 20 requests/minute per form
- **Actual usage**: Much less due to:
  - User typing patterns
  - Validation checks
  - Change detection

### Bandwidth

- Templates: ~1-5 KB per save
- Syllabi: ~5-15 KB per save
- Canvas: ~10-50 KB per save (depends on elements)

### Server Considerations

- Implement rate limiting on API
- Cache recent saves
- Optimize update queries
- Consider WebSocket for real-time sync

## Summary

The auto-save feature:

✅ Prevents data loss from accidental closures
✅ Reduces cognitive load (no manual save needed)
✅ Provides clear visual feedback
✅ Optimized for performance
✅ User-configurable
✅ Robust error handling
✅ Works across all main editing components

This implementation follows modern UX best practices while maintaining good performance and reliability.
