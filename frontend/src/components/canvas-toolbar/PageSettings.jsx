export default function PageSettings({ 
  pageSize, 
  orientation, 
  onPageSizeChange, 
  onOrientationChange,
  pageSizes 
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <label className="text-gray-400 text-xs mb-1">Page Size</label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(e.target.value)}
          className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-600 transition-colors"
        >
          {Object.entries(pageSizes).map(([key, value]) => (
            <option key={key} value={key}>{value.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-gray-400 text-xs mb-1">Orientation</label>
        <select
          value={orientation}
          onChange={(e) => onOrientationChange(e.target.value)}
          className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-600 transition-colors"
        >
          <option value="landscape">🖼️ Landscape</option>
          <option value="portrait">📄 Portrait</option>
        </select>
      </div>
    </div>
  );
}
