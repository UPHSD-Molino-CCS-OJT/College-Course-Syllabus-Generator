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
 * Apply an explicit list of { srcRow, srcCol, tgtRow, tgtCol } mappings onto a deep-copy
 * of existingData, writing only the `content` from the source cell into the target cell.
 * All other target-cell style properties (width, height, font, color, bg…) are preserved.
 */
function mergeByMapping(existingData, matrixData, mappings) {
  const merged = existingData.map(row => row.map(cell => ({ ...cell })));
  for (const { srcRow, srcCol, tgtRow, tgtCol } of mappings) {
    if (tgtRow < merged.length && tgtCol < (merged[tgtRow]?.length ?? 0)) {
      merged[tgtRow][tgtCol] = {
        ...merged[tgtRow][tgtCol],
        content: matrixData[srcRow]?.[srcCol]?.content ?? '',
      };
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
  const [activeSrcCell, setActiveSrcCell]     = useState(null); // { row, col } — selected source cell
  const [cellMappings, setCellMappings]       = useState([]);   // [{ srcRow, srcCol, tgtRow, tgtCol }]

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
        setActiveSrcCell(null);
        setCellMappings([]);
        setStep('cell');
      }
    } catch (err) {
      console.error('Failed to build matrix:', err);
      setError(err.message || 'Failed to fetch data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: manual cell mapping ───────────────────────────────────────────
  const handleTargetCellClick = (tgtRow, tgtCol) => {
    if (!activeSrcCell) {
      // No source active — click removes an existing mapping on this target cell
      setCellMappings(prev => prev.filter(m => !(m.tgtRow === tgtRow && m.tgtCol === tgtCol)));
      return;
    }
    // Assign: one source → one target (overwrite any prior mapping for either side)
    setCellMappings(prev => {
      const filtered = prev.filter(m =>
        !(m.tgtRow === tgtRow && m.tgtCol === tgtCol) &&
        !(m.srcRow === activeSrcCell.row && m.srcCol === activeSrcCell.col)
      );
      return [...filtered, { srcRow: activeSrcCell.row, srcCol: activeSrcCell.col, tgtRow, tgtCol }];
    });
    setActiveSrcCell(null); // deselect after placing
  };

  const handleApplyMapping = () => {
    if (!cellMappings.length || !selectedTarget || !builtMatrixData) return;
    const merged = mergeByMapping(selectedTarget.element.data, builtMatrixData, cellMappings);
    onUpdate(selectedTarget.element.id, selectedTarget.zone, selectedTarget.pageIndex, merged);
  };

  // ── Step 3 helpers ────────────────────────────────────────────────────────────
  const selectedMatrix = MATRICES.find((m) => m.id === matrixId);

  // Source (built matrix) preview
  const srcRows        = builtMatrixData ?? [];
  const srcPreviewRows = srcRows.slice(0, MAX_PREVIEW_ROWS);
  const srcHiddenRows  = srcRows.length - srcPreviewRows.length;
  const srcCols        = srcPreviewRows[0]?.length ?? 0;
  const srcClampedCols = Math.min(srcCols, MAX_PREVIEW_COLS);
  const srcHiddenCols  = Math.max(0, srcCols - MAX_PREVIEW_COLS);

  // Target (existing table) preview
  const tgtRows        = selectedTarget?.element?.data ?? [];
  const tgtPreviewRows = tgtRows.slice(0, MAX_PREVIEW_ROWS);
  const tgtHiddenRows  = tgtRows.length - tgtPreviewRows.length;
  const tgtCols        = tgtPreviewRows[0]?.length ?? 0;
  const tgtClampedCols = Math.min(tgtCols, MAX_PREVIEW_COLS);
  const tgtHiddenCols  = Math.max(0, tgtCols - MAX_PREVIEW_COLS);

  // Mapping lookup helpers
  const getMappingForSrc = (r, c) => cellMappings.find(m => m.srcRow === r && m.srcCol === c);
  const getMappingForTgt = (r, c) => cellMappings.find(m => m.tgtRow === r && m.tgtCol === c);

  const stepLabel = step === 'matrix'
    ? 'Step 1 of 3 — Choose a matrix type'
    : step === 'target'
    ? `Step 2 of 3 — Where to place the ${selectedMatrix?.label}?`
    : 'Step 3 of 3 — Map source cells to target cells';

  const handleBack = () => {
    if (step === 'target') { setStep('matrix'); setError(null); }
    if (step === 'cell')   { setStep('target'); setActiveSrcCell(null); setCellMappings([]); setError(null); }
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

        {/* ── Step 3: Cell Mapping ── */}
        {step === 'cell' && (
          <div className="flex flex-col overflow-hidden flex-1">

            {/* Instruction bar */}
            <div className="px-5 py-2.5 border-b border-gray-800 shrink-0 flex items-center gap-4">
              <p className="flex-1 text-gray-400 text-xs leading-relaxed">
                <span className="text-indigo-300 font-semibold">Left panel:</span> click a source cell to select it.{' '}
                <span className="text-amber-300 font-semibold">Right panel:</span> click a target cell to assign the selected source to it.
                Click a mapped target cell (no source selected) to <span className="text-red-400">remove</span> its mapping.
              </p>
              {activeSrcCell && (
                <span className="shrink-0 text-xs bg-indigo-900 text-indigo-200 border border-indigo-600 rounded px-2 py-1">
                  Source R{activeSrcCell.row + 1}C{activeSrcCell.col + 1} selected → click a target
                </span>
              )}
            </div>

            {/* Two-panel area */}
            <div className="flex flex-1 overflow-hidden divide-x divide-gray-700">

              {/* Source panel — built matrix data */}
              <div className="flex flex-col w-1/2 overflow-hidden">
                <div className="px-3 py-2 shrink-0 bg-gray-800/70">
                  <p className="text-gray-300 text-xs font-semibold uppercase tracking-wide">Source — {selectedMatrix?.label}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{srcRows.length} rows × {srcCols} cols — click a cell to select it</p>
                </div>
                <div className="flex-1 overflow-auto p-3">
                  <table className="border-collapse select-none" style={{ tableLayout: 'fixed' }}>
                    <tbody>
                      {srcPreviewRows.map((row, r) => (
                        <tr key={r}>
                          {row.slice(0, MAX_PREVIEW_COLS).map((cell, c) => {
                            const mapping  = getMappingForSrc(r, c);
                            const isActive = activeSrcCell?.row === r && activeSrcCell?.col === c;
                            const isMapped = !!mapping;
                            const rawText  = String(cell?.content ?? '').replace(/<[^>]+>/g, '').slice(0, 22);
                            return (
                              <td
                                key={c}
                                className="relative border border-gray-500 cursor-pointer overflow-hidden"
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
                                onClick={() => setActiveSrcCell(isActive ? null : { row: r, col: c })}
                                title={isMapped
                                  ? `Source R${r+1}C${c+1} → target R${mapping.tgtRow+1}C${mapping.tgtCol+1} (click to re-select)`
                                  : `Select source R${r+1}C${c+1}`}
                              >
                                <div
                                  className="absolute inset-0 pointer-events-none"
                                  style={{
                                    boxShadow: isActive
                                      ? 'inset 0 0 0 2px #818cf8'
                                      : isMapped
                                      ? 'inset 0 0 0 2px #10b981'
                                      : undefined,
                                    backgroundColor: isActive
                                      ? 'rgba(99,102,241,0.18)'
                                      : isMapped
                                      ? 'rgba(16,185,129,0.12)'
                                      : undefined,
                                  }}
                                />
                                <span className="block truncate leading-tight whitespace-nowrap relative z-1">
                                  {rawText}
                                </span>
                                {isMapped && (
                                  <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-emerald-700 text-white rounded px-1 leading-tight z-2 pointer-events-none">
                                    →R{mapping.tgtRow+1}C{mapping.tgtCol+1}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          {srcHiddenCols > 0 && (
                            <td className="text-gray-600 border border-gray-700 px-1 text-center text-[10px] italic">…</td>
                          )}
                        </tr>
                      ))}
                      {srcHiddenRows > 0 && (
                        <tr>
                          <td
                            colSpan={srcClampedCols + (srcHiddenCols > 0 ? 1 : 0)}
                            className="text-gray-600 border border-gray-700 px-2 py-1 text-center text-[10px] italic"
                          >
                            … {srcHiddenRows} more row(s)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Target panel — existing template table */}
              <div className="flex flex-col w-1/2 overflow-hidden">
                <div className="px-3 py-2 shrink-0 bg-gray-800/70">
                  <p className="text-gray-300 text-xs font-semibold uppercase tracking-wide">Target — {selectedTarget?.label}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{tgtRows.length} rows × {tgtCols} cols — click to assign selected source</p>
                </div>
                <div className="flex-1 overflow-auto p-3">
                  <table className="border-collapse select-none" style={{ tableLayout: 'fixed' }}>
                    <tbody>
                      {tgtPreviewRows.map((row, r) => (
                        <tr key={r}>
                          {row.slice(0, MAX_PREVIEW_COLS).map((cell, c) => {
                            const mapping        = getMappingForTgt(r, c);
                            const isMapped       = !!mapping;
                            const canAssign      = !!activeSrcCell;
                            const mappedContent  = isMapped
                              ? String(builtMatrixData?.[mapping.srcRow]?.[mapping.srcCol]?.content ?? '').replace(/<[^>]+>/g, '').slice(0, 22)
                              : null;
                            const rawText = mappedContent ?? String(cell?.content ?? '').replace(/<[^>]+>/g, '').slice(0, 22);
                            return (
                              <td
                                key={c}
                                className="relative border border-gray-400 overflow-hidden"
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
                                  color:           isMapped ? cell?.color : cell?.color,
                                  textAlign:       cell?.align,
                                  padding:         '2px 4px',
                                  verticalAlign:   'top',
                                  cursor:          (canAssign || isMapped) ? 'pointer' : 'default',
                                }}
                                onClick={() => handleTargetCellClick(r, c)}
                                title={
                                  isMapped
                                    ? `Mapped from source R${mapping.srcRow+1}C${mapping.srcCol+1} — click without a source selected to remove`
                                    : canAssign
                                    ? `Assign source R${activeSrcCell.row+1}C${activeSrcCell.col+1} → here`
                                    : `R${r+1}C${c+1}`
                                }
                              >
                                <div
                                  className="absolute inset-0 pointer-events-none"
                                  style={{
                                    boxShadow: isMapped
                                      ? 'inset 0 0 0 2px #10b981'
                                      : canAssign
                                      ? 'inset 0 0 0 1.5px #3b82f6'
                                      : undefined,
                                    backgroundColor: isMapped
                                      ? 'rgba(16,185,129,0.12)'
                                      : canAssign
                                      ? 'rgba(59,130,246,0.07)'
                                      : undefined,
                                  }}
                                />
                                <span className={`block truncate leading-tight whitespace-nowrap relative z-1 ${isMapped ? 'text-emerald-300' : ''}`}>
                                  {rawText}
                                </span>
                                {isMapped && (
                                  <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-emerald-700 text-white rounded px-1 leading-tight z-2 pointer-events-none">
                                    R{mapping.srcRow+1}C{mapping.srcCol+1}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          {tgtHiddenCols > 0 && (
                            <td className="text-gray-600 border border-gray-700 px-1 text-center text-[10px] italic">…</td>
                          )}
                        </tr>
                      ))}
                      {tgtHiddenRows > 0 && (
                        <tr>
                          <td
                            colSpan={tgtClampedCols + (tgtHiddenCols > 0 ? 1 : 0)}
                            className="text-gray-600 border border-gray-700 px-2 py-1 text-center text-[10px] italic"
                          >
                            … {tgtHiddenRows} more row(s)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs">
                  {cellMappings.length > 0
                    ? `${cellMappings.length} cell${cellMappings.length !== 1 ? 's' : ''} mapped`
                    : activeSrcCell
                    ? 'Source selected — click a cell in the right panel'
                    : 'Click a source cell on the left to begin'}
                </span>
                {cellMappings.length > 0 && (
                  <button
                    onClick={() => { setCellMappings([]); setActiveSrcCell(null); }}
                    className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <button
                onClick={handleApplyMapping}
                disabled={!cellMappings.length}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg text-sm transition-colors"
              >
                ✓ Apply Mapping
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
