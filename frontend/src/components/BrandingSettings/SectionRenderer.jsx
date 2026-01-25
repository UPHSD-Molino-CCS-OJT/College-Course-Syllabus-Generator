import { Plus } from 'lucide-react';
import InlineBlock from './InlineBlock';
import InsertButton from './InsertButton';
import LayoutToggle from './LayoutToggle';

export default function SectionRenderer({
  section,
  title,
  settings,
  isPreviewMode,
  blocks,
  layoutField,
  hoveredBlock,
  hoveredSection,
  editingBlock,
  editingSection,
  editingIndex,
  draggedItem,
  dragOverIndex,
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
  onInsert,
  onLayoutChange,
}) {
  return (
    <div className={isPreviewMode ? '' : 'bg-gray-100 p-6 border-b-2 border-gray-300'}>
      {/* Section header */}
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {title}
          </h3>
          <LayoutToggle
            layoutField={layoutField}
            currentLayout={settings[layoutField]}
            onLayoutChange={onLayoutChange}
          />
        </div>
      )}

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
          isPreviewMode ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm italic">
                No {title.toLowerCase()} content
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">
                No {title.toLowerCase()} content yet
              </p>
              <button
                type="button"
                onClick={() => onInsert(section, 0, 'text')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={16} />
                Add First Element
              </button>
            </div>
          )
        ) : (
          <>
            {!isPreviewMode && <InsertButton section={section} position={0} onInsert={onInsert} />}
            {blocks
              .sort((a, b) => a.order - b.order)
              .map((block, index) => {
                const isHovered =
                  hoveredBlock === index && hoveredSection === section;
                const isEditing =
                  editingSection === section &&
                  editingIndex === index &&
                  editingBlock;
                const isDragging =
                  draggedItem?.section === section && draggedItem?.index === index;
                const isDragOver =
                  dragOverIndex?.section === section &&
                  dragOverIndex?.index === index;

                return (
                  <div key={block.id || index}>
                    <InlineBlock
                      block={block}
                      section={section}
                      index={index}
                      isPreviewMode={isPreviewMode}
                      isHovered={isHovered}
                      isEditing={isEditing}
                      isDragging={isDragging}
                      isDragOver={isDragOver}
                      onMouseEnter={() => onMouseEnter(index, section)}
                      onMouseLeave={onMouseLeave}
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onDragEnd={onDragEnd}
                      onEdit={onEdit}
                      onRemove={onRemove}
                      onUpdate={onUpdate}
                      onCloseEditor={onCloseEditor}
                      onImageUpload={(file) => onImageUpload(section, index, file)}
                      onAddChild={(type) => onAddChild(section, index, type)}
                      onRemoveChild={onRemoveChild}
                      onUpdateChild={onUpdateChild}
                      onImageUploadForChild={onImageUploadForChild}
                      onChildDragStart={onChildDragStart}
                      onChildDragOver={onChildDragOver}
                      onChildDrop={onChildDrop}
                      onChildDragEnd={onChildDragEnd}
                    />
                    {!isPreviewMode && (
                      <InsertButton
                        section={section}
                        position={index + 1}
                        onInsert={onInsert}
                      />
                    )}
                  </div>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
}
