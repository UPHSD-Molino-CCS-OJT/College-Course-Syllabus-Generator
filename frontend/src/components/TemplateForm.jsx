import { useState } from 'react';
import { templateAPI } from '../services/api';

const INITIAL_FORM_DATA = {
  name: '',
  description: '',
  pageSize: 'longBond',
  orientation: 'landscape',
  category: 'custom',
  isDefault: false,
};

export default function TemplateForm({ onTemplateCreated, editTemplate, onTemplateUpdated, onCancel }) {
  const [formData, setFormData] = useState(editTemplate || INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editTemplate) {
        const response = await templateAPI.updateTemplate(editTemplate._id, formData);
        onTemplateUpdated(response.data.template);
      } else {
        const response = await templateAPI.createTemplate(formData);
        onTemplateCreated(response.data.template);
      }
      setFormData(INITIAL_FORM_DATA);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      console.error('Error submitting template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {editTemplate ? 'Edit Template' : 'Create New Template'}
        </h2>
        {editTemplate && (
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Academic Formal Template"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of this template"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Page Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Size *</label>
            <select
              name="pageSize"
              value={formData.pageSize}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="longBond">Long Bond</option>
              <option value="legal">Legal</option>
              <option value="letter">Letter</option>
              <option value="a4">A4</option>
            </select>
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orientation *</label>
            <select
              name="orientation"
              value={formData.orientation}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">Custom</option>
              <option value="academic">Academic</option>
              <option value="business">Business</option>
              <option value="formal">Formal</option>
              <option value="creative">Creative</option>
            </select>
          </div>

          {/* Is Default */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isDefault"
              id="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
              Set as default template
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : editTemplate ? 'Update Template' : 'Create Template'}
          </button>
          {editTemplate && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
