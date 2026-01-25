import GroupChild from './GroupChild';

export default function GroupContent({
  block,
  section,
  groupIndex,
  childPath = [],
  isPreviewMode,
  onChildDragStart,
  onChildDragOver,
  onChildDrop,
  onChildDragEnd,
  onRemoveChild,
  onUpdateChild,
  onImageUploadForChild,
}) {
  const groupLayout = block.layout || 'horizontal';

  const handleRemoveChild = (childIndex, path) => {
    onRemoveChild(section, groupIndex, childIndex, path);
  };

  const handleUpdateChild = (childIndex, field, value, path) => {
    onUpdateChild(section, groupIndex, childIndex, field, value, path);
  };

  const renderNestedGroup = (child, sec, grpIdx, path) => {
    return (
      <GroupContent
        block={child}
        section={sec}
        groupIndex={grpIdx}
        childPath={path}
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
  };

  return (
    <div
      data-group-container="true"
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
        <GroupChild
          key={child.id || childIndex}
          child={child}
          childIndex={childIndex}
          section={section}
          groupIndex={groupIndex}
          childPath={childPath}
          isPreviewMode={isPreviewMode}
          onDragStart={onChildDragStart}
          onDragOver={onChildDragOver}
          onDrop={onChildDrop}
          onDragEnd={onChildDragEnd}
          onRemove={handleRemoveChild}
          onUpdate={handleUpdateChild}
          onImageUpload={onImageUploadForChild}
          renderNestedGroup={renderNestedGroup}
        />
      ))}
    </div>
  );
}
