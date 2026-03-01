/**
 * PEO × Graduate Attributes matrix builder.
 */

import { sortGAs, makeCell, buildTableElement } from './shared.js';

/**
 * Build a PEO × Graduate Attributes matrix table element.
 * @param {object[]} peos               – populated from GET /peos
 * @param {object[]} graduateAttributes – populated from GET /graduate-attributes
 * @param {object}   [pos]              – { x, y, existingData? }
 */
export function buildPEOGAMatrix(peos, graduateAttributes, pos) {
  const existingData = pos?.existingData || null;

  const getStoredColWidth = (colIndex) => {
    if (!existingData) return undefined;
    for (const row of existingData) {
      const w = row?.[colIndex]?.width;
      if (w != null) return w;
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

  const lastStoredRowHeight = (() => {
    if (!existingData) return undefined;
    for (let r = existingData.length - 1; r >= 0; r--) {
      const h = getStoredRowHeight(r);
      if (h != null) return h;
    }
    return undefined;
  })();

  const LABEL_W = getStoredColWidth(0);

  const sortedPEOs = [...peos].sort((a, b) => (a.number || 0) - (b.number || 0));
  const sortedGAsForCols = sortGAs(graduateAttributes);
  const rows = [];

  sortedPEOs.forEach((_peo, idx) => {
    const n = idx + 1;
    const rowH = getStoredRowHeight(idx) ?? lastStoredRowHeight;
    const colWidths = sortedGAsForCols.map((_, gi) => getStoredColWidth(gi + 1));
    rows.push([
      makeCell(`{{peo_${n}_label}}`, {
        align: 'left', width: LABEL_W, height: rowH, fontSize: 12, verticalAlign: 'middle',
      }),
      ...sortedGAsForCols.map((_ga, gi) =>
        makeCell(`{{peo_${n}_ga_${gi + 1}}}`, {
          align: 'center', width: colWidths[gi], height: rowH, verticalAlign: 'middle',
        })
      ),
    ]);
  });

  return buildTableElement(rows, { ...pos, matrixType: 'peo-ga' });
}
