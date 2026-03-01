/**
 * Shared constants, helpers, and low-level primitives used by all matrix builders.
 */

export const CHECK = '✔';

/** Category order used to sort GAs consistently between the builder and the resolver */
export const GA_CATEGORY_ORDER = ['CHARACTER', 'COMPETENCE', 'COMMITMENT TO SERVICE'];

export const CATEG_BG = '#ffffff'; // white background for category rows

/**
 * Return a copy of `graduateAttributes` sorted by canonical category order then by number.
 * This ensures the builder and the resolver always agree on which GA is "GA #N".
 */
export function sortGAs(graduateAttributes) {
  return [...graduateAttributes].sort((a, b) => {
    const ai = GA_CATEGORY_ORDER.indexOf(a.category);
    const bi = GA_CATEGORY_ORDER.indexOf(b.category);
    if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return (a.number || 0) - (b.number || 0);
  });
}

/** Shared cell factory */
export function makeCell(
  content,
  {
    bold = false,
    bg = '#ffffff',
    align = 'center',
    width = undefined,
    height = undefined,
    fontSize = 12,
    color = '#000000',
    italic = false,
    verticalAlign = 'middle',
  } = {}
) {
  const cell = {
    content,
    fontSize,
    fontFamily: 'Arial',
    fontWeight: bold ? 'bold' : 'normal',
    fontStyle: italic ? 'italic' : 'normal',
    color,
    align,
    verticalAlign,
    bg,
  };
  if (width  !== undefined) cell.width  = width;
  if (height !== undefined) cell.height = height;
  return cell;
}

/** Build a canvas table element from a 2-D array of cell descriptors */
export function buildTableElement(rows2d, { x = 60, y = 100, matrixType = null } = {}) {
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

/**
 * Helpers for reading back stored column widths and row heights from existing canvas data.
 * Each returns a getter function closed over `existingData`.
 */
export function makeStoredDimensionReaders(existingData, { dataRowStart = 0 } = {}) {
  const getStoredColWidth = (colIndex) => {
    if (!existingData) return undefined;
    for (let r = dataRowStart; r < existingData.length; r++) {
      const w = existingData[r]?.[colIndex]?.width;
      if (w != null) return w;
    }
    if (dataRowStart > 0) {
      for (let r = dataRowStart - 1; r >= 0; r--) {
        const w = existingData[r]?.[colIndex]?.width;
        if (w != null) return w;
      }
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

  return { getStoredColWidth, getStoredRowHeight };
}
