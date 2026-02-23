import { exchangeRateApi, isDemoMode, getApiStatus } from './config';
import { mockExchangeData } from '../data/mockData';
import { format } from 'date-fns';
import { getCache, setCache, getCacheKey } from '../utils/cache';

// Debug flag - set to true to see detailed logs
const DEBUG = true;

const debugLog = (...args) => {
  if (DEBUG) {
    console.log('[ExchangeRate Debug]', ...args);
  }
};

/**
 * Get current USD to ETB exchange rate
 * Uses localStorage cache for instant subsequent loads
 * @returns {Promise<object>} Exchange rate data
 */
export const getCurrentExchangeRate = async () => {
  debugLog('=== getCurrentExchangeRate called ===');
  debugLog('API Status:', getApiStatus());

  // Check cache first (5-minute TTL)
  const cacheKey = 'current_exchange_rate';
  const cached = getCache(cacheKey);
  if (cached) {
    debugLog('Using CACHED exchange rate:', cached.rate, 'ETB per USD');
    return cached;
  }

  if (isDemoMode()) {
    debugLog('DEMO MODE - Using mock exchange rate:', mockExchangeData.currentRate);
    const data = {
      rate: mockExchangeData.currentRate,
      lastUpdate: new Date().toISOString(),
    };
    setCache(cacheKey, data, 5 * 60 * 1000);
    return data;
  }

  try {
    debugLog('Fetching LIVE exchange rate from ExchangeRate-API...');
    const response = await exchangeRateApi.get('/latest/USD');

    const data = {
      rate: response.data.conversion_rates?.ETB,
      lastUpdate: response.data.time_last_update_utc,
      baseCode: response.data.base_code,
    };
    debugLog('LIVE API Response - Current rate:', data.rate, 'ETB per USD');
    // Cache for 5 minutes
    setCache(cacheKey, data, 5 * 60 * 1000);
    return data;
  } catch (error) {
    console.error('Failed to fetch current exchange rate:', error);
    debugLog('API ERROR - Falling back to mock rate:', mockExchangeData.currentRate);
    // Fall back to mock data
    const fallbackData = {
      rate: mockExchangeData.currentRate,
      lastUpdate: new Date().toISOString(),
    };
    setCache(cacheKey, fallbackData, 2 * 60 * 1000);
    return fallbackData;
  }
};

/**
 * Get historical USD to ETB exchange rate for a specific date
 * @param {Date} date - Target date
 * @returns {Promise<number>} Exchange rate
 */
export const getHistoricalExchangeRate = async (date) => {
  debugLog(`=== getHistoricalExchangeRate for ${format(date, 'yyyy-MM-dd')} ===`);

  if (isDemoMode()) {
    const rate = getInterpolatedRate(date);
    debugLog(`DEMO MODE - Interpolated rate for ${format(date, 'yyyy-MM-dd')}: ${rate?.toFixed(2)} ETB/USD`);
    return rate;
  }

  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    debugLog(`Fetching LIVE historical rate for ${year}/${month}/${day}...`);
    const response = await exchangeRateApi.get(`/history/USD/${year}/${month}/${day}`);

    const rate = response.data.conversion_rates?.ETB;
    debugLog(`LIVE API Response - Historical rate for ${format(date, 'yyyy-MM-dd')}: ${rate} ETB/USD`);
    return rate;
  } catch (error) {
    console.error(`Failed to fetch historical rate for ${format(date, 'yyyy-MM-dd')}:`, error);
    debugLog(`API ERROR - Falling back to interpolated rate`);
    // Fall back to interpolated mock data
    return getInterpolatedRate(date);
  }
};

/**
 * Get historical exchange rates for multiple dates
 * Uses localStorage cache for fast subsequent loads
 * Optimized: Uses weekly data points for periods > 90 days
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of { date, rate } objects
 */
export const getHistoricalExchangeRates = async (startDate, endDate) => {
  debugLog(`=== getHistoricalExchangeRates ===`);
  debugLog(`  From: ${format(startDate, 'yyyy-MM-dd')} To: ${format(endDate, 'yyyy-MM-dd')}`);

  // Check cache first (10-minute TTL)
  const cacheKey = getCacheKey('exchange_rates', startDate, endDate);
  const cached = getCache(cacheKey);
  if (cached) {
    debugLog(`Using CACHED exchange rates (${cached.length} data points)`);
    if (cached.length > 0) {
      debugLog(`  First: ${cached[0].rate?.toFixed(2)} ETB/USD`);
      debugLog(`  Last: ${cached[cached.length - 1].rate?.toFixed(2)} ETB/USD`);
    }
    // Restore Date objects from cache
    return cached.map(item => ({
      ...item,
      date: new Date(item.date),
    }));
  }

  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  debugLog(`  Total days: ${totalDays}`);

  // Use weekly intervals for longer periods to reduce data points
  const interval = totalDays > 365 ? 7 : totalDays > 90 ? 3 : 1;
  debugLog(`  Interval: ${interval} days`);

  if (isDemoMode()) {
    debugLog('DEMO MODE - Generating interpolated rates');
    const data = generateInterpolatedRates(startDate, endDate, interval);
    debugLog(`  Generated ${data.length} data points`);
    setCache(cacheKey, data, 10 * 60 * 1000);
    return data;
  }

  debugLog('Fetching LIVE start and end rates...');
  // For API efficiency, fetch only start and end rates and interpolate
  const [startRate, endRate] = await Promise.all([
    getHistoricalExchangeRate(startDate),
    getHistoricalExchangeRate(endDate),
  ]);

  debugLog(`LIVE rates: Start=${startRate?.toFixed(2)}, End=${endRate?.toFixed(2)} ETB/USD`);

  // Generate interpolated rates with appropriate interval
  const rates = [];

  for (let i = 0; i <= totalDays; i += interval) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const progress = i / totalDays;
    const rate = startRate + (endRate - startRate) * progress;

    rates.push({
      date: new Date(date),
      rate: rate,
    });
  }

  // Always include the end date
  if (rates.length === 0 || rates[rates.length - 1].date.getTime() !== endDate.getTime()) {
    rates.push({
      date: new Date(endDate),
      rate: endRate,
    });
  }

  debugLog(`Generated ${rates.length} interpolated rate points`);
  // Cache for 10 minutes
  setCache(cacheKey, rates, 10 * 60 * 1000);
  return rates;
};

/**
 * Get interpolated rate from mock data
 * @param {Date} date - Target date
 * @returns {number} Interpolated rate
 */
const getInterpolatedRate = (date) => {
  const historicalRates = mockExchangeData.historicalRates;
  const targetTime = date.getTime();

  // Find surrounding data points
  let before = null;
  let after = null;

  for (const item of historicalRates) {
    const itemTime = new Date(item.date).getTime();

    if (itemTime <= targetTime) {
      if (!before || itemTime > new Date(before.date).getTime()) {
        before = item;
      }
    }

    if (itemTime >= targetTime) {
      if (!after || itemTime < new Date(after.date).getTime()) {
        after = item;
      }
    }
  }

  // If exact match or only one point available
  if (!before) return after?.rate || mockExchangeData.currentRate;
  if (!after) return before.rate;
  if (before === after) return before.rate;

  // Linear interpolation
  const beforeTime = new Date(before.date).getTime();
  const afterTime = new Date(after.date).getTime();
  const progress = (targetTime - beforeTime) / (afterTime - beforeTime);

  return before.rate + (after.rate - before.rate) * progress;
};

/**
 * Generate interpolated rates between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {number} interval - Days between data points (default: 1)
 * @returns {Array} Array of { date, rate } objects
 */
const generateInterpolatedRates = (startDate, endDate, interval = 1) => {
  const rates = [];
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  for (let i = 0; i <= totalDays; i += interval) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    rates.push({
      date: new Date(date),
      rate: getInterpolatedRate(date),
    });
  }

  // Always include the end date
  const lastDate = rates[rates.length - 1]?.date;
  if (!lastDate || Math.abs(lastDate.getTime() - endDate.getTime()) > 24 * 60 * 60 * 1000) {
    rates.push({
      date: new Date(endDate),
      rate: getInterpolatedRate(endDate),
    });
  }

  return rates;
};

/**
 * Calculate inflation rate between two dates based on exchange rate change
 * @param {number} startRate - Exchange rate at start
 * @param {number} endRate - Exchange rate at end
 * @returns {number} Inflation rate as percentage
 */
export const calculateInflationFromRates = (startRate, endRate) => {
  if (!startRate || !endRate) return 0;
  return ((endRate - startRate) / startRate) * 100;
};
