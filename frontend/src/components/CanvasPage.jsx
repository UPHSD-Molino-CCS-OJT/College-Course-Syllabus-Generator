import { useState, useRef } from 'react';
import { 
  calculateSnapCrossZone, 
  getAllElementsWithAbsoluteCoords, 
  getZoneDimensions 
} from '../utils/snapping';
import TextElement from './canvas/TextElement';
import TableElement from './canvas/TableElement';
import ImageElement from './canvas/ImageElement';
import LineElement from './canvas/LineElement';
import SnapGuides from './canvas/SnapGuides';

export default function CanvasPage({
  document,
  currentPage,
  pageSize,
  zoom,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  editingZone,
  onZoneClick,
  showGrid = false,
  gridSize = 20
}) {
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingCell, setResizingCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [snapGuides, setSnapGuides] = useState([]); // Visual snap guides
  const canvasRef = useRef(null);

  const handleMouseDown = (e, element, zone) => {
    e.stopPropagation();
    onSelectElement(element);
    setIsDragging(true);
    
    // Calculate offset from mouse to element's current position
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - canvasRect.left) / zoom;
    const mouseY = (e.clientY - canvasRect.top) / zoom;
    
    setDragOffset({
      x: mouseX - element.x,
      y: mouseY - element.y
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

    // Get the zone and element
    const { zone, element } = draggingElement;
    
    // Get zone dimensions for boundary constraints
    const zoneDimensions = getZoneDimensions(document, pageSize, zone);
    
    // Get all elements from all zones with absolute coordinates for cross-zone snapping
    const allElementsAbsolute = getAllElementsWithAbsoluteCoords(document, currentPage);
    
    // Apply cross-zone snapping
    const snapResult = calculateSnapCrossZone(
      element,
      x,
      y,
      zone,
      allElementsAbsolute,
      document,
      pageSize
    );
    
    x = snapResult.x;
    y = snapResult.y;
    setSnapGuides(snapResult.guides);
    
    // Calculate element dimensions for boundary constraints
    let elementHeight;
    let elementWidth;
    
    if (element.type === 'text') {
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
      elementHeight = element.height || 50;
      elementWidth = element.width || 100;
    }
    
    // Apply boundary constraints
    const minX = 0;
    const maxX = zoneDimensions.width - elementWidth;
    const minY = 0;
    const maxY = zoneDimensions.height - elementHeight;
    
    x = Math.max(minX, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    onUpdateElement(draggingElement.zone, draggingElement.element.id, { x, y });
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
    setResizingCell(null);
    setSnapGuides([]); // Clear snap guides when drag ends
    // Delay clearing isDragging to prevent click events from firing immediately after drag
    setTimeout(() => setIsDragging(false), 100);
  };

  const renderElement = (element, zone) => {
    const isSelected = selectedElement?.id === element.id;

    if (element.type === 'text') {
      return (
        <TextElement
          key={element.id}
          element={element}
          zone={zone}
          pageSize={pageSize}
          isSelected={isSelected}
          onSelect={onSelectElement}
          onUpdate={onUpdateElement}
          onMouseDown={handleMouseDown}
        />
      );
    }

    if (element.type === 'table') {
      return (
        <TableElement
          key={element.id}
          element={element}
          zone={zone}
          isSelected={isSelected}
          onSelect={onSelectElement}
          onUpdate={onUpdateElement}
          onMouseDown={handleMouseDown}
        />
      );
    }

    if (element.type === 'image') {
      return (
        <ImageElement
          key={element.id}
          element={element}
          zone={zone}
          isSelected={isSelected}
          isDragging={isDragging}
          onSelect={onSelectElement}
          onMouseDown={handleMouseDown}
        />
      );
    }

    if (element.type === 'line') {
      return (
        <LineElement
          key={element.id}
          element={element}
          zone={zone}
          isSelected={isSelected}
          onSelect={onSelectElement}
          onMouseDown={handleMouseDown}
        />
      );
    }

    return null;
  };

  // Render grid overlay
  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];
    const width = pageSize.width;
    const height = pageSize.height;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#e0e0e0"
          strokeWidth={x % (gridSize * 5) === 0 ? 1 : 0.5}
          opacity={x % (gridSize * 5) === 0 ? 0.6 : 0.3}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#e0e0e0"
          strokeWidth={y % (gridSize * 5) === 0 ? 1 : 0.5}
          opacity={y % (gridSize * 5) === 0 ? 0.6 : 0.3}
        />
      );
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        {gridLines}
      </svg>
    );
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
      {/* Grid Overlay */}
      {renderGrid()}

      {/* Header Zone */}
      <div
        className={`absolute left-0 right-0 top-0 ${
          editingZone === 'header' ? 'bg-blue-50/50' : ''
        } hover:bg-gray-50/30 transition-colors cursor-pointer`}
        style={{
          height: document.header.height
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
        {currentPage?.elements.map((el) => renderElement(el, 'content'))}
        {editingZone === 'content' && (
          <div className="absolute top-2 right-2 text-xs text-blue-600 font-semibold bg-white px-2 py-1 rounded">
            CONTENT
          </div>
        )}
      </div>

      {/* Footer Zone */}
      <div
        className={`absolute left-0 right-0 bottom-0 ${
          editingZone === 'footer' ? 'bg-blue-50/50' : ''
        } hover:bg-gray-50/30 transition-colors cursor-pointer`}
        style={{
          height: document.footer.height
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

      {/* Snap Guides - Visual feedback during dragging */}
      <SnapGuides guides={snapGuides} />
    </div>
  );
}