import { useState } from 'react';
import LayoutToggle from './LayoutToggle';
import CompactBlockItem from './CompactBlockItem';
import BlockInsertButton from './BlockInsertButton';
import BlockEditModal from './BlockEditModal';

export default function ContentBlockEditor({
  section,
  sectionLabel,
  settings,
  addContentBlock,
  removeContentBlock,
  updateContentBlock,
  moveContentBlock,
  handleImageUploadForBlock,
  onLayoutChange,
  addChildToGroup,
  removeChildFromGroup,
  updateGroupChild,
  insertContentBlockAt,
}) {
  const layoutField = section === 'headerContent' ? 'headerLayout' : 'footerLayout';
  const [editingBlock, setEditingBlock] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingBlock(settings[section][index]);
  };

  const handleCloseModal = () => {
    setEditingBlock(null);
    setEditingIndex(null);
  };

  const handleUpdate = (field, value) => {
    updateContentBlock(section, editingIndex, field, value);
    // Update local state to reflect changes immediately
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

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    const direction = draggedIndex < targetIndex ? 'down' : 'up';
    const steps = Math.abs(targetIndex - draggedIndex);
    
    for (let i = 0; i < steps; i++) {
      moveContentBlock(section, draggedIndex < targetIndex ? draggedIndex : draggedIndex - i, direction);
    }
    
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {sectionLabel} Content Blocks
        </label>
      </div>

      {/* Layout Toggle */}
      <LayoutToggle
        layoutField={layoutField}
        currentLayout={settings[layoutField]}
        onLayoutChange={onLayoutChange}
      />

      {/* Content Blocks List */}
      <div className="space-y-1">
        {/* Insert at top */}
        <BlockInsertButton
          onInsert={(type) => insertContentBlockAt(section, 0, type)}
          position="top"
        />

        {settings[section].length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">
              Click + above to add your first block
            </p>
          </div>
        ) : (
          <>
            {settings[section].map((block, index) => (
              <div key={block.id || index}>
                <CompactBlockItem
                  block={block}
                  section={section}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === settings[section].length - 1}
                  onEdit={() => handleEdit(index)}
                  onMove={(direction) => moveContentBlock(section, index, direction)}
                  onRemove={() => removeContentBlock(section, index)}
                  onDragStart={(e) => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                />
                
                {/* Insert between blocks */}
                <BlockInsertButton
                  onInsert={(type) => insertContentBlockAt(section, index + 1, type)}
                  position="between"
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Edit Modal */}
      <BlockEditModal
        block={editingBlock}
        isOpen={editingBlock !== null}
        onClose={handleCloseModal}
        onUpdate={handleUpdate}
        onImageUpload={(file) => handleImageUploadForBlock(section, editingIndex, file)}
        onAddChild={(type) => addChildToGroup(section, editingIndex, type)}
        onRemoveChild={(childIndex) => removeChildFromGroup(section, editingIndex, childIndex)}
        onUpdateChild={(childIndex, field, value) =>
          updateGroupChild(section, editingIndex, childIndex, field, value)
        }
      />
    </div>
  );
}
