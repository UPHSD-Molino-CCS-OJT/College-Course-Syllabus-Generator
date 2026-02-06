import { useState } from 'react';
import ElementDragHandle from './ElementDragHandle';

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

  const handleChange = (e) => {
    onUpdate(zone, element.id, { content: e.target.value });
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
        <textarea
          autoFocus
          value={element.content}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full min-h-[30px] bg-white border-2 border-blue-500 rounded px-2 py-1 outline-none resize-none"
          style={textStyle}
        />
      ) : (
        <div className="whitespace-pre-wrap">{element.content}</div>
      )}
    </div>
  );
}
