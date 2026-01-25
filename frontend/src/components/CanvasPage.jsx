import { useState, useRef } from 'react';

export default function CanvasPage({
  document,
  pageSize,
  zoom,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  editingZone,
  onZoneClick
}) {
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState(null);
  const [resizingCell, setResizingCell] = useState(null);
  const canvasRef = useRef(null);

  const handleMouseDown = (e, element, zone) => {
    e.stopPropagation();
    onSelectElement(element);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggingElement({ element, zone });
  };

  const handleCellResizeStart = (e, element, zone, rowIndex, colIndex, direction) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const cell = element.data[rowIndex][colIndex];
    const startWidth = cell.width || element.cellWidth || 150;
    const startHeight = cell.height || element.cellHeight || 40;
    
    setResizingCell({
      element,
      zone,
      rowIndex,
      colIndex,
      direction,
      startX,
      startY,
      startWidth,
      startHeight
    });
  };

  const handleMouseMove = (e) => {
    if (resizingCell) {
      const { element, zone, rowIndex, colIndex, direction, startX, startY, startWidth, startHeight } = resizingCell;
      const deltaX = (e.clientX - startX) / zoom;
      const deltaY = (e.clientY - startY) / zoom;
      
      const newData = element.data.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          const updates = { ...cell };
          let shouldUpdate = false;
          
          // Width adjustment affects entire column
          if ((direction === 'width' || direction === 'both') && cIdx === colIndex) {
            updates.width = Math.max(50, startWidth + deltaX);
            shouldUpdate = true;
          }
          
          // Height adjustment affects only the specific cell
          if ((direction === 'height' || direction === 'both') && rIdx === rowIndex && cIdx === colIndex) {
            updates.height = Math.max(20, startHeight + deltaY);
            shouldUpdate = true;
          }
          
          return shouldUpdate ? updates : cell;
        })
      );
      
      onUpdateElement(zone, element.id, { data: newData });
      return;
    }

    if (!draggingElement) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    let x = (e.clientX - canvasRect.left) / zoom - dragOffset.x;
    let y = (e.clientY - canvasRect.top) / zoom - dragOffset.y;

    // Constrain element to its zone
    const { zone, element } = draggingElement;
    
    // Calculate element dimensions more accurately
    let elementHeight;
    let elementWidth;
    
    if (element.type === 'text') {
      // Estimate text height based on fontSize with some padding
      elementHeight = (element.fontSize || 14) + 10;
      elementWidth = element.width || 200;
    } else if (element.type === 'image') {
      elementHeight = element.height || 100;
      elementWidth = element.width || 100;
    } else if (element.type === 'table') {
      elementHeight = (element.rows || 3) * (element.cellHeight || 40);
      elementWidth = (element.cols || 3) * (element.cellWidth || 150);
    } else if (element.type === 'line') {
      elementHeight = element.strokeWidth || 2;
      elementWidth = element.length || 100;
    } else {
      // Default fallback
      elementHeight = element.height || 50;
      elementWidth = element.width || 100;
    }
    
    // Calculate zone boundaries
    let minY = 0;
    let maxY = 0;
    
    if (zone === 'header') {
      minY = 0;
      maxY = document.header.height - elementHeight;
    } else if (zone === 'content') {
      minY = 0; // Content zone uses relative positioning
      maxY = pageSize.height - document.header.height - document.footer.height - elementHeight;
    } else if (zone === 'footer') {
      minY = 0;
      maxY = document.footer.height - elementHeight;
    }
    
    // Constrain x within page width
    const minX = 0;
    const maxX = pageSize.width - elementWidth;
    
    // Apply constraints
    x = Math.max(minX, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    onUpdateElement(draggingElement.zone, draggingElement.element.id, { x, y });
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
    setResizingCell(null);
  };

  const handleDoubleClick = (element, zone) => {
    if (element.type === 'text') {
      setEditingTextId(element.id);
    }
  };

  const handleTextChange = (e, element, zone) => {
    onUpdateElement(zone, element.id, { content: e.target.value });
  };

  const handleTextBlur = () => {
    setEditingTextId(null);
  };

  const renderElement = (element, zone) => {
    const isSelected = selectedElement?.id === element.id;
    const isEditing = editingTextId === element.id;

    if (element.type === 'text') {
      const textStyle = {
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        fontWeight: element.fontWeight,
        color: element.color,
        textAlign: element.align,
        fontStyle: element.italic ? 'italic' : 'normal',
        textDecoration: element.underline ? 'underline' : 'none',
      };

      if (element.bold) {
        textStyle.fontWeight = 'bold';
      }

      return (
        <div
          key={element.id}
          className={`absolute cursor-move select-none ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          style={{
            left: element.x,
            top: element.y,
            minWidth: element.width || 100,
            ...textStyle
          }}
          onMouseDown={(e) => handleMouseDown(e, element, zone)}
          onDoubleClick={() => handleDoubleClick(element, zone)}
        >
          {isEditing ? (
            <textarea
              autoFocus
              value={element.content}
              onChange={(e) => handleTextChange(e, element, zone)}
              onBlur={handleTextBlur}
              className="w-full min-h-[30px] bg-white border-2 border-blue-500 rounded px-2 py-1 outline-none resize-none"
              style={textStyle}
            />
          ) : (
            <div className="whitespace-pre-wrap">{element.content}</div>
          )}
        </div>
      );
    }

    if (element.type === 'table') {
      return (
        <div
          key={element.id}
          className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          style={{
            left: element.x,
            top: element.y
          }}
        >
          <table className="border-collapse">
            <tbody>
              {element.data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className="border relative group"
                      style={{
                        width: cell.width || element.cellWidth,
                        height: cell.height || element.cellHeight,
                        borderColor: element.borderColor,
                        borderWidth: element.borderWidth,
                        backgroundColor: cell.bg,
                        fontSize: cell.fontSize,
                        fontFamily: cell.fontFamily,
                        fontWeight: cell.fontWeight,
                        color: cell.color,
                        textAlign: cell.align,
                        verticalAlign: cell.verticalAlign || 'top',
                        padding: '8px',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                      }}
                      onMouseDown={(e) => {
                        // Check if clicking on resize handle
                        if (e.target.classList.contains('resize-handle')) {
                          return;
                        }
                        handleMouseDown(e, element, zone);
                      }}
                    >
                      {cell.content}
                      {isSelected && (
                        <>
                          {/* Right edge resize handle */}
                          <div
                            className="resize-handle absolute top-0 right-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 cursor-ew-resize"
                            onMouseDown={(e) => handleCellResizeStart(e, element, zone, rowIndex, colIndex, 'width')}
                          />
                          {/* Bottom edge resize handle */}
                          <div
                            className="resize-handle absolute bottom-0 left-0 w-full h-1 bg-blue-500 opacity-0 group-hover:opacity-100 cursor-ns-resize"
                            onMouseDown={(e) => handleCellResizeStart(e, element, zone, rowIndex, colIndex, 'height')}
                          />
                          {/* Corner resize handle */}
                          <div
                            className="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-blue-500 opacity-0 group-hover:opacity-100 cursor-nwse-resize"
                            onMouseDown={(e) => handleCellResizeStart(e, element, zone, rowIndex, colIndex, 'both')}
                          />
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (element.type === 'image') {
      return (
        <div
          key={element.id}
          className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height
          }}
          onMouseDown={(e) => handleMouseDown(e, element, zone)}
        >
          {element.src ? (
            <img
              src={element.src}
              alt={element.alt || 'Image'}
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
      );
    }

    if (element.type === 'line') {
      return (
        <div
          key={element.id}
          className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          style={{
            left: element.x,
            top: element.y
          }}
          onMouseDown={(e) => handleMouseDown(e, element, zone)}
        >
          <svg width={element.width || 300} height={Math.max(element.strokeWidth || 2, 10)}>
            <line
              x1="0"
              y1={(element.strokeWidth || 2) / 2}
              x2={element.width || 300}
              y2={(element.strokeWidth || 2) / 2}
              stroke={element.strokeColor || '#000000'}
              strokeWidth={element.strokeWidth || 2}
              strokeDasharray={
                element.strokeStyle === 'dashed' ? '5,5' :
                element.strokeStyle === 'dotted' ? '2,2' : 'none'
              }
            />
          </svg>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={canvasRef}
      className="bg-white shadow-2xl relative"
      style={{
        width: pageSize.width * zoom,
        height: pageSize.height * zoom,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header Zone */}
      <div
        className={`absolute left-0 right-0 top-0 border-b-2 ${
          editingZone === 'header' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'
        } hover:bg-gray-50/30 transition-colors cursor-pointer`}
        style={{
          height: document.header.height,
          backgroundColor: document.styles.headerBg
        }}
        onClick={() => onZoneClick('header')}
      >
        {document.header.elements.map((el) => renderElement(el, 'header'))}
        {editingZone === 'header' && (
          <div className="absolute top-2 right-2 text-xs text-blue-600 font-semibold bg-white px-2 py-1 rounded">
            HEADER
          </div>
        )}
      </div>

      {/* Content Zone */}
      <div
        className={`absolute left-0 right-0 ${
          editingZone === 'content' ? 'bg-blue-50/30' : ''
        } hover:bg-gray-50/20 transition-colors cursor-pointer`}
        style={{
          top: document.header.height,
          bottom: document.footer.height
        }}
        onClick={() => onZoneClick('content')}
      >
        {document.content.elements.map((el) => renderElement(el, 'content'))}
        {editingZone === 'content' && (
          <div className="absolute top-2 right-2 text-xs text-blue-600 font-semibold bg-white px-2 py-1 rounded">
            CONTENT
          </div>
        )}
      </div>

      {/* Footer Zone */}
      <div
        className={`absolute left-0 right-0 bottom-0 border-t-2 ${
          editingZone === 'footer' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'
        } hover:bg-gray-50/30 transition-colors cursor-pointer`}
        style={{
          height: document.footer.height,
          backgroundColor: document.styles.footerBg
        }}
        onClick={() => onZoneClick('footer')}
      >
        {document.footer.elements.map((el) => renderElement(el, 'footer'))}
        {editingZone === 'footer' && (
          <div className="absolute top-2 right-2 text-xs text-blue-600 font-semibold bg-white px-2 py-1 rounded">
            FOOTER
          </div>
        )}
      </div>

      {/* Delete button for selected element */}
      {selectedElement && (
        <button
          onClick={() => {
            const zone = 
              document.header.elements.find(e => e.id === selectedElement.id) ? 'header' :
              document.footer.elements.find(e => e.id === selectedElement.id) ? 'footer' : 'content';
            onDeleteElement(zone, selectedElement.id);
          }}
          className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Delete Selected
        </button>
      )}
    </div>
  );
}
