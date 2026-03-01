/**
 * CLO × PLO matrix builder.
 *
 * Layout:
 *   Row 0, Col 0  – "COURSE LEARNING OUTCOMES (CLOs)…" section header  (rowspan=2)
 *   Row 0, Col 1+ – "PROGRAM LEARNING OUTCOMES (PLOs)" section header  (colspan=numPLOs)
 *   Row 1, Col 0  – placeholder (visually covered by rowspan above)
 *   Row 1, Col 1+ – PLO numbers (1, 2, …)
 *   Row 2+, Col 0 – {{clo_N_label}}
 *   Row 2+, Col 1+– {{clo_N_plo_M}}
 *
 * Total check-cell width is kept constant regardless of PLO count by computing
 * CHECK_W = TOTAL_CHECK_AREA / numPLOs (columns grow/shrink inward).
 */

import { makeCell, buildTableElement } from './shared.js';

/**
 * Build a CLO × PLO matrix table element.
 * @param {object[]} clos – populated from GET /clos
 * @param {object[]} plos – populated from GET /plos
 * @param {object}   [pos] – { x, y, existingData? }
 */
export function buildCLOPLOMatrix(clos, plos, pos) {
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

  const lastStoredDataRowHeight = (() => {
    if (!existingData) return undefined;
    for (let r = existingData.length - 1; r >= 2; r--) {
      const h = getStoredRowHeight(r);
      if (h != null) return h;
    }
    return undefined;
  })();

  const sortedCLOs = [...clos].sort((a, b) => (a.number || 0) - (b.number || 0));
  const sortedPLOs = [...plos].sort((a, b) => (a.number || 0) - (b.number || 0));
  const numPLOs = sortedPLOs.length;

  const LABEL_W     = getStoredColWidth(0);
  const checkWidths = sortedPLOs.map((_, pi) => getStoredColWidth(pi + 1));

  const HEADER0_H = getStoredRowHeight(0);
  const HEADER1_H = getStoredRowHeight(1);
  const ROW_H     = lastStoredDataRowHeight;

  const HEADER_BG = '#FCE9D9';
  const rows = [];

  // ── Row 0: CLO section header (rowspan=2) | PLO section header (colspan=numPLOs) ──
  rows.push([
    Object.assign(
      makeCell(
        'COURSE LEARNING OUTCOMES (CLOs)\n\nAt the end of the course, the students can:',
        { bold: true, bg: HEADER_BG, align: 'center', width: LABEL_W, height: HEADER0_H, fontSize: 12, verticalAlign: 'middle' }
      ),
      { _header: true, rowspan: 2 }
    ),
    Object.assign(
      makeCell('PROGRAM LEARNING OUTCOMES (PLOs)', {
        bold: true, bg: HEADER_BG, align: 'center', width: checkWidths[0], height: HEADER0_H, fontSize: 12, verticalAlign: 'middle',
      }),
      { _header: true, colspan: numPLOs }
    ),
    // Empty placeholders for cells visually covered by the colspan above
    ...Array.from({ length: numPLOs - 1 }, (_, pi) =>
      Object.assign(makeCell('', { bg: HEADER_BG, width: checkWidths[pi + 1], height: HEADER0_H }), { _header: true })
    ),
  ]);

  // ── Row 1: col 0 covered by rowspan | PLO numbers ────────────────────────
  rows.push([
    Object.assign(makeCell('', { bg: HEADER_BG, width: LABEL_W, height: HEADER1_H }), { _header: true }),
    ...sortedPLOs.map((plo, pi) =>
      Object.assign(
        makeCell(String(plo.number ?? pi + 1), {
          bold: true, bg: HEADER_BG, align: 'center', width: checkWidths[pi], height: HEADER1_H, fontSize: 12, verticalAlign: 'middle',
        }),
        { _header: true }
      )
    ),
  ]);

  // ── Data rows (row 2+): CLO label | check cells ───────────────────────────
  sortedCLOs.forEach((_clo, idx) => {
    const n = idx + 1;
    const rowH = getStoredRowHeight(idx + 2) ?? ROW_H;
    rows.push([
      makeCell(`{{clo_${n}_label}}`, {
        align: 'left', bg: 'transparent', width: LABEL_W, height: rowH, fontSize: 12, verticalAlign: 'top',
      }),
      ...sortedPLOs.map((_plo, pi) =>
        makeCell(`{{clo_${n}_plo_${pi + 1}}}`, {
          align: 'center', bg: 'transparent', width: checkWidths[pi], height: rowH, verticalAlign: 'middle',
        })
      ),
    ]);
  });

  return buildTableElement(rows, { ...pos, matrixType: 'clo-plo' });
}
