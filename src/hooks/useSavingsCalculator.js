import { useMemo, useEffect, useCallback, useRef } from 'react';
import { useSavingsStore } from '../store/savingsStore';
import { useSettingsStore } from '../store/settingsStore';
import { useAllHistoricalPrices, useCurrentPrices, useExactPricesAtDate } from './useCryptoData';
import { useHistoricalExchangeRates, useCurrentExchangeRate, getRateAtDate, useExactExchangeRate } from './useExchangeRate';
import { getPriceAtDate } from '../api/coingecko';
import {
  calculateCryptoValue,
  calculateBirrValue,
  calculateUsdValue,
  calculateVolatility,
  findBestWorstDays,
  calculateAverageMonthlyReturn,
  calculateSharpeRatio,
  calculateMaxDrawdown,
  findBestPerformer,
  findWorstPerformer,
} from '../utils/calculations';
import { getMonthsBetween } from '../utils/dateUtils';
import { ASSETS } from '../utils/constants';

// Debug flag for calculation logging
const DEBUG = true;

const debugLog = (...args) => {
  if (DEBUG) {
    console.log('[Calculator Debug]', ...args);
  }
};

/**
 * Main hook for calculating all savings comparison data
 * Only calculates when button is clicked - uses snapshot of entries
 */
export const useSavingsCalculator = () => {
  const hasCalculated = useSettingsStore((state) => state.hasCalculated);
  const calculationVersion = useSettingsStore((state) => state.calculationVersion);
  const setIsCalculating = useSettingsStore((state) => state.setIsCalculating);
  // Use the SNAPSHOT of entries from when Calculate was clicked, not live entries
  const calculationSnapshot = useSettingsStore((state) => state.calculationSnapshot);
  const entries = calculationSnapshot || [];

  // Memoize the date to prevent unnecessary refetches
  const userDateStr = entries[0]?.date;
  const stableDaysToFetch = useMemo(() => {
    if (!userDateStr) return 365; // Default
    const userStartDate = new Date(userDateStr);
    const today = new Date();
    const daysSinceStart = Math.max(30, Math.ceil((today - userStartDate) / (1000 * 60 * 60 * 24)));
    // Round to nearest 30 days for maximum cache efficiency
    // Support up to ~5 years of historical data (1825 days)
    return Math.min(Math.ceil(daysSinceStart / 30) * 30, 1825);
  }, [userDateStr]);

  // Fetch EXACT prices at user's start date (most accurate)
  const { data: exactStartPrices, isLoading: exactPricesLoading } = useExactPricesAtDate(userDateStr);
  const { data: exactStartRate, isLoading: exactRateLoading } = useExactExchangeRate(userDateStr);

  // Fetch historical data for chart (fallback for calculations if exact fails)
  const { data: cryptoPrices, isLoading: cryptoLoading } = useAllHistoricalPrices(stableDaysToFetch);
  const { data: currentPrices, isLoading: currentLoading } = useCurrentPrices();
  const { data: exchangeRates, isLoading: ratesLoading } = useHistoricalExchangeRates(stableDaysToFetch);
  const { data: currentRate } = useCurrentExchangeRate();

  const isLoading = cryptoLoading || currentLoading || ratesLoading || exactPricesLoading || exactRateLoading;

  // Track if we've ever had data - once we have it, updates should be instant
  const hasDataRef = useRef(false);
  if (cryptoPrices && exchangeRates && currentRate) {
    hasDataRef.current = true;
  }

  // Set calculating to false IMMEDIATELY when we have cached data
  useEffect(() => {
    if (hasCalculated) {
      if (hasDataRef.current || !isLoading) {
        // Instant - no delay needed when we have data
        setIsCalculating(false);
      }
    }
  }, [isLoading, hasCalculated, setIsCalculating, calculationVersion]);

  // Calculate results for each savings entry (only when user has clicked Calculate)
  const results = useMemo(() => {
    if (!hasCalculated || isLoading || !cryptoPrices || !exchangeRates || !currentRate) {
      debugLog('Skipping calculation - missing data or not triggered');
      return null;
    }

    const currentETBRate = currentRate.rate;
    if (!currentETBRate) {
      debugLog('No current ETB rate available');
      return null;
    }

    debugLog('========================================');
    debugLog('=== CALCULATION STARTED ===');
    debugLog('========================================');

    return entries.map((entry) => {
      const startDate = new Date(entry.date);
      const amount = entry.amount;
      const currency = entry.currency;

      debugLog(`\n--- Entry: ${amount} ${currency} on ${startDate.toLocaleDateString()} ---`);

      // Get exchange rate at start date - PREFER EXACT API DATA over interpolated
      const fallbackRate = getRateAtDate(exchangeRates, startDate) || currentETBRate * 0.8;
      const startETBRate = exactStartRate || fallbackRate;
      debugLog(`Exchange Rates: Start=${startETBRate?.toFixed(2)} (${exactStartRate ? 'EXACT API' : 'interpolated'}), Current=${currentETBRate?.toFixed(2)} ETB/USD`);

      // Convert to ETB if entered in USD
      const amountInETB = currency === 'USD'
        ? amount * startETBRate
        : amount;
      debugLog(`Amount in ETB: ${amountInETB?.toFixed(2)}`);

      // Get crypto prices at start date - PREFER EXACT API DATA
      const btcPriceData = cryptoPrices.bitcoin || [];
      const ethPriceData = cryptoPrices.ethereum || [];
      const tetherPriceData = cryptoPrices.tether || [];

      debugLog(`\nCrypto price data points: BTC=${btcPriceData.length}, ETH=${ethPriceData.length}, USDT=${tetherPriceData.length}`);

      // Use exact API prices if available, otherwise fall back to interpolated
      const btcStartPrice = exactStartPrices?.bitcoin || getPriceAtDate(btcPriceData, startDate) || btcPriceData[0]?.price;
      const ethStartPrice = exactStartPrices?.ethereum || getPriceAtDate(ethPriceData, startDate) || ethPriceData[0]?.price;
      const usdtStartPrice = exactStartPrices?.tether || getPriceAtDate(tetherPriceData, startDate) || 1;

      debugLog(`Using ${exactStartPrices?.bitcoin ? 'EXACT API' : 'interpolated'} prices for start date`);

      // Current crypto prices - use fallbacks
      const btcCurrentPrice = currentPrices?.bitcoin?.usd || btcPriceData[btcPriceData.length - 1]?.price;
      const ethCurrentPrice = currentPrices?.ethereum?.usd || ethPriceData[ethPriceData.length - 1]?.price;
      const usdtCurrentPrice = currentPrices?.tether?.usd || 1;

      debugLog(`\nBitcoin: Start=$${btcStartPrice?.toFixed(2)}, Current=$${btcCurrentPrice?.toFixed(2)}`);
      debugLog(`Ethereum: Start=$${ethStartPrice?.toFixed(2)}, Current=$${ethCurrentPrice?.toFixed(2)}`);
      debugLog(`USDT: Start=$${usdtStartPrice?.toFixed(2)}, Current=$${usdtCurrentPrice?.toFixed(2)}`);

      // Calculate values for each asset
      const birrResult = calculateBirrValue(amountInETB, startETBRate, currentETBRate);
      debugLog(`\nBirr Result: Value=${birrResult.currentValueETB?.toFixed(2)}, Change=${birrResult.gainLossPercent?.toFixed(2)}%`);

      // Always calculate if we have any price data
      const bitcoinResult = btcStartPrice && btcCurrentPrice
        ? calculateCryptoValue(amountInETB, startETBRate, btcStartPrice, btcCurrentPrice, currentETBRate)
        : { currentValueETB: 0, gainLossETB: 0, gainLossPercent: 0 };
      debugLog(`Bitcoin Result: Value=${bitcoinResult.currentValueETB?.toFixed(2)} ETB, Change=${bitcoinResult.gainLossPercent?.toFixed(2)}%`);

      const ethereumResult = ethStartPrice && ethCurrentPrice
        ? calculateCryptoValue(amountInETB, startETBRate, ethStartPrice, ethCurrentPrice, currentETBRate)
        : { currentValueETB: 0, gainLossETB: 0, gainLossPercent: 0 };
      debugLog(`Ethereum Result: Value=${ethereumResult.currentValueETB?.toFixed(2)} ETB, Change=${ethereumResult.gainLossPercent?.toFixed(2)}%`);

      const tetherResult = usdtStartPrice && usdtCurrentPrice
        ? calculateCryptoValue(amountInETB, startETBRate, usdtStartPrice, usdtCurrentPrice, currentETBRate)
        : { currentValueETB: 0, gainLossETB: 0, gainLossPercent: 0 };

      const usdResult = calculateUsdValue(amountInETB, startETBRate, currentETBRate);

      debugLog('\n========================================');

      return {
        entryId: entry.id,
        startDate,
        amountInETB,
        [ASSETS.BIRR]: birrResult,
        [ASSETS.BITCOIN]: bitcoinResult,
        [ASSETS.ETHEREUM]: ethereumResult,
        [ASSETS.USDT]: tetherResult,
        [ASSETS.USD]: usdResult,
      };
    });
  }, [entries, cryptoPrices, exchangeRates, currentRate, currentPrices, exactStartPrices, exactStartRate, isLoading, hasCalculated, calculationVersion]);

  // Calculate aggregate results (total across all entries)
  const aggregateResults = useMemo(() => {
    if (!results || results.length === 0) return null;

    // Sum up all entry results
    const aggregate = {
      totalInvestment: 0,
      [ASSETS.BIRR]: { currentValueETB: 0, gainLossETB: 0, gainLossPercent: 0 },
      [ASSETS.BITCOIN]: { currentValueETB: 0, gainLossETB: 0, gainLossPercent: 0 },
      [ASSETS.ETHEREUM]: { currentValueETB: 0, gainLossETB: 0, gainLossPercent: 0 },
      [ASSETS.USDT]: { currentValueETB: 0, gainLossETB: 0, gainLossPercent: 0 },
      [ASSETS.USD]: { currentValueETB: 0, gainLossETB: 0, gainLossPercent: 0 },
    };

    for (const result of results) {
      aggregate.totalInvestment += result.amountInETB;

      // All assets including Birr now have currentValueETB and gainLossETB
      for (const asset of [ASSETS.BIRR, ASSETS.BITCOIN, ASSETS.ETHEREUM, ASSETS.USDT, ASSETS.USD]) {
        if (result[asset]) {
          aggregate[asset].currentValueETB += result[asset].currentValueETB || 0;
          aggregate[asset].gainLossETB += result[asset].gainLossETB || 0;
        }
      }
    }

    // Calculate percentages
    if (aggregate.totalInvestment > 0) {
      for (const asset of [ASSETS.BIRR, ASSETS.BITCOIN, ASSETS.ETHEREUM, ASSETS.USDT, ASSETS.USD]) {
        aggregate[asset].gainLossPercent =
          ((aggregate[asset].currentValueETB - aggregate.totalInvestment) / aggregate.totalInvestment) * 100;
      }
    }

    return aggregate;
  }, [results]);

  // Find best and worst performers
  const performance = useMemo(() => {
    if (!aggregateResults) return { best: null, worst: null };

    const performanceMap = {
      [ASSETS.BIRR]: aggregateResults[ASSETS.BIRR].gainLossPercent,
      [ASSETS.BITCOIN]: aggregateResults[ASSETS.BITCOIN].gainLossPercent,
      [ASSETS.ETHEREUM]: aggregateResults[ASSETS.ETHEREUM].gainLossPercent,
      [ASSETS.USDT]: aggregateResults[ASSETS.USDT].gainLossPercent,
      [ASSETS.USD]: aggregateResults[ASSETS.USD].gainLossPercent,
    };

    return {
      best: findBestPerformer(performanceMap),
      worst: findWorstPerformer(performanceMap),
    };
  }, [aggregateResults]);

  return {
    results,
    aggregateResults,
    performance,
    isLoading,
    currentRate: currentRate?.rate,
  };
};

/**
 * Hook for generating chart data
 * Only generates when button is clicked - uses snapshot of entries
 */
export const useChartData = () => {
  const hasCalculated = useSettingsStore((state) => state.hasCalculated);
  const calculationVersion = useSettingsStore((state) => state.calculationVersion);
  // Use the SNAPSHOT of entries from when Calculate was clicked
  const calculationSnapshot = useSettingsStore((state) => state.calculationSnapshot);
  const entries = calculationSnapshot || [];

  // Memoize days calculation
  const userDateStr = entries[0]?.date;
  const stableDaysToFetch = useMemo(() => {
    if (!userDateStr) return 365; // Default
    const userStartDate = new Date(userDateStr);
    const today = new Date();
    const daysSinceStart = Math.max(30, Math.ceil((today - userStartDate) / (1000 * 60 * 60 * 24)));
    // Round to nearest 30 days for maximum cache hits
    // Support up to ~5 years of historical data (1825 days)
    return Math.min(Math.ceil(daysSinceStart / 30) * 30, 1825);
  }, [userDateStr]);

  const { data: cryptoPrices, isLoading: cryptoLoading } = useAllHistoricalPrices(stableDaysToFetch);
  const { data: exchangeRates, isLoading: ratesLoading } = useHistoricalExchangeRates(stableDaysToFetch);

  const isLoading = cryptoLoading || ratesLoading;

  const chartData = useMemo(() => {
    if (!hasCalculated || isLoading || !cryptoPrices || !exchangeRates) {
      return null;
    }

    // Use the first entry for chart calculations
    const entry = entries[0];
    if (!entry) return null;

    const startDate = new Date(entry.date);
    const amount = entry.amount;

    // Get price data arrays with fallbacks
    const btcPriceData = cryptoPrices.bitcoin || [];
    const ethPriceData = cryptoPrices.ethereum || [];
    const tetherPriceData = cryptoPrices.tether || [];

    // Get start rate with fallback
    const startRate = getRateAtDate(exchangeRates, startDate) || exchangeRates[0]?.rate || 56;

    // Initial USD value
    const initialUSD = amount / startRate;

    // Get start prices with multiple fallbacks
    const btcStartPrice = getPriceAtDate(btcPriceData, startDate) || btcPriceData[0]?.price || 42000;
    const ethStartPrice = getPriceAtDate(ethPriceData, startDate) || ethPriceData[0]?.price || 2200;

    // Calculate crypto amounts bought
    const btcAmount = initialUSD / btcStartPrice;
    const ethAmount = initialUSD / ethStartPrice;
    const usdtAmount = initialUSD;

    // Generate data points for each date in exchange rates
    return exchangeRates.map((rateData) => {
      const date = new Date(rateData.date);
      const currentRate = rateData.rate || startRate;

      // Get crypto prices at this date with fallbacks
      const btcPrice = getPriceAtDate(btcPriceData, date) || btcStartPrice;
      const ethPrice = getPriceAtDate(ethPriceData, date) || ethStartPrice;

      // Calculate ETB purchasing power decline
      // As ETB depreciates (rate increases), purchasing power decreases
      // Formula: original amount * (startRate / currentRate)
      const birrPurchasingPower = amount * (startRate / currentRate);

      return {
        date,
        birr: birrPurchasingPower, // Purchasing power adjusted value (declines over time)
        bitcoin: btcAmount * btcPrice * currentRate,
        ethereum: ethAmount * ethPrice * currentRate,
        tether: usdtAmount * currentRate,
        usd: initialUSD * currentRate,
        exchangeRate: currentRate,
      };
    });
  }, [entries, cryptoPrices, exchangeRates, isLoading, hasCalculated, calculationVersion]);

  return {
    chartData,
    isLoading,
  };
};

/**
 * Hook for analytics metrics
 */
export const useAnalyticsMetrics = () => {
  const { chartData, isLoading: chartLoading } = useChartData();
  const { aggregateResults, isLoading: calcLoading } = useSavingsCalculator();

  const isLoading = chartLoading || calcLoading;

  const metrics = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;

    const months = getMonthsBetween(chartData[0].date, chartData[chartData.length - 1].date);

    // Extract price arrays for volatility calculations
    const btcPrices = chartData.map((d) => d.bitcoin);
    const ethPrices = chartData.map((d) => d.ethereum);
    const usdtPrices = chartData.map((d) => d.tether);
    const usdPrices = chartData.map((d) => d.usd);
    const birrPrices = chartData.map((d) => d.birr);
    const exchangeRates = chartData.map((d) => d.exchangeRate);

    return {
      volatility: {
        bitcoin: calculateVolatility(btcPrices),
        ethereum: calculateVolatility(ethPrices),
        tether: calculateVolatility(usdtPrices),
        usd: calculateVolatility(usdPrices),
        birr: 0, // Nominal birr has 0 volatility
      },
      bestWorstDays: {
        bitcoin: findBestWorstDays(chartData.map((d) => ({ date: d.date, value: d.bitcoin }))),
        ethereum: findBestWorstDays(chartData.map((d) => ({ date: d.date, value: d.ethereum }))),
      },
      monthlyReturn: {
        bitcoin: calculateAverageMonthlyReturn(btcPrices, months),
        ethereum: calculateAverageMonthlyReturn(ethPrices, months),
        usd: calculateAverageMonthlyReturn(usdPrices, months),
      },
      sharpeRatio: {
        bitcoin: calculateSharpeRatio(btcPrices),
        ethereum: calculateSharpeRatio(ethPrices),
      },
      maxDrawdown: {
        bitcoin: calculateMaxDrawdown(btcPrices),
        ethereum: calculateMaxDrawdown(ethPrices),
      },
      inflationRate: exchangeRates.length > 1
        ? ((exchangeRates[exchangeRates.length - 1] - exchangeRates[0]) / exchangeRates[0]) * 100
        : 0,
    };
  }, [chartData]);

  return {
    metrics,
    isLoading,
  };
};
