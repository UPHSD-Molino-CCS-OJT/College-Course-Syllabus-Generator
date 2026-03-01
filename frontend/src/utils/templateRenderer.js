/**
 * Utility functions for rendering templates with syllabus data
 */

import {
  CHECK,
  sortGAs,
  buildGAMissionKeywordMatrix,
  buildPEOGAMatrix,
  buildPLOPEOMatrix,
  buildCLOPLOMatrix,
  buildLLOCLOMatrix,
  pasteAtAnchor,
} from './matrixBuilders/index.js';

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
  const { gas = [], mks = [], peos = [], plos = [], clos = [], llos = [] } = auxData;
  if (gas.length || mks.length || peos.length || plos.length || clos.length || llos.length) {
    // ga_N_label â€” N is the 1-based position in the canonical category-sorted GA list
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
    // regardless of DB insertion order â€” this keeps builders and resolvers in sync.
    const sortedPEOs = [...peos].sort((a, b) => (a.number || 0) - (b.number || 0));
    const sortedPLOs = [...plos].sort((a, b) => (a.number || 0) - (b.number || 0));
    const sortedCLOs = [...clos].sort((a, b) => (a.number || 0) - (b.number || 0));

    // peo_N_label  â€” N is 1-based position in number-sorted PEO list
    result = result.replace(/\{\{peo_(\d+)_label\}\}/g, (_, n) => {
      const peo = sortedPEOs[Number(n) - 1];
      if (!peo) return '';
      return `${n}. ${peo.title}${peo.description ? ' ' + peo.description : ''}`;
    });

    // peo_N_ga_M  â€” N = PEO position, M = GA position in category-sorted GA list
    result = result.replace(/\{\{peo_(\d+)_ga_(\d+)\}\}/g, (_, pn, gn) => {
      const peo = sortedPEOs[Number(pn) - 1];
      const ga  = sortedGAs[Number(gn) - 1];
      if (!peo || !ga) return '';
      const linked = (peo.graduateAttributes || []).map(g =>
        typeof g === 'object' ? String(g._id) : String(g)
      );
      return linked.includes(String(ga._id)) ? CHECK : '';
    });

    // plo_N_label  â€” N is 1-based position in number-sorted PLO list
    result = result.replace(/\{\{plo_(\d+)_label\}\}/g, (_, n) => {
      const plo = sortedPLOs[Number(n) - 1];
      if (!plo) return '';
      return `${n}. ${plo.title}${plo.description ? ' ' + plo.description : ''}`;
    });

    // plo_N_peo_M  â€” N = PLO position, M = PEO position
    result = result.replace(/\{\{plo_(\d+)_peo_(\d+)\}\}/g, (_, plon, peon) => {
      const plo = sortedPLOs[Number(plon) - 1];
      const peo = sortedPEOs[Number(peon) - 1];
      if (!plo || !peo) return '';
      const linked = (plo.programEducationalObjectives || []).map(p =>
        typeof p === 'object' ? String(p._id) : String(p)
      );
      return linked.includes(String(peo._id)) ? CHECK : '';
    });

    // clo_N_label  â€” N is 1-based position in number-sorted CLO list
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

    // llo_N_label  — N is the 1-based sequential position in period→weekOrder→order-sorted LLO list
    const PERIOD_RANK_TR = { PRELIM: 0, MIDTERM: 1, FINAL: 2 };
    const sortedLLOs = [...(llos || [])].sort((a, b) => {
      const pa = PERIOD_RANK_TR[a.period] ?? 99;
      const pb = PERIOD_RANK_TR[b.period] ?? 99;
      if (pa !== pb) return pa - pb;
      const wa = a.weekOrder ?? 0;
      const wb = b.weekOrder ?? 0;
      if (wa !== wb) return wa - wb;
      return (a.order ?? 0) - (b.order ?? 0);
    });
    result = result.replace(/\{\{llo_(\d+)_label\}\}/g, (_, n) => {
      const llo = sortedLLOs[Number(n) - 1];
      if (!llo) return '';
      return `${n}.  ${llo.text} (${llo.domain})`;
    });

    // llo_N_clo_M  — N = LLO position (sorted), M = CLO position (number-sorted)
    result = result.replace(/\{\{llo_(\d+)_clo_(\d+)\}\}/g, (_, llon, clon) => {
      const llo = sortedLLOs[Number(llon) - 1];
      const clo = sortedCLOs[Number(clon) - 1];
      if (!llo || !clo) return '';
      const linked = (llo.courseLearningOutcomes || []).map(c =>
        typeof c === 'object' ? String(c._id) : String(c)
      );
      return linked.includes(String(clo._id)) ? CHECK : '';
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
    const { gas = [], mks = [], peos = [], plos = [], clos = [], llos = [] } = auxData;
    let rebuilt = null;
    const pos = { x: element.x, y: element.y };
    const posWithData = { ...pos, existingData: element.data };
    if (element.matrixType === 'ga-mk' && gas.length && mks.length) {
      rebuilt = buildGAMissionKeywordMatrix(gas, mks, posWithData);
    } else if (element.matrixType === 'peo-ga' && peos.length && gas.length) {
      rebuilt = buildPEOGAMatrix(peos, gas, posWithData);
    } else if (element.matrixType === 'plo-peo' && plos.length && peos.length) {
      rebuilt = buildPLOPEOMatrix(plos, peos, posWithData);
    } else if (element.matrixType === 'clo-plo' && clos.length && plos.length) {
      rebuilt = buildCLOPLOMatrix(clos, plos, posWithData);
    } else if (element.matrixType === 'llo-clo' && llos.length && clos.length) {
      rebuilt = buildLLOCLOMatrix(llos, clos, posWithData);
    }
    if (rebuilt) {
      //  LLO-CLO: dynamic section rows â€” rebuild structure from DB but preserve
      //    user-edited checkmark content when the structure is unchanged, so
      //    manual check/uncheck toggles survive a re-render. 
      if (element.matrixType === 'llo-clo') {
        const lloStructureChanged =
          rebuilt.rows !== (element.data?.length ?? element.rows) ||
          rebuilt.cols !== (element.data?.[0]?.length ?? element.cols);

        let lloData = rebuilt.data;
        if (!lloStructureChanged && element.data) {
          lloData = rebuilt.data.map((row, r) =>
            row.map((cell, c) => {
              const oldCell = element.data[r]?.[c];
              // Row 0, Col 0 = "LESSON LEARNING OUTCOMES" section title –
              // it carries _header:true for rowspan purposes but the user can
              // freely edit its text / styling, so treat it as an editable cell.
              if (r === 0 && c === 0 && oldCell) {
                return {
                  ...cell,
                  content:       oldCell.content       ?? cell.content,
                  width:         oldCell.width         ?? cell.width,
                  height:        oldCell.height        ?? cell.height,
                  fontSize:      oldCell.fontSize      ?? cell.fontSize,
                  fontFamily:    oldCell.fontFamily    ?? cell.fontFamily,
                  fontWeight:    oldCell.fontWeight    ?? cell.fontWeight,
                  fontStyle:     oldCell.fontStyle     ?? cell.fontStyle,
                  color:         oldCell.color         ?? cell.color,
                  align:         oldCell.align         ?? cell.align,
                  verticalAlign: oldCell.verticalAlign ?? cell.verticalAlign,
                  bg:            oldCell.bg            ?? cell.bg,
                };
              }
              // Always use canonical header cells (period/week dividers, CLO number row)
              if (cell._header) {
                return {
                  ...cell,
                  width:  oldCell?.width  ?? cell.width,
                  height: oldCell?.height ?? cell.height,
                };
              }
              if (!oldCell) return cell;
              // Col 0 = LLO label: preserve user's rich-text edits; fall back to
              // rebuilt content only when the cell has never been edited.
              if (c === 0) {
                return {
                  ...cell,
                  content:       oldCell.content       ?? cell.content,
                  width:         oldCell.width         ?? cell.width,
                  height:        oldCell.height        ?? cell.height,
                  fontSize:      oldCell.fontSize      ?? cell.fontSize,
                  fontFamily:    oldCell.fontFamily    ?? cell.fontFamily,
                  fontStyle:     oldCell.fontStyle     ?? cell.fontStyle,
                  color:         oldCell.color         ?? cell.color,
                  verticalAlign: oldCell.verticalAlign ?? cell.verticalAlign,
                  bg:            oldCell.bg            ?? cell.bg,
                };
              }
              // Col 1+ = CLO check cells: preserve user-edited content (checkmarks)
              return {
                ...cell,
                content:       oldCell.content       ?? cell.content,
                width:         oldCell.width         ?? cell.width,
                height:        oldCell.height        ?? cell.height,
                fontSize:      oldCell.fontSize      ?? cell.fontSize,
                fontFamily:    oldCell.fontFamily    ?? cell.fontFamily,
                fontWeight:    oldCell.fontWeight    ?? cell.fontWeight,
                fontStyle:     oldCell.fontStyle     ?? cell.fontStyle,
                color:         oldCell.color         ?? cell.color,
                verticalAlign: oldCell.verticalAlign ?? cell.verticalAlign,
                bg:            oldCell.bg            ?? cell.bg,
              };
            })
          );
        }

        rendered = {
          ...rebuilt,
          id:          element.id,
          x:           element.x,
          y:           element.y,
          data:        lloData,
          borderColor: element.borderColor ?? rebuilt.borderColor,
          borderWidth: element.borderWidth ?? rebuilt.borderWidth,
          borderStyle: element.borderStyle ?? rebuilt.borderStyle,
          matrixType:  element.matrixType,
        };
      //  CLO-PLO: rebuild structure from DB but preserve the two constant header
      //    cells (row 0 col 0 = CLO title, row 0 col 1 = PLO title) so any user
      //    edits to their text / styling survive a re-render. 
      } else if (element.matrixType === 'clo-plo') {
        const mergedData = rebuilt.data.map((row, r) =>
          row.map((cell, c) => {
            const stored = element.data?.[r]?.[c];
            // Preserve stored content+styles for the two constant header cells
            if (r === 0 && (c === 0 || c === 1)) {
              if (stored) return { ...cell, ...stored, rowspan: cell.rowspan, colspan: cell.colspan };
            }
            // For all other cells, preserve per-cell user customizations (width/height
            // from canvas resizing, plus any colour or font overrides), but always take
            // the rebuilt placeholder content and structural spans.
            if (stored) {
              return {
                ...cell,
                width:         stored.width         ?? cell.width,
                height:        stored.height        ?? cell.height,
                fontSize:      stored.fontSize      ?? cell.fontSize,
                fontFamily:    stored.fontFamily    ?? cell.fontFamily,
                color:         stored.color         ?? cell.color,
                bg:            cell._header ? cell.bg : (stored.bg ?? cell.bg),
                verticalAlign: stored.verticalAlign ?? cell.verticalAlign,
              };
            }
            return cell;
          })
        );
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
      //  Anchor-based paste: re-paste the fresh matrix at the stored position
      } else if (element.matrixAnchorRow !== undefined) {
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
        // Full-table rebuild: preserve per-cell user styles
        const structureChanged = rebuilt.rows !== element.rows || rebuilt.cols !== element.cols;

        // When the structure is the same, preserve per-cell user styles (fonts, colours,
        // background, per-cell borders); only the placeholder content comes from rebuilt.
        let mergedData = rebuilt.data;
        if (!structureChanged && element.data) {
          mergedData = rebuilt.data.map((row, r) =>
            row.map((cell, c) => {
              // Static header cells always use canonical builder styles
              if (cell._header) return cell;
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
                align:         cell.align,   // always use canonical builder alignment
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
                ...(oldCell.colspan          !== undefined ? { colspan:          oldCell.colspan          } : {}),
                ...(oldCell.rowspan          !== undefined ? { rowspan:          oldCell.rowspan          } : {}),
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

//  Relationship Matrix Table Builders 
// Implementations live in matrixBuilders/. Re-exported here for backward compatibility.
export {
  buildGAMissionKeywordMatrix,
  buildPEOGAMatrix,
  buildPLOPEOMatrix,
  buildCLOPLOMatrix,
  buildLLOCLOMatrix,
  pasteAtAnchor,
} from './matrixBuilders/index.js';


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
