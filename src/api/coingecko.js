import { coingeckoApi, isDemoMode, getApiStatus } from './config';
import { mockCryptoData } from '../data/mockData';
import { formatDateForAPI, timestampToDate } from '../utils/dateUtils';
import { getCache, setCache, getCacheKey } from '../utils/cache';

// Debug flag - set to true to see detailed logs
const DEBUG = true;

const debugLog = (...args) => {
  if (DEBUG) {
    console.log('[CoinGecko Debug]', ...args);
  }
};

/**
 * CoinGecko coin IDs
 */
export const COIN_IDS = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  tether: 'tether',
};

/**
 * Get current prices for all tracked cryptocurrencies
 * Uses localStorage cache for instant subsequent loads
 * @returns {Promise<object>} Current prices in USD
 */
export const getCurrentPrices = async () => {
  debugLog('=== getCurrentPrices called ===');
  debugLog('API Status:', getApiStatus());

  // Check cache first (1-minute TTL for current prices)
  const cacheKey = 'current_prices';
  const cached = getCache(cacheKey);
  if (cached) {
    debugLog('Using CACHED current prices:', cached);
    return cached;
  }

  if (isDemoMode()) {
    debugLog('DEMO MODE - Using mock current prices:', mockCryptoData.currentPrices);
    setCache(cacheKey, mockCryptoData.currentPrices, 60 * 1000);
    return mockCryptoData.currentPrices;
  }

  try {
    debugLog('Fetching LIVE prices from CoinGecko API...');
    const response = await coingeckoApi.get('/simple/price', {
      params: {
        ids: Object.values(COIN_IDS).join(','),
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_last_updated_at: true,
      },
    });

    const data = response.data;
    debugLog('LIVE API Response - Current prices:', {
      bitcoin: data.bitcoin?.usd,
      ethereum: data.ethereum?.usd,
      tether: data.tether?.usd,
    });
    // Cache for 1 minute
    setCache(cacheKey, data, 60 * 1000);
    return data;
  } catch (error) {
    console.error('Failed to fetch current prices:', error);
    debugLog('API ERROR - Falling back to mock data');
    // Fall back to mock data on error
    setCache(cacheKey, mockCryptoData.currentPrices, 30 * 1000);
    return mockCryptoData.currentPrices;
  }
};

/**
 * Get historical price data for a cryptocurrency
 * Uses localStorage cache for fast subsequent loads
 * @param {string} coinId - CoinGecko coin ID
 * @param {number} days - Number of days of history
 * @returns {Promise<Array>} Array of [timestamp, price] pairs
 */
export const getHistoricalPrices = async (coinId, days = 365) => {
  debugLog(`=== getHistoricalPrices called for ${coinId}, ${days} days ===`);

  // Check cache first (10-minute TTL)
  const cacheKey = getCacheKey('historical', coinId, days);
  const cached = getCache(cacheKey);
  if (cached) {
    debugLog(`Using CACHED historical ${coinId} (${cached.length} data points)`);
    // Show first and last prices
    if (cached.length > 0) {
      const first = cached[0];
      const last = cached[cached.length - 1];
      debugLog(`  First: ${new Date(first[0]).toLocaleDateString()} = $${first[1]?.toFixed(2)}`);
      debugLog(`  Last: ${new Date(last[0]).toLocaleDateString()} = $${last[1]?.toFixed(2)}`);
    }
    return cached;
  }

  if (isDemoMode()) {
    debugLog(`DEMO MODE - Using mock historical ${coinId}`);
    const data = mockCryptoData.historicalPrices[coinId] || [];
    debugLog(`  Mock data points: ${data.length}`);
    setCache(cacheKey, data, 10 * 60 * 1000);
    return data;
  }

  try {
    debugLog(`Fetching LIVE historical ${coinId} from CoinGecko API...`);
    const response = await coingeckoApi.get(`/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: days > 90 ? 'daily' : undefined,
      },
    });

    const data = response.data.prices;
    debugLog(`LIVE API Response - ${coinId} historical (${data.length} data points):`);
    if (data.length > 0) {
      const first = data[0];
      const last = data[data.length - 1];
      debugLog(`  First: ${new Date(first[0]).toLocaleDateString()} = $${first[1]?.toFixed(2)}`);
      debugLog(`  Last: ${new Date(last[0]).toLocaleDateString()} = $${last[1]?.toFixed(2)}`);
    }
    // Cache for 10 minutes
    setCache(cacheKey, data, 10 * 60 * 1000);
    return data;
  } catch (error) {
    console.error(`Failed to fetch historical prices for ${coinId}:`, error);
    debugLog(`API ERROR for ${coinId} - Falling back to mock data`);
    // Fall back to mock data on error
    const fallbackData = mockCryptoData.historicalPrices[coinId] || [];
    setCache(cacheKey, fallbackData, 5 * 60 * 1000); // Cache fallback for 5 min
    return fallbackData;
  }
};

/**
 * Get historical price data within a specific date range
 * @param {string} coinId - CoinGecko coin ID
 * @param {Date} from - Start date
 * @param {Date} to - End date
 * @returns {Promise<Array>} Array of [timestamp, price] pairs
 */
export const getHistoricalPricesRange = async (coinId, from, to) => {
  if (isDemoMode()) {
    return mockCryptoData.historicalPrices[coinId] || [];
  }

  try {
    const response = await coingeckoApi.get(`/coins/${coinId}/market_chart/range`, {
      params: {
        vs_currency: 'usd',
        from: Math.floor(from.getTime() / 1000),
        to: Math.floor(to.getTime() / 1000),
      },
    });

    return response.data.prices;
  } catch (error) {
    console.error(`Failed to fetch historical prices range for ${coinId}:`, error);
    // Fall back to regular historical fetch
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
    return getHistoricalPrices(coinId, days);
  }
};

/**
 * Get all historical data for tracked cryptocurrencies
 * @param {number} days - Number of days of history
 * @returns {Promise<object>} Historical data keyed by coin ID
 */
export const getAllHistoricalPrices = async (days = 365) => {
  const coinIds = Object.values(COIN_IDS);

  const results = await Promise.all(
    coinIds.map((coinId) => getHistoricalPrices(coinId, days))
  );

  return coinIds.reduce((acc, coinId, index) => {
    acc[coinId] = results[index];
    return acc;
  }, {});
};

/**
 * Get historical price for a SPECIFIC date using CoinGecko's /history endpoint
 * This is more reliable for exact date lookups than market_chart
 * @param {string} coinId - CoinGecko coin ID
 * @param {Date} date - Target date
 * @returns {Promise<number|null>} Price in USD or null
 */
export const getExactPriceAtDate = async (coinId, date) => {
  // Format date as DD-MM-YYYY for CoinGecko API
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const dateStr = `${day}-${month}-${year}`;

  debugLog(`=== getExactPriceAtDate for ${coinId} on ${dateStr} ===`);

  // Check cache first (1-hour TTL for historical exact prices - they don't change)
  const cacheKey = getCacheKey('exact_price', coinId, dateStr);
  const cached = getCache(cacheKey);
  if (cached !== null) {
    debugLog(`Using CACHED exact price for ${coinId} on ${dateStr}: $${cached}`);
    return cached;
  }

  if (isDemoMode()) {
    debugLog(`DEMO MODE - Cannot get exact price, returning null`);
    return null;
  }

  try {
    debugLog(`Fetching LIVE exact price for ${coinId} on ${dateStr}...`);
    const response = await coingeckoApi.get(`/coins/${coinId}/history`, {
      params: {
        date: dateStr,
        localization: false,
      },
    });

    const price = response.data?.market_data?.current_price?.usd;
    if (price) {
      debugLog(`LIVE API Response - ${coinId} on ${dateStr}: $${price.toFixed(2)}`);
      // Cache for 1 hour (historical prices don't change)
      setCache(cacheKey, price, 60 * 60 * 1000);
      return price;
    } else {
      debugLog(`No price data in response for ${coinId} on ${dateStr}`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to fetch exact price for ${coinId} on ${dateStr}:`, error);
    debugLog(`API ERROR - Could not get exact price`);
    return null;
  }
};

/**
 * Get exact prices for all tracked cryptocurrencies at a specific date
 * @param {Date} date - Target date
 * @returns {Promise<object>} Prices keyed by coin ID
 */
export const getAllExactPricesAtDate = async (date) => {
  const coinIds = Object.values(COIN_IDS);

  const results = await Promise.all(
    coinIds.map((coinId) => getExactPriceAtDate(coinId, date))
  );

  return coinIds.reduce((acc, coinId, index) => {
    acc[coinId] = results[index];
    return acc;
  }, {});
};

/**
 * Transform CoinGecko price data to chart-friendly format
 * @param {Array} priceData - Raw price data [[timestamp, price], ...]
 * @returns {Array} Formatted data [{ date, price }, ...]
 */
export const transformPriceData = (priceData) => {
  if (!priceData || !Array.isArray(priceData)) return [];

  return priceData.map(([timestamp, price]) => ({
    date: timestampToDate(timestamp),
    price: price,
  }));
};

/**
 * Get price at a specific date using binary search (O(log n))
 * Returns closest available price - no strict date threshold
 * @param {Array} priceData - Transformed price data (sorted by date)
 * @param {Date} targetDate - Target date
 * @returns {number|null} Price at date or null
 */
export const getPriceAtDate = (priceData, targetDate) => {
  if (!priceData || priceData.length === 0) {
    debugLog('getPriceAtDate: No price data available');
    return null;
  }

  const targetTime = targetDate.getTime();

  // Handle edge cases - if target is before or after all data
  const firstDate = priceData[0]?.date?.getTime?.() || priceData[0]?.date;
  const lastDate = priceData[priceData.length - 1]?.date?.getTime?.() || priceData[priceData.length - 1]?.date;

  if (targetTime <= firstDate) {
    debugLog(`getPriceAtDate: Target ${targetDate.toLocaleDateString()} is before data, using first price: $${priceData[0].price?.toFixed(2)}`);
    return priceData[0].price;
  }
  if (targetTime >= lastDate) {
    debugLog(`getPriceAtDate: Target ${targetDate.toLocaleDateString()} is after data, using last price: $${priceData[priceData.length - 1].price?.toFixed(2)}`);
    return priceData[priceData.length - 1].price;
  }

  // Binary search for closest date
  let left = 0;
  let right = priceData.length - 1;

  while (left < right - 1) {
    const mid = Math.floor((left + right) / 2);
    const midTime = priceData[mid]?.date?.getTime?.() || priceData[mid]?.date;

    if (midTime === targetTime) {
      debugLog(`getPriceAtDate: Exact match for ${targetDate.toLocaleDateString()} = $${priceData[mid].price?.toFixed(2)}`);
      return priceData[mid].price;
    } else if (midTime < targetTime) {
      left = mid;
    } else {
      right = mid;
    }
  }

  // Return the closest of the two candidates
  const leftTime = priceData[left]?.date?.getTime?.() || priceData[left]?.date;
  const rightTime = priceData[right]?.date?.getTime?.() || priceData[right]?.date;

  const leftDiff = Math.abs(leftTime - targetTime);
  const rightDiff = Math.abs(rightTime - targetTime);

  const result = leftDiff <= rightDiff ? priceData[left].price : priceData[right].price;
  debugLog(`getPriceAtDate: Closest match for ${targetDate.toLocaleDateString()} = $${result?.toFixed(2)}`);
  return result;
};
