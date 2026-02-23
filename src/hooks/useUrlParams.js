import { useEffect, useCallback } from 'react';
import { useSavingsStore } from '../store/savingsStore';
import { useSettingsStore } from '../store/settingsStore';

/**
 * Hook for syncing state with URL parameters
 * Enables shareable URLs
 */
export const useUrlParams = () => {
  const entries = useSavingsStore((state) => state.entries);
  const exportToParams = useSavingsStore((state) => state.exportToParams);
  const importFromParams = useSavingsStore((state) => state.importFromParams);
  const timeRange = useSettingsStore((state) => state.timeRange);
  const setTimeRange = useSettingsStore((state) => state.setTimeRange);

  // Import from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Import savings entries
    importFromParams(params);

    // Import time range
    const range = params.get('range');
    if (range && ['1M', '3M', '6M', '1Y', 'ALL'].includes(range)) {
      setTimeRange(range);
    }
  }, []);

  // Generate shareable URL
  const generateShareUrl = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    // Add entries
    params.set('entries', exportToParams());

    // Add time range
    params.set('range', timeRange);

    return `${baseUrl}?${params.toString()}`;
  }, [entries, timeRange, exportToParams]);

  // Update URL without navigation (for browser history)
  const updateUrl = useCallback(() => {
    const url = generateShareUrl();
    window.history.replaceState({}, '', url);
  }, [generateShareUrl]);

  // Copy share URL to clipboard
  const copyShareUrl = useCallback(async () => {
    const url = generateShareUrl();

    try {
      await navigator.clipboard.writeText(url);
      return { success: true, url };
    } catch (error) {
      console.error('Failed to copy URL:', error);
      return { success: false, url, error };
    }
  }, [generateShareUrl]);

  return {
    generateShareUrl,
    updateUrl,
    copyShareUrl,
  };
};
