import { useState, useRef, useEffect } from 'react';
import { Trash2, Copy, ZoomIn, ZoomOut, Grid, Move } from 'lucide-react';

export default function CanvasElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  canvasScale = 1,
}) {
  // Safety check - element must have position and size
  if (!element?.position || !element?.size) {
    console.warn('Invalid element structure:', element);
    return null;
  }

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) {
      return; // Let resize handle manage this
    }
    e.stopPropagation();
    onSelect(element.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX / canvasScale - element.position.x,
      y: e.clientY / canvasScale - element.position.y,
    });
  };

  const handleResizeStart = (e, handle) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({
      x: e.clientX / canvasScale,
      y: e.clientY / canvasScale,
      width: element.size.width,
      height: element.size.height,
      posX: element.position.x,
      posY: element.position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX / canvasScale - dragStart.x;
        const newY = e.clientY / canvasScale - dragStart.y;
        onUpdate(element.id, {
          position: { x: Math.max(0, newX), y: Math.max(0, newY) },
        });
      } else if (isResizing) {
        const deltaX = e.clientX / canvasScale - dragStart.x;
        const deltaY = e.clientY / canvasScale - dragStart.y;

        let newWidth = dragStart.width;
        let newHeight = dragStart.height;
        let newX = dragStart.posX;
        let newY = dragStart.posY;

        switch (resizeHandle) {
          case 'se': // Bottom-right
            newWidth = Math.max(20, dragStart.width + deltaX);
            newHeight = Math.max(20, dragStart.height + deltaY);
            break;
          case 'sw': // Bottom-left
            newWidth = Math.max(20, dragStart.width - deltaX);
            newHeight = Math.max(20, dragStart.height + deltaY);
            newX = dragStart.posX + (dragStart.width - newWidth);
            break;
          case 'ne': // Top-right
            newWidth = Math.max(20, dragStart.width + deltaX);
            newHeight = Math.max(20, dragStart.height - deltaY);
            newY = dragStart.posY + (dragStart.height - newHeight);
            break;
          case 'nw': // Top-left
            newWidth = Math.max(20, dragStart.width - deltaX);
            newHeight = Math.max(20, dragStart.height - deltaY);
            newX = dragStart.posX + (dragStart.width - newWidth);
            newY = dragStart.posY + (dragStart.height - newHeight);
            break;
          case 'e': // Right
            newWidth = Math.max(20, dragStart.width + deltaX);
            break;
          case 'w': // Left
            newWidth = Math.max(20, dragStart.width - deltaX);
            newX = dragStart.posX + (dragStart.width - newWidth);
            break;
          case 'n': // Top
            newHeight = Math.max(20, dragStart.height - deltaY);
            newY = dragStart.posY + (dragStart.height - newHeight);
            break;
          case 's': // Bottom
            newHeight = Math.max(20, dragStart.height + deltaY);
            break;
        }

        onUpdate(element.id, {
          position: { x: Math.max(0, newX), y: Math.max(0, newY) },
          size: { width: newWidth, height: newHeight },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, canvasScale, element.id, onUpdate, resizeHandle, element.position, element.size]);

  const getTextStyle = () => {
    const styles = element.styles || {};
    const fontSizeMap = {
      small: '12px',
      medium: '16px',
      large: '20px',
      xlarge: '24px',
    };

    return {
      fontSize: fontSizeMap[styles.fontSize] || '16px',
      fontWeight: styles.fontWeight || 'normal',
      color: styles.color || '#000000',
      textAlign: styles.textAlign || 'center',
      lineHeight: '1.5',
    };
  };

  const getImageStyle = () => {
    const styles = element.styles || {};
    return {
      objectFit: styles.objectFit || 'contain',
      width: '100%',
      height: '100%',
    };
  };

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: element.zIndex,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #3B82F6' : '1px solid transparent',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      }}
      className={`${isSelected ? 'ring-2 ring-blue-400' : ''} hover:border-blue-300 transition-all`}
    >
      {/* Element Content */}
      {element.type === 'text' ? (
        <div
          style={getTextStyle()}
          className="w-full h-full flex items-center justify-center p-2 overflow-hidden"
        >
          {element.content || 'Enter text'}
        </div>
      ) : (
        <img
          src={element.content || 'https://via.placeholder.com/100'}
          alt="Element"
          style={getImageStyle()}
          className="pointer-events-none"
        />
      )}

      {/* Resize Handles - only show when selected */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div
            className="resize-handle absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full -top-1.5 -left-1.5 cursor-nw-resize hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="resize-handle absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full -top-1.5 -right-1.5 cursor-ne-resize hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="resize-handle absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full -bottom-1.5 -left-1.5 cursor-sw-resize hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="resize-handle absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full -bottom-1.5 -right-1.5 cursor-se-resize hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />

          {/* Edge handles */}
          <div
            className="resize-handle absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full top-1/2 -translate-y-1/2 -left-1.5 cursor-w-resize hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="resize-handle absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full top-1/2 -translate-y-1/2 -right-1.5 cursor-e-resize hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          <div
            className="resize-handle absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full left-1/2 -translate-x-1/2 -top-1.5 cursor-n-resize hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="resize-handle absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full left-1/2 -translate-x-1/2 -bottom-1.5 cursor-s-resize hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
        </>
      )}
    </div>
  );
}
