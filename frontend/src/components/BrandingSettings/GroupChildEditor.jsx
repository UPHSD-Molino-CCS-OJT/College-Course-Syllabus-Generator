import { Trash2, Type, Image } from 'lucide-react';

export default function GroupChildEditor({ child, childIndex, onUpdate, onRemove }) {
  const handleImageUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(childIndex, 'content', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border border-gray-200 rounded p-3 bg-white space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {child.type === 'text' ? (
            <Type size={12} className="text-blue-600" />
          ) : (
            <Image size={12} className="text-green-600" />
          )}
          <span className="text-xs text-gray-600">
            {child.type === 'text' ? 'Text' : 'Image'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(childIndex)}
          className="p-0.5 text-red-400 hover:text-red-600"
          title="Remove"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {child.type === 'text' ? (
        <>
          <textarea
            value={child.content || ''}
            onChange={(e) => onUpdate(childIndex, 'content', e.target.value)}
            rows={2}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter text content"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-gray-600 mb-0.5">Weight</label>
              <select
                value={child.styles?.fontWeight || 'normal'}
                onChange={(e) => onUpdate(childIndex, 'styles.fontWeight', e.target.value)}
                className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-0.5">Size</label>
              <select
                value={child.styles?.fontSize || 'medium'}
                onChange={(e) => onUpdate(childIndex, 'styles.fontSize', e.target.value)}
                className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-0.5">Color</label>
              <input
                type="color"
                value={child.styles?.color || '#000000'}
                onChange={(e) => onUpdate(childIndex, 'styles.color', e.target.value)}
                className="w-full h-6 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              className="block w-full text-[10px] text-gray-500 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {child.content && (
            <div className="flex items-start gap-2">
              <img
                src={child.content}
                alt="Preview"
                className="w-12 h-12 object-contain border border-gray-300 rounded"
              />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">Width (px)</label>
                  <input
                    type="number"
                    value={child.styles?.width || 50}
                    onChange={(e) => onUpdate(childIndex, 'styles.width', parseInt(e.target.value))}
                    className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
                    min="10"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">Height (px)</label>
                  <input
                    type="number"
                    value={child.styles?.height || 50}
                    onChange={(e) => onUpdate(childIndex, 'styles.height', parseInt(e.target.value))}
                    className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
                    min="10"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
