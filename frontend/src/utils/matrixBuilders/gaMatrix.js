/**
 * Graduate Attributes × Mission Keywords matrix builder.
 */

import {
  CHECK,
  GA_CATEGORY_ORDER,
  CATEG_BG,
  sortGAs,
  makeCell,
  buildTableElement,
} from './shared.js';

/**
 * Build a Graduate Attributes × Mission Keywords matrix table element.
 * @param {object[]} graduateAttributes  – populated from GET /graduate-attributes
 * @param {object[]} missionKeywords     – populated from GET /mission-keywords
 * @param {object}   [pos]               – { x, y, existingData? }
 */
export function buildGAMissionKeywordMatrix(graduateAttributes, missionKeywords, pos) {
  const mkCodes = missionKeywords.map((mk) => mk.code);

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

  const LABEL_W = getStoredColWidth(0);
  const CHECK_W = getStoredColWidth(1);

  const rows = [];
  let rowIndex = 0;

  const sortedAllGAs = sortGAs(graduateAttributes);
  let globalGAIdx = 0;

  GA_CATEGORY_ORDER.forEach((cat) => {
    const gaInCat = sortedAllGAs.filter((ga) => ga.category === cat);
    if (gaInCat.length === 0) return;

    const catH = getStoredRowHeight(rowIndex);
    rows.push([
      makeCell(cat, { bold: true, bg: CATEG_BG, align: 'left', width: LABEL_W, height: catH, fontSize: 12 }),
      ...mkCodes.map(() => makeCell('', { bg: CATEG_BG, width: CHECK_W, height: catH })),
    ]);
    rowIndex++;

    gaInCat.forEach(() => {
      globalGAIdx++;
      const rowH = getStoredRowHeight(rowIndex);
      rows.push([
        makeCell(`{{ga_${globalGAIdx}_label}}`, {
          align: 'left', width: LABEL_W, height: rowH, fontSize: 12, verticalAlign: 'middle',
        }),
        ...mkCodes.map((code) =>
          makeCell(`{{ga_${globalGAIdx}_mk_${code}}}`, {
            align: 'center', width: CHECK_W, height: rowH, verticalAlign: 'middle',
          })
        ),
      ]);
      rowIndex++;
    });
  });

  const uncategorised = sortedAllGAs.filter((ga) => !GA_CATEGORY_ORDER.includes(ga.category));
  if (uncategorised.length > 0) {
    const catH = getStoredRowHeight(rowIndex);
    rows.push([
      makeCell('OTHER', { bold: true, bg: CATEG_BG, align: 'left', width: LABEL_W, height: catH, fontSize: 12 }),
      ...mkCodes.map(() => makeCell('', { bg: CATEG_BG, width: CHECK_W, height: catH })),
    ]);
    rowIndex++;
    uncategorised.forEach(() => {
      globalGAIdx++;
      const rowH = getStoredRowHeight(rowIndex);
      rows.push([
        makeCell(`{{ga_${globalGAIdx}_label}}`, {
          align: 'left', width: LABEL_W, height: rowH, fontSize: 12, verticalAlign: 'middle',
        }),
        ...mkCodes.map((code) =>
          makeCell(`{{ga_${globalGAIdx}_mk_${code}}}`, {
            align: 'center', width: CHECK_W, height: rowH, verticalAlign: 'middle',
          })
        ),
      ]);
      rowIndex++;
    });
  }

  return buildTableElement(rows, { ...pos, matrixType: 'ga-mk' });
}
