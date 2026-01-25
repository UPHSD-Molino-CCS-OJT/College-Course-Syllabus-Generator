export default function ImageBlockEditor({ block, onUpdate, onImageUpload }) {
  return (
    <>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onImageUpload(e.target.files[0])}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      {block.content && (
        <div className="flex items-start gap-3">
          <img
            src={block.content}
            alt="Preview"
            className="w-20 h-20 object-contain border border-gray-300 rounded"
          />
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Width (px)</label>
              <input
                type="number"
                value={block.styles.width || 100}
                onChange={(e) => onUpdate('styles.width', parseInt(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="10"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Height (px)</label>
              <input
                type="number"
                value={block.styles.height || 100}
                onChange={(e) => onUpdate('styles.height', parseInt(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="10"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
