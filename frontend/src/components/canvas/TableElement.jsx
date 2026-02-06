import { useState } from 'react';
import ElementDragHandle from './ElementDragHandle';

export default function TableElement({
  element,
  zone,
  isSelected,
  onSelect,
  onUpdate,
  onMouseDown,
  onCellResizeStart
}) {
  const [editingCell, setEditingCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

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
      <table style={{ borderCollapse: 'collapse', borderSpacing: '0' }}>
        <tbody>
          {element.data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isCellEditing = editingCell?.rowIndex === rowIndex && 
                                     editingCell?.colIndex === colIndex;
                const isHovered = isSelected && hoveredCell?.rowIndex === rowIndex && 
                                 hoveredCell?.colIndex === colIndex;
                
                return (
                  <td
                    key={colIndex}
                    className="relative group transition-all"
                    style={{
                      width: cell.width || element.cellWidth,
                      height: cell.height || element.cellHeight,
                      borderTop: (cell.showBorderTop !== undefined ? cell.showBorderTop : element.showBorderTop !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderRight: (cell.showBorderRight !== undefined ? cell.showBorderRight : element.showBorderRight !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderBottom: (cell.showBorderBottom !== undefined ? cell.showBorderBottom : element.showBorderBottom !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderLeft: (cell.showBorderLeft !== undefined ? cell.showBorderLeft : element.showBorderLeft !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      backgroundColor: isHovered ? '#dbeafe' : cell.bg,
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
                    onMouseEnter={() => setHoveredCell({ rowIndex, colIndex })}
                    onMouseLeave={() => setHoveredCell(null)}
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
                        {/* Right edge handle for column width */}
                        <div
                          className="resize-handle absolute top-0 right-0 w-2 h-full bg-blue-400/60 hover:bg-blue-500 cursor-ew-resize transition-all"
                          style={{
                            transform: 'translateX(1px)',
                            zIndex: 10
                          }}
                          onMouseDown={(e) => handleCellResizeStart(e, rowIndex, colIndex, 'width')}
                          title="Resize column width"
                        />
                        {/* Bottom edge handle for row height */}
                        <div
                          className="resize-handle absolute bottom-0 left-0 w-full h-2 bg-blue-400/60 hover:bg-blue-500 cursor-ns-resize transition-all"
                          style={{
                            transform: 'translateY(1px)',
                            zIndex: 10
                          }}
                          onMouseDown={(e) => handleCellResizeStart(e, rowIndex, colIndex, 'height')}
                          title="Resize row height"
                        />
                        {/* Corner handle for both dimensions */}
                        <div
                          className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 hover:bg-blue-600 cursor-nwse-resize transition-all shadow-md"
                          style={{
                            transform: 'translate(2px, 2px)',
                            borderRadius: '0 0 4px 0',
                            zIndex: 11
                          }}
                          onMouseDown={(e) => handleCellResizeStart(e, rowIndex, colIndex, 'both')}
                          title="Resize both width and height"
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
