import { Edit2, Trash2, GripVertical, Type, Image, Check, X } from 'lucide-react';
import { useState } from 'react';
import TextBlockEditor from './TextBlockEditor';
import ImageBlockEditor from './ImageBlockEditor';

export default function GroupChild({
  child,
  childIndex,
  section,
  groupIndex,
  childPath,
  isPreviewMode,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
  onEdit,
  onUpdate,
  onImageUpload,
  renderNestedGroup,
  onParentMouseLeave,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
  };

  const handleCloseEditor = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsEditing(false);
  };

  const handleUpdate = (field, value) => {
    onUpdate(childIndex, field, value, childPath);
  };

  return (
    <div className="space-y-2" data-child-element="true">
      <div
        className={`relative ${
          !isPreviewMode ? 'pt-10' : ''
        } ${isDragging ? 'opacity-40' : ''}`}
        draggable={!isPreviewMode && !isEditing}
        onDragStart={(e) => {
          setIsDragging(true);
          onDragStart(e, section, groupIndex, childIndex, childPath);
        }}
        onDragOver={(e) => onDragOver(e, section, groupIndex, childIndex, childPath)}
        onDrop={(e) => {
          setIsDragging(false);
          onDrop(e, section, groupIndex, childIndex, childPath);
        }}
        onDragEnd={(e) => {
          setIsDragging(false);
          onDragEnd();
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          if (!isPreviewMode) {
            setIsHovered(true);
            // Clear parent group's hover state when child is hovered
            if (onParentMouseLeave) {
              onParentMouseLeave();
            }
          }
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          if (!isPreviewMode) setIsHovered(false);
        }}
      >
        {/* Hover toolbar */}
        {!isPreviewMode && (
          <div
            className={`absolute top-0 left-0 flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded shadow-lg z-30 text-xs transition-opacity duration-200 ${
              isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              type="button"
              className="p-0.5 hover:bg-purple-700 rounded cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical size={12} />
            </button>
            <button
              type="button"
              onClick={handleEditClick}
              className={`p-0.5 hover:bg-purple-700 rounded ${isEditing ? 'bg-purple-600' : ''}`}
              title={isEditing ? 'Close editor' : 'Edit'}
            >
              {isEditing ? <X size={12} /> : <Edit2 size={12} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(childIndex, childPath);
              }}
              className="p-0.5 hover:bg-red-600 rounded"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}

        {/* Child content */}
        <div
          className={`${
            !isPreviewMode && (isHovered || isEditing)
              ? 'ring-2 ring-purple-400 ring-offset-1 rounded'
              : ''
          }`}
          onClick={!isPreviewMode && !isDragging ? handleEditClick : undefined}
          style={{ cursor: isPreviewMode ? 'default' : isDragging ? 'grabbing' : 'pointer' }}
        >
          {child.type === 'text' ? (
            <p
              style={{
                fontWeight: child.styles?.fontWeight || 'normal',
                fontSize:
                  child.styles?.fontSize === 'small'
                    ? '12px'
                    : child.styles?.fontSize === 'large'
                    ? '18px'
                    : '14px',
                color: child.styles?.color || '#000000',
                margin: 0,
              }}
            >
              {child.content || 'Click to add text'}
            </p>
          ) : child.type === 'image' ? (
            <img
              src={child.content}
              alt="Group element"
              style={{
                width: `${child.styles?.width || 50}px`,
                height: `${child.styles?.height || 50}px`,
                display: 'block',
              }}
            />
          ) : (
            renderNestedGroup(child, section, groupIndex, [...childPath, childIndex])
          )}
        </div>
      </div>

      {/* Floating Editor for Child */}
      {isEditing && !isPreviewMode && child.type !== 'group' && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleCloseEditor();
            }}
          />
          
          {/* Floating editor window */}
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-purple-500 rounded-lg shadow-2xl p-6 space-y-4 z-50 max-w-xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                {child.type === 'text' && <Type size={16} className="text-blue-600" />}
                {child.type === 'image' && <Image size={16} className="text-green-600" />}
                <span className="font-semibold text-gray-900 text-sm">
                  {child.type === 'text' ? 'Text Element' : 'Image Element'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleCloseEditor();
                }}
                className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-medium"
              >
                <Check size={12} />
                Done
              </button>
            </div>

            {child.type === 'text' ? (
              <TextBlockEditor block={child} onUpdate={handleUpdate} />
            ) : (
              <ImageBlockEditor
                block={child}
                onUpdate={handleUpdate}
                onImageUpload={(file) => onImageUpload(section, groupIndex, childIndex, file, childPath)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
