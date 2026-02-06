export default function EditorActions({ 
  autoSaveEnabled, 
  onAutoSaveToggle, 
  onClose, 
  onSave 
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center text-sm text-white bg-gray-700 rounded px-3 py-2 border border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer">
        <input
          type="checkbox"
          checked={autoSaveEnabled}
          onChange={(e) => onAutoSaveToggle(e.target.checked)}
          className="mr-2"
        />
        <span className="font-medium">Auto-save</span>
      </label>
      
      <div className="h-8 w-px bg-gray-600"></div>

      <button
        onClick={onClose}
        className="px-5 py-2 text-white bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 text-sm font-medium transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors shadow-md"
      >
        💾 Save & Close
      </button>
    </div>
  );
}
