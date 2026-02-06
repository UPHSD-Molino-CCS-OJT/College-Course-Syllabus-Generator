import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Custom hook for auto-saving data
 * 
 * @param {Function} saveFunction - Async function to save data
 * @param {any} data - Data to save
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Delay in ms before auto-save (default: 2000)
 * @param {boolean} options.enabled - Whether auto-save is enabled (default: true)
 * @param {Function} options.shouldSave - Function to determine if save should happen
 * @returns {Object} - Auto-save state and controls
 */
export function useAutoSave(saveFunction, data, options = {}) {
  const {
    delay = 2000,
    enabled = true,
    shouldSave = () => true,
  } = options;

  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  
  const timeoutRef = useRef(null);
  const previousDataRef = useRef(data);
  const isSavingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const performSave = useCallback(async () => {
    if (!enabled || isSavingRef.current || !shouldSave(data)) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');
    setError(null);

    try {
      await saveFunction(data);
      
      if (mountedRef.current) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        previousDataRef.current = data;
        
        // Reset to idle after 3 seconds
        setTimeout(() => {
          if (mountedRef.current) {
            setSaveStatus('idle');
          }
        }, 3000);
      }
    } catch (err) {
      if (mountedRef.current) {
        setSaveStatus('error');
        setError(err.message || 'Failed to save');
        console.error('Auto-save error:', err);
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [enabled, saveFunction, data, shouldSave]);

  useEffect(() => {
    // Don't auto-save if disabled
    if (!enabled) {
      return;
    }

    // Don't auto-save if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      performSave();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, performSave]);

  const manualSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await performSave();
  }, [performSave]);

  const resetStatus = useCallback(() => {
    setSaveStatus('idle');
    setError(null);
  }, []);

  return {
    saveStatus,
    lastSaved,
    error,
    manualSave,
    resetStatus,
    isSaving: saveStatus === 'saving',
  };
}

/**
 * Auto-save status indicator component
 */
export function AutoSaveIndicator({ saveStatus, lastSaved, error }) {
  if (saveStatus === 'idle' && !lastSaved) {
    return null;
  }

  const getStatusContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">Saving...</span>
          </div>
        );
      
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">
              Saved {lastSaved && formatTimeSince(lastSaved)}
            </span>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error || 'Save failed'}</span>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center">
      {getStatusContent()}
    </div>
  );
}

function formatTimeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleDateString();
}
