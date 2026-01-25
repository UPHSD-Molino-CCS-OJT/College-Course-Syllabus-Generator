export default function SyllabusView({ syllabus, onClose, onEdit }) {
  if (!syllabus) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{syllabus.courseCode} - {syllabus.courseTitle}</h2>
              <p className="text-blue-100">{syllabus.department} | {syllabus.semester} {syllabus.year}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Course Information */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Course Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-semibold">Credits:</span> {syllabus.credits}</p>
                <p><span className="font-semibold">Status:</span> <span className="capitalize">{syllabus.status}</span></p>
              </div>
            </section>

            {/* Instructor Information */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instructor Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-semibold">Name:</span> {syllabus.instructorName}</p>
                <p><span className="font-semibold">Email:</span> <a href={`mailto:${syllabus.instructorEmail}`} className="text-blue-600 hover:underline">{syllabus.instructorEmail}</a></p>
                {syllabus.officeHours && <p><span className="font-semibold">Office Hours:</span> {syllabus.officeHours}</p>}
                {syllabus.officeLocation && <p><span className="font-semibold">Office Location:</span> {syllabus.officeLocation}</p>}
              </div>
            </section>

            {/* Course Description */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Course Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{syllabus.description}</p>
            </section>

            {/* Prerequisites */}
            {syllabus.prerequisites && (
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Prerequisites</h3>
                <p className="text-gray-700">{syllabus.prerequisites}</p>
              </section>
            )}

            {/* Learning Outcomes */}
            {syllabus.learningOutcomes && syllabus.learningOutcomes.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Learning Outcomes</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {syllabus.learningOutcomes.map((outcome, index) => (
                    <li key={index}>{outcome.outcome}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Textbooks */}
            {syllabus.textbooks && (
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Textbooks & Materials</h3>
                <p className="text-gray-700 whitespace-pre-line">{syllabus.textbooks}</p>
                {syllabus.additionalMaterials && (
                  <div className="mt-2">
                    <p className="font-semibold text-gray-800">Additional Materials:</p>
                    <p className="text-gray-700 whitespace-pre-line">{syllabus.additionalMaterials}</p>
                  </div>
                )}
              </section>
            )}

            {/* Grading */}
            {syllabus.gradingComponents && syllabus.gradingComponents.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Grading</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-2">Component</th>
                        <th className="text-right py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syllabus.gradingComponents.map((component, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2">
                            {component.component}
                            {component.description && (
                              <span className="block text-sm text-gray-600">{component.description}</span>
                            )}
                          </td>
                          <td className="text-right py-2">{component.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {syllabus.gradingScale && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="font-semibold text-gray-800 mb-1">Grading Scale:</p>
                      <p className="text-gray-700">{syllabus.gradingScale}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Weekly Schedule */}
            {syllabus.weeklySchedule && syllabus.weeklySchedule.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Course Schedule</h3>
                <div className="space-y-3">
                  {syllabus.weeklySchedule.map((week, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-2">Week {week.weekNumber}: {week.topic}</h4>
                      {week.activities && (
                        <p className="text-gray-700 text-sm mb-2"><span className="font-semibold">Activities:</span> {week.activities}</p>
                      )}
                      {week.assignments && (
                        <p className="text-gray-700 text-sm"><span className="font-semibold">Assignments:</span> {week.assignments}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Policies */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Course Policies</h3>
              <div className="space-y-4">
                {syllabus.attendancePolicy && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Attendance Policy</h4>
                    <p className="text-gray-700 whitespace-pre-line">{syllabus.attendancePolicy}</p>
                  </div>
                )}
                {syllabus.lateSubmissionPolicy && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Late Submission Policy</h4>
                    <p className="text-gray-700 whitespace-pre-line">{syllabus.lateSubmissionPolicy}</p>
                  </div>
                )}
                {syllabus.academicIntegrity && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Academic Integrity</h4>
                    <p className="text-gray-700 whitespace-pre-line">{syllabus.academicIntegrity}</p>
                  </div>
                )}
                {syllabus.disabilities && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Disabilities Accommodation</h4>
                    <p className="text-gray-700 whitespace-pre-line">{syllabus.disabilities}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

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
