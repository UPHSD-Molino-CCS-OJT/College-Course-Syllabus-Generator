import CanvasEditor from './CanvasEditor';

export default function AdvancedSettingsTab({
  settings,
  handlers,
}) {
  const handleHeaderChange = (newElements) => {
    handlers.updateCanvasElements('headerContent', newElements);
  };

  const handleFooterChange = (newElements) => {
    handlers.updateCanvasElements('footerContent', newElements);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Header Canvas</h3>
          <span className="text-sm text-gray-500">
            {(settings.headerContent || []).length} element(s)
          </span>
        </div>
        <CanvasEditor
          elements={settings.headerContent || []}
          onChange={handleHeaderChange}
          canvasWidth={800}
          canvasHeight={300}
        />
      </div>

      {/* Footer Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Footer Canvas</h3>
          <span className="text-sm text-gray-500">
            {(settings.footerContent || []).length} element(s)
          </span>
        </div>
        <CanvasEditor
          elements={settings.footerContent || []}
          onChange={handleFooterChange}
          canvasWidth={800}
          canvasHeight={200}
        />
      </div>
    </div>
  );
}

