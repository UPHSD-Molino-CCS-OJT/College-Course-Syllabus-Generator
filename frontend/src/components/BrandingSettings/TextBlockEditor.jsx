export default function TextBlockEditor({ block, onUpdate }) {
  return (
    <>
      <textarea
        value={block.content}
        onChange={(e) => onUpdate('content', e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        placeholder="Enter text content"
      />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
          <select
            value={block.styles.fontWeight}
            onChange={(e) => onUpdate('styles.fontWeight', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Font Size</label>
          <select
            value={block.styles.fontSize}
            onChange={(e) => onUpdate('styles.fontSize', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Color</label>
          <input
            type="color"
            value={block.styles.color}
            onChange={(e) => onUpdate('styles.color', e.target.value)}
            className="w-full h-8 border border-gray-300 rounded cursor-pointer"
          />
        </div>
      </div>
    </>
  );
}
