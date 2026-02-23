import { useQuery } from '@tanstack/react-query';
import {
  getCurrentExchangeRate,
  getHistoricalExchangeRates,
  getHistoricalExchangeRate,
  calculateInflationFromRates,
} from '../api/exchangeRate';
import { useSettingsStore } from '../store/settingsStore';
import { TIME_RANGES } from '../utils/constants';
import { subDays } from 'date-fns';

/**
 * Hook for fetching current USD/ETB exchange rate
 * Optimized for INSTANT access - aggressive caching
 */
export const useCurrentExchangeRate = () => {
  const autoRefresh = useSettingsStore((state) => state.autoRefresh);

  return useQuery({
    queryKey: ['exchangeRate', 'current'],
    queryFn: getCurrentExchangeRate,
    staleTime: 10 * 60 * 1000, // 10 minutes - exchange rates don't change that often
    gcTime: 60 * 60 * 1000, // 1 hour in cache
    refetchInterval: autoRefresh ? 120000 : false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Hook for fetching historical exchange rates
 * Optimized for INSTANT access - data cached aggressively
 * @param {string|number} timeRange - Time range key or number of days
 */
export const useHistoricalExchangeRates = (timeRange = '1Y') => {
  // Support both time range keys and direct day counts
  const days = typeof timeRange === 'number' ? timeRange : (TIME_RANGES[timeRange]?.days || 365);
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  return useQuery({
    queryKey: ['exchangeRate', 'historical', days],
    queryFn: () => getHistoricalExchangeRates(startDate, endDate),
    staleTime: 30 * 60 * 1000, // 30 minutes - historical data is stable
    gcTime: 60 * 60 * 1000, // 1 hour in cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Hook for calculating inflation rate based on exchange rate change
 * @param {string} timeRange - Time range key
 */
export const useInflationRate = (timeRange = '1Y') => {
  const { data: historicalRates, isLoading, error } = useHistoricalExchangeRates(timeRange);

  if (!historicalRates || historicalRates.length < 2) {
    return { inflationRate: null, isLoading, error };
  }

  const startRate = historicalRates[0].rate;
  const endRate = historicalRates[historicalRates.length - 1].rate;
  const inflationRate = calculateInflationFromRates(startRate, endRate);

  return {
    inflationRate,
    startRate,
    endRate,
    isLoading,
    error,
  };
};

/**
 * Hook for fetching EXACT exchange rate at a specific date
 * Uses the API's historical endpoint for accurate rates
 * @param {Date|string} date - Target date
 */
export const useExactExchangeRate = (date) => {
  const dateStr = date ? (date instanceof Date ? date.toISOString().split('T')[0] : date) : null;

  return useQuery({
    queryKey: ['exchangeRate', 'exact', dateStr],
    queryFn: () => getHistoricalExchangeRate(new Date(date)),
    enabled: !!date,
    staleTime: 60 * 60 * 1000, // 1 hour - historical rates don't change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours in cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 2,
  });
};

/**
 * Get the exchange rate at a specific date using binary search (O(log n))
 * @param {Array} historicalRates - Array of { date, rate }
 * @param {Date} targetDate - Target date
 * @returns {number|null} Exchange rate at date
 */
export const getRateAtDate = (historicalRates, targetDate) => {
  if (!historicalRates || historicalRates.length === 0) return null;

  const targetTime = targetDate.getTime();

  // Handle edge cases
  const getTime = (item) => new Date(item.date).getTime();

  if (targetTime <= getTime(historicalRates[0])) {
    return historicalRates[0].rate;
  }
  if (targetTime >= getTime(historicalRates[historicalRates.length - 1])) {
    return historicalRates[historicalRates.length - 1].rate;
  }

  // Binary search for closest date
  let left = 0;
  let right = historicalRates.length - 1;

  while (left < right - 1) {
    const mid = Math.floor((left + right) / 2);
    const midTime = getTime(historicalRates[mid]);

    if (midTime === targetTime) {
      return historicalRates[mid].rate;
    } else if (midTime < targetTime) {
      left = mid;
    } else {
      right = mid;
    }
  }

  // Return the closest of the two candidates
  const leftDiff = Math.abs(getTime(historicalRates[left]) - targetTime);
  const rightDiff = Math.abs(getTime(historicalRates[right]) - targetTime);

  return leftDiff <= rightDiff ? historicalRates[left].rate : historicalRates[right].rate;
};
