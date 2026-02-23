import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS, DEFAULT_TIME_RANGE, CHART_TYPES } from '../utils/constants';

/**
 * Settings store for app-wide preferences
 */
export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark',
      })),

      // Base currency for display
      baseCurrency: 'ETB',
      setBaseCurrency: (currency) => set({ baseCurrency: currency }),
      toggleBaseCurrency: () => set((state) => ({
        baseCurrency: state.baseCurrency === 'ETB' ? 'USD' : 'ETB',
      })),

      // Time range
      timeRange: DEFAULT_TIME_RANGE,
      setTimeRange: (range) => set({ timeRange: range }),

      // Active chart type
      activeChart: CHART_TYPES.LINE,
      setActiveChart: (chartType) => set({ activeChart: chartType }),

      // Calculation trigger - stores a snapshot of entries when Calculate is clicked
      calculationVersion: 0,
      hasCalculated: false,
      isCalculating: false,
      // Snapshot of entries at calculation time - only this is used for calculations
      calculationSnapshot: null,
      triggerCalculation: (entries) => {
        set((state) => ({
          calculationVersion: state.calculationVersion + 1,
          hasCalculated: true,
          isCalculating: true,
          // Store snapshot of entries at calculation time
          calculationSnapshot: entries ? JSON.parse(JSON.stringify(entries)) : state.calculationSnapshot,
        }));
        // Auto-clear loading state after a short timeout as fallback
        setTimeout(() => {
          set({ isCalculating: false });
        }, 300);
      },
      setIsCalculating: (value) => set({ isCalculating: value }),

      // Data refresh
      autoRefresh: true,
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),

      // Last data update timestamp
      lastUpdate: null,
      setLastUpdate: (timestamp) => set({ lastUpdate: timestamp }),

      // UI preferences
      showAnimations: true,
      setShowAnimations: (enabled) => set({ showAnimations: enabled }),

      compactMode: false,
      setCompactMode: (enabled) => set({ compactMode: enabled }),

      // Reset to defaults
      resetSettings: () => set({
        theme: 'dark',
        baseCurrency: 'ETB',
        timeRange: DEFAULT_TIME_RANGE,
        activeChart: CHART_TYPES.LINE,
        autoRefresh: true,
        showAnimations: true,
        compactMode: false,
      }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      partialize: (state) => ({
        theme: state.theme,
        baseCurrency: state.baseCurrency,
        timeRange: state.timeRange,
        autoRefresh: state.autoRefresh,
        showAnimations: state.showAnimations,
        compactMode: state.compactMode,
      }),
    }
  )
);

/**
 * Hook to sync theme with document
 */
export const useSyncTheme = () => {
  const theme = useSettingsStore((state) => state.theme);

  // This will be called in a useEffect
  return () => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
};
