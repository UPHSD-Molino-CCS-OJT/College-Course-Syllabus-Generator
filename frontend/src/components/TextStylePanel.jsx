import DataFieldPicker from './DataFieldPicker';

export default function TextStylePanel({ element, onUpdate }) {
  const fontFamilies = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Helvetica',
    'Calibri',
    'Comic Sans MS',
    'Impact'
  ];

  const fontWeights = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: '100', label: 'Thin' },
    { value: '300', label: 'Light' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' }
  ];

  const alignments = [
    { value: 'left', label: 'Left', icon: '⬅' },
    { value: 'center', label: 'Center', icon: '↔' },
    { value: 'right', label: 'Right', icon: '➡' },
    { value: 'justify', label: 'Justify', icon: '⬌' }
  ];

  const insertField = (field) => {
    const currentContent = element.content || '';
    onUpdate({ content: currentContent + field });
  };

  return (
    <div className="p-4 text-white">
      <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Text Properties</h3>

      {/* Font Family */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Font Family</label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {fontFamilies.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Font Size</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="8"
            max="72"
            value={element.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="flex-1"
          />
          <input
            type="number"
            min="8"
            max="72"
            value={element.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Font Weight */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Font Weight</label>
        <select
          value={element.fontWeight}
          onChange={(e) => onUpdate({ fontWeight: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {fontWeights.map((weight) => (
            <option key={weight.value} value={weight.value}>
              {weight.label}
            </option>
          ))}
        </select>
      </div>

      {/* Text Decorations */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Text Style</label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ bold: !element.bold })}
            className={`flex-1 px-3 py-2 rounded font-bold transition-colors ${
              element.bold
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() => onUpdate({ italic: !element.italic })}
            className={`flex-1 px-3 py-2 rounded italic transition-colors ${
              element.italic
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Italic"
          >
            I
          </button>
          <button
            onClick={() => onUpdate({ underline: !element.underline })}
            className={`flex-1 px-3 py-2 rounded underline transition-colors ${
              element.underline
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Underline"
          >
            U
          </button>
        </div>
      </div>

      {/* Text Color */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Text Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={element.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <input
            type="text"
            value={element.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            placeholder="#000000"
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Text Alignment */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Alignment</label>
        <div className="grid grid-cols-4 gap-2">
          {alignments.map((align) => (
            <button
              key={align.value}
              onClick={() => onUpdate({ align: align.value })}
              className={`px-3 py-2 rounded transition-colors ${
                element.align === align.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={align.label}
            >
              {align.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Width */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Width (px)</label>
        <input
          type="number"
          min="50"
          max="1000"
          value={element.width || 200}
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

      {/* Text Content */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Content</label>
        
        <DataFieldPicker onInsert={insertField} compact={true} />

        <textarea
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          rows={4}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Enter text or use the dropdown above to insert data fields"
        />
      </div>
    </div>
  );
}
