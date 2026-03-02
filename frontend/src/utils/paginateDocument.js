/**
 * paginateDocument — splits elements that overflow the content zone
 * across consecutive canvas pages.
 *
 * Tables are split row-by-row; all other element types (text, image, line)
 * are moved wholesale to the next page when their bottom edge exceeds the
 * available content height.
 *
 * Each split/moved fragment is tagged with:
 *   paginationGroupId  — the original element's id (shared by all fragments)
 *   continuationIndex  — 0 for the first fragment, 1 for the second, etc.
 *
 * Calling paginateDocument again safely de-paginates first (merging table
 * fragments back and returning moved non-table elements to their source page)
 * before re-splitting, so repeated calls are idempotent.
 */

/** Get the height of a table row (reads from col-0 cell, falls back to table default). */
function rowHeight(row, fallbackCellHeight) {
  if (!row) return fallbackCellHeight ?? 40;
  for (const cell of row) {
    if (cell?.height != null) return cell.height;
  }
  return fallbackCellHeight ?? 40;
}

/**
 * Estimate the rendered height of a non-table element.
 * Uses the same heuristic as CanvasPage.jsx boundary constraints.
 */
function elementMeasuredHeight(el) {
  if (el.type === 'text')  return (el.fontSize || 14) + 10;
  if (el.type === 'image') return el.height || 100;
  if (el.type === 'line')  return el.strokeWidth || 2;
  if (el.type === 'table') {
    if (!Array.isArray(el.data)) return (el.rows ?? 1) * (el.cellHeight ?? 40);
    return el.data.reduce((s, row) => s + rowHeight(row, el.cellHeight), 0);
  }
  return el.height || 50;
}

/**
 * Merge previously-split/moved fragments back into single elements.
 * Table fragments with the same paginationGroupId are concatenated in
 * continuationIndex order. Non-table elements that were moved are returned
 * to their source page at their original y position.
 */
function dePaginate(pages) {
  // Gather all fragments grouped by paginationGroupId
  const groups = new Map(); // groupId → [ {pageIdx, elIdx, el} ] in doc order

  pages.forEach((page, pi) => {
    page.elements.forEach((el, ei) => {
      if (!el.paginationGroupId) return;
      if (!groups.has(el.paginationGroupId)) groups.set(el.paginationGroupId, []);
      groups.get(el.paginationGroupId).push({ pi, ei, el });
    });
  });

  if (groups.size === 0) return pages; // nothing to merge

  // Sort each group by continuationIndex ascending
  for (const arr of groups.values()) {
    arr.sort((a, b) => (a.el.continuationIndex ?? 0) - (b.el.continuationIndex ?? 0));
  }

  const keepMerged = new Map();  // `${pi}-${ei}` → mergedElement
  const removeSet  = new Set();  // `${pi}-${ei}` keys to drop

  for (const frags of groups.values()) {
    const first = frags[0];
    const isTable = Array.isArray(first.el.data) && first.el.type === 'table';

    if (isTable) {
      // Tables: concatenate row data from all fragments
      const mergedData = frags.flatMap(f => f.el.data ?? []);
      const mergedEl = {
        ...first.el,
        data: mergedData,
        rows: mergedData.length,
        id: first.el.paginationGroupId,
        paginationGroupId: undefined,
        continuationIndex: undefined,
        _overflowOriginalY: undefined,
      };
      keepMerged.set(`${first.pi}-${first.ei}`, mergedEl);
    } else {
      // Non-table: restore original y on the first (source) fragment
      const restoredEl = {
        ...first.el,
        id: first.el.paginationGroupId,
        y: first.el._overflowOriginalY ?? first.el.y,
        paginationGroupId: undefined,
        continuationIndex: undefined,
        _overflowOriginalY: undefined,
      };
      // The source fragment slot gets the restored element
      keepMerged.set(`${first.pi}-${first.ei}`, restoredEl);
    }
    frags.slice(1).forEach(({ pi, ei }) => removeSet.add(`${pi}-${ei}`));
  }

  return pages.map((page, pi) => ({
    ...page,
    elements: page.elements
      .map((el, ei) => {
        const key = `${pi}-${ei}`;
        if (removeSet.has(key)) return null;
        if (keepMerged.has(key)) return keepMerged.get(key);
        return el;
      })
      .filter(Boolean),
  }));
}

/**
 * Paginate a canvas document so that any element overflowing the content zone
 * is moved or split to the next page.
 *
 * - Tables are split row-by-row at the overflow boundary.
 * - All other element types are moved wholesale to the next page.
 *
 * @param {object} canvasDoc       – the full canvas document
 * @param {{ width: number, height: number }} currentPageSize
 * @returns {object} updated canvas document with pages adjusted
 */
export function paginateDocument(canvasDoc, currentPageSize) {
  const headerH = canvasDoc.header?.height ?? 80;
  const footerH = canvasDoc.footer?.height ?? 60;
  const contentH = currentPageSize.height - headerH - footerH;

  if (contentH <= 0) return canvasDoc; // degenerate — nothing to do

  // Step 1: merge any previously created fragments so we start clean
  const mergedPages = dePaginate(canvasDoc.pages ?? []);

  // Step 2: walk through pages in order, splitting/moving overflowing elements
  // and carrying remainder elements to the next page.
  let carry = [];
  const resultPages = [];

  const splitPageElements = (elements, pageIdx) => {
    const kept     = [];
    const overflow = [];

    for (const el of elements) {
      // ── Tables: split row-by-row ─────────────────────────────────────────
      if (el.type === 'table' && Array.isArray(el.data) && el.data.length > 0) {
        const availableH = contentH - Math.max(0, el.y ?? 0);

        if (availableH <= 0) {
          overflow.push({ ...el, y: 4, continuationIndex: (el.continuationIndex ?? 0) });
          continue;
        }

        let cumH = 0;
        let splitRow = -1;
        for (let r = 0; r < el.data.length; r++) {
          const rh = rowHeight(el.data[r], el.cellHeight);
          if (cumH + rh > availableH) { splitRow = r; break; }
          cumH += rh;
        }

        if (splitRow === -1) { kept.push(el); continue; } // fits entirely

        const groupId  = el.paginationGroupId ?? el.id;
        const curIndex = el.continuationIndex ?? 0;

        if (splitRow > 0) {
          const firstRows = el.data.slice(0, splitRow);
          kept.push({
            ...el,
            data: firstRows,
            rows: firstRows.length,
            paginationGroupId: groupId,
            continuationIndex: curIndex,
          });
        }

        const restRows = el.data.slice(splitRow > 0 ? splitRow : 0);
        if (restRows.length > 0) {
          overflow.push({
            ...el,
            id: `${groupId}-cont-p${pageIdx + 1}`,
            data: restRows,
            rows: restRows.length,
            paginationGroupId: groupId,
            continuationIndex: curIndex + (splitRow > 0 ? 1 : 0),
            y: 4,
          });
        }
        continue;
      }

      // ── Non-table elements: move whole if bottom edge exceeds content zone ─
      const elH   = elementMeasuredHeight(el);
      const elY   = el.y ?? 0;
      const bottom = elY + elH;

      if (bottom > contentH) {
        const groupId  = el.paginationGroupId ?? el.id;
        const curIndex = el.continuationIndex ?? 0;

        // Tag the source slot so dePaginate can restore position
        // (only for the very first move — continuations already have the tag)
        if (!el.paginationGroupId) {
          // Replace source with a placeholder entry that dePaginate will remove
          // by tagging the original element on this page so it gets cleaned up.
          // Actually: we keep a tagged placeholder on this page with no content
          // and the real element on the next page.
          // Simpler: just omit the element from this page and put it on the next.
          // dePaginate re-inserts it here using _overflowOriginalY.
        }

        overflow.push({
          ...el,
          id: el.paginationGroupId ? `${groupId}-cont-p${pageIdx + 1}` : `${groupId}-cont-p${pageIdx + 1}`,
          y: 4,
          paginationGroupId: groupId,
          continuationIndex: curIndex + 1,
          _overflowOriginalY: elY, // remember original y for de-pagination
        });

        if (!el.paginationGroupId) {
          // Keep a tombstone on this page so dePaginate can find the source slot
          kept.push({
            ...el,
            paginationGroupId: groupId,
            continuationIndex: 0,
            _overflowOriginalY: elY,
          });
        }
        continue;
      }

      kept.push(el);
    }

    return { kept, overflow };
  };

  for (let pi = 0; pi < mergedPages.length; pi++) {
    const page = mergedPages[pi];
    const elements = [...carry, ...page.elements];
    carry = [];

    const { kept, overflow } = splitPageElements(elements, pi);
    resultPages.push({ ...page, elements: kept });
    carry = overflow;
  }

  // If any carry remains after all existing pages, create new overflow pages
  while (carry.length > 0) {
    const pi = resultPages.length;
    const elements = carry.map(el => ({ ...el, y: 4 }));
    carry = [];

    const { kept, overflow } = splitPageElements(elements, pi);
    resultPages.push({
      id: `page-overflow-${pi}-${Date.now()}`,
      elements: kept,
    });
    carry = overflow;
  }

  return { ...canvasDoc, pages: resultPages };
}

/**
 * Returns true if any element in the canvas document overflows
 * the content zone on its page (tables or any other element type).
 */
export function hasOverflowingElements(canvasDoc, currentPageSize) {
  const headerH = canvasDoc.header?.height ?? 80;
  const footerH = canvasDoc.footer?.height ?? 60;
  const contentH = currentPageSize.height - headerH - footerH;

  for (const page of canvasDoc.pages ?? []) {
    for (const el of page.elements) {
      const elY = el.y ?? 0;

      if (el.type === 'table' && Array.isArray(el.data)) {
        const availableH = contentH - Math.max(0, elY);
        let cumH = 0;
        for (const row of el.data) {
          cumH += rowHeight(row, el.cellHeight);
          if (cumH > availableH) return true;
        }
      } else {
        const elH = elementMeasuredHeight(el);
        if (elY + elH > contentH) return true;
      }
    }
  }
  return false;
}

/**
 * Backward-compat alias — kept so existing callers that import
 * hasOverflowingTables continue to work.
 * @deprecated Use hasOverflowingElements instead.
 */
export const hasOverflowingTables = hasOverflowingElements;
