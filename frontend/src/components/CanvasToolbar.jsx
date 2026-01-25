export default function CanvasToolbar({ editingZone, onAddText, onAddTable, onZoneChange }) {
  const zones = [
    { id: 'header', label: 'Header', icon: '📄' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'footer', label: 'Footer', icon: '📋' }
  ];

  const tools = [
    { id: 'text', label: 'Text', icon: 'T', action: () => onAddText(editingZone || 'content') },
    { id: 'table', label: 'Table', icon: '⊞', action: () => onAddTable(editingZone || 'content') }
  ];

  return (
    <div className="w-20 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 gap-4">
      {/* Zone Selector */}
      <div className="space-y-2">
        <div className="text-gray-400 text-xs text-center mb-2">Zones</div>
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => onZoneChange(zone.id)}
            className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
              editingZone === zone.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={zone.label}
          >
            <span className="text-xl">{zone.icon}</span>
            <span className="text-xs">{zone.label}</span>
          </button>
        ))}
      </div>

      <div className="h-px w-12 bg-gray-600"></div>

      {/* Tools */}
      <div className="space-y-2">
        <div className="text-gray-400 text-xs text-center mb-2">Tools</div>
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={tool.action}
            disabled={!editingZone}
            className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
              editingZone
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            title={tool.label}
          >
            <span className="text-2xl font-bold">{tool.icon}</span>
            <span className="text-xs">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
