import { Type, Image as ImageIcon, Copy, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export default function CanvasElementEditor({ element, onUpdate, onDuplicate, onDelete }) {
  const handleStyleUpdate = (field, value) => {
    onUpdate({
      styles: {
        ...element.styles,
        [field]: value,
      },
    });
  };

  const handlePositionUpdate = (axis, value) => {
    onUpdate({
      position: {
        ...element.position,
        [axis]: Math.max(0, parseInt(value) || 0),
      },
    });
  };

  const handleSizeUpdate = (dimension, value) => {
    onUpdate({
      size: {
        ...element.size,
        [dimension]: Math.max(10, parseInt(value) || 10),
      },
    });
  };

  return (
    <div className="w-80 bg-white border border-gray-300 rounded-lg p-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {element.type === 'text' ? (
            <Type size={18} className="text-blue-500" />
          ) : (
            <ImageIcon size={18} className="text-green-500" />
          )}
          <h3 className="font-medium text-gray-900">
            {element.type === 'text' ? 'Text' : 'Image'} Properties
          </h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onDuplicate}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Content */}
        {element.type === 'text' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Content
            </label>
            <textarea
              value={element.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
              placeholder="Enter text..."
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              value={element.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        )}

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X</label>
              <input
                type="number"
                value={element.position.x}
                onChange={(e) => handlePositionUpdate('x', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Y</label>
              <input
                type="number"
                value={element.position.y}
                onChange={(e) => handlePositionUpdate('y', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Width</label>
              <input
                type="number"
                value={element.size.width}
                onChange={(e) => handleSizeUpdate('width', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                min="10"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Height</label>
              <input
                type="number"
                value={element.size.height}
                onChange={(e) => handleSizeUpdate('height', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                min="10"
              />
            </div>
          </div>
        </div>

        {/* Layer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Z-Index (Layer)
          </label>
          <input
            type="number"
            value={element.zIndex}
            onChange={(e) => onUpdate({ zIndex: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            min="0"
          />
        </div>

        {/* Text-specific styles */}
        {element.type === 'text' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alignment
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => handleStyleUpdate('textAlign', 'left')}
                  className={`flex-1 p-2 border rounded ${
                    element.styles?.textAlign === 'left'
                      ? 'bg-blue-100 border-blue-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <AlignLeft size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => handleStyleUpdate('textAlign', 'center')}
                  className={`flex-1 p-2 border rounded ${
                    element.styles?.textAlign === 'center'
                      ? 'bg-blue-100 border-blue-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <AlignCenter size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => handleStyleUpdate('textAlign', 'right')}
                  className={`flex-1 p-2 border rounded ${
                    element.styles?.textAlign === 'right'
                      ? 'bg-blue-100 border-blue-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <AlignRight size={16} className="mx-auto" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Size
              </label>
              <select
                value={element.styles?.fontSize || 'medium'}
                onChange={(e) => handleStyleUpdate('fontSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">Extra Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Weight
              </label>
              <select
                value={element.styles?.fontWeight || 'normal'}
                onChange={(e) => handleStyleUpdate('fontWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Light</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={element.styles?.color || '#000000'}
                  onChange={(e) => handleStyleUpdate('color', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={element.styles?.color || '#000000'}
                  onChange={(e) => handleStyleUpdate('color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                />
              </div>
            </div>
          </>
        )}

        {/* Image-specific styles */}
        {element.type === 'image' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Object Fit
            </label>
            <select
              value={element.styles?.objectFit || 'contain'}
              onChange={(e) => handleStyleUpdate('objectFit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="fill">Fill</option>
              <option value="none">None</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
