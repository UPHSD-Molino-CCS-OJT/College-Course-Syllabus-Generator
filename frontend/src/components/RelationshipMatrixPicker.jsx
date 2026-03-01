import { useState, useMemo } from 'react';
import { missionKeywordAPI, graduateAttributeAPI, peoAPI, ploAPI, cloAPI } from '../services/api';
import {
  buildGAMissionKeywordMatrix,
  buildPEOGAMatrix,
  buildPLOPEOMatrix,
  buildCLOPLOMatrix,
  pasteAtAnchor,
} from '../utils/templateRenderer';

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
 * Compute all cell positions that are hidden (covered) by a colspan/rowspan ancestor.
 * Returns a Set of "row-col" strings.
 */
function computeCoveredCells(data) {
  const covered = new Set();
  data.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      const cs = cell?.colspan || 1;
      const rs = cell?.rowspan || 1;
      if (cs > 1 || rs > 1) {
        for (let dr = 0; dr < rs; dr++) {
          for (let dc = 0; dc < cs; dc++) {
            if (dr === 0 && dc === 0) continue;
            covered.add(`${rIdx + dr}-${cIdx + dc}`);
          }
        }
      }
    });
  });
  return covered;
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
  // step: 'matrix' → 'target' → 'anchor'
  const [step, setStep]           = useState('matrix');
  const [matrixId, setMatrixId]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // Step 3 state
  const [selectedTarget, setSelectedTarget] = useState(null); // { element, zone, pageIndex, label }
  const [builtMatrixData, setBuiltMatrixData] = useState(null); // 2-D array from builder
  const [anchor, setAnchor]       = useState(null); // { row, col } — top-left paste position in target

  const templateTables = useMemo(() => getTemplateTables(canvasDocument), [canvasDocument]);

  // Covered cells in target (from colspan/rowspan)
  const coveredCells = useMemo(
    () => selectedTarget ? computeCoveredCells(selectedTarget.element.data) : new Set(),
    [selectedTarget]
  );

  // How many rows/cols will be added or removed when the anchor paste runs
  const dimensionDelta = useMemo(() => {
    if (!anchor || !builtMatrixData || !selectedTarget) return null;
    const existingRows = selectedTarget.element.data?.length ?? 0;
    const existingCols = selectedTarget.element.data?.[0]?.length ?? 0;
    const newRows = anchor.row + (builtMatrixData.length ?? 0);
    const newCols = anchor.col + (builtMatrixData[0]?.length ?? 0);
    return {
      rowDelta: newRows - existingRows,
      colDelta: newCols - existingCols,
      newRows,
      newCols,
    };
  }, [anchor, builtMatrixData, selectedTarget]);

  // ── Step 1 → Step 2 ──────────────────────────────────────────────────────────
  const handlePickMatrix = (id) => {
    setMatrixId(id);
    setError(null);
    setStep('target');
  };

  // ── Step 2: pick target ───────────────────────────────────────────────────────
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
        setAnchor(null);
        setStep('anchor');
      }
    } catch (err) {
      console.error('Failed to build matrix:', err);
      setError(err.message || 'Failed to fetch data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: apply anchor paste ────────────────────────────────────────────────
  const handleApplyAnchor = () => {
    if (!anchor || !selectedTarget || !builtMatrixData) return;
    const { data, rows, cols } = pasteAtAnchor(
      selectedTarget.element.data, builtMatrixData, anchor.row, anchor.col
    );
    onUpdate(
      selectedTarget.element.id,
      selectedTarget.zone,
      selectedTarget.pageIndex,
      data,
      // Store matrixType + anchor so the editor can auto-rebuild on next open
      { rows, cols, matrixType: matrixId, matrixAnchorRow: anchor.row, matrixAnchorCol: anchor.col },
    );
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const selectedMatrix = MATRICES.find((m) => m.id === matrixId);

  // Overlay: which target cells would be written?
  const overlaySet = useMemo(() => {
    if (!anchor || !builtMatrixData || !selectedTarget) return new Set();
    const set = new Set();
    builtMatrixData.forEach((row, sr) => {
      row.forEach((_cell, sc) => {
        const tr = anchor.row + sr;
        const tc = anchor.col + sc;
        if (!coveredCells.has(`${tr}-${tc}`)) set.add(`${tr}-${tc}`);
      });
    });
    return set;
  }, [anchor, builtMatrixData, coveredCells, selectedTarget]);

  const stepLabel = step === 'matrix'
    ? 'Step 1 of 3 — Choose a matrix type'
    : step === 'target'
    ? `Step 2 of 3 — Where to place the ${selectedMatrix?.label}?`
    : 'Step 3 of 3 — Click the top-left anchor cell in the target table';

  const handleBack = () => {
    if (step === 'target') { setStep('matrix'); setError(null); }
    if (step === 'anchor')  { setStep('target'); setAnchor(null); setError(null); }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh]">

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
                          {' — '}you will manually map each cell
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

        {/* ── Step 3: Anchor Pick ── */}
        {step === 'anchor' && (
          <div className="flex flex-col overflow-hidden flex-1">

            {/* Instruction bar */}
            <div className="px-5 py-2.5 border-b border-gray-800 shrink-0 flex items-center gap-4 flex-wrap">
              <p className="flex-1 text-gray-400 text-xs leading-relaxed min-w-0">
                Click the <span className="text-blue-300 font-semibold">top-left cell</span> where the matrix should start.
                The entire source ({builtMatrixData?.length ?? 0} rows × {builtMatrixData?.[0]?.length ?? 0} cols) will be pasted from that position.
                Cells covered by colspan/rowspan are automatically skipped.
              </p>
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {anchor && (
                  <span className="text-xs bg-blue-900 text-blue-200 border border-blue-600 rounded px-2 py-1">
                    Anchor: R{anchor.row + 1}C{anchor.col + 1}
                    {' '}— {overlaySet.size} cell{overlaySet.size !== 1 ? 's' : ''} updated
                  </span>
                )}
                {dimensionDelta && (dimensionDelta.rowDelta !== 0 || dimensionDelta.colDelta !== 0) && (
                  <span className="text-xs rounded px-2 py-1 border"
                    style={{
                      background: dimensionDelta.rowDelta > 0 || dimensionDelta.colDelta > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      borderColor: dimensionDelta.rowDelta > 0 || dimensionDelta.colDelta > 0 ? '#10b981' : '#ef4444',
                      color: dimensionDelta.rowDelta > 0 || dimensionDelta.colDelta > 0 ? '#6ee7b7' : '#fca5a5',
                    }}
                  >
                    {[dimensionDelta.rowDelta > 0 && `+${dimensionDelta.rowDelta} row${dimensionDelta.rowDelta !== 1 ? 's' : ''}`,
                      dimensionDelta.rowDelta < 0 && `${dimensionDelta.rowDelta} row${Math.abs(dimensionDelta.rowDelta) !== 1 ? 's' : ''}`,
                      dimensionDelta.colDelta > 0 && `+${dimensionDelta.colDelta} col${dimensionDelta.colDelta !== 1 ? 's' : ''}`,
                      dimensionDelta.colDelta < 0 && `${dimensionDelta.colDelta} col${Math.abs(dimensionDelta.colDelta) !== 1 ? 's' : ''}`,
                    ].filter(Boolean).join(', ')}
                    {' '}→ {dimensionDelta.newRows}×{dimensionDelta.newCols}
                  </span>
                )}
              </div>
            </div>

            {/* Target table — full size, no row/col limit */}
            <div className="flex-1 overflow-auto p-3">
              <p className="text-gray-500 text-[10px] mb-2 uppercase tracking-wide font-semibold">
                Target — {selectedTarget?.label} &nbsp;·&nbsp; {selectedTarget?.element?.data?.length ?? 0} rows × {selectedTarget?.element?.data?.[0]?.length ?? 0} cols
              </p>
              <table className="border-collapse select-none" style={{ tableLayout: 'fixed' }}>
                <tbody>
                  {(selectedTarget?.element?.data ?? []).map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => {
                          if (coveredCells.has(`${r}-${c}`)) return null; // hidden by ancestor span
                          const key = `${r}-${c}`;
                          const isOverlay  = overlaySet.has(key);
                          const isAnchor   = anchor?.row === r && anchor?.col === c;
                          const rawText = String(cell?.content ?? '').replace(/<[^>]+>/g, '').slice(0, 40);
                          // What source content would land here?
                          const srcContent = (anchor && isOverlay)
                            ? String(builtMatrixData?.[r - anchor.row]?.[c - anchor.col]?.content ?? '').replace(/<[^>]+>/g, '').slice(0, 40)
                            : null;
                          return (
                            <td
                              key={c}
                              colSpan={cell?.colspan || 1}
                              rowSpan={cell?.rowspan || 1}
                              className="relative border border-gray-400 overflow-hidden cursor-pointer"
                              style={{
                                width:           cell?.width,
                                minWidth:        cell?.width,
                                maxWidth:        cell?.width,
                                height:          cell?.height,
                                maxHeight:       cell?.height,
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
                              onClick={() => setAnchor({ row: r, col: c })}
                              title={
                                isAnchor
                                  ? `Anchor at R${r+1}C${c+1} — matrix starts here`
                                  : isOverlay
                                  ? `Will receive: "${srcContent}"`
                                  : `Click to set anchor at R${r+1}C${c+1}`
                              }
                            >
                              <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  boxShadow: isAnchor
                                    ? 'inset 0 0 0 2.5px #3b82f6'
                                    : isOverlay
                                    ? 'inset 0 0 0 1.5px #10b981'
                                    : undefined,
                                  backgroundColor: isAnchor
                                    ? 'rgba(59,130,246,0.22)'
                                    : isOverlay
                                    ? 'rgba(16,185,129,0.13)'
                                    : undefined,
                                }}
                              />
                              <span className={`block truncate leading-tight whitespace-nowrap relative z-1 text-[10px] ${isOverlay && !isAnchor ? 'text-emerald-300' : ''} ${isAnchor ? 'text-blue-200 font-semibold' : ''}`}>
                                {srcContent !== null ? srcContent : rawText}
                              </span>
                              {isAnchor && (
                                <span className="absolute top-0.5 left-0.5 text-[8px] bg-blue-700 text-white rounded px-1 leading-tight z-2 pointer-events-none">
                                  START
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action bar */}
            <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-between shrink-0">
              <span className="text-gray-400 text-xs">
                {anchor
                  ? [
                      `Pasting ${builtMatrixData?.length ?? 0}×${builtMatrixData?.[0]?.length ?? 0} matrix at R${anchor.row+1}C${anchor.col+1}`,
                      dimensionDelta && (dimensionDelta.rowDelta !== 0 || dimensionDelta.colDelta !== 0)
                        ? `— table resized to ${dimensionDelta.newRows}×${dimensionDelta.newCols}`
                        : `— ${overlaySet.size} cells will be updated`,
                    ].filter(Boolean).join(' ')
                  : 'Click any cell above to set where the matrix content starts'}
              </span>
              <button
                onClick={handleApplyAnchor}
                disabled={!anchor}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg text-sm transition-colors"
              >
                ✓ Paste Matrix
              </button>
            </div>
          </div>
        )}

        {/* Footer hint (hidden in step 3 — confirm bar takes over) */}
        {step !== 'anchor' && (
          <div className="px-6 pb-4 text-xs text-gray-600 text-center shrink-0">
            {step === 'matrix'
              ? 'Choose a matrix type to continue.'
              : 'Choosing an existing table lets you set the anchor cell where the matrix content starts.'}
          </div>
        )}
      </div>
    </div>
  );
}
