import { useState, useRef, useEffect } from 'react';
import CanvasToolbar from './CanvasToolbar';
import CanvasPage from './CanvasPage';
import TextStylePanel from './TextStylePanel';
import TableEditor from './TableEditor';

// Page size configurations (in pixels, 96 DPI)
const PAGE_SIZES = {
  legal: {
    name: 'Legal',
    portrait: { width: 816, height: 1344 },
    landscape: { width: 1344, height: 816 }
  },
  longBond: {
    name: 'Long Bond',
    portrait: { width: 816, height: 1248 },
    landscape: { width: 1248, height: 816 }
  },
  letter: {
    name: 'Letter',
    portrait: { width: 816, height: 1056 },
    landscape: { width: 1056, height: 816 }
  },
  a4: {
    name: 'A4',
    portrait: { width: 794, height: 1123 },
    landscape: { width: 1123, height: 794 }
  }
};

export default function CanvasEditor({ template, onClose, onSave }) {
  const [pageSize, setPageSize] = useState(template?.pageSize || 'longBond');
  const [orientation, setOrientation] = useState(template?.orientation || 'landscape');
  const [zoom, setZoom] = useState(1);
  const [selectedElement, setSelectedElement] = useState(null);
  const [editingZone, setEditingZone] = useState(null); // 'header', 'footer', or 'content'
  
  // Document structure
  const [document, setDocument] = useState(template?.canvasDocument || {
    header: {
      height: 120,
      elements: []
    },
    footer: {
      height: 80,
      elements: []
    },
    content: {
      elements: []
    },
    styles: {
      defaultFont: 'Arial',
      defaultSize: 14,
      headerBg: '#f8f9fa',
      footerBg: '#f8f9fa'
    }
  });

  const canvasRef = useRef(null);

  // Get current page dimensions
  const currentPageSize = PAGE_SIZES[pageSize][orientation];

  // Initialize document with template data
  useEffect(() => {
    if (template && !template.canvasDocument) {
      initializeDocument();
    } else if (template?.canvasDocument) {
      setDocument(template.canvasDocument);
    }
  }, [template]);

  const initializeDocument = () => {
    // Create initial header elements
    const headerElements = [
      {
        id: 'header-title',
        type: 'text',
        content: 'Header Title',
        x: 40,
        y: 30,
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        color: '#1f2937',
        align: 'left'
      },
      {
        id: 'header-subtitle',
        type: 'text',
        content: 'Subtitle',
        x: 40,
        y: 70,
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#4b5563',
        align: 'left'
      }
    ];

    // Create initial footer elements
    const footerElements = [
      {
        id: 'footer-page',
        type: 'text',
        content: 'Page {page}',
        x: currentPageSize.width - 100,
        y: 30,
        fontSize: 12,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#6b7280',
        align: 'right'
      },
      {
        id: 'footer-info',
        type: 'text',
        content: 'Footer Information',
        x: 40,
        y: 30,
        fontSize: 12,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#6b7280',
        align: 'left'
      }
    ];

    setDocument(prev => ({
      ...prev,
      header: { ...prev.header, elements: headerElements },
      footer: { ...prev.footer, elements: footerElements }
    }));
  };

  const handleAddText = (zone) => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Double click to edit',
      x: 100,
      y: zone === 'header' ? 50 : zone === 'footer' ? 30 : 200,
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      align: 'left',
      width: 200
    };

    setDocument(prev => ({
      ...prev,
      [zone]: {
        ...prev[zone],
        elements: [...prev[zone].elements, newElement]
      }
    }));

    setSelectedElement(newElement);
  };

  const handleAddTable = (zone) => {
    const newTable = {
      id: `table-${Date.now()}`,
      type: 'table',
      x: 100,
      y: zone === 'header' ? 50 : zone === 'footer' ? 30 : 200,
      rows: 3,
      cols: 3,
      cellWidth: 150,
      cellHeight: 40,
      borderColor: '#000000',
      borderWidth: 1,
      headerBg: '#f3f4f6',
      data: Array(3).fill(null).map((_, i) => 
        Array(3).fill(null).map((_, j) => ({
          content: i === 0 ? `Header ${j + 1}` : `Cell ${i}-${j}`,
          fontSize: 12,
          fontFamily: 'Arial',
          fontWeight: i === 0 ? 'bold' : 'normal',
          color: '#000000',
          align: 'left',
          bg: i === 0 ? '#f3f4f6' : '#ffffff'
        }))
      )
    };

    setDocument(prev => ({
      ...prev,
      [zone]: {
        ...prev[zone],
        elements: [...prev[zone].elements, newTable]
      }
    }));

    setSelectedElement(newTable);
  };

  const handleUpdateElement = (zone, elementId, updates) => {
    setDocument(prev => ({
      ...prev,
      [zone]: {
        ...prev[zone],
        elements: prev[zone].elements.map(el =>
          el.id === elementId ? { ...el, ...updates } : el
        )
      }
    }));

    if (selectedElement?.id === elementId) {
      setSelectedElement(prev => ({ ...prev, ...updates }));
    }
  };

  const handleDeleteElement = (zone, elementId) => {
    setDocument(prev => ({
      ...prev,
      [zone]: {
        ...prev[zone],
        elements: prev[zone].elements.filter(el => el.id !== elementId)
      }
    }));

    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const handleSave = () => {
    onSave?.({
      ...template,
      canvasDocument: document,
      pageSize,
      orientation
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/95 z-50 flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold text-lg">Canvas Editor</h2>
          <div className="h-6 w-px bg-gray-600"></div>
          
          {/* Page Size Selector */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(PAGE_SIZES).map(([key, value]) => (
              <option key={key} value={key}>{value.name}</option>
            ))}
          </select>

          {/* Orientation Selector */}
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="landscape">Landscape</option>
            <option value="portrait">Portrait</option>
          </select>

          {/* Zoom Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
            >
              −
            </button>
            <span className="text-white text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-white border border-gray-600 rounded hover:bg-gray-700 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Save
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <CanvasToolbar
          editingZone={editingZone}
          onAddText={handleAddText}
          onAddTable={handleAddTable}
          onZoneChange={setEditingZone}
        />

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-800 p-8">
          <div className="mx-auto" style={{ width: 'fit-content' }}>
            <CanvasPage
              document={document}
              pageSize={currentPageSize}
              zoom={zoom}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              editingZone={editingZone}
              onZoneClick={setEditingZone}
            />
          </div>
        </div>

        {/* Right Panel - Properties */}
        {selectedElement && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            {selectedElement.type === 'text' && (
              <TextStylePanel
                element={selectedElement}
                onUpdate={(updates) => {
                  const zone = editingZone || 
                    (document.header.elements.find(e => e.id === selectedElement.id) ? 'header' :
                     document.footer.elements.find(e => e.id === selectedElement.id) ? 'footer' : 'content');
                  handleUpdateElement(zone, selectedElement.id, updates);
                }}
              />
            )}
            {selectedElement.type === 'table' && (
              <TableEditor
                table={selectedElement}
                onUpdate={(updates) => {
                  const zone = editingZone || 
                    (document.header.elements.find(e => e.id === selectedElement.id) ? 'header' :
                     document.footer.elements.find(e => e.id === selectedElement.id) ? 'footer' : 'content');
                  handleUpdateElement(zone, selectedElement.id, updates);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
