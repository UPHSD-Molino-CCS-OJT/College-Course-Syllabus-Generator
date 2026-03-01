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
  };

  // Handle both old (content) and new (pages) structure
  if (canvasDocument.pages) {
    rendered.pages = canvasDocument.pages.map(page => ({
      ...page,
      elements: page.elements?.map((el) => renderElement(el, syllabus)) || [],
    }));
  } else if (canvasDocument.content) {
    // Backward compatibility
    rendered.content = {
      ...canvasDocument.content,
      elements: canvasDocument.content?.elements?.map((el) =>
        renderElement(el, syllabus)
      ) || [],
    };
  }

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

// ─── Relationship Matrix Table Builders ───────────────────────────────────────

const CHECK = '✓';

/** Shared cell factory */
function makeCell(content, { bold = false, bg = '#ffffff', align = 'center', width = 120, height = 40, fontSize = 11, color = '#000000', italic = false } = {}) {
  return {
    content,
    fontSize,
    fontFamily: 'Arial',
    fontWeight: bold ? 'bold' : 'normal',
    fontStyle: italic ? 'italic' : 'normal',
    color,
    align,
    bg,
    width,
    height,
  };
}

/** Build a canvas table element from a 2-D array of cell descriptors */
function buildTableElement(rows2d, { x = 60, y = 100 } = {}) {
  const numRows = rows2d.length;
  const numCols = rows2d[0]?.length || 0;
  return {
    id: `table-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'table',
    x,
    y,
    rows: numRows,
    cols: numCols,
    cellWidth: rows2d[0]?.[0]?.width || 120,
    cellHeight: rows2d[0]?.[0]?.height || 40,
    borderColor: '#000000',
    borderWidth: 1,
    borderStyle: 'solid',
    showBorderTop: true,
    showBorderRight: true,
    showBorderBottom: true,
    showBorderLeft: true,
    headerBg: '#f3f4f6',
    data: rows2d,
  };
}

const CATEG_BG   = '#f8f0d0'; // very light for category rows

/**
 * Build a Graduate Attributes × Mission Keywords matrix table element.
 * @param {object[]} graduateAttributes  – populated from GET /graduate-attributes
 * @param {object[]} missionKeywords     – populated from GET /mission-keywords
 */
export function buildGAMissionKeywordMatrix(graduateAttributes, missionKeywords, pos) {
  const mkCodes  = missionKeywords.map(mk => mk.code);
  const mkIds    = missionKeywords.map(mk => String(mk._id));

  const LABEL_W   = 420;
  const CHECK_W   = 60;
  const ROW_H     = 38;

  const rows = [];

  const categories = ['CHARACTER', 'COMPETENCE', 'COMMITMENT TO SERVICE'];
  categories.forEach(cat => {
    const gaInCat = graduateAttributes.filter(ga => ga.category === cat);
    if (gaInCat.length === 0) return;

    // Category row
    const totalW = LABEL_W + CHECK_W * mkCodes.length;
    rows.push([
      makeCell(cat, { bold: true, bg: CATEG_BG, align: 'left', width: totalW, height: 32, fontSize: 11 }),
      ...mkCodes.map(() => makeCell('', { bg: CATEG_BG, width: CHECK_W, height: 32 })),
    ]);

    gaInCat.forEach((ga, idx) => {
      const label = `${idx + 1}. ${ga.title}${ga.description ? ' ' + ga.description : ''}`;
      const gaLinkedIds = (ga.missionKeywords || []).map(mk =>
        typeof mk === 'object' ? String(mk._id) : String(mk)
      );
      rows.push([
        makeCell(label, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
        ...mkIds.map(id => makeCell(gaLinkedIds.includes(id) ? CHECK : '', { align: 'center', width: CHECK_W, height: ROW_H })),
      ]);
    });
  });

  return buildTableElement(rows, pos);
}

/**
 * Build a PEO × Graduate Attributes matrix table element.
 * @param {object[]} peos              – populated from GET /peos
 * @param {object[]} graduateAttributes – populated from GET /graduate-attributes
 */
export function buildPEOGAMatrix(peos, graduateAttributes, pos) {
  const gaIds   = graduateAttributes.map(ga => String(ga._id));
  const gaLabels = graduateAttributes.map((ga, i) => `GA${i + 1}`);

  const LABEL_W  = 380;
  const CHECK_W  = 55;
  const ROW_H    = 60;

  const rows = [];

  peos.forEach((peo, idx) => {
    const label = `${idx + 1}. ${peo.title} ${peo.description || ''}`.trim();
    const peoLinkedIds = (peo.graduateAttributes || []).map(ga =>
      typeof ga === 'object' ? String(ga._id) : String(ga)
    );
    rows.push([
      makeCell(label, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
      ...gaIds.map(id => makeCell(peoLinkedIds.includes(id) ? CHECK : '', { align: 'center', width: CHECK_W, height: ROW_H })),
    ]);
  });

  return buildTableElement(rows, pos);
}

/**
 * Build a PLO × PEO matrix table element.
 * @param {object[]} plos – populated from GET /plos
 * @param {object[]} peos – populated from GET /peos
 */
export function buildPLOPEOMatrix(plos, peos, pos) {
  const peoIds    = peos.map(p => String(p._id));
  const peoLabels = peos.map((_, i) => String(i + 1));

  const LABEL_W  = 400;
  const CHECK_W  = 65;
  const ROW_H    = 60;

  const rows = [];

  plos.forEach((plo, idx) => {
    const label = `${idx + 1}. ${plo.title} ${plo.description || ''}`.trim();
    const ploLinkedIds = (plo.programEducationalObjectives || []).map(p =>
      typeof p === 'object' ? String(p._id) : String(p)
    );
    rows.push([
      makeCell(label, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
      ...peoIds.map(id => makeCell(ploLinkedIds.includes(id) ? CHECK : '', { align: 'center', width: CHECK_W, height: ROW_H })),
    ]);
  });

  return buildTableElement(rows, pos);
}

/**
 * Build a CLO × PLO matrix table element.
 * @param {object[]} clos – populated from GET /clos
 * @param {object[]} plos – populated from GET /plos
 */
export function buildCLOPLOMatrix(clos, plos, pos) {
  const ploIds    = plos.map(p => String(p._id));
  const ploLabels = plos.map((_, i) => String(i + 1));

  const LABEL_W  = 400;
  const CHECK_W  = 65;
  const ROW_H    = 60;

  const rows = [];

  clos.forEach((clo, idx) => {
    const label = `${idx + 1}. ${clo.title} ${clo.description || ''}`.trim();
    const cloLinkedIds = (clo.programLearningOutcomes || []).map(p =>
      typeof p === 'object' ? String(p._id) : String(p)
    );
    rows.push([
      makeCell(label, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
      ...ploIds.map(id => makeCell(cloLinkedIds.includes(id) ? CHECK : '', { align: 'center', width: CHECK_W, height: ROW_H })),
    ]);
  });

  return buildTableElement(rows, pos);
}

// ─── End Relationship Matrix Builders ─────────────────────────────────────────

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
