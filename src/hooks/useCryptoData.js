import { useQuery, useQueries } from '@tanstack/react-query';
import {
  getCurrentPrices,
  getHistoricalPrices,
  getAllHistoricalPrices,
  getAllExactPricesAtDate,
  COIN_IDS,
  transformPriceData,
} from '../api/coingecko';
import { useSettingsStore } from '../store/settingsStore';
import { TIME_RANGES } from '../utils/constants';

/**
 * Hook for fetching current cryptocurrency prices
 * Optimized for INSTANT access - aggressive caching, minimal refetching
 */
export const useCurrentPrices = () => {
  const autoRefresh = useSettingsStore((state) => state.autoRefresh);
  const setLastUpdate = useSettingsStore((state) => state.setLastUpdate);

  return useQuery({
    queryKey: ['cryptoPrices', 'current'],
    queryFn: getCurrentPrices,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
    gcTime: 60 * 60 * 1000, // 1 hour in cache
    refetchInterval: autoRefresh ? 120000 : false, // Refetch every 2 min if enabled
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if we have data
    refetchOnReconnect: false,
    onSuccess: () => {
      setLastUpdate(new Date().toISOString());
    },
  });
};

/**
 * Hook for fetching historical price data for a single coin
 * @param {string} coinId - CoinGecko coin ID
 * @param {string} timeRange - Time range key
 */
export const useHistoricalPrices = (coinId, timeRange = '1Y') => {
  const days = TIME_RANGES[timeRange]?.days || 365;

  return useQuery({
    queryKey: ['cryptoPrices', 'historical', coinId, days],
    queryFn: () => getHistoricalPrices(coinId, days),
    select: transformPriceData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching historical data for all tracked cryptocurrencies
 * Optimized with parallel fetching and aggressive caching
 * @param {string|number} timeRange - Time range key or number of days
 */
export const useAllHistoricalPrices = (timeRange = '1Y') => {
  // Support both time range keys and direct day counts
  const days = typeof timeRange === 'number' ? timeRange : (TIME_RANGES[timeRange]?.days || 365);
  const coinIds = Object.values(COIN_IDS);

  const queries = useQueries({
    queries: coinIds.map((coinId) => ({
      queryKey: ['cryptoPrices', 'historical', coinId, days],
      queryFn: () => getHistoricalPrices(coinId, days),
      select: transformPriceData,
      staleTime: 30 * 60 * 1000, // 30 minutes - historical data doesn't change often
      gcTime: 60 * 60 * 1000, // 1 hour in cache
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    })),
  });

  // Combine results
  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error;

  const data = coinIds.reduce((acc, coinId, index) => {
    acc[coinId] = queries[index].data || [];
    return acc;
  }, {});

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: () => queries.forEach((q) => q.refetch()),
  };
};

/**
 * Hook for getting the current price of a specific coin
 * @param {string} coinId - CoinGecko coin ID
 */
export const useCoinPrice = (coinId) => {
  const { data, isLoading, error } = useCurrentPrices();

  return {
    price: data?.[coinId]?.usd || null,
    change24h: data?.[coinId]?.usd_24h_change || null,
    isLoading,
    error,
  };
};

/**
 * Get formatted current prices for display
 */
export const useFormattedPrices = () => {
  const { data, isLoading, error } = useCurrentPrices();

  if (!data) {
    return { prices: null, isLoading, error };
  }

  const prices = {
    bitcoin: {
      price: data.bitcoin?.usd,
      change: data.bitcoin?.usd_24h_change,
    },
    ethereum: {
      price: data.ethereum?.usd,
      change: data.ethereum?.usd_24h_change,
    },
    tether: {
      price: data.tether?.usd,
      change: data.tether?.usd_24h_change,
    },
  };

  return { prices, isLoading, error };
};

/**
 * Hook for fetching EXACT prices at a specific date
 * Uses CoinGecko's /history endpoint for accurate historical prices
 * @param {Date|string} date - Target date
 */
export const useExactPricesAtDate = (date) => {
  const dateStr = date ? (date instanceof Date ? date.toISOString().split('T')[0] : date) : null;

  return useQuery({
    queryKey: ['cryptoPrices', 'exact', dateStr],
    queryFn: () => getAllExactPricesAtDate(new Date(date)),
    enabled: !!date,
    staleTime: 60 * 60 * 1000, // 1 hour - historical prices don't change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours in cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 2,
  });
};
