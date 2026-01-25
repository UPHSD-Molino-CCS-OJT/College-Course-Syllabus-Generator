import { syllabusAPI } from '../services/api';
import { User, Calendar, BookOpen, Printer, Edit, Trash2, Eye, Palette } from 'lucide-react';

export default function SyllabusList({ syllabi, onEditSyllabus, onDeleteSyllabus, onViewSyllabus, onViewPrint, onEditCanvas, loading }) {
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this syllabus?')) {
      try {
        await syllabusAPI.deleteSyllabus(id);
        onDeleteSyllabus(id);
      } catch (error) {
        console.error('Failed to delete syllabus:', error);
        alert('Failed to delete syllabus');
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading syllabi...</p>
      </div>
    );
  }

  if (syllabi.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">No syllabi found. Create your first syllabus above!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {syllabi.map((syllabus) => (
        <div key={syllabus._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          {/* Card Header */}
          <div className="bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{syllabus.courseCode}</h3>
                <p className="text-blue-100 text-sm">{syllabus.department}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(syllabus.status)}`}>
                {syllabus.status}
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {syllabus.courseTitle}
            </h4>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="truncate">{syllabus.instructorName}</span>
              </div>

              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{syllabus.semester} {syllabus.year}</span>
              </div>

              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>{syllabus.credits} Credits</span>
              </div>
            </div>

            <p className="text-sm text-gray-700 line-clamp-3 mb-4">
              {syllabus.description}
            </p>

            {/* Card Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onViewSyllabus(syllabus)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => onEditCanvas?.(syllabus)}
                className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                title="Canvas Editor"
              >
                <Palette className="w-4 h-4" />
                Canvas
              </button>
              <button
                onClick={() => onViewPrint(syllabus)}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                title="Print/Export"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => onEditSyllabus(syllabus)}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(syllabus._id)}
                className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Created {new Date(syllabus.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
