import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  STORAGE_KEYS,
  DEFAULT_SAVINGS_AMOUNT,
  MAX_SAVINGS_ENTRIES,
} from '../utils/constants';
import { getDefaultStartDate } from '../utils/dateUtils';
import { validateSavingsEntry } from '../utils/validators';

/**
 * Generate a unique ID for savings entries
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Create a default savings entry
 */
const createDefaultEntry = () => ({
  id: generateId(),
  amount: DEFAULT_SAVINGS_AMOUNT,
  currency: 'ETB',
  date: getDefaultStartDate().toISOString(),
  label: '',
});

/**
 * Savings store for managing user's savings entries
 */
export const useSavingsStore = create(
  persist(
    (set, get) => ({
      // Savings entries (max 10)
      entries: [createDefaultEntry()],

      // Add a new entry
      addEntry: () => {
        const { entries } = get();
        if (entries.length >= MAX_SAVINGS_ENTRIES) {
          return false;
        }

        const newEntry = createDefaultEntry();
        set({ entries: [...entries, newEntry] });
        return true;
      },

      // Remove an entry by ID
      removeEntry: (id) => {
        const { entries } = get();
        // Don't allow removing the last entry
        if (entries.length <= 1) {
          return false;
        }

        set({ entries: entries.filter((e) => e.id !== id) });
        return true;
      },

      // Update an entry
      updateEntry: (id, updates) => {
        const { entries } = get();
        set({
          entries: entries.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        });
      },

      // Update entry amount
      setEntryAmount: (id, amount) => {
        get().updateEntry(id, { amount: parseFloat(amount) || 0 });
      },

      // Update entry date
      setEntryDate: (id, date) => {
        const dateStr = date instanceof Date ? date.toISOString() : date;
        get().updateEntry(id, { date: dateStr });
      },

      // Update entry currency
      setEntryCurrency: (id, currency) => {
        get().updateEntry(id, { currency });
      },

      // Update entry label
      setEntryLabel: (id, label) => {
        get().updateEntry(id, { label });
      },

      // Get total savings amount
      getTotalAmount: () => {
        const { entries } = get();
        return entries.reduce((sum, e) => sum + (e.amount || 0), 0);
      },

      // Get entries as Date objects
      getEntriesWithDates: () => {
        const { entries } = get();
        return entries.map((e) => ({
          ...e,
          dateObj: new Date(e.date),
        }));
      },

      // Validate all entries
      validateEntries: () => {
        const { entries } = get();
        return entries.map((e) => ({
          id: e.id,
          validation: validateSavingsEntry({
            ...e,
            date: new Date(e.date),
          }),
        }));
      },

      // Check if all entries are valid
      isValid: () => {
        const { entries } = get();
        return entries.every((e) => {
          const validation = validateSavingsEntry({
            ...e,
            date: new Date(e.date),
          });
          return validation.isValid;
        });
      },

      // Reset to default
      resetEntries: () => {
        set({ entries: [createDefaultEntry()] });
      },

      // Import entries from URL params
      importFromParams: (params) => {
        try {
          const entriesJson = params.get('entries');
          if (entriesJson) {
            const entries = JSON.parse(decodeURIComponent(entriesJson));
            if (Array.isArray(entries) && entries.length > 0) {
              // Validate and sanitize
              const validEntries = entries
                .slice(0, MAX_SAVINGS_ENTRIES)
                .map((e) => ({
                  id: generateId(),
                  amount: parseFloat(e.amount) || DEFAULT_SAVINGS_AMOUNT,
                  currency: ['ETB', 'USD'].includes(e.currency) ? e.currency : 'ETB',
                  date: e.date || getDefaultStartDate().toISOString(),
                  label: e.label || '',
                }));

              if (validEntries.length > 0) {
                set({ entries: validEntries });
                return true;
              }
            }
          }

          // Legacy single entry params
          const amount = params.get('amount');
          const date = params.get('date');
          const currency = params.get('currency');

          if (amount) {
            const entry = {
              id: generateId(),
              amount: parseFloat(amount) || DEFAULT_SAVINGS_AMOUNT,
              currency: ['ETB', 'USD'].includes(currency) ? currency : 'ETB',
              date: date || getDefaultStartDate().toISOString(),
              label: '',
            };
            set({ entries: [entry] });
            return true;
          }

          return false;
        } catch (error) {
          console.error('Failed to import entries from params:', error);
          return false;
        }
      },

      // Export entries to URL params
      exportToParams: () => {
        const { entries } = get();
        const simplified = entries.map((e) => ({
          amount: e.amount,
          currency: e.currency,
          date: e.date,
          label: e.label,
        }));

        return encodeURIComponent(JSON.stringify(simplified));
      },
    }),
    {
      name: STORAGE_KEYS.SAVINGS,
      partialize: (state) => ({
        entries: state.entries,
      }),
    }
  )
);
