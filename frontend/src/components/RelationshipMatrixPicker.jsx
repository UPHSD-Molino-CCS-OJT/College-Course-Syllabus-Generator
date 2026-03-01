import { useState, useMemo } from 'react';
import { missionKeywordAPI, graduateAttributeAPI, peoAPI, ploAPI, cloAPI } from '../services/api';
import {
  buildGAMissionKeywordMatrix,
  buildPEOGAMatrix,
  buildPLOPEOMatrix,
  buildCLOPLOMatrix,
} from '../utils/templateRenderer';

const MAX_PREVIEW_ROWS = 14;
const MAX_PREVIEW_COLS = 14;

const MATRICES = [
  {
    id: 'ga-mk',
    label: 'Graduate Attributes × Mission Keywords',
    description: 'Checkmark matrix showing which Graduate Attributes relate to each Mission Keyword (A–F).',
    icon: '🎯',
    color: 'blue',
  },
  {
    id: 'peo-ga',
    label: 'PEOs × Graduate Attributes',
    description: 'Program Educational Objectives mapped against all Graduate Attributes (GA1–GA11).',
    icon: '📚',
    color: 'green',
  },
  {
    id: 'plo-peo',
    label: 'PLOs × Program Educational Objectives',
    description: 'Program Learning Outcomes mapped against the Program Educational Objectives.',
    icon: '🎓',
    color: 'purple',
  },
  {
    id: 'clo-plo',
    label: 'CLOs × Program Learning Outcomes',
    description: 'Course Learning Outcomes mapped against the Program Learning Outcomes.',
    icon: '📝',
    color: 'orange',
  },
];

const COLOR_MAP = {
  blue:   { card: 'border-blue-500 bg-blue-900/20 hover:bg-blue-900/40',   badge: 'bg-blue-600' },
  green:  { card: 'border-green-500 bg-green-900/20 hover:bg-green-900/40', badge: 'bg-green-600' },
  purple: { card: 'border-purple-500 bg-purple-900/20 hover:bg-purple-900/40', badge: 'bg-purple-600' },
  orange: { card: 'border-orange-500 bg-orange-900/20 hover:bg-orange-900/40', badge: 'bg-orange-600' },
};

/** Collect every table element from a canvasDocument with zone/page metadata */
function getTemplateTables(canvasDocument) {
  if (!canvasDocument) return [];
  const results = [];
  const collect = (elements, zone, pageIndex, pageLabel) => {
    (elements || []).forEach((el, ei) => {
      if (el.type === 'table') {
        results.push({
          element: el,
          zone,
          pageIndex,
          label: `${pageLabel} — Table ${ei + 1} (${el.data?.[0]?.length ?? '?'} cols × ${el.data?.length ?? '?'} rows)`,
        });
      }
    });
  };
  collect(canvasDocument.header?.elements, 'header', null, 'Header');
  collect(canvasDocument.footer?.elements, 'footer', null, 'Footer');
  (canvasDocument.pages || []).forEach((page, pi) => {
    collect(page.elements, 'page', pi, `Page ${pi + 1}`);
  });
  return results;
}

/**
 * Overlay matrixData onto a deep-copy of existingData starting at cell (originRow, originCol).
 * Cells outside the existing table's bounds are silently clipped.
 */
function mergeCells(existingData, matrixData, originRow, originCol) {
  const merged = existingData.map(row => row.map(cell => ({ ...cell })));
  for (let r = 0; r < matrixData.length; r++) {
    for (let c = 0; c < (matrixData[r]?.length ?? 0); c++) {
      const tr = originRow + r;
      const tc = originCol + c;
      if (tr < merged.length && tc < (merged[tr]?.length ?? 0)) {
        merged[tr][tc] = { ...matrixData[r][c] };
      }
    }
  }
  return merged;
}

/** Fetch matrix data from the API and return a built table element. Throws on empty data. */
async function fetchMatrixElement(matrixId) {
  if (matrixId === 'ga-mk') {
    const [gaRes, mkRes] = await Promise.all([
      graduateAttributeAPI.getAll({ limit: 100 }),
      missionKeywordAPI.getAll({ limit: 50 }),
    ]);
    const gas = gaRes.data?.graduateAttributes || [];
    const mks = mkRes.data?.missionKeywords || [];
    if (!gas.length || !mks.length) throw new Error('No Graduate Attributes or Mission Keywords found.');
    return buildGAMissionKeywordMatrix(gas, mks);
  }
  if (matrixId === 'peo-ga') {
    const [peoRes, gaRes] = await Promise.all([
      peoAPI.getAll({ limit: 100 }),
      graduateAttributeAPI.getAll({ limit: 100 }),
    ]);
    const peos = peoRes.data?.peos || [];
    const gas  = gaRes.data?.graduateAttributes || [];
    if (!peos.length || !gas.length) throw new Error('No PEOs or Graduate Attributes found.');
    return buildPEOGAMatrix(peos, gas);
  }
  if (matrixId === 'plo-peo') {
    const [ploRes, peoRes] = await Promise.all([
      ploAPI.getAll({ limit: 100 }),
      peoAPI.getAll({ limit: 100 }),
    ]);
    const plos = ploRes.data?.plos || [];
    const peos = peoRes.data?.peos || [];
    if (!plos.length || !peos.length) throw new Error('No PLOs or PEOs found.');
    return buildPLOPEOMatrix(plos, peos);
  }
  if (matrixId === 'clo-plo') {
    const [cloRes, ploRes] = await Promise.all([
      cloAPI.getAll({ limit: 100 }),
      ploAPI.getAll({ limit: 100 }),
    ]);
    const clos = cloRes.data?.clos || [];
    const plos = ploRes.data?.plos || [];
    if (!clos.length || !plos.length) throw new Error('No CLOs or PLOs found.');
    return buildCLOPLOMatrix(clos, plos);
  }
  throw new Error('Unknown matrix type.');
}

export default function RelationshipMatrixPicker({ canvasDocument, onInsert, onUpdate, onClose }) {
  // step: 'matrix' → 'target' → 'cell'
  const [step, setStep]           = useState('matrix');
  const [matrixId, setMatrixId]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // Step 3 state
  const [selectedTarget, setSelectedTarget]   = useState(null); // { element, zone, pageIndex, label }
  const [builtMatrixData, setBuiltMatrixData] = useState(null); // 2-D array from builder
  const [originCell, setOriginCell]           = useState(null); // { row, col } — chosen top-left corner
  const [hoverCell, setHoverCell]             = useState(null); // { row, col } — hover highlight

  const templateTables = useMemo(() => getTemplateTables(canvasDocument), [canvasDocument]);

  // ── Step 1 → Step 2 ──────────────────────────────────────────────────────────
  const handlePickMatrix = (id) => {
    setMatrixId(id);
    setError(null);
    setStep('target');
  };

  // ── Step 2: pick target ───────────────────────────────────────────────────────
  // target === null  → "insert as new" (fetches and commits immediately)
  // target is a table descriptor → fetch data, then go to step 'cell'
  const handlePickTarget = async (target) => {
    setLoading(true);
    setError(null);
    try {
      const element = await fetchMatrixElement(matrixId);
      if (!target) {
        onInsert(element);
      } else {
        setBuiltMatrixData(element.data);
        setSelectedTarget(target);
        setOriginCell(null);
        setHoverCell(null);
        setStep('cell');
      }
    } catch (err) {
      console.error('Failed to build matrix:', err);
      setError(err.message || 'Failed to fetch data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: confirm origin cell → merge → commit ──────────────────────────
  const handleConfirmOrigin = () => {
    if (!originCell || !selectedTarget || !builtMatrixData) return;
    const merged = mergeCells(
      selectedTarget.element.data,
      builtMatrixData,
      originCell.row,
      originCell.col,
    );
    onUpdate(selectedTarget.element.id, selectedTarget.zone, selectedTarget.pageIndex, merged);
  };

  // ── Step 3 helpers ────────────────────────────────────────────────────────────
  const selectedMatrix = MATRICES.find((m) => m.id === matrixId);

  /** Whether cell (r, c) falls inside the matrix region anchored at `origin` */
  const inRange = (r, c, origin) => {
    if (!origin || !builtMatrixData) return false;
    return (
      r >= origin.row &&
      r <  origin.row + builtMatrixData.length &&
      c >= origin.col &&
      c <  origin.col + (builtMatrixData[0]?.length ?? 0)
    );
  };

  const tableRows   = selectedTarget?.element?.data ?? [];
  const previewRows = tableRows.slice(0, MAX_PREVIEW_ROWS);
  const previewCols = previewRows[0]?.length ?? 0;
  const clampedCols = Math.min(previewCols, MAX_PREVIEW_COLS);
  const hiddenRows  = tableRows.length - previewRows.length;
  const hiddenCols  = Math.max(0, previewCols - MAX_PREVIEW_COLS);

  const matRows = builtMatrixData?.length ?? 0;
  const matCols = builtMatrixData?.[0]?.length ?? 0;

  const overflowWarning = originCell
    ? (() => {
        const rowOvf = Math.max(0, originCell.row + matRows - tableRows.length);
        const colOvf = Math.max(0, originCell.col + matCols - previewCols);
        if (rowOvf > 0 && colOvf > 0)
          return `${rowOvf} row(s) and ${colOvf} col(s) of matrix data will be clipped (outside table bounds).`;
        if (rowOvf > 0) return `${rowOvf} row(s) of matrix data will be clipped (outside table bounds).`;
        if (colOvf > 0) return `${colOvf} col(s) of matrix data will be clipped (outside table bounds).`;
        return null;
      })()
    : null;

  const stepLabel = step === 'matrix'
    ? 'Step 1 of 3 — Choose a matrix type'
    : step === 'target'
    ? `Step 2 of 3 — Where to place the ${selectedMatrix?.label}?`
    : 'Step 3 of 3 — Click a cell to set the top-left corner';

  const handleBack = () => {
    if (step === 'target') { setStep('matrix'); setError(null); }
    if (step === 'cell')   { setStep('target'); setOriginCell(null); setHoverCell(null); setError(null); }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            {step !== 'matrix' && (
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white transition-colors text-sm"
                aria-label="Back"
              >
                ← Back
              </button>
            )}
            <div>
              <h2 className="text-white font-bold text-xl">📊 Relationship Matrix</h2>
              <p className="text-gray-400 text-sm mt-0.5">{stepLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 bg-red-900/50 border border-red-600 text-red-300 rounded-lg px-4 py-3 text-sm shrink-0">
            ⚠️ {error}
          </div>
        )}

        {/* ── Step 1: Pick Matrix Type ── */}
        {step === 'matrix' && (
          <div className="p-6 grid grid-cols-1 gap-3 overflow-y-auto">
            {MATRICES.map((m) => {
              const colors = COLOR_MAP[m.color];
              return (
                <button
                  key={m.id}
                  onClick={() => handlePickMatrix(m.id)}
                  className={`w-full text-left border rounded-xl px-5 py-4 transition-all duration-150 ${colors.card} cursor-pointer`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-white font-semibold text-sm">{m.label}</span>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">{m.description}</p>
                    </div>
                    <span className="text-gray-500 text-lg shrink-0">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Step 2: Pick Target Table ── */}
        {step === 'target' && (
          <div className="p-6 space-y-3 overflow-y-auto">
            <p className="text-gray-400 text-xs">
              Select an existing table from your template — you will then pick exactly which cell to start from.
              Or insert the matrix as a brand-new element.
            </p>

            {templateTables.length > 0 && (
              <>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide pt-1">
                  Existing tables in this template
                </p>
                {templateTables.map((t, i) => (
                  <button
                    key={t.element.id ?? i}
                    onClick={() => handlePickTarget(t)}
                    disabled={loading}
                    className="w-full text-left border border-amber-600 bg-amber-900/20 hover:bg-amber-900/40 rounded-xl px-5 py-4 transition-all duration-150 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🗃️</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-amber-300 font-semibold text-sm">{t.label}</span>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {t.element.data?.length ?? 0} rows × {t.element.data?.[0]?.length ?? 0} cols
                          {' — '}you will choose the starting cell
                        </p>
                      </div>
                      {loading
                        ? <span className="text-amber-400 animate-pulse text-sm">⏳</span>
                        : <span className="text-gray-500 text-lg">→</span>}
                    </div>
                  </button>
                ))}
                <div className="border-t border-gray-700 pt-3" />
              </>
            )}

            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
              Or insert as a new element
            </p>
            <button
              onClick={() => handlePickTarget(null)}
              disabled={loading}
              className="w-full text-left border border-blue-600 bg-blue-900/20 hover:bg-blue-900/40 rounded-xl px-5 py-4 transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">➕</span>
                <div className="flex-1 min-w-0">
                  <span className="text-blue-300 font-semibold text-sm">Insert as new table</span>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Adds a new table element to the current canvas zone at position (60, 100)
                  </p>
                </div>
                {loading
                  ? <span className="text-blue-400 animate-pulse text-sm">⏳</span>
                  : <span className="text-gray-500 text-lg">→</span>}
              </div>
            </button>

            {templateTables.length === 0 && (
              <p className="text-gray-500 text-xs text-center pt-2">
                No tables found in this template — only the "new table" option is available.
              </p>
            )}
          </div>
        )}

        {/* ── Step 3: Cell Picker ── */}
        {step === 'cell' && (
          <div className="flex flex-col overflow-hidden flex-1">

            {/* Info bar */}
            <div className="px-6 pt-4 pb-2 shrink-0 space-y-1.5">
              <p className="text-gray-300 text-sm font-semibold">{selectedTarget?.label}</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Matrix to insert:{' '}
                <span className="text-indigo-300 font-semibold">{matRows} rows × {matCols} cols</span>
                {' '}({selectedMatrix?.label}). Click any cell below to set the top-left corner.
                <span className="text-blue-300"> Blue</span> = hover region;
                <span className="text-emerald-300"> green</span> = confirmed origin.
              </p>
              {overflowWarning && (
                <p className="text-yellow-400 text-xs bg-yellow-900/30 border border-yellow-700 rounded px-3 py-1.5">
                  ⚠️ {overflowWarning}
                </p>
              )}
            </div>

            {/* Scrollable table grid */}
            <div className="flex-1 overflow-auto px-6 pb-2">
              <table className="border-collapse select-none" style={{ tableLayout: 'fixed' }}>
                <tbody>
                  {previewRows.map((row, r) => (
                    <tr key={r}>
                      {row.slice(0, MAX_PREVIEW_COLS).map((cell, c) => {
                        const isSelected = inRange(r, c, originCell);
                        const isHovered  = !isSelected && inRange(r, c, hoverCell);
                        const cellW = cell?.width  ?? selectedTarget?.element?.cellWidth;
                        const cellH = cell?.height ?? selectedTarget?.element?.cellHeight;
                        // Strip HTML tags for preview text
                        const rawText = String(cell?.content ?? '').replace(/<[^>]+>/g, '').slice(0, 18);
                        return (
                          <td
                            key={c}
                            className="relative border border-gray-400 cursor-pointer overflow-hidden"
                            style={{
                              width:           cellW,
                              minWidth:        cellW,
                              maxWidth:        cellW,
                              height:          cellH,
                              maxHeight:       cellH,
                              backgroundColor: cell?.bg,
                              fontSize:        cell?.fontSize,
                              fontFamily:      cell?.fontFamily,
                              fontWeight:      cell?.fontWeight,
                              fontStyle:       cell?.fontStyle,
                              color:           cell?.color,
                              textAlign:       cell?.align,
                              padding:         '2px 4px',
                              verticalAlign:   'top',
                            }}
                            onMouseEnter={() => setHoverCell({ row: r, col: c })}
                            onMouseLeave={() => setHoverCell(null)}
                            onClick={() => setOriginCell({ row: r, col: c })}
                            title={`Row ${r + 1}, Col ${c + 1}${isSelected ? ' — origin' : ''}`}
                          >
                            {/* Highlight overlay — sits above cell background, below text */}
                            {(isSelected || isHovered) && (
                              <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  backgroundColor: isSelected ? 'rgba(16,185,129,0.35)' : 'rgba(59,130,246,0.30)',
                                  boxShadow: isSelected
                                    ? 'inset 0 0 0 2px #10b981'
                                    : 'inset 0 0 0 1.5px #3b82f6',
                                }}
                              />
                            )}
                            <span className="block truncate leading-tight whitespace-nowrap">
                              {rawText || ''}
                            </span>
                          </td>
                        );
                      })}
                      {hiddenCols > 0 && (
                        <td className="text-gray-500 border border-gray-700 px-1 text-center text-xs italic">…</td>
                      )}
                    </tr>
                  ))}
                  {hiddenRows > 0 && (
                    <tr>
                      <td
                        colSpan={clampedCols + (hiddenCols > 0 ? 1 : 0)}
                        className="text-gray-500 border border-gray-700 px-2 py-1 text-center text-xs italic"
                      >
                        … {hiddenRows} more row(s) not shown in preview
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Confirm bar */}
            <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between shrink-0">
              <span className="text-gray-400 text-xs">
                {originCell
                  ? `Starting at row ${originCell.row + 1}, col ${originCell.col + 1}`
                  : 'No cell selected — click the grid above'}
              </span>
              <button
                onClick={handleConfirmOrigin}
                disabled={!originCell}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg text-sm transition-colors"
              >
                ✓ Place Matrix Here
              </button>
            </div>
          </div>
        )}

        {/* Footer hint (hidden in step 3 — confirm bar takes over) */}
        {step !== 'cell' && (
          <div className="px-6 pb-4 text-xs text-gray-600 text-center shrink-0">
            {step === 'matrix'
              ? 'Choose a matrix type to continue.'
              : 'Choosing an existing table lets you place the matrix into any cell region.'}
          </div>
        )}
      </div>
    </div>
  );
}
