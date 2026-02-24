import { useState, useEffect } from 'react';
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
  const [hoveredCell, setHoveredCell] = useState(null);

  // Clear cell focus whenever this table loses selection
  useEffect(() => {
    if (!isSelected) {
      setEditingCell(null);
      setHoveredCell(null);
    }
  }, [isSelected]);

  const handleCellClick = (e, rowIndex, colIndex) => {
    e.stopPropagation();
    // Select table and enter edit mode immediately
    onSelect(element);
    // Only change editing cell if clicking a different cell
    if (!editingCell || editingCell.rowIndex !== rowIndex || editingCell.colIndex !== colIndex) {
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

  // Compute which cells are hidden because they're covered by a spanning cell
  const computeCoveredCells = (data) => {
    const covered = new Set();
    data.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        const cs = cell.colspan || 1;
        const rs = cell.rowspan || 1;
        if (cs > 1 || rs > 1) {
          for (let dr = 0; dr < rs; dr++) {
            for (let dc = 0; dc < cs; dc++) {
              if (dr === 0 && dc === 0) continue;
              covered.add(`${rIdx + dr}-${cIdx + dc}`);
            }
          }
        }
      });
    });
    return covered;
  };

  const coveredCells = computeCoveredCells(element.data);

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
        // Close editor if clicking on table background (not a cell)
        if (e.target === e.currentTarget) {
          setEditingCell(null);
        }
      }}
    >
      {isSelected && <ElementDragHandle onMouseDown={(e) => onMouseDown(e, element, zone)} />}
      <table style={{ borderCollapse: 'collapse', borderSpacing: '0', userSelect: 'none', tableLayout: 'fixed' }}>
        <tbody>
          {element.data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                // Skip cells covered by a spanning ancestor
                if (coveredCells.has(`${rowIndex}-${colIndex}`)) return null;

                const isCellEditing = editingCell?.rowIndex === rowIndex && 
                                     editingCell?.colIndex === colIndex;
                const isHovered = isSelected && hoveredCell?.rowIndex === rowIndex && 
                                 hoveredCell?.colIndex === colIndex;
                
                return (
                  <td
                    key={colIndex}
                    colSpan={cell.colspan || 1}
                    rowSpan={cell.rowspan || 1}
                    className={`relative group ${
                      isCellEditing ? 'ring-2 ring-blue-500 ring-inset' :
                      isSelected && !isCellEditing ? 'hover:ring-1 hover:ring-blue-400 hover:ring-inset hover:bg-blue-50' : ''
                    }`}
                    style={{
                      width: cell.width || element.cellWidth,
                      maxWidth: cell.width || element.cellWidth,
                      height: cell.height || element.cellHeight,
                      maxHeight: cell.height || element.cellHeight,
                      overflow: 'hidden',
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
                      padding: '0',
                      margin: '0',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      position: 'relative',
                      userSelect: isCellEditing ? 'text' : 'none',
                      cursor: isSelected ? 'pointer' : 'default'
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
                  >
                    {isCellEditing ? (
                      <RichTextEditor
                        content={cell.content}
                        onUpdate={(newContent) => handleCellChange(newContent, rowIndex, colIndex)}
                        wrapperStyle={{ width: '100%', height: '100%', margin: '0', padding: '0' }}
                        style={{
                          fontSize: cell.fontSize,
                          fontFamily: cell.fontFamily,
                          fontWeight: cell.fontWeight,
                          color: cell.color,
                          textAlign: cell.align,
                          width: '100%',
                          height: '100%',
                          margin: '0',
                          padding: '0'
                        }}
                        contentAttributes={{ 'data-cell-editor': 'true' }}
                        className="bg-white border-2 border-blue-500"
                      />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: cell.content || '' }}
                        className="table-cell-content"
                        style={{ pointerEvents: 'none', margin: '0', padding: '0' }}
                      />
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
