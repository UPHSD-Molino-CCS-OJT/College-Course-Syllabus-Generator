export default function PreviewSection({ settings, renderContentBlock }) {
  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
      <div
        className="border border-gray-300 rounded-md overflow-hidden"
        style={{
          fontFamily: settings.fontFamily,
        }}
      >
        {/* Preview Header */}
        {settings.headerContent.length > 0 && (
          <div className="bg-gray-100 p-4 border-b-2 border-gray-300">
            <div
              className={
                settings.headerLayout === 'horizontal'
                  ? 'flex items-center gap-4 flex-wrap'
                  : 'space-y-2'
              }
              style={{
                justifyContent:
                  settings.headerLayout === 'horizontal' ? 'center' : 'initial',
              }}
            >
              {settings.headerContent
                .sort((a, b) => a.order - b.order)
                .map((block, index) => (
                  <div
                    key={block.id || index}
                    style={{
                      textAlign:
                        block.type === 'group'
                          ? 'initial'
                          : settings.headerLayout === 'horizontal'
                          ? 'initial'
                          : block.alignment,
                      width: block.type === 'group' ? '100%' : 'auto',
                    }}
                  >
                    {renderContentBlock(
                      block,
                      settings.headerLayout === 'horizontal'
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Preview Content */}
        <div className="p-6">
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: settings.secondaryColor }}
          >
            Course Syllabus
          </h3>
          <p className="text-gray-700">
            This is a preview of how your syllabus will look with the current
            header and footer settings.
          </p>
        </div>

        {/* Preview Footer */}
        {settings.footerContent.length > 0 && (
          <div className="bg-gray-100 p-4 border-t-2 border-gray-300">
            <div
              className={
                settings.footerLayout === 'horizontal'
                  ? 'flex items-center gap-4 flex-wrap'
                  : 'space-y-2'
              }
              style={{
                justifyContent:
                  settings.footerLayout === 'horizontal' ? 'center' : 'initial',
              }}
            >
              {settings.footerContent
                .sort((a, b) => a.order - b.order)
                .map((block, index) => (
                  <div
                    key={block.id || index}
                    style={{
                      textAlign:
                        block.type === 'group'
                          ? 'initial'
                          : settings.footerLayout === 'horizontal'
                          ? 'initial'
                          : block.alignment,
                      width: block.type === 'group' ? '100%' : 'auto',
                    }}
                  >
                    {renderContentBlock(
                      block,
                      settings.footerLayout === 'horizontal'
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
