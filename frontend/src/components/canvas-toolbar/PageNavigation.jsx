export default function PageNavigation({ 
  currentPage, 
  totalPages, 
  onPageChange,
  onAddPage,
  onDuplicatePage,
  onDeletePage
}) {
  const canDelete = totalPages > 1;

  return (
    <div className="flex items-center gap-3">
      {/* Page Navigator */}
      <div className="flex flex-col">
        <label className="text-gray-400 text-xs mb-1">Page</label>
        <div className="flex items-center gap-2 bg-gray-700 rounded px-2 py-1 border border-gray-600">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="text-white px-2 py-0.5 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            ‹
          </button>
          <span className="text-white text-sm min-w-[50px] text-center font-medium">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="text-white px-2 py-1 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            ›
          </button>
        </div>
      </div>

      {/* Page Actions */}
      <div className="flex flex-col">
        <label className="text-gray-400 text-xs mb-1">Actions</label>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddPage}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
            title="Add new page"
          >
            + Add
          </button>
          <button
            onClick={onDuplicatePage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
            title="Duplicate current page"
          >
            📋 Copy
          </button>
          <button
            onClick={onDeletePage}
            disabled={!canDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            title={canDelete ? "Delete current page" : "Cannot delete the last page"}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
