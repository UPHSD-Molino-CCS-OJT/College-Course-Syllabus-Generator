import { useState } from 'react';
import { syllabusAPI } from '../services/api';

const INITIAL_FORM_DATA = {
  courseCode: '',
  courseTitle: '',
  department: '',
  credits: 3,
  semester: '1st Semester',
  year: new Date().getFullYear(),
  instructorName: '',
  instructorEmail: '',
  officeHours: '',
  officeLocation: '',
  description: '',
  prerequisites: '',
  learningOutcomes: [{ outcome: '' }],
  textbooks: '',
  additionalMaterials: '',
  gradingComponents: [{ component: '', percentage: 0, description: '' }],
  gradingScale: 'A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: Below 60',
  weeklySchedule: [],
  attendancePolicy: '',
  lateSubmissionPolicy: '',
  academicIntegrity: '',
  disabilities: '',
  status: 'draft',
};

export default function SyllabusForm({ onSyllabusCreated, editSyllabus, onSyllabusUpdated, onCancel }) {
  const [formData, setFormData] = useState(editSyllabus || INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editSyllabus) {
        const response = await syllabusAPI.updateSyllabus(editSyllabus._id, formData);
        onSyllabusUpdated(response.data.syllabus);
      } else {
        const response = await syllabusAPI.createSyllabus(formData);
        onSyllabusCreated(response.data.syllabus);
      }
      setFormData(INITIAL_FORM_DATA);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addLearningOutcome = () => {
    setFormData({
      ...formData,
      learningOutcomes: [...formData.learningOutcomes, { outcome: '' }],
    });
  };

  const updateLearningOutcome = (index, value) => {
    const updated = [...formData.learningOutcomes];
    updated[index].outcome = value;
    setFormData({ ...formData, learningOutcomes: updated });
  };

  const removeLearningOutcome = (index) => {
    const updated = formData.learningOutcomes.filter((_, i) => i !== index);
    setFormData({ ...formData, learningOutcomes: updated });
  };

  const addGradingComponent = () => {
    setFormData({
      ...formData,
      gradingComponents: [...formData.gradingComponents, { component: '', percentage: 0, description: '' }],
    });
  };

  const updateGradingComponent = (index, field, value) => {
    const updated = [...formData.gradingComponents];
    updated[index][field] = value;
    setFormData({ ...formData, gradingComponents: updated });
  };

  const removeGradingComponent = (index) => {
    const updated = formData.gradingComponents.filter((_, i) => i !== index);
    setFormData({ ...formData, gradingComponents: updated });
  };

  const addWeek = () => {
    setFormData({
      ...formData,
      weeklySchedule: [
        ...formData.weeklySchedule,
        { weekNumber: formData.weeklySchedule.length + 1, topic: '', activities: '', assignments: '' },
      ],
    });
  };

  const updateWeek = (index, field, value) => {
    const updated = [...formData.weeklySchedule];
    updated[index][field] = value;
    setFormData({ ...formData, weeklySchedule: updated });
  };

  const removeWeek = (index) => {
    const updated = formData.weeklySchedule.filter((_, i) => i !== index);
    setFormData({ ...formData, weeklySchedule: updated });
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info' },
    { id: 'instructor', name: 'Instructor' },
    { id: 'course', name: 'Course Details' },
    { id: 'grading', name: 'Grading' },
    { id: 'schedule', name: 'Schedule' },
    { id: 'policies', name: 'Policies' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {editSyllabus ? 'Edit Syllabus' : 'Create New Syllabus'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
                <input
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  required
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduction to Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Computer Science"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="2000"
                  max="2100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        )}

        {/* Instructor Tab */}
        {activeTab === 'instructor' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Name *</label>
              <input
                type="text"
                name="instructorName"
                value={formData.instructorName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dr. Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Email *</label>
              <input
                type="email"
                name="instructorEmail"
                value={formData.instructorEmail}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jane.smith@university.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Hours</label>
              <textarea
                name="officeHours"
                value={formData.officeHours}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Monday 2-4 PM, Wednesday 3-5 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
              <input
                type="text"
                name="officeLocation"
                value={formData.officeLocation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Building A, Room 301"
              />
            </div>
          </div>
        )}

        {/* Course Details Tab */}
        {activeTab === 'course' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="An introduction to..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
              <textarea
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CS100 or equivalent"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Learning Outcomes</label>
                <button
                  type="button"
                  onClick={addLearningOutcome}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Outcome
                </button>
              </div>
              {formData.learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={outcome.outcome}
                    onChange={(e) => updateLearningOutcome(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Students will be able to..."
                  />
                  {formData.learningOutcomes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLearningOutcome(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Textbooks</label>
              <textarea
                name="textbooks"
                value={formData.textbooks}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Required textbooks and materials..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Materials</label>
              <textarea
                name="additionalMaterials"
                value={formData.additionalMaterials}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional readings, resources..."
              />
            </div>
          </div>
        )}

        {/* Grading Tab */}
        {activeTab === 'grading' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Grading Components</label>
                <button
                  type="button"
                  onClick={addGradingComponent}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Component
                </button>
              </div>
              {formData.gradingComponents.map((component, index) => (
                <div key={index} className="border border-gray-300 rounded-md p-3 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      value={component.component}
                      onChange={(e) => updateGradingComponent(index, 'component', e.target.value)}
                      placeholder="Component name"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={component.percentage}
                      onChange={(e) => updateGradingComponent(index, 'percentage', parseFloat(e.target.value))}
                      placeholder="Percentage"
                      min="0"
                      max="100"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeGradingComponent(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-700 border border-gray-300 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={component.description}
                    onChange={(e) => updateGradingComponent(index, 'description', e.target.value)}
                    placeholder="Description (optional)"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grading Scale</label>
              <textarea
                name="gradingScale"
                value={formData.gradingScale}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="A: 90-100, B: 80-89..."
              />
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Weekly Schedule</label>
              <button
                type="button"
                onClick={addWeek}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Week
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.weeklySchedule.map((week, index) => (
                <div key={index} className="border border-gray-300 rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Week {week.weekNumber}</span>
                    <button
                      type="button"
                      onClick={() => removeWeek(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={week.topic}
                    onChange={(e) => updateWeek(index, 'topic', e.target.value)}
                    placeholder="Topic"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <textarea
                    value={week.activities}
                    onChange={(e) => updateWeek(index, 'activities', e.target.value)}
                    placeholder="Activities"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <input
                    type="text"
                    value={week.assignments}
                    onChange={(e) => updateWeek(index, 'assignments', e.target.value)}
                    placeholder="Assignments"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Policy</label>
              <textarea
                name="attendancePolicy"
                value={formData.attendancePolicy}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Attendance requirements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Late Submission Policy</label>
              <textarea
                name="lateSubmissionPolicy"
                value={formData.lateSubmissionPolicy}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Policy for late assignments..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Integrity</label>
              <textarea
                name="academicIntegrity"
                value={formData.academicIntegrity}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Academic honesty policies..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disabilities Accommodation</label>
              <textarea
                name="disabilities"
                value={formData.disabilities}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Accommodation policies..."
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : editSyllabus ? 'Update Syllabus' : 'Create Syllabus'}
          </button>
          {editSyllabus && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
