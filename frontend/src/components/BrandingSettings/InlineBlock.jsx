import { Edit2, Trash2, GripVertical, Type, Image, Folder, X, Check } from 'lucide-react';
import TextBlockEditor from './TextBlockEditor';
import ImageBlockEditor from './ImageBlockEditor';
import GroupBlockEditor from './GroupBlockEditor';
import GroupContent from './GroupContent';

export default function InlineBlock({
  block,
  section,
  index,
  isPreviewMode,
  isHovered,
  isEditing,
  isDragging,
  isDragOver,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onEdit,
  onRemove,
  onUpdate,
  onCloseEditor,
  onImageUpload,
  onAddChild,
  onRemoveChild,
  onUpdateChild,
  onImageUploadForChild,
  onChildDragStart,
  onChildDragOver,
  onChildDrop,
  onChildDragEnd,
}) {
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(section, index);
  };

  const renderBlockContent = () => {
    if (block.type === 'group') {
      return (
        <GroupContent
          block={block}
          section={section}
          groupIndex={index}
          isPreviewMode={isPreviewMode}
          onChildDragStart={onChildDragStart}
          onChildDragOver={onChildDragOver}
          onChildDrop={onChildDrop}
          onChildDragEnd={onChildDragEnd}
          onRemoveChild={onRemoveChild}
          onUpdateChild={onUpdateChild}
          onImageUploadForChild={onImageUploadForChild}
        />
      );
    } else if (block.type === 'text') {
      return (
        <p
          style={{
            fontWeight: block.styles?.fontWeight || 'normal',
            fontSize:
              block.styles?.fontSize === 'small'
                ? '12px'
                : block.styles?.fontSize === 'large'
                ? '18px'
                : '14px',
            color: block.styles?.color || '#000000',
            margin: 0,
            minHeight: '20px',
            padding: '4px',
          }}
        >
          {block.content || 'Click to add text'}
        </p>
      );
    } else {
      return (
        <img
          src={block.content}
          alt="Content"
          style={{
            width: `${block.styles?.width || 100}px`,
            height: `${block.styles?.height || 100}px`,
            display: 'block',
          }}
        />
      );
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative ${!isPreviewMode ? 'group/block pt-10' : ''} ${
          isDragging ? 'opacity-40' : ''
        } ${isDragOver ? 'border-t-4 border-blue-500' : ''}`}
        draggable={!isPreviewMode && !isEditing}
        onDragStart={(e) => onDragStart(e, section, index)}
        onDragOver={(e) => onDragOver(e, section, index)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, section, index)}
        onDragEnd={onDragEnd}
        onMouseEnter={(e) => {
          // Don't trigger hover if we're entering from a child element
          if (!e.target.hasAttribute('data-child-element') && !e.target.closest('[data-child-element]')) {
            onMouseEnter();
          }
        }}
        onMouseLeave={(e) => {
          // Don't trigger leave if we're leaving to a child element
          if (!e.relatedTarget?.hasAttribute('data-child-element') && !e.relatedTarget?.closest('[data-child-element]')) {
            onMouseLeave();
          }
        }}
      >
        {/* Hover toolbar */}
        {!isPreviewMode && (
          <div
            className={`absolute top-0 left-0 flex items-center gap-1 bg-gray-700 text-white px-2 py-1 rounded shadow-lg z-10 transition-opacity duration-200 ${
              isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              type="button"
              className="p-1 hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical size={14} />
            </button>
            <button
              type="button"
              onClick={handleEditClick}
              className={`p-1 hover:bg-gray-700 rounded ${isEditing ? 'bg-blue-600' : ''}`}
              title={isEditing ? 'Close editor' : 'Edit'}
            >
              {isEditing ? <X size={14} /> : <Edit2 size={14} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(section, index);
              }}
              className="p-1 hover:bg-red-600 rounded"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Block content */}
        <div
          className={`transition-all ${
            !isPreviewMode && (isHovered || isEditing)
              ? 'ring-2 ring-blue-400 ring-offset-2 rounded'
              : ''
          }`}
          onClick={() => !isPreviewMode && !isDragging && onEdit(section, index)}
          style={{
            cursor: isPreviewMode ? 'default' : isDragging ? 'grabbing' : 'pointer',
          }}
        >
          {renderBlockContent()}
        </div>
      </div>

      {/* Floating Editor Panel */}
      {isEditing && !isPreviewMode && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onCloseEditor();
            }}
          />
          
          {/* Floating editor window */}
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-blue-500 rounded-lg shadow-2xl p-6 space-y-4 z-50 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                {block.type === 'text' && <Type size={18} className="text-blue-600" />}
                {block.type === 'image' && <Image size={18} className="text-green-600" />}
                {block.type === 'group' && <Folder size={18} className="text-purple-600" />}
                <span className="font-semibold text-gray-900">
                  {block.type === 'text' && 'Text Block'}
                  {block.type === 'image' && 'Image Block'}
                  {block.type === 'group' && 'Group Container'}
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseEditor}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
              >
                <Check size={14} />
                Done
              </button>
            </div>

          {/* Editor Content */}
          {block.type === 'group' ? (
            <GroupBlockEditor
              block={block}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onRemoveChild={(childIndex) => onRemoveChild(section, index, childIndex, [])}
              onUpdateChild={(childIndex, field, value) =>
                onUpdateChild(section, index, childIndex, field, value, [])
              }
            />
          ) : block.type === 'text' ? (
            <>
              <TextBlockEditor block={block} onUpdate={onUpdate} />
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
        </>
      )}
    </div>
  );
}
