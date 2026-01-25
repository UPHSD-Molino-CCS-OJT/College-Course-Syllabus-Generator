import { templateAPI } from '../services/api';
import { FileText, Edit, Trash2, Star, Palette } from 'lucide-react';

export default function TemplateList({ templates, onEditTemplate, onDeleteTemplate, onEditCanvas, loading, onSetDefault }) {
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await templateAPI.deleteTemplate(id);
        onDeleteTemplate(id);
      } catch (error) {
        console.error('Failed to delete template:', error);
        alert('Failed to delete template');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await templateAPI.setDefaultTemplate(id);
      onSetDefault(id);
    } catch (error) {
      console.error('Failed to set default template:', error);
      alert('Failed to set default template');
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'business':
        return 'bg-green-100 text-green-800';
      case 'formal':
        return 'bg-purple-100 text-purple-800';
      case 'creative':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600">No templates found. Create your first template above!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div key={template._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{template.name}</h3>
                  {template.isDefault && (
                    <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  )}
                </div>
                <p className="text-purple-100 text-sm capitalize">
                  {template.pageSize} • {template.orientation}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeColor(template.category)}`}>
                {template.category}
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4">
            {template.description && (
              <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                {template.description}
              </p>
            )}

            {/* Template Stats */}
            <div className="space-y-1 text-xs text-gray-600 mb-4">
              <div className="flex items-center justify-between">
                <span>Header Elements:</span>
                <span className="font-semibold">{template.canvasDocument?.header?.elements?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Footer Elements:</span>
                <span className="font-semibold">{template.canvasDocument?.footer?.elements?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{template.canvasDocument?.pages ? 'Pages' : 'Content Elements'}:</span>
                <span className="font-semibold">
                  {template.canvasDocument?.pages ? 
                    template.canvasDocument.pages.length : 
                    (template.canvasDocument?.content?.elements?.length || 0)
                  }
                </span>
              </div>
            </div>

            {/* Card Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onEditCanvas(template)}
                className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
              >
                <Palette className="w-4 h-4" />
                Design
              </button>
              <button
                onClick={() => onEditTemplate(template)}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              {!template.isDefault && (
                <button
                  onClick={() => handleSetDefault(template._id)}
                  className="px-3 py-2 border border-yellow-300 text-yellow-700 text-sm rounded-md hover:bg-yellow-50 transition-colors flex items-center gap-1"
                  title="Set as default"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(template._id)}
                className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Created {new Date(template.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
