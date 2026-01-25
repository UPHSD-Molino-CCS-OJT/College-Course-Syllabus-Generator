import { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import AdvancedSettingsTab from './AdvancedSettingsTab';
import { migrateToCanvasStructure, needsMigration } from './utils/migration';

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
        let loadedSettings = response.data.settings;

        // Check if migration is needed
        if (needsMigration(loadedSettings)) {
          console.log('Migrating old nested group structure to canvas structure...');
          loadedSettings = migrateToCanvasStructure(loadedSettings);
        }

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

  const updateContentBlock = (section, index, field, value, reorderedBlocks = null) => {
    // If reorderedBlocks is provided, replace the entire section
    if (reorderedBlocks) {
      setSettings((prev) => ({
        ...prev,
        [section]: reorderedBlocks,
      }));
      return;
    }
    
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

  // Canvas-specific update handler
  const updateCanvasElements = (section, newElements) => {
    setSettings((prev) => ({
      ...prev,
      [section]: newElements,
    }));
  };

  // Group all handlers for advanced tab
  const handlers = {
    updateCanvasElements,
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
