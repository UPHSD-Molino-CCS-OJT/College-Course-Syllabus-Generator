import { useState, useRef } from 'react';
import { Plus, Type, Image, Trash2, Grid, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import CanvasElement from './CanvasElement';
import CanvasElementEditor from './CanvasElementEditor';
import { createCanvasElement } from './utils/dataModel';

export default function CanvasEditor({ elements, onChange, canvasWidth = 800, canvasHeight = 400 }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);

  const handleAddElement = (type) => {
    const newElement = createCanvasElement(
      type,
      Math.floor(canvasWidth / 2 - 100),
      Math.floor(canvasHeight / 2 - 50)
    );
    onChange([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleUpdateElement = (id, updates) => {
    const updatedElements = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    onChange(updatedElements);
  };

  const handleDeleteElement = (id) => {
    onChange(elements.filter((el) => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const handleDuplicateElement = (id) => {
    const element = elements.find((el) => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: Date.now() + Math.random(),
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20,
        },
      };
      onChange([...elements, newElement]);
      setSelectedElement(newElement.id);
    }
  };

  const handleCanvasClick = (e) => {
    // Deselect if clicking on canvas background
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
    }
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.1, 0.5));
  };

  const handleBringForward = () => {
    if (!selectedElement) return;
    const maxZ = Math.max(...elements.map((el) => el.zIndex || 0), 0);
    const element = elements.find((el) => el.id === selectedElement);
    if (element && (element.zIndex || 0) < maxZ) {
      handleUpdateElement(selectedElement, { zIndex: (element.zIndex || 0) + 1 });
    }
  };

  const handleSendBackward = () => {
    if (!selectedElement) return;
    const element = elements.find((el) => el.id === selectedElement);
    if (element && (element.zIndex || 0) > 0) {
      handleUpdateElement(selectedElement, { zIndex: (element.zIndex || 0) - 1 });
    }
  };

  const selectedElementData = elements.find((el) => el.id === selectedElement);

  return (
    <div className="flex gap-4">
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-100 border border-gray-300 rounded-t-lg p-2 flex items-center gap-2">
          <button
            onClick={() => handleAddElement('text')}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            <Type size={16} />
            Add Text
          </button>
          <button
            onClick={() => handleAddElement('image')}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            <Image size={16} />
            Add Image
          </button>

          <div className="flex-1" />

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded ${
              showGrid ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600'
            } hover:bg-blue-50`}
            title="Toggle Grid"
          >
            <Grid size={16} />
          </button>

          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-white rounded hover:bg-gray-50"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-sm text-gray-600 min-w-[45px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-white rounded hover:bg-gray-50"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>

          {/* Layer Controls */}
          {selectedElement && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button
                onClick={handleBringForward}
                className="p-1.5 bg-white rounded hover:bg-gray-50"
                title="Bring Forward"
              >
                <Layers size={16} />
              </button>
              <button
                onClick={handleSendBackward}
                className="p-1.5 bg-white rounded hover:bg-gray-50"
                title="Send Backward"
              >
                <Layers size={16} className="rotate-180" />
              </button>
              <button
                onClick={() => handleDeleteElement(selectedElement)}
                className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>

        {/* Canvas */}
        <div className="border border-gray-300 border-t-0 rounded-b-lg overflow-auto bg-gray-50 p-8">
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundImage: showGrid
                ? 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)'
                : 'none',
              backgroundSize: showGrid ? '20px 20px' : 'auto',
            }}
            className="relative bg-white border-2 border-gray-300 shadow-lg mx-auto"
          >
            {/* Render all elements sorted by z-index */}
            {[...elements]
              .filter(el => el && el.position && el.size) // Only render valid elements
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map((element) => (
                <CanvasElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElement === element.id}
                  onSelect={setSelectedElement}
                  onUpdate={handleUpdateElement}
                  onDelete={handleDeleteElement}
                  canvasScale={scale}
                />
              ))}

            {/* Empty state */}
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Plus size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click "Add Text" or "Add Image" to start</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedElementData && (
        <CanvasElementEditor
          element={selectedElementData}
          onUpdate={(updates) => handleUpdateElement(selectedElementData.id, updates)}
          onDuplicate={() => handleDuplicateElement(selectedElementData.id)}
          onDelete={() => handleDeleteElement(selectedElementData.id)}
        />
      )}
    </div>
  );
}
