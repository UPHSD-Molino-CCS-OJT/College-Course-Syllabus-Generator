import { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import AdvancedSettingsTab from './AdvancedSettingsTab';

export default function BrandingSettings() {
  const [settings, setSettings] = useState({
    institutionName: '',
    institutionLogo: '',
    headerText: '',
    footerText: '',
    headerLayout: 'vertical',
    headerContent: [],
    footerLayout: 'vertical',
    footerContent: [],
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    fontSize: 'medium',
    fontFamily: 'Arial, sans-serif',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      if (response.data.settings) {
        const loadedSettings = response.data.settings;

        // Ensure all content blocks have stable IDs
        if (loadedSettings.headerContent) {
          loadedSettings.headerContent = loadedSettings.headerContent.map(
            (block, index) => ({
              ...block,
              id: block.id || Date.now() + index + Math.random(),
            })
          );
        }
        if (loadedSettings.footerContent) {
          loadedSettings.footerContent = loadedSettings.footerContent.map(
            (block, index) => ({
              ...block,
              id: block.id || Date.now() + index + Math.random(),
            })
          );
        }

        setSettings(loadedSettings);
        setLogoPreview(loadedSettings.institutionLogo);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLayoutChange = (fieldName, value) => {
    setSettings((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setSettings((prev) => ({ ...prev, institutionLogo: base64String }));
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setSettings((prev) => ({ ...prev, institutionLogo: '' }));
    setLogoPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await settingsAPI.updateSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save settings. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    setMessage({ type: '', text: '' });
  };

  // Content block management
  const addContentBlock = (section, type) => {
    const newBlock = {
      id: Date.now() + Math.random(),
      type,
      content: type === 'text' ? 'Enter text here' : '',
      alignment: 'center',
      styles: {
        fontWeight: 'normal',
        fontSize: 'medium',
        color: '#000000',
        width: type === 'image' ? 100 : undefined,
        height: type === 'image' ? 100 : undefined,
      },
      order: settings[section].length,
      children: type === 'group' ? [] : undefined,
      layout: type === 'group' ? 'horizontal' : undefined,
    };
    setSettings((prev) => ({
      ...prev,
      [section]: [...prev[section], newBlock],
    }));
  };

  const insertContentBlockAt = (section, position, type) => {
    const newBlock = {
      id: Date.now() + Math.random(),
      type,
      content: type === 'text' ? 'Enter text here' : '',
      alignment: 'center',
      styles: {
        fontWeight: 'normal',
        fontSize: 'medium',
        color: '#000000',
        width: type === 'image' ? 100 : undefined,
        height: type === 'image' ? 100 : undefined,
      },
      order: position,
      children: type === 'group' ? [] : undefined,
      layout: type === 'group' ? 'horizontal' : undefined,
    };
    
    setSettings((prev) => {
      const newContent = [...prev[section]];
      newContent.splice(position, 0, newBlock);
      // Update order for all blocks
      newContent.forEach((block, i) => (block.order = i));
      return {
        ...prev,
        [section]: newContent,
      };
    });
  };

  const removeContentBlock = (section, index) => {
    setSettings((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const updateContentBlock = (section, index, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: prev[section].map((block, i) =>
        i === index
          ? field.includes('.')
            ? {
                ...block,
                styles: {
                  ...block.styles,
                  [field.split('.')[1]]: value,
                },
              }
            : { ...block, [field]: value }
          : block
      ),
    }));
  };

  const moveContentBlock = (section, index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= settings[section].length) return;

    const newContent = [...settings[section]];
    [newContent[index], newContent[newIndex]] = [
      newContent[newIndex],
      newContent[index],
    ];
    newContent.forEach((block, i) => (block.order = i));

    setSettings((prev) => ({ ...prev, [section]: newContent }));
  };

  const addChildToGroup = (section, groupIndex, type) => {
    const newChild = {
      id: Date.now() + Math.random(),
      type,
      content: type === 'text' ? 'Enter text here' : '',
      alignment: type === 'group' ? 'center' : undefined,
      layout: type === 'group' ? 'horizontal' : undefined,
      children: type === 'group' ? [] : undefined,
      styles: {
        fontWeight: 'normal',
        fontSize: 'medium',
        color: '#000000',
        width: type === 'image' ? 50 : undefined,
        height: type === 'image' ? 50 : undefined,
      },
    };

    setSettings((prev) => ({
      ...prev,
      [section]: prev[section].map((block, i) =>
        i === groupIndex
          ? {
              ...block,
              children: [...(block.children || []), newChild],
            }
          : block
      ),
    }));
  };

  const removeChildFromGroup = (section, groupIndex, childIndex) => {
    setSettings((prev) => ({
      ...prev,
      [section]: prev[section].map((block, i) =>
        i === groupIndex
          ? {
              ...block,
              children: (block.children || []).filter((_, ci) => ci !== childIndex),
            }
          : block
      ),
    }));
  };

  const updateGroupChild = (section, groupIndex, childIndex, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: prev[section].map((block, i) =>
        i === groupIndex
          ? {
              ...block,
              children: (block.children || []).map((child, ci) =>
                ci === childIndex
                  ? field.includes('.')
                    ? {
                        ...child,
                        styles: {
                          ...child.styles,
                          [field.split('.')[1]]: value,
                        },
                      }
                    : { ...child, [field]: value }
                  : child
              ),
            }
          : block
      ),
    }));
  };

  const handleImageUploadForBlock = (section, index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateContentBlock(section, index, 'content', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle clicking on a preview element to edit it
  const handleEditBlock = (section, index) => {
    // Scroll to the element in the editor list
    const element = document.getElementById(`block-${section}-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Trigger the edit action
      setTimeout(() => {
        const editButton = element.querySelector('[data-edit-button]');
        if (editButton) {
          editButton.click();
        }
      }, 300);
    }
  };

  // Render content block helper
  const renderContentBlock = (block, isHorizontal = false, section = null, index = null) => {
    const isClickable = section !== null && index !== null;
    
    if (block.type === 'group') {
      const groupLayout = block.layout || 'horizontal';
      return (
        <div
          className={isClickable ? 'group/preview cursor-pointer transition-all hover:bg-purple-50 hover:shadow-sm rounded p-1' : ''}
          onClick={isClickable ? () => handleEditBlock(section, index) : undefined}
          title={isClickable ? 'Click to edit this group' : undefined}
          style={{
            display: 'inline-flex',
            flexDirection: groupLayout === 'horizontal' ? 'row' : 'column',
            alignItems: 'center',
            gap: '8px',
            justifyContent:
              block.alignment === 'left'
                ? 'flex-start'
                : block.alignment === 'right'
                ? 'flex-end'
                : 'center',
          }}
        >
          {(block.children || []).map((child, childIndex) => (
            <div key={child.id || childIndex}>
              {child.type === 'text' ? (
                <p
                  style={{
                    fontWeight: child.styles?.fontWeight || 'normal',
                    fontSize:
                      child.styles?.fontSize === 'small'
                        ? '12px'
                        : child.styles?.fontSize === 'large'
                        ? '18px'
                        : '14px',
                    color: child.styles?.color || '#000000',
                    margin: 0,
                  }}
                >
                  {child.content}
                </p>
              ) : (
                <img
                  src={child.content}
                  alt="Group element"
                  style={{
                    width: `${child.styles?.width || 50}px`,
                    height: `${child.styles?.height || 50}px`,
                    display: 'block',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      );
    } else if (block.type === 'text') {
      return (
        <p
          className={isClickable ? 'cursor-pointer transition-all hover:bg-blue-50 hover:shadow-sm rounded px-2 py-1 inline-block' : ''}
          onClick={isClickable ? () => handleEditBlock(section, index) : undefined}
          title={isClickable ? 'Click to edit this text' : undefined}
          style={{
            fontWeight: block.styles.fontWeight,
            fontSize:
              block.styles.fontSize === 'small'
                ? '12px'
                : block.styles.fontSize === 'large'
                ? '18px'
                : '14px',
            color: block.styles.color,
            margin: 0,
          }}
        >
          {block.content}
        </p>
      );
    } else {
      return (
        <img
          className={isClickable ? 'cursor-pointer transition-all hover:ring-2 hover:ring-green-400 hover:shadow-md rounded' : ''}
          onClick={isClickable ? () => handleEditBlock(section, index) : undefined}
          title={isClickable ? 'Click to edit this image' : undefined}
          src={block.content}
          alt="Header"
          style={{
            width: `${block.styles.width}px`,
            height: `${block.styles.height}px`,
            display: 'block',
          }}
        />
      );
    }
  };

  // Group all handlers for advanced tab
  const handlers = {
    addContentBlock,
    insertContentBlockAt,
    removeContentBlock,
    updateContentBlock,
    moveContentBlock,
    handleImageUploadForBlock,
    handleLayoutChange,
    addChildToGroup,
    removeChildFromGroup,
    updateGroupChild,
    handleEditBlock,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Header/Footer Settings</h2>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AdvancedSettingsTab
          settings={settings}
          handlers={handlers}
          renderContentBlock={renderContentBlock}
        />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
