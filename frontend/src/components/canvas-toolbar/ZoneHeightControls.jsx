export default function ZoneHeightControls({ 
  headerHeight, 
  footerHeight, 
  onHeaderHeightChange, 
  onFooterHeightChange 
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <label className="text-gray-400 text-xs mb-1">Header Height</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="50"
            max="300"
            value={headerHeight}
            onChange={onHeaderHeightChange}
            className="bg-gray-700 text-white rounded px-2 py-1.5 text-sm w-20 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-xs">px</span>
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-gray-400 text-xs mb-1">Footer Height</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="50"
            max="300"
            value={footerHeight}
            onChange={onFooterHeightChange}
            className="bg-gray-700 text-white rounded px-2 py-1.5 text-sm w-20 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-xs">px</span>
        </div>
      </div>
    </div>
  );
}
