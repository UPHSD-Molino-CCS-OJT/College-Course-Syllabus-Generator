export default function SyllabusTemplateView({ syllabus, onClose }) {
  if (!syllabus) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Syllabus Template View</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {/* Course Header */}
          <div className="text-center mb-8 border-b border-gray-300 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {syllabus.courseCode}: {syllabus.courseTitle}
            </h1>
            <p className="text-lg text-gray-600">
              {syllabus.department} • {syllabus.credits} Credits
            </p>
            <p className="text-md text-gray-500 mt-1">
              {syllabus.semester} {syllabus.year}
            </p>
          </div>

          {/* Instructor Information */}
          <section className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Instructor Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <p><span className="font-semibold">Name:</span> {syllabus.instructorName}</p>
              <p><span className="font-semibold">Email:</span> {syllabus.instructorEmail}</p>
              <p><span className="font-semibold">Office Hours:</span> {syllabus.officeHours}</p>
              <p><span className="font-semibold">Office Location:</span> {syllabus.officeLocation}</p>
            </div>
          </section>

          {/* Course Description */}
          <section className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Course Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{syllabus.description}</p>
          </section>

          {/* Prerequisites */}
          {syllabus.prerequisites && (
            <section className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Prerequisites
              </h2>
              <p className="text-gray-700">{syllabus.prerequisites}</p>
            </section>
          )}

          {/* Learning Outcomes */}
          {syllabus.learningOutcomes && syllabus.learningOutcomes.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Learning Outcomes
              </h2>
              <ul className="list-disc list-inside space-y-2">
                {syllabus.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="text-gray-700">{outcome.outcome}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Required Materials */}
          {syllabus.textbooks && (
            <section className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Required Textbooks
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{syllabus.textbooks}</p>
            </section>
          )}

          {/* Additional Materials */}
          {syllabus.additionalMaterials && (
            <section className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Additional Materials
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{syllabus.additionalMaterials}</p>
            </section>
          )}

          {/* Grading Components */}
          {syllabus.gradingComponents && syllabus.gradingComponents.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Grading Components
              </h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Component</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Percentage</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {syllabus.gradingComponents.map((component, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-700">{component.component}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{component.percentage}%</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{component.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Grading Scale */}
          {syllabus.gradingScale && (
            <section className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Grading Scale
              </h2>
              <p className="text-gray-700">{syllabus.gradingScale}</p>
            </section>
          )}

          {/* Weekly Schedule */}
          {syllabus.weeklySchedule && syllabus.weeklySchedule.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Weekly Schedule
              </h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Week</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Topics</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Readings</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Assignments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {syllabus.weeklySchedule.map((week, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-700">{week.week}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{week.topics}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{week.readings}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{week.assignments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Policies */}
          <section className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Course Policies
            </h2>
            
            {syllabus.attendancePolicy && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Attendance Policy</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{syllabus.attendancePolicy}</p>
              </div>
            )}

            {syllabus.lateSubmissionPolicy && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Late Submission Policy</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{syllabus.lateSubmissionPolicy}</p>
              </div>
            )}

            {syllabus.academicIntegrity && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Academic Integrity</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{syllabus.academicIntegrity}</p>
              </div>
            )}

            {syllabus.disabilities && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Disability Accommodations</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{syllabus.disabilities}</p>
              </div>
            )}
          </section>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
