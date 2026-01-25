import { Type, Image, Folder } from 'lucide-react';
import LayoutToggle from './LayoutToggle';
import ContentBlockItem from './ContentBlockItem';

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
}) {
  const layoutField = section === 'headerContent' ? 'headerLayout' : 'footerLayout';

  return (
    <div className="space-y-4">
      {/* Header with Add Buttons */}
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {sectionLabel} Content Blocks
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addContentBlock(section, 'text')}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
          >
            <Type size={16} />
            Add Text
          </button>
          <button
            type="button"
            onClick={() => addContentBlock(section, 'image')}
            className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-sm"
          >
            <Image size={16} />
            Add Image
          </button>
          <button
            type="button"
            onClick={() => addContentBlock(section, 'group')}
            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 text-sm"
          >
            <Folder size={16} />
            Add Group
          </button>
        </div>
      </div>

      {/* Layout Toggle */}
      <LayoutToggle
        layoutField={layoutField}
        currentLayout={settings[layoutField]}
        onLayoutChange={onLayoutChange}
      />

      {/* Content Blocks List */}
      {settings[section].length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">
            No content blocks yet. Add text or image blocks to customize your{' '}
            {sectionLabel.toLowerCase()}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {settings[section].map((block, index) => (
            <ContentBlockItem
              key={block.id || index}
              block={block}
              index={index}
              isFirst={index === 0}
              isLast={index === settings[section].length - 1}
              onUpdate={(field, value) =>
                updateContentBlock(section, index, field, value)
              }
              onMove={(direction) => moveContentBlock(section, index, direction)}
              onRemove={() => removeContentBlock(section, index)}
              onImageUpload={(file) =>
                handleImageUploadForBlock(section, index, file)
              }
              onAddChild={(type) => addChildToGroup(section, index, type)}
              onRemoveChild={(childIndex) =>
                removeChildFromGroup(section, index, childIndex)
              }
              onUpdateChild={(childIndex, field, value) =>
                updateGroupChild(section, index, childIndex, field, value)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
