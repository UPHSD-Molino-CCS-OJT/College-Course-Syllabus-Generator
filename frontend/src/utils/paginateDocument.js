/**
 * paginateDocument — splits table elements that overflow the content zone
 * across consecutive canvas pages.
 *
 * Each split fragment is tagged with:
 *   paginationGroupId  — the original element's id (shared by all fragments)
 *   continuationIndex  — 0 for the first fragment, 1 for the second, etc.
 *
 * Calling paginateDocument again safely de-paginates first (merging all fragments
 * back into one element) before re-splitting, so repeated calls are idempotent.
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
 * Merge previously-split table fragments back into single elements.
 * Fragments with the same paginationGroupId are concatenated in continuationIndex
 * order back into the first-page fragment (which keeps the canonical id/position).
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

  // Build lookup: for each element (by pi+ei), what to do with it
  // 'keep-merged' → replace with merged element
  // 'remove'      → drop it (it was a continuation)
  const keepMerged = new Map();  // `${pi}-${ei}` → mergedElement
  const removeSet  = new Set();  // `${pi}-${ei}` keys to drop

  for (const frags of groups.values()) {
    const mergedData = frags.flatMap(f => f.el.data ?? []);
    const first = frags[0];
    const mergedEl = {
      ...first.el,
      data: mergedData,
      rows: mergedData.length,
      // Restore the canonical id (first fragment already has it)
      id: first.el.paginationGroupId,
      paginationGroupId: undefined,
      continuationIndex: undefined,
    };
    keepMerged.set(`${first.pi}-${first.ei}`, mergedEl);
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
 * Paginate a canvas document so that tables overflowing the content zone
 * are split across consecutive pages.
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

  // Step 2: walk through pages in order, splitting overflowing tables and
  // carrying remainder elements to the next page.
  let carry = []; // elements carried over from the previous page
  const resultPages = [];

  const splitPageElements = (elements, pageIdx) => {
    const kept     = [];
    const overflow = [];

    for (const el of elements) {
      if (el.type !== 'table' || !Array.isArray(el.data) || el.data.length === 0) {
        kept.push(el);
        continue;
      }

      const availableH = contentH - Math.max(0, el.y ?? 0);

      if (availableH <= 0) {
        // Table starts below the content zone — move it entirely to next page
        overflow.push({ ...el, y: 4, continuationIndex: (el.continuationIndex ?? 0) });
        continue;
      }

      // Find the row index where the table would first exceed available height
      let cumH = 0;
      let splitRow = -1;
      for (let r = 0; r < el.data.length; r++) {
        const rh = rowHeight(el.data[r], el.cellHeight);
        if (cumH + rh > availableH) {
          splitRow = r;
          break;
        }
        cumH += rh;
      }

      if (splitRow === -1) {
        // Entire table fits on this page
        kept.push(el);
        continue;
      }

      // Determine fragment identifiers
      const groupId = el.paginationGroupId ?? el.id;
      const curIndex = el.continuationIndex ?? 0;

      if (splitRow > 0) {
        // First portion stays on this page
        const firstRows = el.data.slice(0, splitRow);
        kept.push({
          ...el,
          id: curIndex === 0 ? el.id : el.id, // keep id for first fragment
          data: firstRows,
          rows: firstRows.length,
          paginationGroupId: groupId,
          continuationIndex: curIndex,
        });
      }
      // else: table doesn't even have a first row that fits — carry whole thing

      // Rest goes to the next page
      const restRows = el.data.slice(splitRow > 0 ? splitRow : 0);
      if (restRows.length > 0) {
        overflow.push({
          ...el,
          id: `${groupId}-cont-p${pageIdx + 1}`,
          data: restRows,
          rows: restRows.length,
          paginationGroupId: groupId,
          continuationIndex: curIndex + (splitRow > 0 ? 1 : 0),
          y: 4, // small top margin on continuation pages
        });
      }
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
 * Returns true if the canvas document has any tables that overflow
 * the content zone on their page.
 */
export function hasOverflowingTables(canvasDoc, currentPageSize) {
  const headerH = canvasDoc.header?.height ?? 80;
  const footerH = canvasDoc.footer?.height ?? 60;
  const contentH = currentPageSize.height - headerH - footerH;

  for (const page of canvasDoc.pages ?? []) {
    for (const el of page.elements) {
      if (el.type !== 'table' || !Array.isArray(el.data)) continue;
      const availableH = contentH - Math.max(0, el.y ?? 0);
      let cumH = 0;
      for (const row of el.data) {
        cumH += rowHeight(row, el.cellHeight);
        if (cumH > availableH) return true;
      }
    }
  }
  return false;
}
