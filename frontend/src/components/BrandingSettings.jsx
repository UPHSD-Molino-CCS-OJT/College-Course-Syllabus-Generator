import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import { Plus, Trash2, MoveUp, MoveDown, Image, Type, Folder } from 'lucide-react';

// Content Block Editor Component (extracted to prevent re-creation on every render)
const ContentBlockEditor = ({ 
  section, 
  sectionLabel, 
  settings, 
  addContentBlock, 
  removeContentBlock, 
  updateContentBlock, 
  moveContentBlock, 
  handleImageUploadForBlock,
  onLayoutChange,
  addChildToGroup,
  removeChildFromGroup,
  updateGroupChild
}) => {
  const layoutField = section === 'headerContent' ? 'headerLayout' : 'footerLayout';
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {sectionLabel} Content Blocks
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addContentBlock(section, 'text')}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
          >
            <Type size={16} />
            Add Text
          </button>
          <button
            type="button"
            onClick={() => addContentBlock(section, 'image')}
            className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-sm"
          >
            <Image size={16} />
            Add Image
          </button>
          <button
            type="button"
            onClick={() => addContentBlock(section, 'group')}
            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 text-sm"
          >
            <Folder size={16} />
            Add Group
          </button>
        </div>
      </div>

      {/* Layout Control */}
      <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-md border border-gray-200">
        <span className="text-sm font-medium text-gray-700">Layout:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onLayoutChange(layoutField, 'vertical')}
            className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
              settings[layoutField] === 'vertical'
                ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Vertical (Stack)
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange(layoutField, 'horizontal')}
            className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
              settings[layoutField] === 'horizontal'
                ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Horizontal (Same Line)
          </button>
        </div>
      </div>

      {settings[section].length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">
            No content blocks yet. Add text or image blocks to customize your {sectionLabel.toLowerCase()}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {settings[section].map((block, index) => (
            <div
              key={block.id || index}
              className={`border rounded-lg p-4 space-y-3 ${
                block.type === 'group' 
                  ? 'border-purple-300 bg-purple-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {block.type === 'text' ? (
                    <Type size={16} className="text-blue-600" />
                  ) : block.type === 'image' ? (
                    <Image size={16} className="text-green-600" />
                  ) : (
                    <Folder size={16} className="text-purple-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {block.type === 'text' ? 'Text Block' : 
                     block.type === 'image' ? 'Image Block' : 
                     'Group Container'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveContentBlock(section, index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move up"
                  >
                    <MoveUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveContentBlock(section, index, 'down')}
                    disabled={index === settings[section].length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move down"
                  >
                    <MoveDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeContentBlock(section, index)}
                    className="p-1 text-red-400 hover:text-red-600"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {block.type === 'group' ? (
                <>
                  {/* Group Alignment */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Group Alignment</label>
                    <div className="flex gap-2">
                      {['left', 'center', 'right'].map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => updateContentBlock(section, index, 'alignment', align)}
                          className={`flex-1 px-3 py-1 text-xs rounded border ${
                            block.alignment === align
                              ? 'bg-purple-100 border-purple-500 text-purple-700'
                              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {align.charAt(0).toUpperCase() + align.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group Children */}
                  <div className="border-t border-purple-200 pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-gray-700">
                        Group Elements ({(block.children || []).length})
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => addChildToGroup(section, index, 'text')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
                        >
                          <Type size={12} />
                          Text
                        </button>
                        <button
                          type="button"
                          onClick={() => addChildToGroup(section, index, 'image')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100"
                        >
                          <Image size={12} />
                          Image
                        </button>
                      </div>
                    </div>

                    {(!block.children || block.children.length === 0) ? (
                      <div className="border-2 border-dashed border-purple-200 rounded p-4 text-center">
                        <p className="text-purple-500 text-xs">
                          No elements in this group. Add text or image elements.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {block.children.map((child, childIndex) => (
                          <div
                            key={child.id || childIndex}
                            className="border border-gray-200 rounded p-3 bg-white space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {child.type === 'text' ? (
                                  <Type size={12} className="text-blue-600" />
                                ) : (
                                  <Image size={12} className="text-green-600" />
                                )}
                                <span className="text-xs text-gray-600">
                                  {child.type === 'text' ? 'Text' : 'Image'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeChildFromGroup(section, index, childIndex)}
                                className="p-0.5 text-red-400 hover:text-red-600"
                                title="Remove"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {child.type === 'text' ? (
                              <>
                                <textarea
                                  value={child.content || ''}
                                  onChange={(e) =>
                                    updateGroupChild(section, index, childIndex, 'content', e.target.value)
                                  }
                                  rows={2}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Enter text content"
                                />
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="block text-[10px] text-gray-600 mb-0.5">Weight</label>
                                    <select
                                      value={child.styles?.fontWeight || 'normal'}
                                      onChange={(e) =>
                                        updateGroupChild(section, index, childIndex, 'styles.fontWeight', e.target.value)
                                      }
                                      className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
                                    >
                                      <option value="normal">Normal</option>
                                      <option value="bold">Bold</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-gray-600 mb-0.5">Size</label>
                                    <select
                                      value={child.styles?.fontSize || 'medium'}
                                      onChange={(e) =>
                                        updateGroupChild(section, index, childIndex, 'styles.fontSize', e.target.value)
                                      }
                                      className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
                                    >
                                      <option value="small">Small</option>
                                      <option value="medium">Medium</option>
                                      <option value="large">Large</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-gray-600 mb-0.5">Color</label>
                                    <input
                                      type="color"
                                      value={child.styles?.color || '#000000'}
                                      onChange={(e) =>
                                        updateGroupChild(section, index, childIndex, 'styles.color', e.target.value)
                                      }
                                      className="w-full h-6 border border-gray-300 rounded cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          updateGroupChild(section, index, childIndex, 'content', reader.result);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="block w-full text-[10px] text-gray-500 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                  />
                                </div>
                                {child.content && (
                                  <div className="flex items-start gap-2">
                                    <img
                                      src={child.content}
                                      alt="Preview"
                                      className="w-12 h-12 object-contain border border-gray-300 rounded"
                                    />
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[10px] text-gray-600 mb-0.5">Width (px)</label>
                                        <input
                                          type="number"
                                          value={child.styles?.width || 50}
                                          onChange={(e) =>
                                            updateGroupChild(
                                              section,
                                              index,
                                              childIndex,
                                              'styles.width',
                                              parseInt(e.target.value)
                                            )
                                          }
                                          className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
                                          min="10"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-gray-600 mb-0.5">Height (px)</label>
                                        <input
                                          type="number"
                                          value={child.styles?.height || 50}
                                          onChange={(e) =>
                                            updateGroupChild(
                                              section,
                                              index,
                                              childIndex,
                                              'styles.height',
                                              parseInt(e.target.value)
                                            )
                                          }
                                          className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
                                          min="10"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : block.type === 'text' ? (
                <>
                  <textarea
                    value={block.content}
                    onChange={(e) =>
                      updateContentBlock(section, index, 'content', e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Enter text content"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
                      <select
                        value={block.styles.fontWeight}
                        onChange={(e) =>
                          updateContentBlock(section, index, 'styles.fontWeight', e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                      <select
                        value={block.styles.fontSize}
                        onChange={(e) =>
                          updateContentBlock(section, index, 'styles.fontSize', e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Color</label>
                      <input
                        type="color"
                        value={block.styles.color}
                        onChange={(e) =>
                          updateContentBlock(section, index, 'styles.color', e.target.value)
                        }
                        className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUploadForBlock(section, index, e.target.files[0])
                      }
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {block.content && (
                    <div className="flex items-start gap-3">
                      <img
                        src={block.content}
                        alt="Preview"
                        className="w-20 h-20 object-contain border border-gray-300 rounded"
                      />
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Width (px)</label>
                          <input
                            type="number"
                            value={block.styles.width || 100}
                            onChange={(e) =>
                              updateContentBlock(
                                section,
                                index,
                                'styles.width',
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="10"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Height (px)</label>
                          <input
                            type="number"
                            value={block.styles.height || 100}
                            onChange={(e) =>
                              updateContentBlock(
                                section,
                                index,
                                'styles.height',
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="10"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs text-gray-600 mb-1">Alignment</label>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => updateContentBlock(section, index, 'alignment', align)}
                      className={`flex-1 px-3 py-1 text-xs rounded border ${
                        block.alignment === align
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'advanced'

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
          loadedSettings.headerContent = loadedSettings.headerContent.map((block, index) => ({
            ...block,
            id: block.id || Date.now() + index + Math.random(),
          }));
        }
        if (loadedSettings.footerContent) {
          loadedSettings.footerContent = loadedSettings.footerContent.map((block, index) => ({
            ...block,
            id: block.id || Date.now() + index + Math.random(),
          }));
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
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLayoutChange = (fieldName, value) => {
    setSettings(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setSettings(prev => ({ ...prev, institutionLogo: base64String }));
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
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
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    setMessage({ type: '', text: '' });
  };

  // Helper functions for managing content blocks
  const addContentBlock = (section, type) => {
    const newBlock = {
      id: Date.now() + Math.random(), // Stable unique ID
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
      children: type === 'group' ? [] : undefined, // Initialize children array for groups
    };
    setSettings(prev => ({
      ...prev,
      [section]: [...prev[section], newBlock],
    }));
  };

  const removeContentBlock = (section, index) => {
    setSettings(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const updateContentBlock = (section, index, field, value) => {
    setSettings(prev => ({
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
    [newContent[index], newContent[newIndex]] = [newContent[newIndex], newContent[index]];
    newContent.forEach((block, i) => (block.order = i));

    setSettings(prev => ({ ...prev, [section]: newContent }));
  };

  // Group management functions
  const addChildToGroup = (section, groupIndex, type) => {
    const newChild = {
      id: Date.now() + Math.random(),
      type,
      content: type === 'text' ? 'Enter text here' : '',
      styles: {
        fontWeight: 'normal',
        fontSize: 'medium',
        color: '#000000',
        width: type === 'image' ? 50 : undefined,
        height: type === 'image' ? 50 : undefined,
      },
    };
    
    setSettings(prev => ({
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
    setSettings(prev => ({
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
    setSettings(prev => ({
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

  // Helper to render content block (text, image, or group)
  const renderContentBlock = (block, isHorizontal = false) => {
    if (block.type === 'group') {
      // Render group container with children
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: block.alignment === 'left' ? 'flex-start' : 
                           block.alignment === 'right' ? 'flex-end' : 
                           'center',
            width: '100%',
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Branding Settings</h2>

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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Basic Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'advanced'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Advanced Header/Footer
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">{activeTab === 'basic' ? (
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
              onClick={() => {
                setSettings(prev => ({ ...prev, institutionLogo: '' }));
                setLogoPreview('');
              }}
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
                onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
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
                onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
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

        {/* Preview */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div 
            className="border border-gray-300 rounded-md p-6"
            style={{
              fontFamily: settings.fontFamily,
              fontSize: settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '18px' : '16px',
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
                <h2 className="text-xl font-bold" style={{ color: settings.primaryColor }}>
                  {settings.institutionName || 'Institution Name'}
                </h2>
                {settings.headerText && (
                  <p className="text-sm text-gray-600 mt-1">{settings.headerText}</p>
                )}
              </div>
            </div>

            {/* Preview Content */}
            <div className="my-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: settings.secondaryColor }}>
                Course Syllabus
              </h3>
              <p className="text-gray-700">
                This is a preview of how your syllabus will look with the current settings.
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
        </>) : (
          <>
            {/* Advanced Header/Footer Editor */}
            <div className="space-y-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Advanced Mode:</strong> Create custom header and footer layouts with multiple text and image blocks. 
                  You can add, reorder, and style each element independently. These settings will override the basic header/footer text fields.
                </p>
              </div>

              {/* Header Content Editor */}
              <ContentBlockEditor 
                section="headerContent" 
                sectionLabel="Header"
                settings={settings}
                addContentBlock={addContentBlock}
                removeContentBlock={removeContentBlock}
                updateContentBlock={updateContentBlock}
                moveContentBlock={moveContentBlock}
                handleImageUploadForBlock={handleImageUploadForBlock}
                onLayoutChange={handleLayoutChange}
                addChildToGroup={addChildToGroup}
                removeChildFromGroup={removeChildFromGroup}
                updateGroupChild={updateGroupChild}
              />

              {/* Footer Content Editor */}
              <ContentBlockEditor 
                section="footerContent" 
                sectionLabel="Footer"
                settings={settings}
                addContentBlock={addContentBlock}
                removeContentBlock={removeContentBlock}
                updateContentBlock={updateContentBlock}
                moveContentBlock={moveContentBlock}
                handleImageUploadForBlock={handleImageUploadForBlock}
                onLayoutChange={handleLayoutChange}
                addChildToGroup={addChildToGroup}
                removeChildFromGroup={removeChildFromGroup}
                updateGroupChild={updateGroupChild}
              />

              {/* Preview */}
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
                        className={settings.headerLayout === 'horizontal' ? 'flex items-center gap-4 flex-wrap' : 'space-y-2'}
                        style={{ 
                          justifyContent: settings.headerLayout === 'horizontal' ? 'center' : 'initial'
                        }}
                      >
                        {settings.headerContent
                          .sort((a, b) => a.order - b.order)
                          .map((block, index) => (
                            <div
                              key={block.id || index}
                              style={{ 
                                textAlign: block.type === 'group' ? 'initial' : (settings.headerLayout === 'horizontal' ? 'initial' : block.alignment),
                                width: block.type === 'group' ? '100%' : 'auto',
                              }}
                            >
                              {renderContentBlock(block, settings.headerLayout === 'horizontal')}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Preview Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: settings.secondaryColor }}>
                      Course Syllabus
                    </h3>
                    <p className="text-gray-700">
                      This is a preview of how your syllabus will look with the current header and footer settings.
                    </p>
                  </div>

                  {/* Preview Footer */}
                  {settings.footerContent.length > 0 && (
                    <div className="bg-gray-100 p-4 border-t-2 border-gray-300">
                      <div 
                        className={settings.footerLayout === 'horizontal' ? 'flex items-center gap-4 flex-wrap' : 'space-y-2'}
                        style={{ 
                          justifyContent: settings.footerLayout === 'horizontal' ? 'center' : 'initial'
                        }}
                      >
                        {settings.footerContent
                          .sort((a, b) => a.order - b.order)
                          .map((block, index) => (
                            <div
                              key={block.id || index}
                              style={{ 
                                textAlign: block.type === 'group' ? 'initial' : (settings.footerLayout === 'horizontal' ? 'initial' : block.alignment),
                                width: block.type === 'group' ? '100%' : 'auto',
                              }}
                            >
                              {renderContentBlock(block, settings.footerLayout === 'horizontal')}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
          </>
        )}
      </form>
    </div>
  );
}
