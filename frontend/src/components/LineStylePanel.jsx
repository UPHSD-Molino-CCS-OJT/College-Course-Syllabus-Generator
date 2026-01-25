export default function LineStylePanel({ element, onUpdate }) {
  const strokeStyles = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' }
  ];

  return (
    <div className="p-4 text-white">
      <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Line Properties</h3>

      {/* Line Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Preview</label>
        <div className="bg-gray-700 rounded p-4 flex items-center justify-center">
          <svg width="200" height="40">
            <line
              x1="0"
              y1="20"
              x2="200"
              y2="20"
              stroke={element.strokeColor || '#000000'}
              strokeWidth={element.strokeWidth || 2}
              strokeDasharray={
                element.strokeStyle === 'dashed' ? '5,5' :
                element.strokeStyle === 'dotted' ? '2,2' : 'none'
              }
            />
          </svg>
        </div>
      </div>

      {/* Stroke Color */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Line Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={element.strokeColor || '#000000'}
            onChange={(e) => onUpdate({ strokeColor: e.target.value })}
            className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <input
            type="text"
            value={element.strokeColor || '#000000'}
            onChange={(e) => onUpdate({ strokeColor: e.target.value })}
            placeholder="#000000"
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stroke Width */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Line Width</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="20"
            value={element.strokeWidth || 2}
            onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) })}
            className="flex-1"
          />
          <input
            type="number"
            min="1"
            max="20"
            value={element.strokeWidth || 2}
            onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) })}
            className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stroke Style */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Line Style</label>
        <select
          value={element.strokeStyle || 'solid'}
          onChange={(e) => onUpdate({ strokeStyle: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {strokeStyles.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </div>

      {/* Length */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Length (px)</label>
        <input
          type="number"
          min="10"
          max="1200"
          value={element.width || 300}
          onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Position */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400">X</label>
            <input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Y</label>
            <input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
