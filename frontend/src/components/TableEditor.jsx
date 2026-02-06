import { useState } from 'react';
import BorderPresets from './table-editor/BorderPresets';
import CellGridSelector from './table-editor/CellGridSelector';
import CellEditorModal from './table-editor/CellEditorModal';

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
      case 'vertical':
        borderUpdates = {
          showBorderTop: false,
          showBorderRight: true,
          showBorderBottom: false,
          showBorderLeft: true
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
      case 'outer-borders':
      case 'inner-borders':
        // Will be applied conditionally per cell
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
        if (preset === 'outer-borders') {
          // Toggle outer borders
          const isOuter = i === 0 || j === table.cols - 1 || i === table.rows - 1 || j === 0;
          if (isOuter) {
            return {
              ...cell,
              showBorderTop: i === 0 ? !cell.showBorderTop : cell.showBorderTop,
              showBorderRight: j === table.cols - 1 ? !cell.showBorderRight : cell.showBorderRight,
              showBorderBottom: i === table.rows - 1 ? !cell.showBorderBottom : cell.showBorderBottom,
              showBorderLeft: j === 0 ? !cell.showBorderLeft : cell.showBorderLeft
            };
          }
          return cell;
        }
        if (preset === 'inner-borders') {
          // Toggle inner borders (all borders except outer edges)
          return {
            ...cell,
            showBorderTop: i === 0 ? cell.showBorderTop : !cell.showBorderTop,
            showBorderRight: j === table.cols - 1 ? cell.showBorderRight : !cell.showBorderRight,
            showBorderBottom: i === table.rows - 1 ? cell.showBorderBottom : !cell.showBorderBottom,
            showBorderLeft: j === 0 ? cell.showBorderLeft : !cell.showBorderLeft
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
              <BorderPresets onApplyPreset={applyBorderPreset} />

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
        <CellEditorModal
          cell={table.data[selectedCell.row][selectedCell.col]}
          cellPosition={selectedCell}
          onClose={closeCellEditor}
          onCellUpdate={(updates) => handleCellUpdate(selectedCell.row, selectedCell.col, updates)}
          onApplyStyleToAll={applyCellStyleToAll}
          onCopyBordersToAll={() => {
            const cell = table.data[selectedCell.row][selectedCell.col];
            bulkUpdateCells({
              showBorderTop: cell.showBorderTop,
              showBorderRight: cell.showBorderRight,
              showBorderBottom: cell.showBorderBottom,
              showBorderLeft: cell.showBorderLeft
            });
          }}
        />
      )}
    </div>
  );
}