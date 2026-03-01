/**
 * Utility functions for rendering templates with syllabus data
 */

const CHECK = '✓';

/** Category order used to sort GAs consistently between the builder and the resolver */
const GA_CATEGORY_ORDER = ['CHARACTER', 'COMPETENCE', 'COMMITMENT TO SERVICE'];

/**
 * Return a copy of `graduateAttributes` sorted by canonical category order then by number.
 * This ensures the builder and the resolver always agree on which GA is "GA #N".
 */
function sortGAs(graduateAttributes) {
  return [...graduateAttributes].sort((a, b) => {
    const ai = GA_CATEGORY_ORDER.indexOf(a.category);
    const bi = GA_CATEGORY_ORDER.indexOf(b.category);
    if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return (a.number || 0) - (b.number || 0);
  });
}

/**
 * Replace placeholders in text with actual syllabus data and optional auxiliary
 * relationship-matrix data.
 * @param {string} text - Text containing placeholders like {{courseCode}}
 * @param {object} syllabus - Syllabus data object
 * @param {object} [auxData] - { gas, mks, peos, plos, clos } arrays for matrix placeholders
 * @returns {string} Text with placeholders replaced
 */
export function replacePlaceholders(text, syllabus, auxData = {}) {
  if (!text) return text || '';
  if (!syllabus && !Object.keys(auxData).length) return text;

  let result = text;

  if (syllabus) {
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
  }
  const { gas = [], mks = [], peos = [], plos = [], clos = [] } = auxData;
  if (gas.length || mks.length || peos.length || plos.length || clos.length) {
    // ga_N_label — N is the 1-based position in the canonical category-sorted GA list
    const sortedGAs = sortGAs(gas);
    result = result.replace(/\{\{ga_(\d+)_label\}\}/g, (_, n) => {
      const ga = sortedGAs[Number(n) - 1];
      if (!ga) return '';
      return `${n}. ${ga.title}${ga.description ? ' ' + ga.description : ''}`;
    });

    // ga_N_mk_CODE  (e.g. {{ga_3_mk_A}})
    result = result.replace(/\{\{ga_(\d+)_mk_([^}]+)\}\}/g, (_, n, code) => {
      const ga = sortedGAs[Number(n) - 1];
      if (!ga) return '';
      const linked = (ga.missionKeywords || []).map(mk =>
        typeof mk === 'object' ? mk.code : (mks.find(m => String(m._id) === String(mk))?.code ?? '')
      );
      return linked.includes(code) ? CHECK : '';
    });

    // peo_N_label
    result = result.replace(/\{\{peo_(\d+)_label\}\}/g, (_, n) => {
      const peo = peos.find(p => p.number === Number(n));
      if (!peo) return '';
      return `${peo.title}${peo.description ? ' ' + peo.description : ''}`;
    });

    // peo_N_ga_M  (e.g. {{peo_2_ga_5}})
    result = result.replace(/\{\{peo_(\d+)_ga_(\d+)\}\}/g, (_, pn, gn) => {
      const peo = peos.find(p => p.number === Number(pn));
      const ga  = gas.find(g => g.number === Number(gn));
      if (!peo || !ga) return '';
      const linked = (peo.graduateAttributes || []).map(g =>
        typeof g === 'object' ? String(g._id) : String(g)
      );
      return linked.includes(String(ga._id)) ? CHECK : '';
    });

    // plo_N_label
    result = result.replace(/\{\{plo_(\d+)_label\}\}/g, (_, n) => {
      const plo = plos.find(p => p.number === Number(n));
      if (!plo) return '';
      return `${plo.title}${plo.description ? ' ' + plo.description : ''}`;
    });

    // plo_N_peo_M  (e.g. {{plo_3_peo_1}})
    result = result.replace(/\{\{plo_(\d+)_peo_(\d+)\}\}/g, (_, plon, peon) => {
      const plo = plos.find(p => p.number === Number(plon));
      const peo = peos.find(p => p.number === Number(peon));
      if (!plo || !peo) return '';
      const linked = (plo.programEducationalObjectives || []).map(p =>
        typeof p === 'object' ? String(p._id) : String(p)
      );
      return linked.includes(String(peo._id)) ? CHECK : '';
    });

    // clo_N_label
    result = result.replace(/\{\{clo_(\d+)_label\}\}/g, (_, n) => {
      const clo = clos.find(c => c.number === Number(n));
      if (!clo) return '';
      return `${clo.title}${clo.description ? ' ' + clo.description : ''}`;
    });

    // clo_N_plo_M  (e.g. {{clo_2_plo_4}})
    result = result.replace(/\{\{clo_(\d+)_plo_(\d+)\}\}/g, (_, clon, plon) => {
      const clo = clos.find(c => c.number === Number(clon));
      const plo = plos.find(p => p.number === Number(plon));
      if (!clo || !plo) return '';
      const linked = (clo.programLearningOutcomes || []).map(p =>
        typeof p === 'object' ? String(p._id) : String(p)
      );
      return linked.includes(String(plo._id)) ? CHECK : '';
    });
  }

  return result;
}

/**
 * Render a template element with syllabus data
 * @param {object} element - Template element (text or table)
 * @param {object} syllabus - Syllabus data object
 * @param {object} [auxData] - Auxiliary collections for matrix placeholders
 * @returns {object} Element with content replaced
 */
export function renderElement(element, syllabus, auxData = {}) {
  if (!element) return element;

  const rendered = { ...element };

  if (element.type === 'text') {
    rendered.content = replacePlaceholders(element.content, syllabus, auxData);
  } else if (element.type === 'table' && element.data && Array.isArray(element.data)) {
    // Table structure uses element.data as a 2D array
    rendered.data = element.data.map((row) =>
      Array.isArray(row) ? row.map((cell) => ({
        ...cell,
        content: replacePlaceholders(cell.content, syllabus, auxData),
      })) : row
    );
  }

  return rendered;
}

/**
 * Render an entire canvas document with syllabus data
 * @param {object} canvasDocument - Template canvas document
 * @param {object} syllabus - Syllabus data object
 * @param {object} [auxData] - Auxiliary collections for matrix placeholders
 * @returns {object} Canvas document with all placeholders replaced
 */
export function renderCanvasDocument(canvasDocument, syllabus, auxData = {}) {
  if (!canvasDocument || !syllabus) return canvasDocument;

  const rendered = {
    ...canvasDocument,
    header: {
      ...canvasDocument.header,
      elements: canvasDocument.header?.elements?.map((el) =>
        renderElement(el, syllabus, auxData)
      ) || [],
    },
    footer: {
      ...canvasDocument.footer,
      elements: canvasDocument.footer?.elements?.map((el) =>
        renderElement(el, syllabus, auxData)
      ) || [],
    },
  };

  // Handle both old (content) and new (pages) structure
  if (canvasDocument.pages) {
    rendered.pages = canvasDocument.pages.map(page => ({
      ...page,
      elements: page.elements?.map((el) => renderElement(el, syllabus, auxData)) || [],
    }));
  } else if (canvasDocument.content) {
    // Backward compatibility
    rendered.content = {
      ...canvasDocument.content,
      elements: canvasDocument.content?.elements?.map((el) =>
        renderElement(el, syllabus, auxData)
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
  const mkCodes = missionKeywords.map(mk => mk.code);

  const LABEL_W  = 420;
  const CHECK_W  = 60;
  const ROW_H    = 38;

  const rows = [];

  // Sort GAs using the same canonical order as the resolver so that the
  // global 1-based index in the placeholder matches what replacePlaceholders expects.
  const sortedAllGAs = sortGAs(graduateAttributes);
  let globalGAIdx = 0;

  GA_CATEGORY_ORDER.forEach(cat => {
    const gaInCat = sortedAllGAs.filter(ga => ga.category === cat);
    if (gaInCat.length === 0) return;

    // Category separator row — static text, no placeholder needed
    const totalW = LABEL_W + CHECK_W * mkCodes.length;
    rows.push([
      makeCell(cat, { bold: true, bg: CATEG_BG, align: 'left', width: totalW, height: 32, fontSize: 11 }),
      ...mkCodes.map(() => makeCell('', { bg: CATEG_BG, width: CHECK_W, height: 32 })),
    ]);

    gaInCat.forEach(() => {
      globalGAIdx++;
      rows.push([
        makeCell(`{{ga_${globalGAIdx}_label}}`, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
        ...mkCodes.map(code => makeCell(`{{ga_${globalGAIdx}_mk_${code}}}`, { align: 'center', width: CHECK_W, height: ROW_H })),
      ]);
    });
  });

  // Include any GAs that don't belong to a known category at the end
  const uncategorised = sortedAllGAs.filter(ga => !GA_CATEGORY_ORDER.includes(ga.category));
  if (uncategorised.length > 0) {
    rows.push([
      makeCell('OTHER', { bold: true, bg: CATEG_BG, align: 'left', width: LABEL_W + CHECK_W * mkCodes.length, height: 32, fontSize: 11 }),
      ...mkCodes.map(() => makeCell('', { bg: CATEG_BG, width: CHECK_W, height: 32 })),
    ]);
    uncategorised.forEach(() => {
      globalGAIdx++;
      rows.push([
        makeCell(`{{ga_${globalGAIdx}_label}}`, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
        ...mkCodes.map(code => makeCell(`{{ga_${globalGAIdx}_mk_${code}}}`, { align: 'center', width: CHECK_W, height: ROW_H })),
      ]);
    });
  }

  return buildTableElement(rows, pos);
}

/**
 * Build a PEO × Graduate Attributes matrix table element.
 * @param {object[]} peos              – populated from GET /peos
 * @param {object[]} graduateAttributes – populated from GET /graduate-attributes
 */
export function buildPEOGAMatrix(peos, graduateAttributes, pos) {
  const LABEL_W  = 380;
  const CHECK_W  = 55;
  const ROW_H    = 60;

  const rows = [];

  peos.forEach(peo => {
    rows.push([
      makeCell(`{{peo_${peo.number}_label}}`, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
      ...graduateAttributes.map(ga => makeCell(`{{peo_${peo.number}_ga_${ga.number}}}`, { align: 'center', width: CHECK_W, height: ROW_H })),
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
  const LABEL_W  = 400;
  const CHECK_W  = 65;
  const ROW_H    = 60;

  const rows = [];

  plos.forEach(plo => {
    rows.push([
      makeCell(`{{plo_${plo.number}_label}}`, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
      ...peos.map(peo => makeCell(`{{plo_${plo.number}_peo_${peo.number}}}`, { align: 'center', width: CHECK_W, height: ROW_H })),
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
  const LABEL_W  = 400;
  const CHECK_W  = 65;
  const ROW_H    = 60;

  const rows = [];

  clos.forEach(clo => {
    rows.push([
      makeCell(`{{clo_${clo.number}_label}}`, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
      ...plos.map(plo => makeCell(`{{clo_${clo.number}_plo_${plo.number}}}`, { align: 'center', width: CHECK_W, height: ROW_H })),
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
