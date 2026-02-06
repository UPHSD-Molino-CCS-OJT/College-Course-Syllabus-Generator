import { useState, useRef, useEffect, useCallback } from 'react';
import CanvasToolbar from './CanvasToolbar';
import CanvasPage from './CanvasPage';
import TextStylePanel from './TextStylePanel';
import TableEditor from './TableEditor';
import ImageStylePanel from './ImageStylePanel';
import LineStylePanel from './LineStylePanel';
import { useAutoSave, AutoSaveIndicator } from '../utils/useAutoSave.jsx';
import { templateAPI } from '../services/api';
import PageSettings from './canvas-toolbar/PageSettings';
import ZoneHeightControls from './canvas-toolbar/ZoneHeightControls';
import ViewControls from './canvas-toolbar/ViewControls';
import PageNavigation from './canvas-toolbar/PageNavigation';
import EditorActions from './canvas-toolbar/EditorActions';

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
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20); // Grid spacing in pixels
  const [clipboard, setClipboard] = useState(null); // Stores copied element with zone info
  
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

  // Auto-save function for canvas editor (saves without closing)
  const autoSaveFunction = useCallback(async () => {
    if (template && template._id) {
      const updatedTemplate = {
        ...template,
        canvasDocument: canvasDocument,
        pageSize,
        orientation
      };
      // Save directly via API without triggering onSave callback
      try {
        await templateAPI.updateTemplate(template._id, updatedTemplate);
      } catch (error) {
        console.error('Auto-save failed:', error);
        throw error;
      }
    }
  }, [template, canvasDocument, pageSize, orientation]);

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

  // Copy selected element to clipboard
  const handleCopyElement = () => {
    if (!selectedElement) return;
    
    const zone = findElementZone(selectedElement.id);
    setClipboard({
      element: { ...selectedElement },
      sourceZone: zone,
      sourcePageIndex: zone === 'content' ? currentPageIndex : null
    });
  };

  // Paste element from clipboard
  const handlePasteElement = () => {
    if (!clipboard) return;

    const { element } = clipboard;
    const targetZone = editingZone || 'content';
    
    // Create new element at exact position with new ID
    const newElement = {
      ...element,
      id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: element.x,
      y: element.y
    };

    // Add to appropriate zone
    if (targetZone === 'header' || targetZone === 'footer') {
      setCanvasDocument(prev => ({
        ...prev,
        [targetZone]: {
          ...prev[targetZone],
          elements: [...prev[targetZone].elements, newElement]
        }
      }));
    } else {
      setCanvasDocument(prev => ({
        ...prev,
        pages: (prev.pages || []).map((page, idx) =>
          idx === currentPageIndex
            ? { ...page, elements: [...(page.elements || []), newElement] }
            : page
        )
      }));
    }

    setSelectedElement(newElement);
  };

  // Duplicate selected element
  const handleDuplicateElement = () => {
    if (!selectedElement) return;

    const zone = findElementZone(selectedElement.id);
    const newElement = {
      ...selectedElement,
      id: `${selectedElement.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: selectedElement.x,
      y: selectedElement.y
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
      setCanvasDocument(prev => ({
        ...prev,
        pages: (prev.pages || []).map((page, idx) =>
          idx === currentPageIndex
            ? { ...page, elements: [...(page.elements || []), newElement] }
            : page
        )
      }));
    }

    setSelectedElement(newElement);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Copy: Cmd/Ctrl + C
      if (cmdOrCtrl && e.key === 'c' && selectedElement) {
        e.preventDefault();
        handleCopyElement();
      }

      // Paste: Cmd/Ctrl + V
      if (cmdOrCtrl && e.key === 'v' && clipboard) {
        e.preventDefault();
        handlePasteElement();
      }

      // Duplicate: Cmd/Ctrl + D
      if (cmdOrCtrl && e.key === 'd' && selectedElement) {
        e.preventDefault();
        handleDuplicateElement();
      }

      // Delete: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault();
        const zone = findElementZone(selectedElement.id);
        handleDeleteElement(zone, selectedElement.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, clipboard, currentPageIndex, editingZone]);

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
      <div className="bg-gray-800 border-b-2 border-gray-700 shadow-lg">
        {/* Top Row: Title and Auto-save Status */}
        <div className="px-6 py-2 flex items-center justify-between border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold text-xl tracking-tight">📐 Canvas Editor</h2>
            <div className="h-5 w-px bg-gray-600"></div>
            <AutoSaveIndicator saveStatus={saveStatus} lastSaved={lastSaved} error={autoSaveError} />
          </div>
          <EditorActions
            autoSaveEnabled={autoSaveEnabled}
            onAutoSaveToggle={setAutoSaveEnabled}
            onClose={onClose}
            onSave={handleSave}
          />
        </div>

        {/* Bottom Row: Controls */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <PageSettings
              pageSize={pageSize}
              orientation={orientation}
              onPageSizeChange={setPageSize}
              onOrientationChange={setOrientation}
              pageSizes={PAGE_SIZES}
            />
            
            <div className="h-10 w-px bg-gray-600"></div>
            
            <ZoneHeightControls
              headerHeight={canvasDocument.header.height}
              footerHeight={canvasDocument.footer.height}
              onHeaderHeightChange={handleHeaderHeightChange}
              onFooterHeightChange={handleFooterHeightChange}
            />
            
            <div className="h-10 w-px bg-gray-600"></div>
            
            <ViewControls
              zoom={zoom}
              onZoomChange={setZoom}
              showGrid={showGrid}
              gridSize={gridSize}
              onGridToggle={setShowGrid}
              onGridSizeChange={setGridSize}
            />
          </div>

          <PageNavigation
            currentPage={currentPageIndex}
            totalPages={canvasDocument.pages?.length || 1}
            onPageChange={setCurrentPageIndex}
            onAddPage={handleAddPage}
            onDuplicatePage={() => handleDuplicatePage(currentPageIndex)}
            onDeletePage={() => handleDeletePage(currentPageIndex)}
          />
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
              showGrid={showGrid}
              gridSize={gridSize}
            />
          </div>
        </div>

        {/* Right Panel - Properties */}
        {selectedElement && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto flex flex-col">
            {/* Panel Header with Copy/Paste/Delete Actions */}
            <div className="p-4 bg-gray-900 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-lg">
                  {selectedElement.type === 'text' && '📝 Text Properties'}
                  {selectedElement.type === 'table' && '📊 Table Properties'}
                  {selectedElement.type === 'image' && '🖼️ Image Properties'}
                  {selectedElement.type === 'line' && '➖ Line Properties'}
                </h3>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyElement}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1"
                    title="Copy (Ctrl+C)"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={handleDuplicateElement}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1"
                    title="Duplicate (Ctrl+D)"
                  >
                    📑 Duplicate
                  </button>
                  {clipboard && (
                    <button
                      onClick={handlePasteElement}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 animate-pulse"
                      title="Paste (Ctrl+V)"
                    >
                      📥 Paste
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    const zone = editingZone || findElementZone(selectedElement.id);
                    handleDeleteElement(zone, selectedElement.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors shadow-sm flex items-center gap-1"
                  title="Delete (Delete key)"
                >
                  🗑️ Delete
                </button>
              </div>
              <div className="mt-2 text-gray-400 text-xs">
                ID: {selectedElement.id.substring(0, 16)}...
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
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
          </div>
        )}
      </div>
    </div>
  );
}
