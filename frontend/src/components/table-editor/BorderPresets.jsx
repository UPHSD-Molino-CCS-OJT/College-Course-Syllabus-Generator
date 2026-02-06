export default function BorderPresets({ activeToggles, onToggle, onClearAll }) {
  const getButtonClasses = (isActive) => {
    return `px-3 py-2 rounded text-xs font-medium transition-all border-2 ${
      isActive 
        ? 'bg-green-600 hover:bg-green-700 border-green-400 shadow-lg shadow-green-500/50' 
        : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
    }`;
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-gray-300">Border Toggles (Mix & Match)</label>
          <button
            onClick={onClearAll}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors"
            title="Clear all borders"
          >
            ✕ Clear All
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onToggle('fullGrid')}
            className={getButtonClasses(activeToggles.fullGrid)}
            title="Toggle all borders on/off"
          >
            {activeToggles.fullGrid ? '✓' : '⊞'} Full Grid
          </button>
          <button
            onClick={() => onToggle('outer')}
            className={getButtonClasses(activeToggles.outer)}
            title="Toggle outer borders"
          >
            {activeToggles.outer ? '✓' : '⊡'} Outer
          </button>
          <button
            onClick={() => onToggle('horizontal')}
            className={getButtonClasses(activeToggles.horizontal)}
            title="Toggle horizontal lines"
          >
            {activeToggles.horizontal ? '✓' : '☰'} Horizontal
          </button>
          <button
            onClick={() => onToggle('vertical')}
            className={getButtonClasses(activeToggles.vertical)}
            title="Toggle vertical lines"
          >
            {activeToggles.vertical ? '✓' : '☱'} Vertical
          </button>
          <button
            onClick={() => onToggle('inner')}
            className={getButtonClasses(activeToggles.inner)}
            title="Toggle inner borders"
          >
            {activeToggles.inner ? '✓' : '⊟'} Inner
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 italic mt-2 p-2 bg-gray-800/50 rounded">
        💡 Tip: Click multiple toggles to combine border styles
      </div>
    </>
  );
}
