import { useState, useEffect } from 'react';
import { templateAPI } from '../services/api';
import TemplateRenderer from './TemplateRenderer';

export default function SyllabusView({ syllabus, onClose, onEdit }) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      
      // Determine which template to use
      if (syllabus.template && typeof syllabus.template === 'object' && syllabus.template.canvasDocument) {
        // Use the linked template
        setTemplate(syllabus.template);
      } else {
        // Fetch and use the default template
        try {
          const templateResponse = await templateAPI.getDefaultTemplate();
          if (templateResponse.data.template) {
            setTemplate(templateResponse.data.template);
          }
        } catch (error) {
          console.log('No default template found:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!syllabus) return null;

  const usesTemplate = template && template.canvasDocument;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl w-full mx-auto" style={{ maxWidth: 'calc(356mm + 48px)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{syllabus.courseCode} - {syllabus.courseTitle}</h2>
              <p className="text-blue-100">{syllabus.department} | {syllabus.semester} {syllabus.academicYear}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : usesTemplate ? (
            /* Template-based view */
            <div className="p-6 bg-gray-100 max-h-[80vh] overflow-y-auto">
              <TemplateRenderer 
                template={template} 
                syllabus={syllabus}
              />
            </div>
          ) : (
            /* No template - show message */
            <div className="p-12 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Template Available</h3>
              <p className="text-gray-600 mb-8">Please create and set a default template, or assign a template to this syllabus to view the formatted version.</p>
              <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg text-left">
                <h4 className="font-bold text-lg mb-3">Syllabus Information:</h4>
                <p className="mb-2"><strong>Course:</strong> {syllabus.courseCode} - {syllabus.courseTitle}</p>
                <p className="mb-2"><strong>Instructor:</strong> {syllabus.instructorName}</p>
                <p className="mb-2"><strong>Semester:</strong> {syllabus.semester} {syllabus.academicYear}</p>
                <p className="mb-2"><strong>Credits:</strong> {syllabus.credits}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <div className="text-sm text-gray-600">
              Last updated: {new Date(syllabus.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onEdit(syllabus);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
