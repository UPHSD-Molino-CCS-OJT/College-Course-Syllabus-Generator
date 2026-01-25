import ContentBlockEditor from './ContentBlockEditor';
import PreviewSection from './PreviewSection';

export default function AdvancedSettingsTab({
  settings,
  handlers,
  renderContentBlock,
}) {
  return (
    <>
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Advanced Mode:</strong> Create custom header and footer layouts
          with multiple text and image blocks. You can add, reorder, and style each
          element independently. These settings will override the basic header/footer
          text fields.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Left side: Preview (70% width) */}
        <div className="w-[70%]">
          <PreviewSection
            settings={settings}
            renderContentBlock={renderContentBlock}
            onEditBlock={handlers.handleEditBlock}
          />
        </div>

        {/* Right side: Block Editors (30% width) */}
        <div className="w-[30%] space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {/* Header Content Editor */}
          <ContentBlockEditor
            section="headerContent"
            sectionLabel="Header"
            settings={settings}
            addContentBlock={handlers.addContentBlock}
            removeContentBlock={handlers.removeContentBlock}
            updateContentBlock={handlers.updateContentBlock}
            moveContentBlock={handlers.moveContentBlock}
            handleImageUploadForBlock={handlers.handleImageUploadForBlock}
            onLayoutChange={handlers.handleLayoutChange}
            addChildToGroup={handlers.addChildToGroup}
            removeChildFromGroup={handlers.removeChildFromGroup}
            updateGroupChild={handlers.updateGroupChild}
            insertContentBlockAt={handlers.insertContentBlockAt}
          />

          {/* Footer Content Editor */}
          <ContentBlockEditor
            section="footerContent"
            sectionLabel="Footer"
            settings={settings}
            addContentBlock={handlers.addContentBlock}
            removeContentBlock={handlers.removeContentBlock}
            updateContentBlock={handlers.updateContentBlock}
            moveContentBlock={handlers.moveContentBlock}
            handleImageUploadForBlock={handlers.handleImageUploadForBlock}
            onLayoutChange={handlers.handleLayoutChange}
            addChildToGroup={handlers.addChildToGroup}
            removeChildFromGroup={handlers.removeChildFromGroup}
            updateGroupChild={handlers.updateGroupChild}
            insertContentBlockAt={handlers.insertContentBlockAt}
          />
        </div>
      </div>
    </>
  );
}
