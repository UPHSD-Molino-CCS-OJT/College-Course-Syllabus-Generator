export default function LayoutToggle({ layoutField, currentLayout, onLayoutChange }) {
  return (
    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-md border border-gray-200">
      <span className="text-sm font-medium text-gray-700">Layout:</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onLayoutChange(layoutField, 'vertical')}
          className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
            currentLayout === 'vertical'
              ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Vertical (Stack)
        </button>
        <button
          type="button"
          onClick={() => onLayoutChange(layoutField, 'horizontal')}
          className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
            currentLayout === 'horizontal'
              ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Horizontal (Same Line)
        </button>
      </div>
    </div>
  );
}
