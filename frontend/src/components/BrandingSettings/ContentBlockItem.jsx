import { MoveUp, MoveDown, Trash2, Type, Image, Folder } from 'lucide-react';
import TextBlockEditor from './TextBlockEditor';
import ImageBlockEditor from './ImageBlockEditor';
import GroupBlockEditor from './GroupBlockEditor';

export default function ContentBlockItem({
  block,
  index,
  isFirst,
  isLast,
  onUpdate,
  onMove,
  onRemove,
  onImageUpload,
  onAddChild,
  onRemoveChild,
  onUpdateChild,
}) {
  const blockTypeLabels = {
    text: 'Text Block',
    image: 'Image Block',
    group: 'Group Container',
  };

  const blockIcons = {
    text: <Type size={16} className="text-blue-600" />,
    image: <Image size={16} className="text-green-600" />,
    group: <Folder size={16} className="text-purple-600" />,
  };

  return (
    <div
      className={`border rounded-lg p-4 space-y-3 ${
        block.type === 'group'
          ? 'border-purple-300 bg-purple-50'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {blockIcons[block.type]}
          <span className="text-sm font-medium text-gray-700">
            {blockTypeLabels[block.type]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove('up')}
            disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move up"
          >
            <MoveUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => onMove('down')}
            disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move down"
          >
            <MoveDown size={16} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-600"
            title="Remove"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Block Editor */}
      {block.type === 'group' ? (
        <GroupBlockEditor
          block={block}
          onUpdate={onUpdate}
          onAddChild={onAddChild}
          onRemoveChild={onRemoveChild}
          onUpdateChild={onUpdateChild}
        />
      ) : block.type === 'text' ? (
        <TextBlockEditor block={block} onUpdate={onUpdate} />
      ) : (
        <ImageBlockEditor
          block={block}
          onUpdate={onUpdate}
          onImageUpload={onImageUpload}
        />
      )}

      {/* Alignment (not for groups, handled separately) */}
      {block.type !== 'group' && (
        <div>
          <label className="block text-xs text-gray-600 mb-1">Alignment</label>
          <div className="flex gap-2">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => onUpdate('alignment', align)}
                className={`flex-1 px-3 py-1 text-xs rounded border ${
                  block.alignment === align
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
