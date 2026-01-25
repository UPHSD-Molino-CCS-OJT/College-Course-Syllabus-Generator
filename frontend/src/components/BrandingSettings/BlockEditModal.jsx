import { X, Type, Image, Folder } from 'lucide-react';
import TextBlockEditor from './TextBlockEditor';
import ImageBlockEditor from './ImageBlockEditor';
import GroupBlockEditor from './GroupBlockEditor';

export default function BlockEditModal({
  block,
  isOpen,
  onClose,
  onUpdate,
  onImageUpload,
  onAddChild,
  onRemoveChild,
  onUpdateChild,
}) {
  if (!isOpen || !block) return null;

  const blockTypeInfo = {
    text: { icon: Type, label: 'Text Block', color: 'blue' },
    image: { icon: Image, label: 'Image Block', color: 'green' },
    group: { icon: Folder, label: 'Group Container', color: 'purple' },
  };

  const info = blockTypeInfo[block.type];
  const Icon = info.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b bg-${info.color}-50`}>
          <div className="flex items-center gap-2">
            <Icon size={20} className={`text-${info.color}-600`} />
            <h3 className="text-lg font-semibold text-gray-900">{info.label}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {block.type === 'group' ? (
            <GroupBlockEditor
              block={block}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onRemoveChild={onRemoveChild}
              onUpdateChild={onUpdateChild}
            />
          ) : block.type === 'text' ? (
            <>
              <TextBlockEditor block={block} onUpdate={onUpdate} />
              {/* Alignment for text blocks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alignment
                </label>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => onUpdate('alignment', align)}
                      className={`flex-1 px-4 py-2 text-sm rounded border transition-colors ${
                        block.alignment === align
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <ImageBlockEditor
                block={block}
                onUpdate={onUpdate}
                onImageUpload={onImageUpload}
              />
              {/* Alignment for image blocks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alignment
                </label>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => onUpdate('alignment', align)}
                      className={`flex-1 px-4 py-2 text-sm rounded border transition-colors ${
                        block.alignment === align
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
