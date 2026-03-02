/**
 * paginateDocument — splits overflow elements across consecutive canvas pages.
 *
 * Tables  → split row-by-row at the page boundary; continuation rows appear on
 *            the next page, column widths / table styles are preserved.
 * Others  → moved wholesale to the next page when their bottom edge overflows.
 *
 * Tagging schema (allows idempotent re-pagination):
 *   paginationGroupId   — original element id shared by every fragment
 *   continuationIndex   — 0 for the first kept fragment, 1+ for continuations
 *
 * dePaginate() is called first on every paginateDocument() invocation so that:
 *   - split table rows are merged back into one element before re-splitting
 *   - moved non-table elements on overflow pages are cleaned-up in place
 *     (they stay on the overflow page — no automatic bounce-back to source page)
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
 * Undo a previous pagination pass so that paginateDocument can start fresh.
 *
 * Tables  : all fragments for a paginationGroupId are merged (rows concatenated)
 *           back into the first fragment's page position.
 * Others  : the tombstone / intermediate fragments are removed; the LAST fragment
 *           (the one on the overflow page) is cleaned up in-place.
 *           Non-table elements do NOT jump back to their source page.
 */
function dePaginate(pages) {
  const groups = new Map(); // groupId → [{pi, ei, el}]

  pages.forEach((page, pi) => {
    page.elements.forEach((el, ei) => {
      if (!el.paginationGroupId) return;
      const g = el.paginationGroupId;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push({ pi, ei, el });
    });
  });

  if (groups.size === 0) return pages;

  for (const arr of groups.values()) {
    arr.sort((a, b) => (a.el.continuationIndex ?? 0) - (b.el.continuationIndex ?? 0));
  }

  const keepMerged = new Map(); // `${pi}-${ei}` → replacement element
  const removeSet  = new Set(); // `${pi}-${ei}` → drop this slot

  for (const frags of groups.values()) {
    const isTable = frags[0].el.type === 'table' && Array.isArray(frags[0].el.data);

    if (isTable) {
      // Merge all row data back into the first fragment's slot
      const first      = frags[0];
      const mergedData = frags.flatMap(f => f.el.data ?? []);
      keepMerged.set(`${first.pi}-${first.ei}`, {
        ...first.el,
        data:              mergedData,
        rows:              mergedData.length,
        id:                first.el.paginationGroupId,
        paginationGroupId: undefined,
        continuationIndex: undefined,
      });
      frags.slice(1).forEach(({ pi, ei }) => removeSet.add(`${pi}-${ei}`));
    } else {
      // Keep only the LAST fragment (real element on overflow page),
      // drop any earlier tombstones from the source page.
      const last = frags[frags.length - 1];
      keepMerged.set(`${last.pi}-${last.ei}`, {
        ...last.el,
        id:                last.el.paginationGroupId,
        paginationGroupId: undefined,
        continuationIndex: undefined,
      });
      frags.slice(0, -1).forEach(({ pi, ei }) => removeSet.add(`${pi}-${ei}`));
    }
  }

  return pages.map((page, pi) => ({
    ...page,
    elements: page.elements
      .map((el, ei) => {
        const key = `${pi}-${ei}`;
        if (removeSet.has(key))  return null;
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

  // Step 2 — walk pages, split/move overflowing elements, carry remainder forward
  let   carry       = [];
  const resultPages = [];

  const splitPage = (elements, pageIdx) => {
    const kept     = [];
    const overflow = [];

    for (const el of elements) {

      // ── Tables ───────────────────────────────────────────────────────────
      if (el.type === 'table' && Array.isArray(el.data) && el.data.length > 0) {
        const elY        = el.y ?? 0;
        const availableH = contentH - Math.max(0, elY);

        // Table starts at or below the fold → move entirely to next page.
        // Guard: if already at the very top (y ≤ 4) accept it here to prevent
        // an infinite loop when a single row is taller than the content zone.
        if (availableH <= 0) {
          if (elY <= 4) {
            kept.push(el);
          } else {
            const groupId = el.paginationGroupId ?? el.id;
            overflow.push({
              ...el,
              y:                 4,
              paginationGroupId: groupId,
              continuationIndex: el.continuationIndex ?? 0,
            });
          }
          continue;
        }

        let cumH     = 0;
        let splitRow = -1;
        for (let r = 0; r < el.data.length; r++) {
          const rh = rowHeight(el.data[r], el.cellHeight);
          if (cumH + rh > availableH) { splitRow = r; break; }
          cumH += rh;
        }

        if (splitRow === -1) { kept.push(el); continue; } // fits entirely

        // splitRow === 0: not even the first row fits.
        // Guard: if already at top, leave it to prevent infinite carry.
        if (splitRow === 0 && elY <= 4) { kept.push(el); continue; }

        const groupId  = el.paginationGroupId ?? el.id;
        const curIndex = el.continuationIndex ?? 0;

        if (splitRow > 0) {
          const firstRows = el.data.slice(0, splitRow);
          kept.push({
            ...el,
            data:              firstRows,
            rows:              firstRows.length,
            paginationGroupId: groupId,
            continuationIndex: curIndex,
          });
        }
        // If splitRow === 0 (but elY > 4), the whole table is moved below.

        const restRows = el.data.slice(Math.max(splitRow, 0));
        if (restRows.length > 0) {
          overflow.push({
            ...el,
            id:                `${groupId}-cont-p${pageIdx + 1}`,
            data:              restRows,
            rows:              restRows.length,
            paginationGroupId: groupId,
            continuationIndex: curIndex + (splitRow > 0 ? 1 : 0),
            y:                 4,
          });
        }
        continue;
      }

      // ── Non-table elements ────────────────────────────────────────────────
      const elY    = el.y ?? 0;
      const elH    = elementMeasuredHeight(el);
      const bottom = elY + elH;

      if (bottom > contentH) {
        // Guard: already at top — can't push further up.
        if (elY <= 4) { kept.push(el); continue; }

        const groupId  = el.paginationGroupId ?? el.id;
        const curIndex = el.continuationIndex ?? 0;

        // Move to next page — no tombstone (tombstones cause infinite loops in
        // hasOverflowingElements because they share the original overflowing y).
        overflow.push({
          ...el,
          id:                `${groupId}-cont-p${pageIdx + 1}`,
          y:                 4,
          paginationGroupId: groupId,
          continuationIndex: curIndex + 1,
        });
        continue;
      }

      kept.push(el);
    }

    return { kept, overflow };
  };

  for (let pi = 0; pi < mergedPages.length; pi++) {
    const page     = mergedPages[pi];
    const elements = [...carry, ...page.elements];
    carry          = [];

    const { kept, overflow } = splitPage(elements, pi);
    resultPages.push({ ...page, elements: kept });
    carry = overflow;
  }

  // Spill remaining carry into new overflow pages.
  // Safety cap prevents runaway loops when content is impossibly large.
  const maxNewPages = (mergedPages.length || 1) + 50;
  while (carry.length > 0 && resultPages.length < maxNewPages) {
    const pi       = resultPages.length;
    const elements = carry.map(el => ({ ...el, y: Math.max(el.y ?? 0, 4) }));
    carry          = [];

    const { kept, overflow } = splitPage(elements, pi);
    resultPages.push({
      id:       `page-overflow-${pi}`,
      elements: kept,
    });
    carry = overflow;
  }

  return { ...canvasDoc, pages: resultPages };
}

/**
 * Returns true when any element's bottom edge exceeds the content zone height,
 * ignoring elements that are already on an overflow page (continuationIndex ≥ 1)
 * or are guarded at the top of the page (y ≤ 4) where they can't be moved further.
 */
export function hasOverflowingElements(canvasDoc, currentPageSize) {
  const headerH  = canvasDoc.header?.height ?? 80;
  const footerH  = canvasDoc.footer?.height ?? 60;
  const contentH = currentPageSize.height - headerH - footerH;

  for (const page of canvasDoc.pages ?? []) {
    for (const el of page.elements) {
      // Already-moved overflow fragments shouldn't re-trigger pagination
      if (el.paginationGroupId && (el.continuationIndex ?? 0) >= 1) continue;

      const elY = el.y ?? 0;
      // Elements pinned at the top (y ≤ 4) can't be moved — don't trigger
      if (elY <= 4) continue;

      if (el.type === 'table' && Array.isArray(el.data)) {
        const availableH = contentH - Math.max(0, elY);
        if (availableH <= 0) return true;
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
