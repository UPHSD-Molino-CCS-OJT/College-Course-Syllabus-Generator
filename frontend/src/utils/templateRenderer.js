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

    // Sort each collection by .number so positional index N always refers to the same item
    // regardless of DB insertion order — this keeps builders and resolvers in sync.
    const sortedPEOs = [...peos].sort((a, b) => (a.number || 0) - (b.number || 0));
    const sortedPLOs = [...plos].sort((a, b) => (a.number || 0) - (b.number || 0));
    const sortedCLOs = [...clos].sort((a, b) => (a.number || 0) - (b.number || 0));

    // peo_N_label  — N is 1-based position in number-sorted PEO list
    result = result.replace(/\{\{peo_(\d+)_label\}\}/g, (_, n) => {
      const peo = sortedPEOs[Number(n) - 1];
      if (!peo) return '';
      return `${n}. ${peo.title}${peo.description ? ' ' + peo.description : ''}`;
    });

    // peo_N_ga_M  — N = PEO position, M = GA position in category-sorted GA list
    result = result.replace(/\{\{peo_(\d+)_ga_(\d+)\}\}/g, (_, pn, gn) => {
      const peo = sortedPEOs[Number(pn) - 1];
      const ga  = sortedGAs[Number(gn) - 1];
      if (!peo || !ga) return '';
      const linked = (peo.graduateAttributes || []).map(g =>
        typeof g === 'object' ? String(g._id) : String(g)
      );
      return linked.includes(String(ga._id)) ? CHECK : '';
    });

    // plo_N_label  — N is 1-based position in number-sorted PLO list
    result = result.replace(/\{\{plo_(\d+)_label\}\}/g, (_, n) => {
      const plo = sortedPLOs[Number(n) - 1];
      if (!plo) return '';
      return `${n}. ${plo.title}${plo.description ? ' ' + plo.description : ''}`;
    });

    // plo_N_peo_M  — N = PLO position, M = PEO position
    result = result.replace(/\{\{plo_(\d+)_peo_(\d+)\}\}/g, (_, plon, peon) => {
      const plo = sortedPLOs[Number(plon) - 1];
      const peo = sortedPEOs[Number(peon) - 1];
      if (!plo || !peo) return '';
      const linked = (plo.programEducationalObjectives || []).map(p =>
        typeof p === 'object' ? String(p._id) : String(p)
      );
      return linked.includes(String(peo._id)) ? CHECK : '';
    });

    // clo_N_label  — N is 1-based position in number-sorted CLO list
    result = result.replace(/\{\{clo_(\d+)_label\}\}/g, (_, n) => {
      const clo = sortedCLOs[Number(n) - 1];
      if (!clo) return '';
      return `${n}. ${clo.title}${clo.description ? ' ' + clo.description : ''}`;
    });

    // clo_N_plo_M  — N = CLO position, M = PLO position
    result = result.replace(/\{\{clo_(\d+)_plo_(\d+)\}\}/g, (_, clon, plon) => {
      const clo = sortedCLOs[Number(clon) - 1];
      const plo = sortedPLOs[Number(plon) - 1];
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

  let rendered = { ...element };

  // If the element is a tagged matrix table, rebuild its rows from current auxData
  // so adding/removing items in the DB is automatically reflected.
  if (element.type === 'table' && element.matrixType) {
    const { gas = [], mks = [], peos = [], plos = [], clos = [] } = auxData;
    let rebuilt = null;
    const pos = { x: element.x, y: element.y };
    if (element.matrixType === 'ga-mk' && gas.length && mks.length) {
      rebuilt = buildGAMissionKeywordMatrix(gas, mks, pos);
    } else if (element.matrixType === 'peo-ga' && peos.length && gas.length) {
      rebuilt = buildPEOGAMatrix(peos, gas, pos);
    } else if (element.matrixType === 'plo-peo' && plos.length && peos.length) {
      rebuilt = buildPLOPEOMatrix(plos, peos, pos);
    } else if (element.matrixType === 'clo-plo' && clos.length && plos.length) {
      rebuilt = buildCLOPLOMatrix(clos, plos, pos);
    }
    if (rebuilt) {
      // ── Anchor-based paste: re-paste the fresh matrix at the stored position ──
      if (element.matrixAnchorRow !== undefined) {
        const anchorRow = element.matrixAnchorRow ?? 0;
        const anchorCol = element.matrixAnchorCol ?? 0;
        const { data: pastedData, rows: pRows, cols: pCols } = pasteAtAnchor(
          element.data, rebuilt.data, anchorRow, anchorCol
        );
        rendered = {
          ...element,
          data:            pastedData,
          rows:            pRows,
          cols:            pCols,
          matrixType:      element.matrixType,
          matrixAnchorRow: anchorRow,
          matrixAnchorCol: anchorCol,
        };
      } else {
        // ── Full-table rebuild: preserve per-cell user styles ──────────────────
        const structureChanged = rebuilt.rows !== element.rows || rebuilt.cols !== element.cols;

        // When the structure is the same, preserve per-cell user styles (fonts, colours,
        // background, per-cell borders); only the placeholder content comes from rebuilt.
        let mergedData = rebuilt.data;
        if (!structureChanged && element.data) {
          mergedData = rebuilt.data.map((row, r) =>
            row.map((cell, c) => {
              const oldCell = element.data[r]?.[c];
              if (!oldCell) return cell;
              const isHeader = cell.fontWeight === 'bold';
              return {
                ...cell,
                fontSize:      oldCell.fontSize      ?? cell.fontSize,
                fontFamily:    oldCell.fontFamily    ?? cell.fontFamily,
                fontWeight:    cell.fontWeight,   // always enforce builder: bold for category rows, normal for data rows
                fontStyle:     oldCell.fontStyle     ?? cell.fontStyle,
                color:         oldCell.color         ?? cell.color,
                align:         isHeader ? cell.align : (oldCell.align         ?? cell.align),
                verticalAlign: oldCell.verticalAlign ?? cell.verticalAlign,
                bg:            isHeader ? cell.bg    : (oldCell.bg            ?? cell.bg),
                width:         oldCell.width         ?? cell.width,
                height:        oldCell.height        ?? cell.height,
                ...(oldCell.showBorderTop    !== undefined ? { showBorderTop:    oldCell.showBorderTop    } : {}),
                ...(oldCell.showBorderRight  !== undefined ? { showBorderRight:  oldCell.showBorderRight  } : {}),
                ...(oldCell.showBorderBottom !== undefined ? { showBorderBottom: oldCell.showBorderBottom } : {}),
                ...(oldCell.showBorderLeft   !== undefined ? { showBorderLeft:   oldCell.showBorderLeft   } : {}),
                ...(oldCell.borderColor      !== undefined ? { borderColor:      oldCell.borderColor      } : {}),
                ...(oldCell.borderWidth      !== undefined ? { borderWidth:      oldCell.borderWidth      } : {}),
                ...(oldCell.borderStyle      !== undefined ? { borderStyle:      oldCell.borderStyle      } : {}),
              };
            })
          );
        }

        // Preserve user-customised styling from the stored element; only update structure
        rendered = {
          ...rebuilt,
          id:          element.id,
          x:           element.x,
          y:           element.y,
          data:        mergedData,
          borderColor: element.borderColor ?? rebuilt.borderColor,
          borderWidth: element.borderWidth ?? rebuilt.borderWidth,
          borderStyle: element.borderStyle ?? rebuilt.borderStyle,
          cellWidth:   element.cellWidth   ?? rebuilt.cellWidth,
          cellHeight:  element.cellHeight  ?? rebuilt.cellHeight,
          matrixType:  element.matrixType,
        };
      }
    }
  }

  if (element.type === 'text') {
    rendered.content = replacePlaceholders(element.content, syllabus, auxData);
  } else if (element.type === 'table' && rendered.data && Array.isArray(rendered.data)) {
    // Table structure uses element.data as a 2D array
    rendered.data = rendered.data.map((row) =>
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
function makeCell(content, { bold = false, bg = '#ffffff', align = 'center', width = 120, height = 40, fontSize = 12, color = '#000000', italic = false } = {}) {
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
function buildTableElement(rows2d, { x = 60, y = 100, matrixType = null } = {}) {
  const numRows = rows2d.length;
  const numCols = rows2d[0]?.length || 0;
  const el = {
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
  if (matrixType) el.matrixType = matrixType;
  return el;
}

const CATEG_BG   = '#ffffff'; // white background for category rows

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
      makeCell(cat, { bold: true, bg: CATEG_BG, align: 'left', width: totalW, height: 32, fontSize: 12 }),
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
      makeCell('OTHER', { bold: true, bg: CATEG_BG, align: 'left', width: LABEL_W + CHECK_W * mkCodes.length, height: 32, fontSize: 12 }),
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

  return buildTableElement(rows, { ...pos, matrixType: 'ga-mk' });
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

  const sortedPEOs = [...peos].sort((a, b) => (a.number || 0) - (b.number || 0));
  const sortedGAsForCols = sortGAs(graduateAttributes);
  const rows = [];

  sortedPEOs.forEach((_peo, idx) => {
    const n = idx + 1;
    rows.push([
      makeCell(`{{peo_${n}_label}}`, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
      ...sortedGAsForCols.map((_ga, gi) => makeCell(`{{peo_${n}_ga_${gi + 1}}}`, { align: 'center', width: CHECK_W, height: ROW_H })),
    ]);
  });

  return buildTableElement(rows, { ...pos, matrixType: 'peo-ga' });
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

  const sortedPLOs = [...plos].sort((a, b) => (a.number || 0) - (b.number || 0));
  const sortedPEOs = [...peos].sort((a, b) => (a.number || 0) - (b.number || 0));
  const rows = [];

  sortedPLOs.forEach((_plo, idx) => {
    const n = idx + 1;
    rows.push([
      makeCell(`{{plo_${n}_label}}`, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
      ...sortedPEOs.map((_peo, pi) => makeCell(`{{plo_${n}_peo_${pi + 1}}}`, { align: 'center', width: CHECK_W, height: ROW_H })),
    ]);
  });

  return buildTableElement(rows, { ...pos, matrixType: 'plo-peo' });
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

  const sortedCLOs = [...clos].sort((a, b) => (a.number || 0) - (b.number || 0));
  const sortedPLOs = [...plos].sort((a, b) => (a.number || 0) - (b.number || 0));
  const rows = [];

  sortedCLOs.forEach((_clo, idx) => {
    const n = idx + 1;
    rows.push([
      makeCell(`{{clo_${n}_label}}`, { align: 'left', width: LABEL_W, height: ROW_H, fontSize: 10 }),
      ...sortedPLOs.map((_plo, pi) => makeCell(`{{clo_${n}_plo_${pi + 1}}}`, { align: 'center', width: CHECK_W, height: ROW_H })),
    ]);
  });

  return buildTableElement(rows, { ...pos, matrixType: 'clo-plo' });
}

// ─── End Relationship Matrix Builders ─────────────────────────────────────────

/**
 * Paste the source matrix onto the target table starting at (anchorRow, anchorCol).
 * Expands or trims rows and columns so the table exactly fits the matrix from the
 * anchor point. Rows/cols before the anchor are kept intact. Existing cell styles
 * (font, colour, bg, borders) are preserved; only `content` is overwritten from
 * the matrix source.
 *
 * Returns { data, rows, cols } — the updated 2-D array plus new dimensions.
 */
export function pasteAtAnchor(existingData, matrixData, anchorRow, anchorCol) {
  const matrixRows = matrixData.length;
  const matrixCols = matrixData[0]?.length ?? 0;
  const targetRowCount = anchorRow + matrixRows;
  const targetColCount = anchorCol + matrixCols;

  // Deep copy
  let merged = existingData.map(row => row.map(cell => ({ ...cell })));

  // Expand rows if the matrix extends beyond the current bottom
  while (merged.length < targetRowCount) {
    const templateRow = merged[merged.length - 1] ?? [];
    merged.push(templateRow.map(cell => ({ ...cell, content: '' })));
  }

  // Trim excess rows below the matrix extent
  if (merged.length > targetRowCount) {
    merged = merged.slice(0, targetRowCount);
  }

  // Fix each row's column count and overwrite matrix cell content
  merged = merged.map((row, r) => {
    // Expand cols if needed (copy style from last col as template)
    while (row.length < targetColCount) {
      const tpl = row[row.length - 1] ?? {
        content: '', fontSize: 12, fontFamily: 'Arial', fontWeight: 'normal',
        color: '#000000', align: 'left', bg: '#ffffff', width: 120, height: 40,
      };
      row = [...row, { ...tpl, content: '' }];
    }

    // Trim excess cols beyond the matrix extent
    if (row.length > targetColCount) {
      row = row.slice(0, targetColCount);
    }

    // For rows inside the matrix zone: overwrite content from the source matrix
    if (r >= anchorRow) {
      const mr = r - anchorRow;
      const matrixRow = matrixData[mr] ?? [];
      row = [...row];
      for (let c = 0; c < matrixCols; c++) {
        const srcCell = matrixRow[c];
        if (srcCell !== undefined) {
          const srcIsHeader = srcCell.fontWeight === 'bold';
          row[anchorCol + c] = {
            ...row[anchorCol + c],
            content:    srcCell.content    ?? '',
            fontWeight: srcCell.fontWeight,   // always enforce builder: bold for category rows, normal for data rows
            bg:         srcIsHeader ? srcCell.bg        : (row[anchorCol + c].bg        ?? srcCell.bg),
            align:      srcIsHeader ? srcCell.align     : (row[anchorCol + c].align     ?? srcCell.align),
            fontSize:   srcIsHeader ? srcCell.fontSize  : (row[anchorCol + c].fontSize  ?? srcCell.fontSize),
            fontStyle:  srcIsHeader ? srcCell.fontStyle : (row[anchorCol + c].fontStyle ?? srcCell.fontStyle),
          };
        }
      }
    }
    return row;
  });

  return { data: merged, rows: targetRowCount, cols: targetColCount };
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
