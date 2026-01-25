import { useState } from 'react';
import { Eye, Edit } from 'lucide-react';
import SectionRenderer from './SectionRenderer';
import GroupContent from './GroupContent';

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

  const handleMouseEnter = (index, section) => {
    if (!isPreviewMode) {
      setHoveredBlock(index);
      setHoveredSection(section);
    }
  };

  const handleMouseLeave = () => {
    if (!isPreviewMode) {
      setHoveredBlock(null);
      setHoveredSection(null);
    }
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

  const handleRemoveChild = (section, groupIndex, childIndex, childPath) => {
    if (childPath.length === 0) {
      handlers.removeChildFromGroup(section, groupIndex, childIndex);
    } else {
      const block = settings[section][groupIndex];
      let children = [...(block.children || [])];

      const removeFromNested = (items, path, indexToRemove) => {
        if (path.length === 0) {
          return items.filter((_, idx) => idx !== indexToRemove);
        }
        const [currentIndex, ...restPath] = path;
        return items.map((item, idx) =>
          idx === currentIndex
            ? {
                ...item,
                children: removeFromNested(item.children || [], restPath, indexToRemove),
              }
            : item
        );
      };

      const updatedChildren = removeFromNested(children, childPath, childIndex);
      handlers.updateContentBlock(section, groupIndex, 'children', updatedChildren);
    }
  };

  const handleUpdateChild = (section, groupIndex, childIndex, field, value, childPath) => {
    if (childPath.length === 0) {
      handlers.updateGroupChild(section, groupIndex, childIndex, field, value);
    } else {
      const block = settings[section][groupIndex];
      let children = [...(block.children || [])];

      const updateNested = (items, path, indexToUpdate, fld, val) => {
        if (path.length === 0) {
          return items.map((item, idx) =>
            idx === indexToUpdate
              ? fld.includes('.')
                ? {
                    ...item,
                    styles: {
                      ...item.styles,
                      [fld.split('.')[1]]: val,
                    },
                  }
                : { ...item, [fld]: val }
              : item
          );
        }
        const [currentIndex, ...restPath] = path;
        return items.map((item, idx) =>
          idx === currentIndex
            ? {
                ...item,
                children: updateNested(
                  item.children || [],
                  restPath,
                  indexToUpdate,
                  fld,
                  val
                ),
              }
            : item
        );
      };

      const updatedChildren = updateNested(children, childPath, childIndex, field, value);
      handlers.updateContentBlock(section, groupIndex, 'children', updatedChildren);
    }
  };

  const handleImageUploadForChild = (section, groupIndex, childIndex, file, childPath) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateChild(section, groupIndex, childIndex, 'content', reader.result, childPath);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderSimpleBlockContent = (block) => {
    if (block.type === 'group') {
      return (
        <GroupContent
          block={block}
          section={null}
          groupIndex={null}
          isPreviewMode={true}
          onChildDragStart={() => {}}
          onChildDragOver={() => {}}
          onChildDrop={() => {}}
          onChildDragEnd={() => {}}
          onRemoveChild={() => {}}
          onUpdateChild={() => {}}
          onImageUploadForChild={() => {}}
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

  const renderBlockContent = (block) => {
    if (block.type === 'group') {
      return (
        <GroupContent
          block={block}
          section={null}
          groupIndex={null}
          isPreviewMode={true}
          onChildDragStart={() => {}}
          onChildDragOver={() => {}}
          onChildDrop={() => {}}
          onChildDragEnd={() => {}}
          onRemoveChild={() => {}}
          onUpdateChild={() => {}}
          onImageUploadForChild={() => {}}
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
          <SectionRenderer
            section="headerContent"
            title="Header"
            settings={settings}
            blocks={settings.headerContent || []}
            layoutField="headerLayout"
            isPreviewMode={isPreviewMode}
            hoveredBlock={hoveredBlock}
            hoveredSection={hoveredSection}
            editingBlock={editingBlock}
            editingSection={editingSection}
            editingIndex={editingIndex}
            draggedItem={draggedItem}
            dragOverIndex={dragOverIndex}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onEdit={handleEdit}
            onRemove={handlers.removeContentBlock}
            onUpdate={handleUpdate}
            onCloseEditor={handleCloseEditor}
            onImageUpload={handlers.handleImageUploadForBlock}
            onAddChild={handlers.addChildToGroup}
            onRemoveChild={handleRemoveChild}
            onUpdateChild={handleUpdateChild}
            onImageUploadForChild={handleImageUploadForChild}
            onChildDragStart={handleChildDragStart}
            onChildDragOver={handleChildDragOver}
            onChildDrop={handleChildDrop}
            onChildDragEnd={handleChildDragEnd}
            onInsert={handlers.insertContentBlockAt}
            onLayoutChange={handlers.handleLayoutChange}
          />

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
          <SectionRenderer
            section="footerContent"
            title="Footer"
            settings={settings}
            blocks={settings.footerContent || []}
            layoutField="footerLayout"
            isPreviewMode={isPreviewMode}
            hoveredBlock={hoveredBlock}
            hoveredSection={hoveredSection}
            editingBlock={editingBlock}
            editingSection={editingSection}
            editingIndex={editingIndex}
            draggedItem={draggedItem}
            dragOverIndex={dragOverIndex}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onEdit={handleEdit}
            onRemove={handlers.removeContentBlock}
            onUpdate={handleUpdate}
            onCloseEditor={handleCloseEditor}
            onImageUpload={handlers.handleImageUploadForBlock}
            onAddChild={handlers.addChildToGroup}
            onRemoveChild={handleRemoveChild}
            onUpdateChild={handleUpdateChild}
            onImageUploadForChild={handleImageUploadForChild}
            onChildDragStart={handleChildDragStart}
            onChildDragOver={handleChildDragOver}
            onChildDrop={handleChildDrop}
            onChildDragEnd={handleChildDragEnd}
            onInsert={handlers.insertContentBlockAt}
            onLayoutChange={handlers.handleLayoutChange}
          />
        </div>
      )}
    </>
  );
}
