import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Settings, Type, Image, Folder } from 'lucide-react';
import BlockEditModal from './BlockEditModal';
import LayoutToggle from './LayoutToggle';

export default function InlineEditablePreview({ settings, handlers }) {
  const [editingBlock, setEditingBlock] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);

  const handleEdit = (section, index) => {
    setEditingSection(section);
    setEditingIndex(index);
    setEditingBlock(settings[section][index]);
  };

  const handleCloseModal = () => {
    setEditingBlock(null);
    setEditingSection(null);
    setEditingIndex(null);
  };

  const handleUpdate = (field, value) => {
    handlers.updateContentBlock(editingSection, editingIndex, field, value);
    setEditingBlock(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const renderInlineBlock = (block, section, index) => {
    const isHovered = hoveredBlock === index && hoveredSection === section;

    return (
      <div
        key={block.id || index}
        className="relative group/block pt-10"
        onMouseEnter={() => {
          setHoveredBlock(index);
          setHoveredSection(section);
        }}
        onMouseLeave={() => {
          setHoveredBlock(null);
          setHoveredSection(null);
        }}
      >
        {/* Hover toolbar */}
        <div className={`absolute top-0 left-0 flex items-center gap-1 bg-gray-900 text-white px-2 py-1 rounded shadow-lg z-10 transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <button
            type="button"
            className="p-1 hover:bg-gray-700 rounded"
            title="Drag to reorder"
          >
            <GripVertical size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleEdit(section, index)}
            className="p-1 hover:bg-gray-700 rounded"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => handlers.removeContentBlock(section, index)}
            className="p-1 hover:bg-red-600 rounded"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Block content */}
        <div
          className={`transition-all ${
            isHovered ? 'ring-2 ring-blue-400 ring-offset-2 rounded' : ''
          }`}
          onClick={() => handleEdit(section, index)}
          style={{ cursor: 'pointer' }}
        >
          {renderBlockContent(block)}
        </div>
      </div>
    );
  };

  const renderBlockContent = (block) => {
    if (block.type === 'group') {
      const groupLayout = block.layout || 'horizontal';
      return (
        <div
          style={{
            display: 'inline-flex',
            flexDirection: groupLayout === 'horizontal' ? 'row' : 'column',
            alignItems: 'center',
            gap: '8px',
            justifyContent:
              block.alignment === 'left'
                ? 'flex-start'
                : block.alignment === 'right'
                ? 'flex-end'
                : 'center',
          }}
        >
          {(block.children || []).map((child, childIndex) => (
            <div key={child.id || childIndex}>
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
                  {child.content}
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
                renderBlockContent(child)
              )}
            </div>
          ))}
        </div>
      );
    } else if (block.type === 'text') {
      return (
        <p
          style={{
            fontWeight: block.styles.fontWeight,
            fontSize:
              block.styles.fontSize === 'small'
                ? '12px'
                : block.styles.fontSize === 'large'
                ? '18px'
                : '14px',
            color: block.styles.color,
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
            width: `${block.styles.width}px`,
            height: `${block.styles.height}px`,
            display: 'block',
          }}
        />
      );
    }
  };

  const renderInsertButton = (section, position) => {
    return (
      <div className="relative group/insert my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 group-hover/insert:border-blue-400"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="opacity-0 group-hover/insert:opacity-100 transition-opacity bg-white px-2">
            <div className="flex gap-1 bg-gray-900 text-white rounded shadow-lg p-1">
              <button
                type="button"
                onClick={() => handlers.insertContentBlockAt(section, position, 'text')}
                className="p-1.5 hover:bg-gray-700 rounded flex items-center gap-1"
                title="Add text"
              >
                <Type size={14} />
                <span className="text-xs">Text</span>
              </button>
              <button
                type="button"
                onClick={() => handlers.insertContentBlockAt(section, position, 'image')}
                className="p-1.5 hover:bg-gray-700 rounded flex items-center gap-1"
                title="Add image"
              >
                <Image size={14} />
                <span className="text-xs">Image</span>
              </button>
              <button
                type="button"
                onClick={() => handlers.insertContentBlockAt(section, position, 'group')}
                className="p-1.5 hover:bg-gray-700 rounded flex items-center gap-1"
                title="Add group"
              >
                <Folder size={14} />
                <span className="text-xs">Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (section, title) => {
    const layoutField = section === 'headerContent' ? 'headerLayout' : 'footerLayout';
    const blocks = settings[section] || [];

    return (
      <div className="bg-gray-100 p-6 border-b-2 border-gray-300">
        {/* Section header with layout toggle */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
          <LayoutToggle
            layoutField={layoutField}
            currentLayout={settings[layoutField]}
            onLayoutChange={handlers.handleLayoutChange}
          />
        </div>

        {/* Content */}
        <div
          className={
            settings[layoutField] === 'horizontal'
              ? 'flex items-center gap-4 flex-wrap'
              : 'space-y-4'
          }
          style={{
            justifyContent:
              settings[layoutField] === 'horizontal' ? 'space-between' : 'initial',
          }}
        >
          {blocks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">No {title.toLowerCase()} content yet</p>
              <button
                type="button"
                onClick={() => handlers.insertContentBlockAt(section, 0, 'text')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={16} />
                Add First Element
              </button>
            </div>
          ) : (
            <>
              {renderInsertButton(section, 0)}
              {blocks
                .sort((a, b) => a.order - b.order)
                .map((block, index) => (
                  <div key={block.id || index}>
                    {renderInlineBlock(block, section, index)}
                    {renderInsertButton(section, index + 1)}
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="border border-gray-300 rounded-md overflow-hidden" style={{ fontFamily: settings.fontFamily }}>
        {/* Header */}
        {renderSection('headerContent', 'Header')}

        {/* Preview Content */}
        <div className="p-6">
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: settings.secondaryColor }}
          >
            Course Syllabus
          </h3>
          <p className="text-gray-700">
            This is a preview of how your syllabus will look with the current
            header and footer settings. Click any element to edit it.
          </p>
        </div>

        {/* Footer */}
        {renderSection('footerContent', 'Footer')}
      </div>

      {/* Edit Modal */}
      <BlockEditModal
        block={editingBlock}
        isOpen={editingBlock !== null}
        onClose={handleCloseModal}
        onUpdate={handleUpdate}
        onImageUpload={(file) =>
          handlers.handleImageUploadForBlock(editingSection, editingIndex, file)
        }
        onAddChild={(type) =>
          handlers.addChildToGroup(editingSection, editingIndex, type)
        }
        onRemoveChild={(childIndex) =>
          handlers.removeChildFromGroup(editingSection, editingIndex, childIndex)
        }
        onUpdateChild={(childIndex, field, value) =>
          handlers.updateGroupChild(editingSection, editingIndex, childIndex, field, value)
        }
      />
    </>
  );
}
