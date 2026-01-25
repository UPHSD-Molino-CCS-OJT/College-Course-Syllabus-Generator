import { useState } from 'react';
import { GripVertical, Edit2, Trash2, Type, Image, Folder, ChevronDown, ChevronUp } from 'lucide-react';

export default function CompactBlockItem({
  block,
  section,
  index,
  isFirst,
  isLast,
  onEdit,
  onMove,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const blockTypeInfo = {
    text: { icon: Type, label: 'Text', color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    image: { icon: Image, label: 'Image', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    group: { icon: Folder, label: 'Group', color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  };

  const info = blockTypeInfo[block.type];
  const Icon = info.icon;

  // Preview content
  const getPreview = () => {
    if (block.type === 'text') {
      return block.content?.substring(0, 60) + (block.content?.length > 60 ? '...' : '');
    } else if (block.type === 'image') {
      return block.content ? 'Image uploaded' : 'No image';
    } else if (block.type === 'group') {
      return `${(block.children || []).length} element${(block.children || []).length !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div
      id={section && index !== undefined ? `block-${section}-${index}` : undefined}
      className={`group border-2 rounded-lg transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } ${info.borderColor} ${info.bgColor} hover:shadow-md`}
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e);
      }}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={onDragOver}
      onDrop={(e) => {
        onDrop(e);
        setIsDragging(false);
      }}
    >
      <div className="flex items-center gap-2 p-3">
        {/* Drag handle */}
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical size={18} />
        </button>

        {/* Icon and label */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon size={16} className={`text-${info.color}-600 flex-shrink-0`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{info.label}</span>
              {block.type === 'group' && (block.children?.length > 0) && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{getPreview()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            data-edit-button
            className="p-1.5 text-gray-600 hover:bg-white hover:text-blue-600 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-gray-600 hover:bg-white hover:text-red-600 rounded transition-colors"
            title="Remove"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expanded group children preview */}
      {isExpanded && block.type === 'group' && (block.children?.length > 0) && (
        <div className="border-t border-gray-200 px-3 py-2 bg-white/50">
          <div className="space-y-1">
            {block.children.map((child, idx) => (
              <div key={child.id || idx} className="flex items-center gap-2 text-xs text-gray-600">
                {child.type === 'text' ? <Type size={12} /> : <Image size={12} />}
                <span className="truncate">
                  {child.type === 'text' 
                    ? (child.content?.substring(0, 40) + (child.content?.length > 40 ? '...' : ''))
                    : 'Image'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
