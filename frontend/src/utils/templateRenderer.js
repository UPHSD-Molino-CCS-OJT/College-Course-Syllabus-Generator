/**
 * Utility functions for rendering templates with syllabus data
 */

/**
 * Replace placeholders in text with actual syllabus data
 * @param {string} text - Text containing placeholders like {{courseCode}}
 * @param {object} syllabus - Syllabus data object
 * @returns {string} Text with placeholders replaced
 */
export function replacePlaceholders(text, syllabus) {
  if (!text || !syllabus) return text || '';

  let result = text;

  // Helper function to format month-year dates
  const formatMonthYear = (dateString) => {
    if (!dateString) return '';
    try {
      const [year, month] = dateString.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch (error) {
      return dateString;
    }
  };

  // Basic fields
  const fieldMap = {
    courseCode: syllabus.courseCode || '',
    courseTitle: syllabus.courseTitle || '',
    department: syllabus.department || '',
    credits: syllabus.credits || '',
    semester: syllabus.semester || '',
    academicYear: syllabus.academicYear || '',
    instructorName: syllabus.instructorName || '',
    instructorEmail: syllabus.instructorEmail || '',
    officeHours: syllabus.officeHours || '',
    officeLocation: syllabus.officeLocation || '',
    description: syllabus.description || '',
    prerequisites: syllabus.prerequisites || '',
    textbooks: syllabus.textbooks || '',
    additionalMaterials: syllabus.additionalMaterials || '',
    gradingScale: syllabus.gradingScale || '',
    attendancePolicy: syllabus.attendancePolicy || '',
    lateSubmissionPolicy: syllabus.lateSubmissionPolicy || '',
    academicIntegrity: syllabus.academicIntegrity || '',
    disabilities: syllabus.disabilities || '',
    dateRevised: formatMonthYear(syllabus.dateRevised),
    dateOfEffectivity: formatMonthYear(syllabus.dateOfEffectivity),
    reviewed: syllabus.reviewed || '',
    recommendingApproval: syllabus.recommendingApproval || '',
    approved: syllabus.approved || '',
  };

  // Replace each field
  Object.keys(fieldMap).forEach((key) => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(placeholder, fieldMap[key]);
  });

  return result;
}

/**
 * Render a template element with syllabus data
 * @param {object} element - Template element (text or table)
 * @param {object} syllabus - Syllabus data object
 * @returns {object} Element with content replaced
 */
export function renderElement(element, syllabus) {
  if (!element) return element;

  const rendered = { ...element };

  if (element.type === 'text') {
    rendered.content = replacePlaceholders(element.content, syllabus);
  } else if (element.type === 'table' && element.data && Array.isArray(element.data)) {
    // Table structure uses element.data as a 2D array
    rendered.data = element.data.map((row) =>
      Array.isArray(row) ? row.map((cell) => ({
        ...cell,
        content: replacePlaceholders(cell.content, syllabus),
      })) : row
    );
  }

  return rendered;
}

/**
 * Render an entire canvas document with syllabus data
 * @param {object} canvasDocument - Template canvas document
 * @param {object} syllabus - Syllabus data object
 * @returns {object} Canvas document with all placeholders replaced
 */
export function renderCanvasDocument(canvasDocument, syllabus) {
  if (!canvasDocument || !syllabus) return canvasDocument;

  const rendered = {
    ...canvasDocument,
    header: {
      ...canvasDocument.header,
      elements: canvasDocument.header?.elements?.map((el) =>
        renderElement(el, syllabus)
      ) || [],
    },
    footer: {
      ...canvasDocument.footer,
      elements: canvasDocument.footer?.elements?.map((el) =>
        renderElement(el, syllabus)
      ) || [],
    },
    content: {
      ...canvasDocument.content,
      elements: canvasDocument.content?.elements?.map((el) =>
        renderElement(el, syllabus)
      ) || [],
    },
  };

  return rendered;
}

/**
 * Get formatted learning outcomes as text
 * @param {object} syllabus - Syllabus data
 * @returns {string} Formatted learning outcomes
 */
export function getFormattedLearningOutcomes(syllabus) {
  if (!syllabus.learningOutcomes || syllabus.learningOutcomes.length === 0) {
    return '';
  }
  return syllabus.learningOutcomes
    .map((outcome, index) => `${index + 1}. ${outcome.outcome}`)
    .join('\n');
}

/**
 * Get formatted grading components as text
 * @param {object} syllabus - Syllabus data
 * @returns {string} Formatted grading components
 */
export function getFormattedGradingComponents(syllabus) {
  if (!syllabus.gradingComponents || syllabus.gradingComponents.length === 0) {
    return '';
  }
  return syllabus.gradingComponents
    .map((comp) => `${comp.component}: ${comp.percentage}%`)
    .join('\n');
}

/**
 * Get formatted weekly schedule as text
 * @param {object} syllabus - Syllabus data
 * @returns {string} Formatted weekly schedule
 */
export function getFormattedWeeklySchedule(syllabus) {
  if (!syllabus.weeklySchedule || syllabus.weeklySchedule.length === 0) {
    return '';
  }
  return syllabus.weeklySchedule
    .map(
      (week) =>
        `Week ${week.weekNumber}: ${week.topic}${
          week.assignments ? ' - ' + week.assignments : ''
        }`
    )
    .join('\n');
}
