export default function ImageStylePanel({ element, onUpdate }) {
  const handleChangeImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onUpdate({ src: event.target.result, alt: file.name });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="p-4 text-white">
      <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Image Properties</h3>

      {/* Image Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Preview</label>
        <div className="bg-gray-700 rounded p-2 flex items-center justify-center" style={{ minHeight: '150px' }}>
          {element.src ? (
            <img src={element.src} alt={element.alt || 'Preview'} className="max-w-full max-h-40 object-contain" />
          ) : (
            <p className="text-gray-400 text-sm">No image</p>
          )}
        </div>
      </div>

      {/* Change Image Button */}
      <div className="mb-4">
        <button
          onClick={handleChangeImage}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Change Image
        </button>
      </div>

      {/* Width */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Width (px)</label>
        <input
          type="number"
          min="10"
          max="1000"
          value={element.width || 150}
          onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Height */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Height (px)</label>
        <input
          type="number"
          min="10"
          max="1000"
          value={element.height || 150}
          onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Maintain Aspect Ratio */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={element.maintainAspectRatio || false}
            onChange={(e) => onUpdate({ maintainAspectRatio: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm">Maintain aspect ratio</span>
        </label>
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

      {/* Alt Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Alt Text</label>
        <input
          type="text"
          value={element.alt || ''}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Image description"
        />
      </div>
    </div>
  );
}
