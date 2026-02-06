import DataFieldPicker from '../DataFieldPicker';

export default function CellEditorModal({
  cell,
  cellPosition,
  onClose,
  onCellUpdate,
  onApplyStyleToAll,
  onCopyBordersToAll
}) {
  const { row, col } = cellPosition;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white">
              Edit Cell [{row}, {col}]
            </h4>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onApplyStyleToAll}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Apply this cell's style to all cells"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Apply Style to All
            </button>
            <button
              onClick={onCopyBordersToAll}
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
          {/* Data Field Picker */}
          <div className="bg-gray-700/50 rounded-lg p-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">Insert Data Field</label>
            <DataFieldPicker 
              onInsert={(field) => {
                const currentContent = cell.content || '';
                onCellUpdate({ content: currentContent + field });
              }} 
              compact={false} 
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
            <textarea
              value={cell.content}
              onChange={(e) => onCellUpdate({ content: e.target.value })}
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
                onChange={(e) => onCellUpdate({ fontSize: parseInt(e.target.value) })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Font Weight</label>
              <select
                value={cell.fontWeight}
                onChange={(e) => onCellUpdate({ fontWeight: e.target.value })}
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
                onChange={(e) => onCellUpdate({ align: e.target.value })}
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
                onChange={(e) => onCellUpdate({ verticalAlign: e.target.value })}
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
                onChange={(e) => onCellUpdate({ width: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Auto"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cell Height (px)</label>
              <input
                type="number"
                value={cell.height || ''}
                onChange={(e) => onCellUpdate({ height: e.target.value ? parseInt(e.target.value) : null })}
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
                  onChange={(e) => onCellUpdate({ color: e.target.value })}
                  className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={cell.color}
                  onChange={(e) => onCellUpdate({ color: e.target.value })}
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
                  onChange={(e) => onCellUpdate({ bg: e.target.value })}
                  className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={cell.bg}
                  onChange={(e) => onCellUpdate({ bg: e.target.value })}
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
                  onChange={(e) => onCellUpdate({ showBorderTop: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span>Top Border</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={cell.showBorderRight !== false}
                  onChange={(e) => onCellUpdate({ showBorderRight: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span>Right Border</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={cell.showBorderBottom !== false}
                  onChange={(e) => onCellUpdate({ showBorderBottom: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span>Bottom Border</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={cell.showBorderLeft !== false}
                  onChange={(e) => onCellUpdate({ showBorderLeft: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span>Left Border</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3 bg-gray-900">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
