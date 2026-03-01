/**
 * LLO × CLO matrix builder.
 *
 * Layout:
 *   Row 0, Col 0  – "LESSON LEARNING OUTCOMES (LLOs)…" section header (rowspan=2)
 *   Row 0, Col 1+ – "COURSE LEARNING OUTCOMES (CLOs)" section header  (colspan=numCLOs)
 *   Row 1, Col 0  – placeholder (visually covered by rowspan above)
 *   Row 1, Col 1+ – CLO numbers (1, 2, …)
 *   Row 2+        – alternating period divider rows, week label rows, and LLO data rows
 */

import { CHECK, makeCell, buildTableElement } from './shared.js';

/** Canonical ordering for exam periods */
const PERIOD_RANK = { PRELIM: 0, MIDTERM: 1, FINAL: 2 };

/**
 * Build an LLO × CLO matrix table element.
 * @param {object[]} llos – populated from GET /llos
 * @param {object[]} clos – populated from GET /clos
 * @param {object}   [pos] – { x, y, existingData? }
 */
export function buildLLOCLOMatrix(llos, clos, pos) {
  const existingData = pos?.existingData || null;

  const getStoredColWidth = (colIndex) => {
    if (!existingData) return undefined;
    for (let r = 2; r < existingData.length; r++) {
      const w = existingData[r]?.[colIndex]?.width;
      if (w != null) return w;
    }
    const w1 = existingData[1]?.[colIndex]?.width;
    if (w1 != null) return w1;
    if (colIndex === 0) {
      const w0 = existingData[0]?.[0]?.width;
      if (w0 != null) return w0;
    }
    return undefined;
  };

  const getStoredRowHeight = (rowIndex) => {
    if (!existingData) return undefined;
    const row = existingData[rowIndex];
    if (!row) return undefined;
    for (const cell of row) {
      if (cell?.height != null) return cell.height;
    }
    return undefined;
  };

  const sortedCLOs = [...clos].sort((a, b) => (a.number || 0) - (b.number || 0));
  const numCLOs = sortedCLOs.length;

  // Sort LLOs by period order → week order → item order
  const sortedLLOs = [...llos].sort((a, b) => {
    const pa = PERIOD_RANK[a.period] ?? 99;
    const pb = PERIOD_RANK[b.period] ?? 99;
    if (pa !== pb) return pa - pb;
    const wa = a.weekOrder ?? 0;
    const wb = b.weekOrder ?? 0;
    if (wa !== wb) return wa - wb;
    return (a.order ?? 0) - (b.order ?? 0);
  });

  const LABEL_W     = getStoredColWidth(0);
  const checkWidths = sortedCLOs.map((_, ci) => getStoredColWidth(ci + 1));

  const HEADER0_H = getStoredRowHeight(0);
  const HEADER1_H = getStoredRowHeight(1);

  const HEADER_BG = '#FCE9D9'; // salmon – matches other matrices
  const PERIOD_BG = '#DAEEF3'; // light blue for PRELIM / MIDTERM / FINAL
  const SECTION_H = 20;        // height for section separator rows
  const DATA_H    = 50;        // default height for LLO data rows

  const rows = [];

  // Preserve user-edited header text when rebuilding; use defaults only on first insert.
  const storedLLOHeaderText = existingData?.[0]?.[0]?.content
    ?? 'LESSON LEARNING OUTCOMES (LLOs)\n\nAt the end of the lesson, the students can';
  const storedCLOHeaderText = existingData?.[0]?.[1]?.content
    ?? 'COURSE LEARNING OUTCOMES (CLOs)';

  // ── Row 0: LLO header (rowspan=2) | CLO header (colspan=numCLOs) ──────────
  rows.push([
    Object.assign(
      makeCell(storedLLOHeaderText, {
        bold: true, bg: HEADER_BG, align: 'center', width: LABEL_W, height: HEADER0_H, fontSize: 12, verticalAlign: 'middle',
      }),
      { _header: true, rowspan: 2 }
    ),
    Object.assign(
      makeCell(storedCLOHeaderText, {
        bold: true, bg: HEADER_BG, align: 'center', width: checkWidths[0], height: HEADER0_H, fontSize: 12, verticalAlign: 'middle',
      }),
      { _header: true, colspan: numCLOs }
    ),
    // Empty placeholders for cells visually covered by the colspan
    ...Array.from({ length: numCLOs - 1 }, (_, ci) =>
      Object.assign(makeCell('', { bg: HEADER_BG, width: checkWidths[ci + 1], height: HEADER0_H }), { _header: true })
    ),
  ]);

  // ── Row 1: col 0 covered by rowspan | CLO numbers ─────────────────────────
  rows.push([
    Object.assign(makeCell('', { bg: HEADER_BG, width: LABEL_W, height: HEADER1_H }), { _header: true }),
    ...sortedCLOs.map((clo, ci) =>
      Object.assign(
        makeCell(String(clo.number ?? ci + 1), {
          bold: true, bg: HEADER_BG, align: 'center', width: checkWidths[ci], height: HEADER1_H, fontSize: 12, verticalAlign: 'middle',
        }),
        { _header: true }
      )
    ),
  ]);

  // ── Data rows: period dividers → week dividers → LLO rows ─────────────────
  let currentPeriod = null;
  let currentWeek   = null;
  let lloCounter    = 0;

  sortedLLOs.forEach((llo) => {
    // Period divider row (e.g. PRELIM, MIDTERM, FINAL)
    if (llo.period !== currentPeriod) {
      currentPeriod = llo.period;
      currentWeek   = null; // force week row to re-emit
      rows.push([
        Object.assign(
          makeCell(llo.period, {
            bold: true, bg: PERIOD_BG, align: 'left',
            width: LABEL_W, height: SECTION_H, fontSize: 11, verticalAlign: 'middle',
          }),
          { _header: true, colspan: 1 + numCLOs }
        ),
        ...Array.from({ length: numCLOs }, (_, ci) =>
          Object.assign(makeCell('', { bg: PERIOD_BG, width: checkWidths[ci], height: SECTION_H }), { _header: true })
        ),
      ]);
    }

    // Week label row (e.g. FIRST WEEK, SECOND WEEK – THIRD WEEK)
    if (llo.weekLabel !== currentWeek) {
      currentWeek = llo.weekLabel;
      rows.push([
        Object.assign(
          makeCell(llo.weekLabel, {
            bold: true, bg: 'transparent', align: 'left',
            width: LABEL_W, height: SECTION_H, fontSize: 11, verticalAlign: 'middle',
          }),
          { _header: true, colspan: 1 + numCLOs }
        ),
        ...Array.from({ length: numCLOs }, (_, ci) =>
          Object.assign(makeCell('', { bg: 'transparent', width: checkWidths[ci], height: SECTION_H }), { _header: true })
        ),
      ]);
    }

    // LLO data row
    lloCounter += 1;
    const lloText      = `${lloCounter}.  ${llo.text} (${llo.domain})`;
    const mappedCloIds = (llo.courseLearningOutcomes || []).map((c) =>
      typeof c === 'object' ? String(c._id) : String(c)
    );

    rows.push([
      makeCell(lloText, {
        align: 'left', bg: 'transparent',
        width: LABEL_W, height: DATA_H, fontSize: 11, verticalAlign: 'top', italic: true,
      }),
      ...sortedCLOs.map((clo, ci) =>
        makeCell(mappedCloIds.includes(String(clo._id)) ? CHECK : '', {
          align: 'center', bg: 'transparent',
          width: checkWidths[ci], height: DATA_H, fontSize: 12, verticalAlign: 'middle', bold: true,
        })
      ),
    ]);
  });

  return buildTableElement(rows, { ...pos, matrixType: 'llo-clo' });
}
