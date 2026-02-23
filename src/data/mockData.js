/**
 * Mock data for demo mode and API fallback
 * Based on realistic historical data patterns
 */

import { subDays, subMonths, subYears, format } from 'date-fns';

const today = new Date();

/**
 * Generate realistic price history with volatility
 * Optimized: Uses weekly data points for periods > 90 days to reduce memory usage
 * @param {number} startPrice - Starting price
 * @param {number} endPrice - Target end price
 * @param {number} days - Number of days
 * @param {number} volatility - Daily volatility (0-1)
 * @returns {Array} Array of [timestamp, price]
 */
const generatePriceHistory = (startPrice, endPrice, days, volatility = 0.02) => {
  const prices = [];

  // Use larger intervals for longer periods to reduce data points
  const interval = days > 365 ? 7 : days > 90 ? 3 : 1;
  const dailyTrend = (endPrice - startPrice) / days;

  let currentPrice = startPrice;

  for (let i = days; i >= 0; i -= interval) {
    const date = subDays(today, i);
    const timestamp = date.getTime();

    // Add some randomness (scaled by interval)
    const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2 * Math.sqrt(interval);
    currentPrice = currentPrice * randomFactor + dailyTrend * interval;

    // Ensure price stays positive
    currentPrice = Math.max(currentPrice, startPrice * 0.1);

    prices.push([timestamp, currentPrice]);
  }

  // Ensure end price is close to target
  prices[prices.length - 1][1] = endPrice;

  return prices;
};

/**
 * Mock cryptocurrency data
 */
export const mockCryptoData = {
  currentPrices: {
    bitcoin: {
      usd: 98500,
      usd_24h_change: 2.5,
      last_updated_at: Math.floor(Date.now() / 1000),
    },
    ethereum: {
      usd: 3450,
      usd_24h_change: 1.8,
      last_updated_at: Math.floor(Date.now() / 1000),
    },
    tether: {
      usd: 1.0,
      usd_24h_change: 0.01,
      last_updated_at: Math.floor(Date.now() / 1000),
    },
  },

  historicalPrices: {
    // Bitcoin: ~$16,000 five years ago to ~$98,500 now (realistic pattern)
    bitcoin: generatePriceHistory(16000, 98500, 1825, 0.03),

    // Ethereum: ~$1,100 five years ago to ~$3,450 now
    ethereum: generatePriceHistory(1100, 3450, 1825, 0.035),

    // Tether: Stable around $1
    tether: generatePriceHistory(1.0, 1.0, 1825, 0.001),
  },
};

/**
 * Mock exchange rate data
 * Ethiopian Birr has been depreciating against USD
 */
export const mockExchangeData = {
  // Current rate (as of early 2025, ETB has significantly weakened)
  currentRate: 126.5,

  // Historical rates showing depreciation trend
  historicalRates: [
    { date: '2015-01-01', rate: 20.1 },
    { date: '2016-01-01', rate: 21.3 },
    { date: '2017-01-01', rate: 22.5 },
    { date: '2018-01-01', rate: 27.2 },
    { date: '2019-01-01', rate: 28.3 },
    { date: '2020-01-01', rate: 32.1 },
    { date: '2020-06-01', rate: 34.5 },
    { date: '2021-01-01', rate: 39.5 },
    { date: '2021-06-01', rate: 43.8 },
    { date: '2022-01-01', rate: 49.5 },
    { date: '2022-06-01', rate: 52.2 },
    { date: '2023-01-01', rate: 53.5 },
    { date: '2023-06-01', rate: 55.0 },
    { date: '2024-01-01', rate: 56.5 },
    { date: '2024-03-01', rate: 57.2 },
    { date: '2024-06-01', rate: 80.0 }, // Major devaluation
    { date: '2024-09-01', rate: 110.0 },
    { date: '2025-01-01', rate: 123.0 },
    { date: format(today, 'yyyy-MM-dd'), rate: 126.5 },
  ],
};

/**
 * Generate complete historical data set for charts
 * @param {number} savingsAmount - Initial savings in ETB
 * @param {Date} startDate - Start date for analysis
 * @returns {object} Complete dataset for all assets
 */
export const generateMockChartData = (savingsAmount = 100000, startDate = subYears(today, 1)) => {
  const days = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
  const data = [];

  // Get start and end exchange rates
  const startRate = 56.5; // Approximate rate 1 year ago
  const endRate = mockExchangeData.currentRate;

  // Calculate initial USD value
  const initialUSD = savingsAmount / startRate;

  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Interpolate exchange rate
    const progress = i / days;
    const currentRate = startRate + (endRate - startRate) * progress;

    // Get crypto prices for this day (simplified - use the generated arrays)
    const btcProgress = i / days;
    const btcPrice = 42000 + (98500 - 42000) * btcProgress;
    const ethPrice = 2200 + (3450 - 2200) * btcProgress;
    const usdtPrice = 1.0;

    // Calculate values
    const birrValue = savingsAmount; // Nominal Birr stays same
    const birrUsdValue = savingsAmount / currentRate; // USD purchasing power

    // If bought crypto at start
    const btcAmount = initialUSD / 42000;
    const btcValue = btcAmount * btcPrice * currentRate;

    const ethAmount = initialUSD / 2200;
    const ethValue = ethAmount * ethPrice * currentRate;

    const usdtAmount = initialUSD;
    const usdtValue = usdtAmount * currentRate;

    const usdValue = initialUSD * currentRate;

    data.push({
      date,
      birr: birrValue,
      birrUsd: birrUsdValue,
      bitcoin: btcValue,
      ethereum: ethValue,
      tether: usdtValue,
      usd: usdValue,
      exchangeRate: currentRate,
    });
  }

  return data;
};

/**
 * Get mock metrics for the dashboard
 */
export const getMockMetrics = () => ({
  inflationRate: 123.7, // Percentage increase in exchange rate over 1 year
  purchasingPowerLoss: 55.3, // Percentage
  bestPerformer: 'bitcoin',
  worstPerformer: 'birr',
  bitcoinGain: 134.5,
  ethereumGain: 56.8,
  usdtGain: 123.7,
  usdGain: 123.7,
  birrLoss: -55.3,
});
