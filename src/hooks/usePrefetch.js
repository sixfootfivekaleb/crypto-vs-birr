import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentPrices, getHistoricalPrices, COIN_IDS, transformPriceData } from '../api/coingecko';
import { getCurrentExchangeRate, getHistoricalExchangeRates } from '../api/exchangeRate';
import { TIME_RANGES } from '../utils/constants';
import { subDays } from 'date-fns';

/**
 * Prefetch all data on app load for instant calculations
 * This runs in the background and populates both localStorage and React Query cache
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchAll = async () => {
      try {
        // Prefetch current prices
        queryClient.prefetchQuery({
          queryKey: ['cryptoPrices', 'current'],
          queryFn: getCurrentPrices,
          staleTime: 60 * 1000,
        });

        // Prefetch current exchange rate
        queryClient.prefetchQuery({
          queryKey: ['exchangeRate', 'current'],
          queryFn: getCurrentExchangeRate,
          staleTime: 5 * 60 * 1000,
        });

        // Prefetch historical data for default time range (1Y)
        const defaultDays = TIME_RANGES['1Y'].days;
        const coinIds = Object.values(COIN_IDS);

        // Prefetch all crypto historical prices in parallel
        coinIds.forEach((coinId) => {
          queryClient.prefetchQuery({
            queryKey: ['cryptoPrices', 'historical', coinId, defaultDays],
            queryFn: () => getHistoricalPrices(coinId, defaultDays),
            select: transformPriceData,
            staleTime: 10 * 60 * 1000,
          });
        });

        // Prefetch historical exchange rates
        const endDate = new Date();
        const startDate = subDays(endDate, defaultDays);
        queryClient.prefetchQuery({
          queryKey: ['exchangeRate', 'historical', defaultDays],
          queryFn: () => getHistoricalExchangeRates(startDate, endDate),
          staleTime: 10 * 60 * 1000,
        });
      } catch (error) {
        console.warn('Prefetch error:', error);
      }
    };

    // Start prefetch after a short delay to not block initial render
    const timer = setTimeout(prefetchAll, 100);
    return () => clearTimeout(timer);
  }, [queryClient]);
};

export default usePrefetch;
