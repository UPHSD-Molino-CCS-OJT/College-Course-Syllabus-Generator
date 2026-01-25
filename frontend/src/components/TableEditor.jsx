import { useState } from 'react';
import DataFieldPicker from './DataFieldPicker';

export default function TableEditor({ table, onUpdate }) {
  const [selectedCell, setSelectedCell] = useState(null);

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

  return (
    <div className="p-4 text-white">
      <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Table Properties</h3>

      {/* Table Dimensions */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Dimensions</label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Rows: {table.rows}</span>
            <div className="flex gap-1">
              <button
                onClick={handleRemoveRow}
                disabled={table.rows <= 1}
                className="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <button
                onClick={handleAddRow}
                className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Columns: {table.cols}</span>
            <div className="flex gap-1">
              <button
                onClick={handleRemoveColumn}
                disabled={table.cols <= 1}
                className="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <button
                onClick={handleAddColumn}
                className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cell Dimensions */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Cell Size</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400">Width</label>
            <input
              type="number"
              min="50"
              max="500"
              value={table.cellWidth}
              onChange={(e) => onUpdate({ cellWidth: parseInt(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Height</label>
            <input
              type="number"
              min="20"
              max="200"
              value={table.cellHeight}
              onChange={(e) => onUpdate({ cellHeight: parseInt(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Border Settings */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Border</label>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Width (px)</label>
            <input
              type="number"
              min="0"
              max="10"
              value={table.borderWidth}
              onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={table.borderColor}
                onChange={(e) => onUpdate({ borderColor: e.target.value })}
                className="w-12 h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={table.borderColor}
                onChange={(e) => onUpdate({ borderColor: e.target.value })}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Position */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400">X</label>
            <input
              type="number"
              value={Math.round(table.x)}
              onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Y</label>
            <input
              type="number"
              value={Math.round(table.y)}
              onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Cell Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Edit Cell</label>
        <div className="bg-gray-700 rounded p-2 max-h-64 overflow-y-auto">
          {table.data.map((row, rowIndex) => (
            <div key={rowIndex} className="mb-2">
              <div className="text-xs text-gray-400 mb-1">Row {rowIndex + 1}</div>
              {row.map((cell, colIndex) => (
                <div key={colIndex} className="mb-2 pl-2">
                  <button
                    onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                    className={`text-xs w-full text-left px-2 py-1 rounded ${
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                        ? 'bg-blue-600'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    Cell [{rowIndex},{colIndex}]: {cell.content}
                  </button>
                  {selectedCell?.row === rowIndex && selectedCell?.col === colIndex && (
                    <div className="mt-2 space-y-2 bg-gray-800 p-2 rounded">
                      <DataFieldPicker 
                        onInsert={(field) => {
                          const currentContent = cell.content || '';
                          handleCellUpdate(rowIndex, colIndex, { content: currentContent + field });
                        }} 
                        compact={true} 
                      />
                      <textarea
                        value={cell.content}
                        onChange={(e) => handleCellUpdate(rowIndex, colIndex, { content: e.target.value })}
                        placeholder="Cell content"
                        rows={3}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <label className="text-xs text-gray-400">Font Size</label>
                          <input
                            type="number"
                            value={cell.fontSize}
                            onChange={(e) => handleCellUpdate(rowIndex, colIndex, { fontSize: parseInt(e.target.value) })}
                            placeholder="Size"
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">H-Align</label>
                          <select
                            value={cell.align}
                            onChange={(e) => handleCellUpdate(rowIndex, colIndex, { align: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Vertical Align</label>
                        <select
                          value={cell.verticalAlign || 'top'}
                          onChange={(e) => handleCellUpdate(rowIndex, colIndex, { verticalAlign: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none"
                        >
                          <option value="top">Top</option>
                          <option value="middle">Middle</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <label className="text-xs text-gray-400">Cell Width</label>
                          <input
                            type="number"
                            value={cell.width || ''}
                            onChange={(e) => handleCellUpdate(rowIndex, colIndex, { width: e.target.value ? parseInt(e.target.value) : null })}
                            placeholder="Auto"
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Cell Height</label>
                          <input
                            type="number"
                            value={cell.height || ''}
                            onChange={(e) => handleCellUpdate(rowIndex, colIndex, { height: e.target.value ? parseInt(e.target.value) : null })}
                            placeholder="Auto"
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Background Color</label>
                        <input
                          type="color"
                          value={cell.bg}
                          onChange={(e) => handleCellUpdate(rowIndex, colIndex, { bg: e.target.value })}
                          className="w-full h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
