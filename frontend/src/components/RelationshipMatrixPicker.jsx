import { useState, useMemo } from 'react';
import { missionKeywordAPI, graduateAttributeAPI, peoAPI, ploAPI, cloAPI } from '../services/api';
import {
  buildGAMissionKeywordMatrix,
  buildPEOGAMatrix,
  buildPLOPEOMatrix,
  buildCLOPLOMatrix,
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

export default function RelationshipMatrixPicker({ canvasDocument, onInsert, onUpdate, onClose }) {
  const [step, setStep]       = useState('matrix'); // 'matrix' | 'target'
  const [matrixId, setMatrixId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const templateTables = useMemo(() => getTemplateTables(canvasDocument), [canvasDocument]);

  /** Step 1 → Step 2: user picked a matrix type */
  const handlePickMatrix = (id) => {
    setMatrixId(id);
    setError(null);
    setStep('target');
  };

  /** Build the matrix data from the API, then dispatch to caller */
  const handleCommit = async (target) => {
    // target is null  → create new element
    // target is { element, zone, pageIndex } → populate existing table
    setLoading(true);
    setError(null);

    try {
      let element;

      if (matrixId === 'ga-mk') {
        const [gaRes, mkRes] = await Promise.all([
          graduateAttributeAPI.getAll({ limit: 100 }),
          missionKeywordAPI.getAll({ limit: 50 }),
        ]);
        const gas = gaRes.data?.graduateAttributes || [];
        const mks = mkRes.data?.missionKeywords || [];
        if (gas.length === 0 || mks.length === 0) { setError('No Graduate Attributes or Mission Keywords found.'); setLoading(false); return; }
        element = buildGAMissionKeywordMatrix(gas, mks);

      } else if (matrixId === 'peo-ga') {
        const [peoRes, gaRes] = await Promise.all([
          peoAPI.getAll({ limit: 100 }),
          graduateAttributeAPI.getAll({ limit: 100 }),
        ]);
        const peos = peoRes.data?.peos || [];
        const gas  = gaRes.data?.graduateAttributes || [];
        if (peos.length === 0 || gas.length === 0) { setError('No PEOs or Graduate Attributes found.'); setLoading(false); return; }
        element = buildPEOGAMatrix(peos, gas);

      } else if (matrixId === 'plo-peo') {
        const [ploRes, peoRes] = await Promise.all([
          ploAPI.getAll({ limit: 100 }),
          peoAPI.getAll({ limit: 100 }),
        ]);
        const plos = ploRes.data?.plos || [];
        const peos = peoRes.data?.peos || [];
        if (plos.length === 0 || peos.length === 0) { setError('No PLOs or PEOs found.'); setLoading(false); return; }
        element = buildPLOPEOMatrix(plos, peos);

      } else if (matrixId === 'clo-plo') {
        const [cloRes, ploRes] = await Promise.all([
          cloAPI.getAll({ limit: 100 }),
          ploAPI.getAll({ limit: 100 }),
        ]);
        const clos = cloRes.data?.clos || [];
        const plos = ploRes.data?.plos || [];
        if (clos.length === 0 || plos.length === 0) { setError('No CLOs or PLOs found.'); setLoading(false); return; }
        element = buildCLOPLOMatrix(clos, plos);
      }

      if (target) {
        // Populate the chosen existing table: keep its id/position, replace data
        onUpdate(target.element.id, target.zone, target.pageIndex, element.data);
      } else {
        onInsert(element);
      }
    } catch (err) {
      console.error('Failed to build matrix:', err);
      setError('Failed to fetch data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedMatrix = MATRICES.find((m) => m.id === matrixId);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {step === 'target' && (
              <button
                onClick={() => { setStep('matrix'); setError(null); }}
                className="text-gray-400 hover:text-white transition-colors text-sm"
                aria-label="Back"
              >
                ← Back
              </button>
            )}
            <div>
              <h2 className="text-white font-bold text-xl">📊 Relationship Matrix</h2>
              <p className="text-gray-400 text-sm mt-0.5">
                {step === 'matrix'
                  ? 'Step 1 of 2 — Choose a matrix type'
                  : `Step 2 of 2 — Where to put the ${selectedMatrix?.label} data?`}
              </p>
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
          <div className="mx-6 mt-4 bg-red-900/50 border border-red-600 text-red-300 rounded-lg px-4 py-3 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* ── Step 1: Pick Matrix Type ── */}
        {step === 'matrix' && (
          <div className="p-6 grid grid-cols-1 gap-3">
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
          <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
            <p className="text-gray-400 text-xs">
              Select an existing table from your template to overwrite with the matrix data, or insert as a brand-new element.
            </p>

            {/* Existing tables from the template */}
            {templateTables.length > 0 && (
              <>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide pt-1">Existing tables in this template</p>
                {templateTables.map((t, i) => (
                  <button
                    key={t.element.id ?? i}
                    onClick={() => handleCommit(t)}
                    disabled={loading}
                    className="w-full text-left border border-amber-600 bg-amber-900/20 hover:bg-amber-900/40 rounded-xl px-5 py-4 transition-all duration-150 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🗃️</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-amber-300 font-semibold text-sm">{t.label}</span>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Current size: {t.element.data?.length ?? 0} rows × {t.element.data?.[0]?.length ?? 0} cols
                          {' → will be replaced with '}{selectedMatrix?.label} data
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

            {/* Insert as new table */}
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Or insert as a new element</p>
            <button
              onClick={() => handleCommit(null)}
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
                No tables found in the current template — only the "new table" option is available.
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-4 text-xs text-gray-600 text-center">
          {step === 'matrix'
            ? 'Choose a matrix type to continue.'
            : 'Overwriting an existing table preserves its position and size on the canvas.'}
        </div>
      </div>
    </div>
  );
}
