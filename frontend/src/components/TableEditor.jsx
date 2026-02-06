import { useState } from 'react';
import DataFieldPicker from './DataFieldPicker';

export default function TableEditor({ table, onUpdate }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    dimensions: true,
    borders: false,
    position: false,
    cells: true
  });
  const [showCellModal, setShowCellModal] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const openCellEditor = (row, col) => {
    setSelectedCell({ row, col });
    setShowCellModal(true);
  };

  const closeCellEditor = () => {
    setShowCellModal(false);
    // Keep selectedCell for highlighting but close modal
  };

  const handleAddRow = () => {
    const newRow = Array(table.cols).fill(null).map((_, j) => ({
      content: `Cell ${table.rows}-${j}`,
      fontSize: 12,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      align: 'left',
      bg: '#ffffff'
    }));

    onUpdate({
      rows: table.rows + 1,
      data: [...table.data, newRow]
    });
  };

  const handleAddColumn = () => {
    const newData = table.data.map((row, i) => [
      ...row,
      {
        content: i === 0 ? `Header ${table.cols}` : `Cell ${i}-${table.cols}`,
        fontSize: 12,
        fontFamily: 'Arial',
        fontWeight: i === 0 ? 'bold' : 'normal',
        color: '#000000',
        align: 'left',
        bg: i === 0 ? '#f3f4f6' : '#ffffff'
      }
    ]);

    onUpdate({
      cols: table.cols + 1,
      data: newData
    });
  };

  const handleRemoveRow = () => {
    if (table.rows <= 1) return;
    onUpdate({
      rows: table.rows - 1,
      data: table.data.slice(0, -1)
    });
  };

  const handleRemoveColumn = () => {
    if (table.cols <= 1) return;
    onUpdate({
      cols: table.cols - 1,
      data: table.data.map(row => row.slice(0, -1))
    });
  };

  const handleCellUpdate = (rowIndex, colIndex, updates) => {
    const newData = table.data.map((row, i) =>
      row.map((cell, j) =>
        i === rowIndex && j === colIndex ? { ...cell, ...updates } : cell
      )
    );
    onUpdate({ data: newData });
  };

  // Apply border preset to all cells
  const applyBorderPreset = (preset) => {
    let borderUpdates = {};
    
    switch(preset) {
      case 'full-grid':
        borderUpdates = {
          showBorderTop: true,
          showBorderRight: true,
          showBorderBottom: true,
          showBorderLeft: true
        };
        break;
      case 'outer-only':
        // Will be applied conditionally per cell
        break;
      case 'horizontal':
        borderUpdates = {
          showBorderTop: true,
          showBorderRight: false,
          showBorderBottom: true,
          showBorderLeft: false
        };
        break;
      case 'no-borders':
        borderUpdates = {
          showBorderTop: false,
          showBorderRight: false,
          showBorderBottom: false,
          showBorderLeft: false
        };
        break;
    }

    const newData = table.data.map((row, i) =>
      row.map((cell, j) => {
        if (preset === 'outer-only') {
          // Only outer edges get borders
          return {
            ...cell,
            showBorderTop: i === 0,
            showBorderRight: j === table.cols - 1,
            showBorderBottom: i === table.rows - 1,
            showBorderLeft: j === 0
          };
        }
        return { ...cell, ...borderUpdates };
      })
    );
    onUpdate({ data: newData });
  };

  // Apply current cell's style to all cells
  const applyCellStyleToAll = () => {
    if (!selectedCell) return;
    const sourceCell = table.data[selectedCell.row][selectedCell.col];
    const styleProps = {
      fontSize: sourceCell.fontSize,
      fontWeight: sourceCell.fontWeight,
      color: sourceCell.color,
      bg: sourceCell.bg,
      align: sourceCell.align,
      verticalAlign: sourceCell.verticalAlign,
      showBorderTop: sourceCell.showBorderTop,
      showBorderRight: sourceCell.showBorderRight,
      showBorderBottom: sourceCell.showBorderBottom,
      showBorderLeft: sourceCell.showBorderLeft
    };

    const newData = table.data.map(row =>
      row.map(cell => ({ ...cell, ...styleProps }))
    );
    onUpdate({ data: newData });
  };

  // Bulk update all cells with specific properties
  const bulkUpdateCells = (updates) => {
    const newData = table.data.map(row =>
      row.map(cell => ({ ...cell, ...updates }))
    );
    onUpdate({ data: newData });
  };

  return (
    <div className="p-4 text-white h-full flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 flex-shrink-0">Table Properties</h3>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {/* Table Dimensions */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('dimensions')}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 flex items-center justify-between text-sm font-medium transition-colors"
          >
            <span>📐 Dimensions & Size</span>
            <span className="text-xs">{expandedSections.dimensions ? '▼' : '▶'}</span>
          </button>
          {expandedSections.dimensions && (
            <div className="p-3 space-y-3 bg-gray-800/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                  <span className="text-sm font-medium">Rows: {table.rows}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRemoveRow}
                      disabled={table.rows <= 1}
                      className="w-8 h-8 bg-red-600 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                      title="Remove row"
                    >
                      −
                    </button>
                    <button
                      onClick={handleAddRow}
                      className="w-8 h-8 bg-blue-600 rounded text-sm hover:bg-blue-700 flex items-center justify-center font-bold"
                      title="Add row"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                  <span className="text-sm font-medium">Columns: {table.cols}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRemoveColumn}
                      disabled={table.cols <= 1}
                      className="w-8 h-8 bg-red-600 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                      title="Remove column"
                    >
                      −
                    </button>
                    <button
                      onClick={handleAddColumn}
                      className="w-8 h-8 bg-blue-600 rounded text-sm hover:bg-blue-700 flex items-center justify-center font-bold"
                      title="Add column"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <label className="block text-xs font-medium text-gray-400 mb-2">Default Cell Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Width (px)</label>
                    <input
                      type="number"
                      min="50"
                      max="500"
                      value={table.cellWidth}
                      onChange={(e) => onUpdate({ cellWidth: parseInt(e.target.value) })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Height (px)</label>
                    <input
                      type="number"
                      min="20"
                      max="200"
                      value={table.cellHeight}
                      onChange={(e) => onUpdate({ cellHeight: parseInt(e.target.value) })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Border Settings */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('borders')}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 flex items-center justify-between text-sm font-medium transition-colors"
          >
            <span>🔲 Borders</span>
            <span className="text-xs">{expandedSections.borders ? '▼' : '▶'}</span>
          </button>
          {expandedSections.borders && (
            <div className="p-3 space-y-3 bg-gray-800/50">
              {/* Quick Border Presets */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Quick Presets (Apply to All Cells)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyBorderPreset('full-grid')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                    title="Add all borders to all cells"
                  >
                    ⊞ Full Grid
                  </button>
                  <button
                    onClick={() => applyBorderPreset('outer-only')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                    title="Only outer table borders"
                  >
                    ⊡ Outer Only
                  </button>
                  <button
                    onClick={() => applyBorderPreset('horizontal')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                    title="Horizontal lines only"
                  >
                    ☰ Horizontal
                  </button>
                  <button
                    onClick={() => applyBorderPreset('no-borders')}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-xs font-medium transition-colors"
                    title="Remove all borders"
                  >
                    ∅ No Borders
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3 space-y-3">
                <label className="block text-xs font-medium text-gray-400 mb-2">Table Border Settings</label>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Width (px)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={table.borderWidth}
                    onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Style</label>
                  <select
                    value={table.borderStyle || 'solid'}
                    onChange={(e) => onUpdate({ borderStyle: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={table.borderColor}
                      onChange={(e) => onUpdate({ borderColor: e.target.value })}
                      className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={table.borderColor}
                      onChange={(e) => onUpdate({ borderColor: e.target.value })}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Show Borders</label>
                  <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer p-2 bg-gray-700/50 rounded hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={table.showBorderTop !== false}
                      onChange={(e) => onUpdate({ showBorderTop: e.target.checked })}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    Top
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer p-2 bg-gray-700/50 rounded hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={table.showBorderRight !== false}
                      onChange={(e) => onUpdate({ showBorderRight: e.target.checked })}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    Right
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer p-2 bg-gray-700/50 rounded hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={table.showBorderBottom !== false}
                      onChange={(e) => onUpdate({ showBorderBottom: e.target.checked })}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    Bottom
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer p-2 bg-gray-700/50 rounded hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={table.showBorderLeft !== false}
                      onChange={(e) => onUpdate({ showBorderLeft: e.target.checked })}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    Left
                  </label>
                </div>
              </div>
              </div>
            </div>
          )}
        </div>

        {/* Position */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('position')}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 flex items-center justify-between text-sm font-medium transition-colors"
          >
            <span>📍 Position</span>
            <span className="text-xs">{expandedSections.position ? '▼' : '▶'}</span>
          </button>
          {expandedSections.position && (
            <div className="p-3 bg-gray-800/50">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">X (px)</label>
                  <input
                    type="number"
                    value={Math.round(table.x)}
                    onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Y (px)</label>
                  <input
                    type="number"
                    value={Math.round(table.y)}
                    onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cell Editor */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('cells')}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 flex items-center justify-between text-sm font-medium transition-colors"
          >
            <span>📝 Edit Cells</span>
            <span className="text-xs">{expandedSections.cells ? '▼' : '▶'}</span>
          </button>
          {expandedSections.cells && (
            <div className="p-3 bg-gray-800/50">
              <div className="text-xs text-gray-400 mb-2">Click a cell to edit its content and style</div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {table.data.map((row, rowIndex) => (
                  <div key={rowIndex}>
                    <div className="text-xs font-medium text-gray-500 mt-2 mb-1 px-1">Row {rowIndex + 1}</div>
                    <div className="grid grid-cols-2 gap-1">
                      {row.map((cell, colIndex) => (
                        <button
                          key={colIndex}
                          onClick={() => openCellEditor(rowIndex, colIndex)}
                          className={`text-xs text-left px-2 py-2 rounded border transition-colors ${
                            selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                              ? 'bg-blue-600 border-blue-400 text-white'
                              : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                          }`}
                          title="Click to edit"
                        >
                          <div className="font-medium">[{rowIndex},{colIndex}]</div>
                          <div className="truncate text-gray-300">{cell.content || '(empty)'}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cell Editor Modal */}
      {showCellModal && selectedCell && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={closeCellEditor}>
          <div 
            className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">
                  Edit Cell [{selectedCell.row}, {selectedCell.col}]
                </h4>
                <button
                  onClick={closeCellEditor}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applyCellStyleToAll}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
                  title="Apply this cell's style to all cells"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Apply Style to All
                </button>
                <button
                  onClick={() => {
                    const cell = table.data[selectedCell.row][selectedCell.col];
                    bulkUpdateCells({
                      showBorderTop: cell.showBorderTop,
                      showBorderRight: cell.showBorderRight,
                      showBorderBottom: cell.showBorderBottom,
                      showBorderLeft: cell.showBorderLeft
                    });
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
                  title="Copy this cell's borders to all cells"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Borders to All
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(() => {
                const cell = table.data[selectedCell.row][selectedCell.col];
                return (
                  <>
                    {/* Data Field Picker */}
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Insert Data Field</label>
                      <DataFieldPicker 
                        onInsert={(field) => {
                          const currentContent = cell.content || '';
                          handleCellUpdate(selectedCell.row, selectedCell.col, { content: currentContent + field });
                        }} 
                        compact={false} 
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                      <textarea
                        value={cell.content}
                        onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { content: e.target.value })}
                        placeholder="Enter cell content..."
                        rows={4}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {/* Typography */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
                        <input
                          type="number"
                          value={cell.fontSize}
                          onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { fontSize: parseInt(e.target.value) })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Font Weight</label>
                        <select
                          value={cell.fontWeight}
                          onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { fontWeight: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>
                    </div>

                    {/* Alignment */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Horizontal Align</label>
                        <select
                          value={cell.align}
                          onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { align: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Vertical Align</label>
                        <select
                          value={cell.verticalAlign || 'top'}
                          onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { verticalAlign: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="top">Top</option>
                          <option value="middle">Middle</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>

                    {/* Cell Dimensions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Cell Width (px)</label>
                        <input
                          type="number"
                          value={cell.width || ''}
                          onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { width: e.target.value ? parseInt(e.target.value) : null })}
                          placeholder="Auto"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Cell Height (px)</label>
                        <input
                          type="number"
                          value={cell.height || ''}
                          onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { height: e.target.value ? parseInt(e.target.value) : null })}
                          placeholder="Auto"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Text Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={cell.color}
                            onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { color: e.target.value })}
                            className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={cell.color}
                            onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { color: e.target.value })}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Background Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={cell.bg}
                            onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { bg: e.target.value })}
                            className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={cell.bg}
                            onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { bg: e.target.value })}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cell Borders */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">Cell Borders</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-3 text-sm cursor-pointer p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={cell.showBorderTop !== false}
                            onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { showBorderTop: e.target.checked })}
                            className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Top Border</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm cursor-pointer p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={cell.showBorderRight !== false}
                            onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { showBorderRight: e.target.checked })}
                            className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Right Border</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm cursor-pointer p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={cell.showBorderBottom !== false}
                            onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { showBorderBottom: e.target.checked })}
                            className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Bottom Border</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm cursor-pointer p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={cell.showBorderLeft !== false}
                            onChange={(e) => handleCellUpdate(selectedCell.row, selectedCell.col, { showBorderLeft: e.target.checked })}
                            className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Left Border</span>
                        </label>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3 bg-gray-900">
              <button
                onClick={closeCellEditor}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
