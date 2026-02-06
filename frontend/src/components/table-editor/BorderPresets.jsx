export default function BorderPresets({ onApplyPreset }) {
  return (
    <>
      {/* Quick Border Presets */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">Quick Presets (Apply to All Cells)</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onApplyPreset('full-grid')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
            title="Add all borders to all cells"
          >
            ⊞ Full Grid
          </button>
          <button
            onClick={() => onApplyPreset('outer-only')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
            title="Only outer table borders"
          >
            ⊡ Outer Only
          </button>
          <button
            onClick={() => onApplyPreset('horizontal')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
            title="Horizontal lines only"
          >
            ☰ Horizontal
          </button>
          <button
            onClick={() => onApplyPreset('vertical')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
            title="Vertical lines only"
          >
            ☱ Vertical
          </button>
          <button
            onClick={() => onApplyPreset('no-borders')}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-xs font-medium transition-colors"
            title="Remove all borders"
          >
            ∅ No Borders
          </button>
        </div>
      </div>

      {/* Border Toggles */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">Toggle Borders</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onApplyPreset('outer-borders')}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-xs font-medium transition-colors"
            title="Toggle outer borders on/off"
          >
            ⬜ Toggle Outer
          </button>
          <button
            onClick={() => onApplyPreset('inner-borders')}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-xs font-medium transition-colors"
            title="Toggle inner borders on/off"
          >
            ⊟ Toggle Inner
          </button>
        </div>
      </div>
    </>
  );
}
