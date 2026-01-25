import { syllabusAPI } from '../services/api';

export default function SyllabusList({ syllabi, onEditSyllabus, onDeleteSyllabus, onViewSyllabus, loading }) {
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
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="truncate">{syllabus.instructorName}</span>
              </div>

              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{syllabus.semester} {syllabus.year}</span>
              </div>

              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{syllabus.credits} Credits</span>
              </div>
            </div>

            <p className="text-sm text-gray-700 line-clamp-3 mb-4">
              {syllabus.description}
            </p>

            {/* Card Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onViewSyllabus(syllabus)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                View
              </button>
              <button
                onClick={() => onEditSyllabus(syllabus)}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(syllabus._id)}
                className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50 transition-colors"
              >
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
