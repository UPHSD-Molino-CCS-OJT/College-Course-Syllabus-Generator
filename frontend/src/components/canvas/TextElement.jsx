import { useState } from 'react';
import ElementDragHandle from './ElementDragHandle';
import RichTextEditor from '../RichTextEditor';

export default function TextElement({
  element,
  zone,
  pageSize,
  isSelected,
  onSelect,
  onUpdate,
  onMouseDown
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (newContent) => {
    onUpdate(zone, element.id, { content: newContent });
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  let textDecoration = '';
  if (element.underline && element.strikethrough) {
    textDecoration = 'underline line-through';
  } else if (element.underline) {
    textDecoration = 'underline';
  } else if (element.strikethrough) {
    textDecoration = 'line-through';
  } else {
    textDecoration = 'none';
  }

  const textStyle = {
    fontSize: element.fontSize,
    fontFamily: element.fontFamily,
    fontWeight: element.fontWeight,
    color: element.color,
    fontStyle: element.italic ? 'italic' : 'normal',
    textDecoration: textDecoration,
    textTransform: element.textTransform || 'none',
    letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
    lineHeight: element.lineHeight || 1.5,
  };

  if (element.bold) {
    textStyle.fontWeight = 'bold';
  }

  return (
    <div
      key={element.id}
      className={`absolute select-none ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.fullWidth ? `${pageSize.width - element.x}px` : (element.width || 200),
        textAlign: element.align || 'left',
        ...textStyle
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element);
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isSelected && <ElementDragHandle onMouseDown={(e) => onMouseDown(e, element, zone)} />}
      {isEditing ? (
        <RichTextEditor
          content={element.content}
          onUpdate={handleChange}
          onBlur={handleBlur}
          style={textStyle}
          className="w-full min-h-[30px] px-2 py-1"
        />
      ) : (
        <div 
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: element.content || '' }}
        />
      )}
    </div>
  );
}
