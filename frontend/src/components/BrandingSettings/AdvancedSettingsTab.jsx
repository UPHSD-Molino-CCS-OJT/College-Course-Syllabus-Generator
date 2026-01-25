import InlineEditablePreview from './InlineEditablePreview';

export default function AdvancedSettingsTab({
  settings,
  handlers,
  renderContentBlock,
}) {
  return (
    <InlineEditablePreview
      settings={settings}
      handlers={handlers}
    />
  );
}
