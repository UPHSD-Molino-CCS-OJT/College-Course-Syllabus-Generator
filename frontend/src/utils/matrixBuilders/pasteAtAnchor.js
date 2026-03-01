/**
 * pasteAtAnchor — paste a source matrix onto an existing table starting at a given cell.
 *
 * Expands or trims rows and columns so the table exactly fits the matrix from the anchor
 * point. Rows/cols before the anchor are kept intact. Existing cell styles (font, colour,
 * bg, borders) are preserved; only `content` is overwritten from the matrix source.
 *
 * @param {object[][]} existingData – current 2-D table data
 * @param {object[][]} matrixData   – new matrix data to paste
 * @param {number}     anchorRow    – 0-based row in existingData where paste starts
 * @param {number}     anchorCol    – 0-based col in existingData where paste starts
 * @returns {{ data: object[][], rows: number, cols: number }}
 */
export function pasteAtAnchor(existingData, matrixData, anchorRow, anchorCol) {
  const matrixRows = matrixData.length;
  const matrixCols = matrixData[0]?.length ?? 0;
  const targetRowCount = anchorRow + matrixRows;
  const targetColCount = anchorCol + matrixCols;

  // Deep copy
  let merged = existingData.map((row) => row.map((cell) => ({ ...cell })));

  // Expand rows if the matrix extends beyond the current bottom
  while (merged.length < targetRowCount) {
    const templateRow = merged[merged.length - 1] ?? [];
    merged.push(templateRow.map((cell) => ({ ...cell, content: '' })));
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
          // Static header cells always win — use the builder's canonical content and styles
          if (srcCell._header) {
            row[anchorCol + c] = { ...srcCell };
          } else {
            const srcIsHeader = srcCell.fontWeight === 'bold';
            row[anchorCol + c] = {
              ...row[anchorCol + c],
              content:    srcCell.content    ?? '',
              fontWeight: srcCell.fontWeight, // always enforce builder: bold for category rows, normal for data rows
              bg:         srcIsHeader ? srcCell.bg       : (row[anchorCol + c].bg        ?? srcCell.bg),
              align:      srcCell.align,      // always use canonical builder alignment
              fontSize:   srcIsHeader ? srcCell.fontSize : (row[anchorCol + c].fontSize  ?? srcCell.fontSize),
              fontStyle:  srcIsHeader ? srcCell.fontStyle: (row[anchorCol + c].fontStyle ?? srcCell.fontStyle),
            };
          }
        }
      }
    }
    return row;
  });

  return { data: merged, rows: targetRowCount, cols: targetColCount };
}
