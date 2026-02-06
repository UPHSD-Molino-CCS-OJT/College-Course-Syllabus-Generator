import { useState, useRef, useEffect, useCallback } from 'react';
import CanvasToolbar from './CanvasToolbar';
import CanvasPage from './CanvasPage';
import TextStylePanel from './TextStylePanel';
import TableEditor from './TableEditor';
import ImageStylePanel from './ImageStylePanel';
import LineStylePanel from './LineStylePanel';
import { useAutoSave, AutoSaveIndicator } from '../utils/useAutoSave.jsx';

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
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Document structure with multi-page support
  const [canvasDocument, setCanvasDocument] = useState(template?.canvasDocument || {
    header: {
      height: 120,
      elements: []
    },
    footer: {
      height: 120,
      elements: []
    },
    pages: [{
      id: 'page-1',
      elements: []
    }],
    styles: {
      defaultFont: 'Arial',
      defaultSize: 14,
      headerBg: '#f8f9fa',
      footerBg: '#f8f9fa'
    }
  });

  const canvasRef = useRef(null);

  // Auto-save function for canvas editor
  const autoSaveFunction = useCallback(async () => {
    if (onSave && template) {
      onSave({
        ...template,
        canvasDocument: canvasDocument,
        pageSize,
        orientation
      });
    }
  }, [onSave, template, canvasDocument, pageSize, orientation]);

  // Set up auto-save
  const { saveStatus, lastSaved, error: autoSaveError } = useAutoSave(
    autoSaveFunction,
    { canvasDocument, pageSize, orientation },
    {
      delay: 2000,
      enabled: autoSaveEnabled && !!template,
      shouldSave: () => true
    }
  );

  // Get current page dimensions
  const currentPageSize = PAGE_SIZES[pageSize][orientation];
  
  // Get current page
  const currentPage = canvasDocument.pages?.[currentPageIndex] || { elements: [] };

  // Initialize document with template data
  useEffect(() => {
    if (template && !template.canvasDocument) {
      initializeDocument();
    } else if (template?.canvasDocument) {
      // Migrate old content structure to pages structure
      let doc = template.canvasDocument;
      if (doc.content && !doc.pages) {
        doc = {
          ...doc,
          pages: [{
            id: 'page-1',
            elements: doc.content.elements || []
          }]
        };
        delete doc.content;
      } else if (!doc.pages) {
        // Ensure pages array exists
        doc = {
          ...doc,
          pages: [{
            id: 'page-1',
            elements: []
          }]
        };
      }
      setCanvasDocument(doc);
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

    setCanvasDocument(prev => ({
      ...prev,
      header: { ...prev.header, elements: headerElements },
      footer: { ...prev.footer, elements: footerElements }
    }));
  };

  // Page management functions
  const handleAddPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      elements: []
    };
    
    setCanvasDocument(prev => ({
      ...prev,
      pages: [...(prev.pages || []), newPage]
    }));
    
    setCurrentPageIndex((canvasDocument.pages?.length || 0));
  };

  const handleDeletePage = (pageIndex) => {
    if ((canvasDocument.pages?.length || 0) <= 1) {
      alert('Cannot delete the last page');
      return;
    }
    
    setCanvasDocument(prev => ({
      ...prev,
      pages: (prev.pages || []).filter((_, i) => i !== pageIndex)
    }));
    
    if (currentPageIndex >= (canvasDocument.pages?.length || 1) - 1) {
      setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
    }
  };

  const handleDuplicatePage = (pageIndex) => {
    const pageToDuplicate = canvasDocument.pages?.[pageIndex];
    if (!pageToDuplicate) return;
    const newPage = {
      id: `page-${Date.now()}`,
      elements: pageToDuplicate.elements.map(el => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random()}`
      }))
    };
    
    setCanvasDocument(prev => ({
      ...prev,
      pages: [
        ...prev.pages.slice(0, pageIndex + 1),
        newPage,
        ...prev.pages.slice(pageIndex + 1)
      ]
    }));
    
    setCurrentPageIndex(pageIndex + 1);
  };

  // Helper function to find which zone an element is in
  const findElementZone = (elementId) => {
    if (canvasDocument.header.elements.find(e => e.id === elementId)) {
      return 'header';
    }
    if (canvasDocument.footer.elements.find(e => e.id === elementId)) {
      return 'footer';
    }
    return 'content';
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

    if (zone === 'header' || zone === 'footer') {
      setCanvasDocument(prev => ({
        ...prev,
        [zone]: {
          ...prev[zone],
          elements: [...prev[zone].elements, newElement]
        }
      }));
    } else {
      // Add to current page
      setCanvasDocument(prev => ({
        ...prev,
        pages: prev.pages.map((page, idx) =>
          idx === currentPageIndex
            ? { ...page, elements: [...page.elements, newElement] }
            : page
        )
      }));
    }

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
      borderStyle: 'solid',
      showBorderTop: true,
      showBorderRight: true,
      showBorderBottom: true,
      showBorderLeft: true,
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

    if (zone === 'header' || zone === 'footer') {
      setCanvasDocument(prev => ({
        ...prev,
        [zone]: {
          ...prev[zone],
          elements: [...prev[zone].elements, newTable]
        }
      }));
    } else {
      setCanvasDocument(prev => ({
        ...prev,
        pages: (prev.pages || []).map((page, idx) =>
          idx === currentPageIndex
            ? { ...page, elements: [...(page.elements || []), newTable] }
            : page
        )
      }));
    }

    setSelectedElement(newTable);
  };

  const handleAddImage = (zone) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage = {
            id: `image-${Date.now()}`,
            type: 'image',
            src: event.target.result,
            x: 100,
            y: zone === 'header' ? 20 : zone === 'footer' ? 20 : 200,
            width: 150,
            height: 150,
            alt: file.name
          };

          if (zone === 'header' || zone === 'footer') {
            setCanvasDocument(prev => ({
              ...prev,
              [zone]: {
                ...prev[zone],
                elements: [...prev[zone].elements, newImage]
              }
            }));
          } else {
            setCanvasDocument(prev => ({
              ...prev,
              pages: (prev.pages || []).map((page, idx) =>
                idx === currentPageIndex
                  ? { ...page, elements: [...(page.elements || []), newImage] }
                  : page
              )
            }));
          }

          setSelectedElement(newImage);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAddLine = (zone) => {
    const newLine = {
      id: `line-${Date.now()}`,
      type: 'line',
      x: 100,
      y: zone === 'header' ? 100 : zone === 'footer' ? 40 : 300,
      width: 300,
      height: 0,
      strokeColor: '#000000',
      strokeWidth: 2,
      strokeStyle: 'solid' // solid, dashed, dotted
    };

    if (zone === 'header' || zone === 'footer') {
      setCanvasDocument(prev => ({
        ...prev,
        [zone]: {
          ...prev[zone],
          elements: [...prev[zone].elements, newLine]
        }
      }));
    } else {
      setCanvasDocument(prev => ({
        ...prev,
        pages: (prev.pages || []).map((page, idx) =>
          idx === currentPageIndex
            ? { ...page, elements: [...(page.elements || []), newLine] }
            : page
        )
      }));
    }

    setSelectedElement(newLine);
  };

  const handleUpdateElement = (zone, elementId, updates) => {
    // Update selectedElement first for immediate visual feedback
    if (selectedElement?.id === elementId) {
      setSelectedElement(prev => ({ ...prev, ...updates }));
    }
    
    // Then update the document
    if (zone === 'header' || zone === 'footer') {
      setCanvasDocument(prev => ({
        ...prev,
        [zone]: {
          ...prev[zone],
          elements: prev[zone].elements.map(el =>
            el.id === elementId ? { ...el, ...updates } : el
          )
        }
      }));
    } else {
      setCanvasDocument(prev => ({
        ...prev,
        pages: (prev.pages || []).map((page, idx) =>
          idx === currentPageIndex
            ? {
                ...page,
                elements: (page.elements || []).map(el =>
                  el.id === elementId ? { ...el, ...updates } : el
                )
              }
            : page
        )
      }));
    }
  };

  const handleDeleteElement = (zone, elementId) => {
    if (zone === 'header' || zone === 'footer') {
      setCanvasDocument(prev => ({
        ...prev,
        [zone]: {
          ...prev[zone],
          elements: prev[zone].elements.filter(el => el.id !== elementId)
        }
      }));
    } else {
      setCanvasDocument(prev => ({
        ...prev,
        pages: (prev.pages || []).map((page, idx) =>
          idx === currentPageIndex
            ? {
                ...page,
                elements: (page.elements || []).filter(el => el.id !== elementId)
              }
            : page
        )
      }));
    }

    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const handleSave = () => {
    onSave?.({
      ...template,
      canvasDocument: canvasDocument,
      pageSize,
      orientation
    });
  };

  const handleHeaderHeightChange = (e) => {
    const height = parseInt(e.target.value) || 120;
    setCanvasDocument(prev => ({
      ...prev,
      header: {
        ...prev.header,
        height
      }
    }));
  };

  const handleFooterHeightChange = (e) => {
    const height = parseInt(e.target.value) || 120;
    setCanvasDocument(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        height
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-900/95 z-50 flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold text-lg">Canvas Editor</h2>
          <div className="h-6 w-px bg-gray-600"></div>
          
          {/* Auto-save indicator */}
          <div className="text-white">
            <AutoSaveIndicator saveStatus={saveStatus} lastSaved={lastSaved} error={autoSaveError} />
          </div>
          
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

          <div className="h-6 w-px bg-gray-600"></div>

          {/* Header Height */}
          <div className="flex items-center gap-2">
            <label className="text-white text-xs">Header:</label>
            <input
              type="number"
              min="50"
              max="300"
              value={canvasDocument.header.height}
              onChange={handleHeaderHeightChange}
              className="bg-gray-700 text-white rounded px-2 py-1 text-sm w-16 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-xs">px</span>
          </div>

          {/* Footer Height */}
          <div className="flex items-center gap-2">
            <label className="text-white text-xs">Footer:</label>
            <input
              type="number"
              min="50"
              max="300"
              value={canvasDocument.footer.height}
              onChange={handleFooterHeightChange}
              className="bg-gray-700 text-white rounded px-2 py-1 text-sm w-16 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-xs">px</span>
          </div>

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

          <div className="h-6 w-px bg-gray-600"></div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <span className="text-white text-xs">Page:</span>
            <button
              onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex === 0}
              className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <span className="text-white text-sm min-w-[60px] text-center">
              {currentPageIndex + 1} / {canvasDocument.pages?.length || 1}
            </span>
            <button
              onClick={() => setCurrentPageIndex(Math.min((canvasDocument.pages?.length || 1) - 1, currentPageIndex + 1))}
              disabled={currentPageIndex === (canvasDocument.pages?.length || 1) - 1}
              className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>

          {/* Page Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddPage()}
              className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
              title="Add new page"
            >
              + Page
            </button>
            <button
              onClick={() => handleDuplicatePage(currentPageIndex)}
              className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
              title="Duplicate current page"
            >
              Duplicate
            </button>
            <button
              onClick={() => handleDeletePage(currentPageIndex)}
              disabled={(canvasDocument.pages?.length || 1) === 1}
              className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="Delete current page"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center text-sm text-white">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="mr-2"
            />
            Auto-save
          </label>
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
          onAddImage={handleAddImage}
          onAddLine={handleAddLine}
          onZoneChange={setEditingZone}
        />

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-800 p-8">
          <div className="mx-auto" style={{ width: 'fit-content' }}>
            <CanvasPage
              document={canvasDocument}
              currentPage={canvasDocument.pages?.[currentPageIndex] || { elements: [] }}
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
                  const zone = editingZone || findElementZone(selectedElement.id);
                  handleUpdateElement(zone, selectedElement.id, updates);
                }}
              />
            )}
            {selectedElement.type === 'table' && (
              <TableEditor
                table={selectedElement}
                onUpdate={(updates) => {
                  const zone = editingZone || findElementZone(selectedElement.id);
                  handleUpdateElement(zone, selectedElement.id, updates);
                }}
              />
            )}
            {selectedElement.type === 'image' && (
              <ImageStylePanel
                element={selectedElement}
                onUpdate={(updates) => {
                  const zone = editingZone || findElementZone(selectedElement.id);
                  handleUpdateElement(zone, selectedElement.id, updates);
                }}
              />
            )}
            {selectedElement.type === 'line' && (
              <LineStylePanel
                element={selectedElement}
                onUpdate={(updates) => {
                  const zone = editingZone || findElementZone(selectedElement.id);
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
