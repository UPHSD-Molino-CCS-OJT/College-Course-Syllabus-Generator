/**
 * Reusable component for inserting syllabus data placeholders
 * Can be used across different element types (text, tables, etc.)
 */
export default function DataFieldPicker({ onInsert, compact = false }) {
  const syllabusFields = [
    { value: '{{courseCode}}', label: 'Course Code' },
    { value: '{{courseTitle}}', label: 'Course Title' },
    { value: '{{department}}', label: 'Department' },
    { value: '{{credits}}', label: 'Credits' },
    { value: '{{semester}}', label: 'Semester' },
    { value: '{{academicYear}}', label: 'Academic Year' },
    { value: '{{instructorName}}', label: 'Instructor Name' },
    { value: '{{instructorEmail}}', label: 'Instructor Email' },
    { value: '{{officeHours}}', label: 'Office Hours' },
    { value: '{{officeLocation}}', label: 'Office Location' },
    { value: '{{description}}', label: 'Course Description' },
    { value: '{{prerequisites}}', label: 'Prerequisites' },
    { value: '{{textbooks}}', label: 'Textbooks' },
    { value: '{{gradingScale}}', label: 'Grading Scale' },
    { value: '{{attendancePolicy}}', label: 'Attendance Policy' },
    { value: '{{lateSubmissionPolicy}}', label: 'Late Submission Policy' },
    { value: '{{academicIntegrity}}', label: 'Academic Integrity' },
    { value: '{{dateRevised}}', label: 'Date Revised' },
    { value: '{{dateOfEffectivity}}', label: 'Date of Effectivity' },
    { value: '{{reviewed}}', label: 'Reviewed By' },
    { value: '{{recommendingApproval}}', label: 'Recommending Approval' },
    { value: '{{approved}}', label: 'Approved By' },
  ];

  const handleSelect = (e) => {
    if (e.target.value) {
      onInsert(e.target.value);
      e.target.value = '';
    }
  };

  return (
    <div className={compact ? 'mb-2' : 'mb-4'}>
      <label className={`block font-medium mb-${compact ? '1' : '2'} ${compact ? 'text-xs text-gray-400' : 'text-sm text-white'}`}>
        Insert Syllabus Data
      </label>
      <select
        onChange={handleSelect}
        className={`w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${compact ? 'text-sm' : ''}`}
      >
        <option value="">-- Insert Field --</option>
        {syllabusFields.map((field) => (
          <option key={field.value} value={field.value}>
            {field.label}
          </option>
        ))}
      </select>
      {!compact && (
        <p className="text-xs text-gray-500 mt-1">
          Select a field to insert placeholder that will be replaced with actual data
        </p>
      )}
    </div>
  );
}
