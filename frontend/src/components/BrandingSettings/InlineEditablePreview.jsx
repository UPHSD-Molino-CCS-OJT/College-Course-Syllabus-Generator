import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Settings, Type, Image, Folder, Eye, Edit, X, Check } from 'lucide-react';
import TextBlockEditor from './TextBlockEditor';
import ImageBlockEditor from './ImageBlockEditor';
import GroupBlockEditor from './GroupBlockEditor';
import LayoutToggle from './LayoutToggle';

export default function InlineEditablePreview({ settings, handlers }) {
  const [editingBlock, setEditingBlock] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggedChild, setDraggedChild] = useState(null);
  const [dragOverChild, setDragOverChild] = useState(null);
  const [hoveredChild, setHoveredChild] = useState(null);

  const handleEdit = (section, index) => {
    // Toggle editing - if clicking the same block, close it
    if (editingSection === section && editingIndex === index) {
      setEditingBlock(null);
      setEditingSection(null);
      setEditingIndex(null);
    } else {
      setEditingSection(section);
      setEditingIndex(index);
      setEditingBlock(settings[section][index]);
    }
  };

  const handleCloseEditor = () => {
    setEditingBlock(null);
    setEditingSection(null);
    setEditingIndex(null);
  };

  const handleUpdate = (field, value) => {
    handlers.updateContentBlock(editingSection, editingIndex, field, value);
  };

  const handleDragStart = (e, section, index) => {
    setDraggedItem({ section, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, section, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex({ section, index });
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetSection, targetIndex) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const { section: sourceSection, index: sourceIndex } = draggedItem;
    
    // Only allow reordering within the same section
    if (sourceSection !== targetSection) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }
    
    if (sourceIndex === targetIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }
    
    // Reorder blocks
    const blocks = [...settings[sourceSection]];
    const [removed] = blocks.splice(sourceIndex, 1);
    blocks.splice(targetIndex, 0, removed);
    
    // Update order property
    const reorderedBlocks = blocks.map((block, idx) => ({
      ...block,
      order: idx,
    }));
    
    handlers.updateContentBlock(sourceSection, null, null, null, reorderedBlocks);
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  // Handlers for dragging children within groups
  const handleChildDragStart = (e, section, groupIndex, childIndex, childPath = []) => {
    e.stopPropagation();
    setDraggedChild({ section, groupIndex, childIndex, childPath });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleChildDragOver = (e, section, groupIndex, childIndex, childPath = []) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverChild({ section, groupIndex, childIndex, childPath });
  };

  const handleChildDrop = (e, section, groupIndex, targetChildIndex, childPath = []) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedChild) return;
    
    const { section: sourceSection, groupIndex: sourceGroupIndex, childIndex: sourceChildIndex, childPath: sourcePath } = draggedChild;
    
    // Only allow reordering within the same group
    if (sourceSection !== section || sourceGroupIndex !== groupIndex || JSON.stringify(sourcePath) !== JSON.stringify(childPath)) {
      setDraggedChild(null);
      setDragOverChild(null);
      return;
    }
    
    if (sourceChildIndex === targetChildIndex) {
      setDraggedChild(null);
      setDragOverChild(null);
      return;
    }
    
    // Get the parent group
    const block = settings[section][groupIndex];
    let children = [...(block.children || [])];
    
    // Navigate to nested group if childPath is provided
    let currentChildren = children;
    for (const pathIndex of childPath) {
      currentChildren = currentChildren[pathIndex].children || [];
    }
    
    // Reorder children
    const childrenCopy = [...currentChildren];
    const [removed] = childrenCopy.splice(sourceChildIndex, 1);
    childrenCopy.splice(targetChildIndex, 0, removed);
    
    // Update the children in the block
    if (childPath.length === 0) {
      // Direct children of the group
      handlers.updateContentBlock(section, groupIndex, 'children', childrenCopy);
    } else {
      // Nested children - need to update recursively
      const updateNestedChildren = (items, path, newChildren) => {
        if (path.length === 0) return newChildren;
        const [currentIndex, ...restPath] = path;
        return items.map((item, idx) => 
          idx === currentIndex
            ? { ...item, children: updateNestedChildren(item.children || [], restPath, newChildren) }
            : item
        );
      };
      
      const updatedChildren = updateNestedChildren(children, childPath, childrenCopy);
      handlers.updateContentBlock(section, groupIndex, 'children', updatedChildren);
    }
    
    setDraggedChild(null);
    setDragOverChild(null);
  };

  const handleChildDragEnd = () => {
    setDraggedChild(null);
    setDragOverChild(null);
  };

  const renderInlineBlock = (block, section, index) => {
    const isHovered = hoveredBlock === index && hoveredSection === section;
    const isEditing = editingSection === section && editingIndex === index && editingBlock;
    const isDragging = draggedItem?.section === section && draggedItem?.index === index;
    const isDragOver = dragOverIndex?.section === section && dragOverIndex?.index === index;
    
    // Get the live block from settings for editing
    const liveBlock = isEditing ? settings[section][index] : block;

    return (
      <div key={block.id || index} className="space-y-2">
        <div
          className={`relative ${!isPreviewMode ? 'group/block pt-10' : ''} ${isDragging ? 'opacity-40' : ''} ${isDragOver ? 'border-t-4 border-blue-500' : ''}`}
          draggable={!isPreviewMode && !isEditing}
          onDragStart={(e) => handleDragStart(e, section, index)}
          onDragOver={(e) => handleDragOver(e, section, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, section, index)}
          onDragEnd={handleDragEnd}
          onMouseEnter={() => {
            if (!isPreviewMode) {
              setHoveredBlock(index);
              setHoveredSection(section);
            }
          }}
          onMouseLeave={() => {
            if (!isPreviewMode) {
              setHoveredBlock(null);
              setHoveredSection(null);
            }
          }}
        >
          {/* Hover toolbar - Only show in edit mode */}
          {!isPreviewMode && (
            <div className={`absolute top-0 left-0 flex items-center gap-1 bg-gray-900 text-white px-2 py-1 rounded shadow-lg z-10 transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(section, index);
                }}
                className={`p-1 hover:bg-gray-700 rounded ${isEditing ? 'bg-blue-600' : ''}`}
                title={isEditing ? 'Close editor' : 'Edit'}
              >
                {isEditing ? <X size={14} /> : <Edit2 size={14} />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.removeContentBlock(section, index);
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
              !isPreviewMode && (isHovered || isEditing) ? 'ring-2 ring-blue-400 ring-offset-2 rounded' : ''
            }`}
            onClick={() => !isPreviewMode && !isDragging && handleEdit(section, index)}
            style={{ cursor: isPreviewMode ? 'default' : isDragging ? 'grabbing' : 'pointer' }}
          >
            {renderBlockContent(block, section, index)}
          </div>
        </div>

        {/* Inline Editor Panel */}
        {isEditing && !isPreviewMode && (
          <div className="bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 space-y-4 animate-in slide-in-from-top-2">
            {/* Editor Header */}
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
                onClick={handleCloseEditor}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
              >
                <Check size={14} />
                Done
              </button>
            </div>

            {/* Editor Content */}
            {block.type === 'group' ? (
              <GroupBlockEditor
                block={liveBlock}
                onUpdate={handleUpdate}
                onAddChild={(type) => handlers.addChildToGroup(editingSection, editingIndex, type)}
                onRemoveChild={(childIndex) => handlers.removeChildFromGroup(editingSection, editingIndex, childIndex)}
                onUpdateChild={(childIndex, field, value) => handlers.updateGroupChild(editingSection, editingIndex, childIndex, field, value)}
              />
            ) : block.type === 'text' ? (
              <>
                <TextBlockEditor block={liveBlock} onUpdate={handleUpdate} />
                {/* Alignment for text blocks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => handleUpdate('alignment', align)}
                        className={`flex-1 px-4 py-2 text-sm rounded border transition-colors ${
                          liveBlock.alignment === align
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
                  block={liveBlock}
                  onUpdate={handleUpdate}
                  onImageUpload={(file) => handlers.handleImageUploadForBlock(editingSection, editingIndex, file)}
                />
                {/* Alignment for image blocks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => handleUpdate('alignment', align)}
                        className={`flex-1 px-4 py-2 text-sm rounded border transition-colors ${
                          liveBlock.alignment === align
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
        )}
      </div>
    );
  };

  const renderBlockContent = (block, section = null, groupIndex = null, childPath = []) => {
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
          {(block.children || []).map((child, childIndex) => {
            const childKey = `${section}-${groupIndex}-${childPath.join('-')}-${childIndex}`;
            const isChildDragging = draggedChild?.section === section && 
                                   draggedChild?.groupIndex === groupIndex && 
                                   draggedChild?.childIndex === childIndex &&
                                   JSON.stringify(draggedChild?.childPath) === JSON.stringify(childPath);
            const isChildDragOver = dragOverChild?.section === section && 
                                   dragOverChild?.groupIndex === groupIndex && 
                                   dragOverChild?.childIndex === childIndex &&
                                   JSON.stringify(dragOverChild?.childPath) === JSON.stringify(childPath);
            const isChildHovered = hoveredChild?.key === childKey;
            
            return (
              <div 
                key={child.id || childIndex}
                className={`relative group/child ${
                  !isPreviewMode && section !== null ? 'pt-10' : ''
                } ${
                  isChildDragging ? 'opacity-40' : ''
                } ${
                  isChildDragOver ? 'border-t-2 border-purple-500' : ''
                }`}
                draggable={!isPreviewMode && section !== null}
                onDragStart={(e) => section !== null && handleChildDragStart(e, section, groupIndex, childIndex, childPath)}
                onDragOver={(e) => section !== null && handleChildDragOver(e, section, groupIndex, childIndex, childPath)}
                onDrop={(e) => section !== null && handleChildDrop(e, section, groupIndex, childIndex, childPath)}
                onDragEnd={handleChildDragEnd}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  if (!isPreviewMode && section !== null) {
                    setHoveredChild({ key: childKey, section, groupIndex, childIndex, childPath });
                  }
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  if (!isPreviewMode && section !== null) {
                    setHoveredChild(null);
                  }
                }}
              >
                {/* Hover toolbar for child elements */}
                {!isPreviewMode && section !== null && (
                  <div className={`absolute top-0 left-0 flex items-center gap-1 bg-purple-900 text-white px-2 py-1 rounded shadow-lg z-20 text-xs transition-opacity duration-200 ${
                    isChildHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open group editor to edit this child
                        handleEdit(section, groupIndex);
                      }}
                      className="p-0.5 hover:bg-purple-700 rounded"
                      title="Edit"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (childPath.length === 0) {
                          handlers.removeChildFromGroup(section, groupIndex, childIndex);
                        } else {
                          // Remove from nested group
                          const block = settings[section][groupIndex];
                          let children = [...(block.children || [])];
                          
                          const removeFromNested = (items, path, indexToRemove) => {
                            if (path.length === 0) {
                              return items.filter((_, idx) => idx !== indexToRemove);
                            }
                            const [currentIndex, ...restPath] = path;
                            return items.map((item, idx) => 
                              idx === currentIndex
                                ? { ...item, children: removeFromNested(item.children || [], restPath, indexToRemove) }
                                : item
                            );
                          };
                          
                          const updatedChildren = removeFromNested(children, childPath, childIndex);
                          handlers.updateContentBlock(section, groupIndex, 'children', updatedChildren);
                        }
                      }}
                      className="p-0.5 hover:bg-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
                
                <div className={`${
                  !isPreviewMode && section !== null && isChildHovered ? 'ring-2 ring-purple-400 ring-offset-1 rounded' : ''
                }`}>
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
                    renderBlockContent(child, section, groupIndex, [...childPath, childIndex])
                  )}
                </div>
              </div>
            );
          })}
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
    // Don't show insert buttons in preview mode
    if (isPreviewMode) return null;

    return (
      <div className="relative group/insert my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-dashed border-gray-300 group-hover/insert:border-blue-500 transition-colors"></div>
        </div>
        <div className="relative flex justify-center">
          <button
            type="button"
            className="opacity-0 group-hover/insert:opacity-100 transition-all bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transform hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              // Show popup menu
              const menu = e.currentTarget.nextElementSibling;
              if (menu) {
                menu.classList.toggle('hidden');
              }
            }}
            title="Add element"
          >
            <Plus size={16} />
          </button>
          <div className="hidden absolute top-12 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-2 z-20 flex gap-2">
            <button
              type="button"
              onClick={() => handlers.insertContentBlockAt(section, position, 'text')}
              className="flex flex-col items-center gap-2 p-4 hover:bg-blue-50 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all group"
              title="Add text block"
            >
              <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-lg">
                <Type size={24} className="text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Text</span>
            </button>
            <button
              type="button"
              onClick={() => handlers.insertContentBlockAt(section, position, 'image')}
              className="flex flex-col items-center gap-2 p-4 hover:bg-green-50 rounded-lg border-2 border-transparent hover:border-green-500 transition-all group"
              title="Add image block"
            >
              <div className="p-3 bg-green-100 group-hover:bg-green-200 rounded-lg">
                <Image size={24} className="text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Image</span>
            </button>
            <button
              type="button"
              onClick={() => handlers.insertContentBlockAt(section, position, 'group')}
              className="flex flex-col items-center gap-2 p-4 hover:bg-purple-50 rounded-lg border-2 border-transparent hover:border-purple-500 transition-all group"
              title="Add group block"
            >
              <div className="p-3 bg-purple-100 group-hover:bg-purple-200 rounded-lg">
                <Folder size={24} className="text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Group</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (section, title) => {
    const layoutField = section === 'headerContent' ? 'headerLayout' : 'footerLayout';
    const blocks = settings[section] || [];

    return (
      <div className={isPreviewMode ? '' : 'bg-gray-100 p-6 border-b-2 border-gray-300'}>
        {/* Section header with layout toggle (only in edit mode) */}
        {!isPreviewMode && (
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
            <LayoutToggle
              layoutField={layoutField}
              currentLayout={settings[layoutField]}
              onLayoutChange={handlers.handleLayoutChange}
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
                <p className="text-gray-400 text-sm italic">No {title.toLowerCase()} content</p>
              </div>
            ) : (
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
            )
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
      {/* Mode Toggle */}
      <div className="flex justify-end items-center gap-4 pb-4 border-b mb-6">
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isPreviewMode 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isPreviewMode ? (
            <>
              <Edit className="w-4 h-4" />
              Switch to Edit Mode
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Switch to Preview Mode
            </>
          )}
        </button>
      </div>

      {isPreviewMode ? (
        /* Preview Mode: Legal Landscape Paper (14" x 8.5" = 1344px x 816px at 96 DPI) */
        <div className="space-y-6">
          {[1, 2].map((pageNum) => (
            <div
              key={pageNum}
              className="mx-auto bg-white shadow-2xl"
              style={{
                width: '1344px',
                height: '816px',
                fontFamily: settings.fontFamily,
              }}
            >
              {/* Header */}
              {(settings.headerContent?.length > 0 || pageNum === 1) && (
                <div className="p-6 border-b">
                  {settings.headerContent?.length > 0 ? (
                    <div
                      className={settings.headerLayout === 'horizontal' ? 'flex items-center gap-4 flex-wrap justify-between' : 'space-y-4'}
                    >
                      {settings.headerContent
                        .sort((a, b) => a.order - b.order)
                        .map((block, index) => (
                          <div key={block.id || index}>{renderBlockContent(block)}</div>
                        ))}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Page Content */}
              <div className="p-8 flex-1">
                <h1 className="text-3xl font-bold mb-4" style={{ color: settings.secondaryColor }}>
                  {pageNum === 1 ? 'Course Syllabus' : 'Course Syllabus - Page 2'}
                </h1>
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>Course Code:</strong> CS 101 | <strong>Course Title:</strong> Introduction to Computer Science
                  </p>
                  <p>
                    <strong>Instructor:</strong> Dr. Jane Smith | <strong>Term:</strong> Spring 2026
                  </p>
                  <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Course Description</h2>
                    <p className="text-justify">
                      {pageNum === 1
                        ? 'This course provides a comprehensive introduction to the field of computer science. Students will learn fundamental programming concepts, problem-solving techniques, and computational thinking. Topics include algorithms, data structures, software development principles, and an overview of computer systems. The course emphasizes hands-on programming experience using modern programming languages and tools.'
                        : 'Through a combination of lectures, laboratory exercises, and projects, students will develop practical skills in writing, testing, and debugging programs. The course also introduces students to important concepts in software engineering, including version control, documentation, and collaborative development. Upon completion, students will have a solid foundation for further study in computer science and related disciplines.'}
                    </p>
                  </div>
                  {pageNum === 1 && (
                    <>
                      <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Learning Objectives</h2>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Understand fundamental programming concepts and paradigms</li>
                          <li>Develop problem-solving skills using computational thinking</li>
                          <li>Write, test, and debug programs in a high-level programming language</li>
                          <li>Apply basic algorithms and data structures to solve problems</li>
                        </ul>
                      </div>
                      <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Required Materials</h2>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Textbook: "Introduction to Computing" (Latest Edition)</li>
                          <li>Laptop with required software installed</li>
                          <li>Access to online learning platform</li>
                        </ul>
                      </div>
                    </>
                  )}
                  {pageNum === 2 && (
                    <>
                      <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Grading Policy</h2>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Programming Assignments: 40%</li>
                          <li>Midterm Exam: 20%</li>
                          <li>Final Exam: 25%</li>
                          <li>Class Participation: 10%</li>
                          <li>Final Project: 5%</li>
                        </ul>
                      </div>
                      <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Course Schedule</h2>
                        <p className="text-sm">
                          Week 1-2: Introduction to Programming | Week 3-4: Control Structures |
                          Week 5-6: Functions and Modules | Week 7-8: Data Structures |
                          Week 9-10: Object-Oriented Programming | Week 11-12: Algorithms |
                          Week 13-14: Software Development | Week 15-16: Final Project
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
              {(settings.footerContent?.length > 0 || pageNum === 1) && (
                <div className="p-6 border-t">
                  {settings.footerContent?.length > 0 ? (
                    <div
                      className={settings.footerLayout === 'horizontal' ? 'flex items-center gap-4 flex-wrap justify-between' : 'space-y-4'}
                    >
                      {settings.footerContent
                        .sort((a, b) => a.order - b.order)
                        .map((block, index) => (
                          <div key={block.id || index}>{renderBlockContent(block)}</div>
                        ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Edit Mode: Original compact view */
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
      )}
    </>
  );
}
