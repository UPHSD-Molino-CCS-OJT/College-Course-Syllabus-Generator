import { useState } from 'react';
import ElementDragHandle from './ElementDragHandle';

export default function TableElement({
  element,
  zone,
  isSelected,
  onSelect,
  onUpdate,
  onMouseDown
}) {
  const [editingCell, setEditingCell] = useState(null);
  const [resizingCell, setResizingCell] = useState(null);

  const handleCellDoubleClick = (e, rowIndex, colIndex) => {
    e.stopPropagation();
    setEditingCell({ rowIndex, colIndex });
  };

  const handleCellChange = (e, rowIndex, colIndex) => {
    const newData = element.data.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        rIdx === rowIndex && cIdx === colIndex
          ? { ...cell, content: e.target.value }
          : cell
      )
    );
    onUpdate(zone, element.id, { data: newData });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleCellResizeStart = (e, rowIndex, colIndex, direction) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const cell = element.data[rowIndex][colIndex];
    const startWidth = cell.width || element.cellWidth || 150;
    const startHeight = cell.height || element.cellHeight || 40;
    
    setResizingCell({
      rowIndex,
      colIndex,
      direction,
      startX,
      startY,
      startWidth,
      startHeight
    });
  };

  return (
    <div
      key={element.id}
      className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: element.x,
        top: element.y
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element);
      }}
    >
      {isSelected && <ElementDragHandle onMouseDown={(e) => onMouseDown(e, element, zone)} />}
      <table style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
        <tbody>
          {element.data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isCellEditing = editingCell?.rowIndex === rowIndex && 
                                     editingCell?.colIndex === colIndex;
                
                return (
                  <td
                    key={colIndex}
                    className="relative group"
                    style={{
                      width: cell.width || element.cellWidth,
                      height: cell.height || element.cellHeight,
                      borderTop: (cell.showBorderTop !== undefined ? cell.showBorderTop : element.showBorderTop !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderRight: (cell.showBorderRight !== undefined ? cell.showBorderRight : element.showBorderRight !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderBottom: (cell.showBorderBottom !== undefined ? cell.showBorderBottom : element.showBorderBottom !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderLeft: (cell.showBorderLeft !== undefined ? cell.showBorderLeft : element.showBorderLeft !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      backgroundColor: cell.bg,
                      fontSize: cell.fontSize,
                      fontFamily: cell.fontFamily,
                      fontWeight: cell.fontWeight,
                      color: cell.color,
                      textAlign: cell.align,
                      verticalAlign: cell.verticalAlign || 'top',
                      padding: isCellEditing ? '0' : '8px',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    }}
                    onMouseDown={(e) => {
                      if (e.target.classList.contains('resize-handle') || isCellEditing) {
                        return;
                      }
                      onMouseDown(e, element, zone);
                    }}
                    onDoubleClick={(e) => handleCellDoubleClick(e, rowIndex, colIndex)}
                  >
                    {isCellEditing ? (
                      <textarea
                        autoFocus
                        value={cell.content}
                        onChange={(e) => handleCellChange(e, rowIndex, colIndex)}
                        onBlur={handleCellBlur}
                        className="w-full h-full bg-white border-2 border-blue-500 outline-none resize-none p-2"
                        style={{
                          fontSize: cell.fontSize,
                          fontFamily: cell.fontFamily,
                          fontWeight: cell.fontWeight,
                          color: cell.color,
                          textAlign: cell.align,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ) : (
                      cell.content
                    )}
                    {isSelected && !isCellEditing && (
                      <>
                        <div
                          className="resize-handle absolute top-0 right-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 cursor-ew-resize"
                          onMouseDown={(e) => handleCellResizeStart(e, rowIndex, colIndex, 'width')}
                        />
                        <div
                          className="resize-handle absolute bottom-0 left-0 w-full h-1 bg-blue-500 opacity-0 group-hover:opacity-100 cursor-ns-resize"
                          onMouseDown={(e) => handleCellResizeStart(e, rowIndex, colIndex, 'height')}
                        />
                        <div
                          className="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-blue-500 opacity-0 group-hover:opacity-100 cursor-nwse-resize"
                          onMouseDown={(e) => handleCellResizeStart(e, rowIndex, colIndex, 'both')}
                        />
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
