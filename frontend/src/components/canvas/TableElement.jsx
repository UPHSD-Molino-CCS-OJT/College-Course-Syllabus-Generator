import { useState } from 'react';
import ElementDragHandle from './ElementDragHandle';
import RichTextEditor from '../RichTextEditor';

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
  const [selectedCell, setSelectedCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  const handleCellClick = (e, rowIndex, colIndex) => {
    e.stopPropagation();
    // Select the cell (highlight it)
    if (isSelected) {
      setSelectedCell({ rowIndex, colIndex });
      // Exit edit mode if clicking a different cell
      if (editingCell && (editingCell.rowIndex !== rowIndex || editingCell.colIndex !== colIndex)) {
        setEditingCell(null);
      }
    }
  };

  const handleCellDoubleClick = (e, rowIndex, colIndex) => {
    e.stopPropagation();
    // Double-click enters edit mode
    if (isSelected) {
      setSelectedCell({ rowIndex, colIndex });
      setEditingCell({ rowIndex, colIndex });
    }
  };

  const handleCellChange = (newContent, rowIndex, colIndex) => {
    const newData = element.data.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        rIdx === rowIndex && cIdx === colIndex
          ? { ...cell, content: newContent }
          : cell
      )
    );
    onUpdate(zone, element.id, { data: newData });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    // Enter key starts editing on selected cell
    if (e.key === 'Enter' && selectedCell && !editingCell) {
      e.preventDefault();
      setEditingCell({ rowIndex, colIndex });
    }
    // Escape exits edit mode
    if (e.key === 'Escape' && editingCell) {
      setEditingCell(null);
    }
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
      <table style={{ borderCollapse: 'collapse', borderSpacing: '0', userSelect: 'none' }}>
        <tbody>
          {element.data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isCellEditing = editingCell?.rowIndex === rowIndex && 
                                     editingCell?.colIndex === colIndex;
                const isCellSelected = isSelected && selectedCell?.rowIndex === rowIndex && 
                                      selectedCell?.colIndex === colIndex;
                const isHovered = isSelected && hoveredCell?.rowIndex === rowIndex && 
                                 hoveredCell?.colIndex === colIndex;
                
                return (
                  <td
                    key={colIndex}
                    className={`relative group transition-all ${
                      isCellEditing ? 'ring-2 ring-blue-500 ring-inset' :
                      isCellSelected ? 'ring-2 ring-blue-300 ring-inset bg-blue-50' :
                      isSelected && !isCellEditing ? 'hover:ring-1 hover:ring-blue-400 hover:ring-inset' : ''
                    }`}
                    style={{
                      width: cell.width || element.cellWidth,
                      height: cell.height || element.cellHeight,
                      borderTop: (cell.showBorderTop !== undefined ? cell.showBorderTop : element.showBorderTop !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderRight: (cell.showBorderRight !== undefined ? cell.showBorderRight : element.showBorderRight !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderBottom: (cell.showBorderBottom !== undefined ? cell.showBorderBottom : element.showBorderBottom !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderLeft: (cell.showBorderLeft !== undefined ? cell.showBorderLeft : element.showBorderLeft !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      backgroundColor: isCellSelected && !isCellEditing ? '#eff6ff' : isHovered ? '#dbeafe' : cell.bg,
                      fontSize: cell.fontSize,
                      fontFamily: cell.fontFamily,
                      fontWeight: cell.fontWeight,
                      color: cell.color,
                      textAlign: cell.align,
                      verticalAlign: cell.verticalAlign || 'top',
                      padding: isCellEditing ? '0' : '8px',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      position: 'relative',
                      userSelect: isCellEditing ? 'text' : 'none',
                      cursor: isCellSelected && !isCellEditing ? 'text' : (isSelected ? 'pointer' : 'default')
                    }}
                    onMouseEnter={() => setHoveredCell({ rowIndex, colIndex })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onMouseDown={(e) => {
                      if (e.target.classList.contains('resize-handle') || isCellEditing) {
                        return;
                      }
                      // Only allow table dragging if clicking outside cell content area when selected
                      if (!isSelected) {
                        onMouseDown(e, element, zone);
                      } else {
                        // When table is selected, prevent drag to allow cell selection
                        e.stopPropagation();
                      }
                    }}
                    onClick={(e) => handleCellClick(e, rowIndex, colIndex)}
                    onDoubleClick={(e) => handleCellDoubleClick(e, rowIndex, colIndex)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    tabIndex={isSelected ? 0 : -1}
                  >
                    {isCellEditing ? (
                      <RichTextEditor
                        content={cell.content}
                        onUpdate={(newContent) => handleCellChange(newContent, rowIndex, colIndex)}
                        onBlur={handleCellBlur}
                        style={{
                          fontSize: cell.fontSize,
                          fontFamily: cell.fontFamily,
                          fontWeight: cell.fontWeight,
                          color: cell.color,
                          textAlign: cell.align,
                          width: '100%',
                          height: '100%',
                          padding: '8px'
                        }}
                        className="bg-white border-2 border-blue-500"
                      />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: cell.content || '' }}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                    {isCellSelected && !isCellEditing && (
                      <div className="absolute top-1 right-1 text-blue-400 text-xs opacity-75 pointer-events-none">
                        Press Enter or Double-click to edit
                      </div>
                    )}
                    {isSelected && !isCellEditing && (
                      <>
                        {/* Right edge handle for column width */}
                        <div
                          className="resize-handle absolute top-0 right-0 w-2 h-full bg-blue-400/60 hover:bg-blue-500 cursor-ew-resize transition-all select-none"
                          style={{
                            transform: 'translateX(1px)',
                            zIndex: 10,
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCellResizeStart(e, element, zone, rowIndex, colIndex, 'width');
                          }}
                          title="Resize column width"
                        />
                        {/* Bottom edge handle for row height */}
                        <div
                          className="resize-handle absolute bottom-0 left-0 w-full h-2 bg-blue-400/60 hover:bg-blue-500 cursor-ns-resize transition-all select-none"
                          style={{
                            transform: 'translateY(1px)',
                            zIndex: 10,
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCellResizeStart(e, element, zone, rowIndex, colIndex, 'height');
                          }}
                          title="Resize row height"
                        />
                        {/* Corner handle for both dimensions */}
                        <div
                          className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 hover:bg-blue-600 cursor-nwse-resize transition-all shadow-md select-none"
                          style={{
                            transform: 'translate(2px, 2px)',
                            borderRadius: '0 0 4px 0',
                            zIndex: 11,
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCellResizeStart(e, element, zone, rowIndex, colIndex, 'both');
                          }}
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
