/**
 * PLO × PEO matrix builder.
 */

import { makeCell, buildTableElement } from './shared.js';

/**
 * Build a PLO × PEO matrix table element.
 * @param {object[]} plos – populated from GET /plos
 * @param {object[]} peos – populated from GET /peos
 * @param {object}   [pos] – { x, y, existingData? }
 */
export function buildPLOPEOMatrix(plos, peos, pos) {
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

  const sortedPLOs = [...plos].sort((a, b) => (a.number || 0) - (b.number || 0));
  const sortedPEOs = [...peos].sort((a, b) => (a.number || 0) - (b.number || 0));
  const rows = [];

  sortedPLOs.forEach((_plo, idx) => {
    const n = idx + 1;
    const rowH = getStoredRowHeight(idx) ?? lastStoredRowHeight;
    const colWidths = sortedPEOs.map((_, pi) => getStoredColWidth(pi + 1));
    rows.push([
      makeCell(`{{plo_${n}_label}}`, {
        align: 'left', width: LABEL_W, height: rowH, fontSize: 12, verticalAlign: 'middle',
      }),
      ...sortedPEOs.map((_peo, pi) =>
        makeCell(`{{plo_${n}_peo_${pi + 1}}}`, {
          align: 'center', width: colWidths[pi], height: rowH, verticalAlign: 'middle',
        })
      ),
    ]);
  });

  return buildTableElement(rows, { ...pos, matrixType: 'plo-peo' });
}
