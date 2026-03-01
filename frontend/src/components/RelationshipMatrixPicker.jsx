import { useState } from 'react';
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

export default function RelationshipMatrixPicker({ onInsert, onClose }) {
  const [loading, setLoading] = useState(null); // id of the matrix being loaded
  const [error, setError]     = useState(null);

  const handleInsert = async (matrixId) => {
    setLoading(matrixId);
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

        if (gas.length === 0 || mks.length === 0) {
          setError('No Graduate Attributes or Mission Keywords found. Please add data first.');
          setLoading(null);
          return;
        }
        element = buildGAMissionKeywordMatrix(gas, mks);

      } else if (matrixId === 'peo-ga') {
        const [peoRes, gaRes] = await Promise.all([
          peoAPI.getAll({ limit: 100 }),
          graduateAttributeAPI.getAll({ limit: 100 }),
        ]);
        const peos = peoRes.data?.peos || [];
        const gas  = gaRes.data?.graduateAttributes || [];

        if (peos.length === 0 || gas.length === 0) {
          setError('No PEOs or Graduate Attributes found. Please add data first.');
          setLoading(null);
          return;
        }
        element = buildPEOGAMatrix(peos, gas);

      } else if (matrixId === 'plo-peo') {
        const [ploRes, peoRes] = await Promise.all([
          ploAPI.getAll({ limit: 100 }),
          peoAPI.getAll({ limit: 100 }),
        ]);
        const plos = ploRes.data?.plos || [];
        const peos = peoRes.data?.peos || [];

        if (plos.length === 0 || peos.length === 0) {
          setError('No PLOs or PEOs found. Please add data first.');
          setLoading(null);
          return;
        }
        element = buildPLOPEOMatrix(plos, peos);

      } else if (matrixId === 'clo-plo') {
        const [cloRes, ploRes] = await Promise.all([
          cloAPI.getAll({ limit: 100 }),
          ploAPI.getAll({ limit: 100 }),
        ]);
        const clos = cloRes.data?.clos || [];
        const plos = ploRes.data?.plos || [];

        if (clos.length === 0 || plos.length === 0) {
          setError('No CLOs or PLOs found. Please add data first.');
          setLoading(null);
          return;
        }
        element = buildCLOPLOMatrix(clos, plos);
      }

      onInsert(element);
    } catch (err) {
      console.error('Failed to build matrix:', err);
      setError('Failed to fetch data from the server. Please check your connection and try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div>
            <h2 className="text-white font-bold text-xl">📊 Insert Relationship Matrix</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Choose a matrix to auto-populate from your saved data
            </p>
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

        {/* Matrix Options */}
        <div className="p-6 grid grid-cols-1 gap-3">
          {MATRICES.map((m) => {
            const colors = COLOR_MAP[m.color];
            const isLoading = loading === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleInsert(m.id)}
                disabled={!!loading}
                className={`w-full text-left border rounded-xl px-5 py-4 transition-all duration-150 ${colors.card} ${loading && !isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{m.label}</span>
                      {isLoading && (
                        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${colors.badge} animate-pulse`}>
                          Loading…
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">{m.description}</p>
                  </div>
                  <span className="text-gray-500 text-lg shrink-0">
                    {isLoading ? '⏳' : '→'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-xs text-gray-500 text-center">
          The table will be inserted into the current canvas zone at position (60, 100). You can reposition it freely after insertion.
        </div>
      </div>
    </div>
  );
}
