export default function CellGridSelector({ tableData, selectedCell, onCellSelect }) {
  return (
    <div className="p-3 bg-gray-800/50">
      <div className="text-xs text-gray-400 mb-2">Click a cell to edit its content and style</div>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {tableData.map((row, rowIndex) => (
          <div key={rowIndex}>
            <div className="text-xs font-medium text-gray-500 mt-2 mb-1 px-1">Row {rowIndex + 1}</div>
            <div className="grid grid-cols-2 gap-1">
              {row.map((cell, colIndex) => (
                <button
                  key={colIndex}
                  onClick={() => onCellSelect(rowIndex, colIndex)}
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
  );
}
