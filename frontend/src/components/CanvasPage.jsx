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

  const handleMouseMove = (e) => {
    if (!draggingElement) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - canvasRect.left) / zoom - dragOffset.x;
    const y = (e.clientY - canvasRect.top) / zoom - dragOffset.y;

    onUpdateElement(draggingElement.zone, draggingElement.element.id, { x, y });
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
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
      return (
        <div
          key={element.id}
          className={`absolute cursor-move select-none ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          style={{
            left: element.x,
            top: element.y,
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            color: element.color,
            textAlign: element.align,
            minWidth: element.width || 100
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
              style={{
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                color: element.color,
                textAlign: element.align
              }}
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
          className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          style={{
            left: element.x,
            top: element.y
          }}
          onMouseDown={(e) => handleMouseDown(e, element, zone)}
        >
          <table className="border-collapse">
            <tbody>
              {element.data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className="border"
                      style={{
                        width: element.cellWidth,
                        height: element.cellHeight,
                        borderColor: element.borderColor,
                        borderWidth: element.borderWidth,
                        backgroundColor: cell.bg,
                        fontSize: cell.fontSize,
                        fontFamily: cell.fontFamily,
                        fontWeight: cell.fontWeight,
                        color: cell.color,
                        textAlign: cell.align,
                        padding: '8px'
                      }}
                    >
                      {cell.content}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
