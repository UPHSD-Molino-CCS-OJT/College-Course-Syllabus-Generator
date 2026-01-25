export default function BasicSettingsTab({
  settings,
  logoPreview,
  handleChange,
  handleLogoUpload,
  onRemoveLogo,
}) {
  return (
    <>
      {/* Institution Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Institution Name *
        </label>
        <input
          type="text"
          name="institutionName"
          value={settings.institutionName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter institution name"
        />
      </div>

      {/* Institution Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Institution Logo
        </label>
        <div className="flex items-center gap-4">
          {logoPreview && (
            <div className="w-24 h-24 border border-gray-300 rounded-md overflow-hidden">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, or SVG. Max size 2MB.
            </p>
          </div>
        </div>
        {settings.institutionLogo && (
          <button
            type="button"
            onClick={onRemoveLogo}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Remove Logo
          </button>
        )}
      </div>

      {/* Header Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Header Text
        </label>
        <textarea
          name="headerText"
          value={settings.headerText}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Text to appear in the header of printed syllabi"
        />
      </div>

      {/* Footer Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Footer Text
        </label>
        <textarea
          name="footerText"
          value={settings.footerText}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Text to appear in the footer of printed syllabi"
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              name="primaryColor"
              value={settings.primaryColor}
              onChange={handleChange}
              className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) =>
                handleChange({ target: { name: 'primaryColor', value: e.target.value } })
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              name="secondaryColor"
              value={settings.secondaryColor}
              onChange={handleChange}
              className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={settings.secondaryColor}
              onChange={(e) =>
                handleChange({ target: { name: 'secondaryColor', value: e.target.value } })
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>
      </div>

      {/* Font Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size
          </label>
          <select
            name="fontSize"
            value={settings.fontSize}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Family
          </label>
          <select
            name="fontFamily"
            value={settings.fontFamily}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="Courier New, monospace">Courier New</option>
          </select>
        </div>
      </div>

      {/* Basic Preview */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div
          className="border border-gray-300 rounded-md p-6"
          style={{
            fontFamily: settings.fontFamily,
            fontSize:
              settings.fontSize === 'small'
                ? '14px'
                : settings.fontSize === 'large'
                ? '18px'
                : '16px',
          }}
        >
          {/* Preview Header */}
          <div
            className="flex items-center justify-between pb-4 mb-4 border-b-2"
            style={{ borderColor: settings.primaryColor }}
          >
            {logoPreview && (
              <img src={logoPreview} alt="Logo" className="h-16 object-contain" />
            )}
            <div className="flex-1 text-center">
              <h2
                className="text-xl font-bold"
                style={{ color: settings.primaryColor }}
              >
                {settings.institutionName || 'Institution Name'}
              </h2>
              {settings.headerText && (
                <p className="text-sm text-gray-600 mt-1">{settings.headerText}</p>
              )}
            </div>
          </div>

          {/* Preview Content */}
          <div className="my-6">
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: settings.secondaryColor }}
            >
              Course Syllabus
            </h3>
            <p className="text-gray-700">
              This is a preview of how your syllabus will look with the current
              settings.
            </p>
          </div>

          {/* Preview Footer */}
          {settings.footerText && (
            <div
              className="pt-4 mt-4 border-t text-center text-sm text-gray-600"
              style={{ borderColor: settings.primaryColor }}
            >
              {settings.footerText}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
