export default function ViewControls({ 
  zoom, 
  onZoomChange,
  showGrid,
  gridSize,
  onGridToggle,
  onGridSizeChange
}) {
  return (
    <div className="flex items-center gap-4">
      {/* Zoom Control */}
      <div className="flex flex-col">
        <label className="text-gray-400 text-xs mb-1">Zoom</label>
        <div className="flex items-center gap-2 bg-gray-700 rounded px-2 py-1 border border-gray-600">
          <button
            onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))}
            className="text-white px-2 py-0.5 rounded hover:bg-gray-600 transition-colors"
            title="Zoom out"
          >
            −
          </button>
          <span className="text-white text-sm min-w-[50px] text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2, zoom + 0.25))}
            className="text-white px-2 py-0.5 rounded hover:bg-gray-600 transition-colors"
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="flex flex-col">
        <label className="text-gray-400 text-xs mb-1">Grid</label>
        <div className="flex items-center gap-2">
          <label className="flex items-center text-sm text-white bg-gray-700 rounded px-3 py-1.5 border border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => onGridToggle(e.target.checked)}
              className="mr-2"
            />
            Show
          </label>
          {showGrid && (
            <div className="flex items-center gap-1 bg-gray-700 rounded px-2 py-1.5 border border-gray-600">
              <input
                type="number"
                value={gridSize}
                onChange={(e) => onGridSizeChange(Math.max(5, parseInt(e.target.value) || 20))}
                min="5"
                max="100"
                className="w-14 px-1 py-0.5 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
              <span className="text-gray-400 text-xs">px</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
