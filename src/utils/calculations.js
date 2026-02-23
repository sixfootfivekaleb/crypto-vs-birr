/**
 * Financial calculation utilities
 */

/**
 * Calculate the value of savings if converted to crypto at a specific date
 * @param {number} savingsAmountETB - Initial savings amount in ETB
 * @param {number} etbToUsdRate - ETB to USD exchange rate at start date
 * @param {number} cryptoPriceAtStart - Crypto price in USD at start date
 * @param {number} cryptoPriceNow - Current crypto price in USD
 * @param {number} currentEtbToUsdRate - Current ETB to USD exchange rate
 * @returns {object} Calculation results
 */
export const calculateCryptoValue = (
  savingsAmountETB,
  etbToUsdRate,
  cryptoPriceAtStart,
  cryptoPriceNow,
  currentEtbToUsdRate
) => {
  // Convert ETB to USD at start date
  const usdAtStart = savingsAmountETB / etbToUsdRate;

  // How much crypto could be bought
  const cryptoAmount = usdAtStart / cryptoPriceAtStart;

  // Current value of crypto in USD
  const currentValueUSD = cryptoAmount * cryptoPriceNow;

  // Current value in ETB
  const currentValueETB = currentValueUSD * currentEtbToUsdRate;

  // Calculate gain/loss
  const gainLossETB = currentValueETB - savingsAmountETB;
  const gainLossPercent = ((currentValueETB - savingsAmountETB) / savingsAmountETB) * 100;

  return {
    cryptoAmount,
    usdAtStart,
    currentValueUSD,
    currentValueETB,
    gainLossETB,
    gainLossPercent,
  };
};

/**
 * Calculate the "kept in Birr" value accounting for inflation
 * @param {number} savingsAmountETB - Initial savings amount in ETB
 * @param {number} etbToUsdRateAtStart - ETB/USD rate at start
 * @param {number} etbToUsdRateNow - Current ETB/USD rate
 * @returns {object} Birr value and purchasing power loss
 */
export const calculateBirrValue = (
  savingsAmountETB,
  etbToUsdRateAtStart,
  etbToUsdRateNow
) => {
  // The Birr amount stays the same nominally
  const nominalValue = savingsAmountETB;

  // But purchasing power in USD terms changes
  const usdValueAtStart = savingsAmountETB / etbToUsdRateAtStart;
  const usdValueNow = savingsAmountETB / etbToUsdRateNow;

  // Purchasing power loss percentage
  const purchasingPowerLoss = ((usdValueAtStart - usdValueNow) / usdValueAtStart) * 100;

  // Effective inflation rate (based on exchange rate change)
  const inflationRate = ((etbToUsdRateNow - etbToUsdRateAtStart) / etbToUsdRateAtStart) * 100;

  // Calculate inflation-adjusted current value in ETB
  // This shows what the original amount is "worth" now in real purchasing power terms
  // Formula: original amount adjusted down by the purchasing power loss
  const currentValueETB = savingsAmountETB * (1 - purchasingPowerLoss / 100);

  // Gain/loss in ETB terms (will be negative due to inflation)
  const gainLossETB = currentValueETB - savingsAmountETB;
  const gainLossPercent = -purchasingPowerLoss; // Negative because it's a loss

  return {
    nominalValue,
    currentValueETB,
    usdValueAtStart,
    usdValueNow,
    purchasingPowerLoss,
    inflationRate,
    gainLossETB,
    gainLossPercent,
  };
};

/**
 * Calculate USD value if held in USD
 * @param {number} savingsAmountETB - Initial savings amount in ETB
 * @param {number} etbToUsdRateAtStart - ETB/USD rate at start
 * @param {number} etbToUsdRateNow - Current ETB/USD rate
 * @returns {object} USD investment results
 */
export const calculateUsdValue = (
  savingsAmountETB,
  etbToUsdRateAtStart,
  etbToUsdRateNow
) => {
  // USD amount bought at start
  const usdAmount = savingsAmountETB / etbToUsdRateAtStart;

  // Current value in ETB
  const currentValueETB = usdAmount * etbToUsdRateNow;

  // Gain/loss
  const gainLossETB = currentValueETB - savingsAmountETB;
  const gainLossPercent = ((currentValueETB - savingsAmountETB) / savingsAmountETB) * 100;

  return {
    usdAmount,
    currentValueETB,
    gainLossETB,
    gainLossPercent,
  };
};

/**
 * Calculate standard deviation (volatility)
 * @param {number[]} values - Array of values
 * @returns {number} Standard deviation
 */
export const calculateStandardDeviation = (values) => {
  if (!values || values.length < 2) return 0;

  const n = values.length;
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / n;

  return Math.sqrt(avgSquaredDiff);
};

/**
 * Calculate daily returns from price data
 * @param {number[]} prices - Array of prices
 * @returns {number[]} Array of daily returns (percentage)
 */
export const calculateDailyReturns = (prices) => {
  if (!prices || prices.length < 2) return [];

  return prices.slice(1).map((price, i) => {
    const prevPrice = prices[i];
    return ((price - prevPrice) / prevPrice) * 100;
  });
};

/**
 * Calculate volatility (annualized standard deviation of returns)
 * @param {number[]} prices - Array of prices
 * @returns {number} Annualized volatility percentage
 */
export const calculateVolatility = (prices) => {
  const dailyReturns = calculateDailyReturns(prices);
  const stdDev = calculateStandardDeviation(dailyReturns);

  // Annualize (assuming 365 days)
  return stdDev * Math.sqrt(365);
};

/**
 * Find best and worst performing days
 * @param {Array<{date: Date, value: number}>} data - Price data with dates
 * @returns {object} Best and worst day info
 */
export const findBestWorstDays = (data) => {
  if (!data || data.length < 2) {
    return { best: null, worst: null };
  }

  let bestDay = { date: null, change: -Infinity };
  let worstDay = { date: null, change: Infinity };

  for (let i = 1; i < data.length; i++) {
    const change = ((data[i].value - data[i - 1].value) / data[i - 1].value) * 100;

    if (change > bestDay.change) {
      bestDay = { date: data[i].date, change };
    }

    if (change < worstDay.change) {
      worstDay = { date: data[i].date, change };
    }
  }

  return { best: bestDay, worst: worstDay };
};

/**
 * Calculate average monthly return
 * @param {number[]} prices - Array of prices
 * @param {number} months - Number of months
 * @returns {number} Average monthly return percentage
 */
export const calculateAverageMonthlyReturn = (prices, months) => {
  if (!prices || prices.length < 2 || !months) return 0;

  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const totalReturn = ((endPrice - startPrice) / startPrice) * 100;

  return totalReturn / months;
};

/**
 * Calculate Sharpe Ratio (simplified)
 * @param {number[]} prices - Array of prices
 * @param {number} riskFreeRate - Annual risk-free rate (default 2%)
 * @returns {number} Sharpe ratio
 */
export const calculateSharpeRatio = (prices, riskFreeRate = 0.02) => {
  if (!prices || prices.length < 30) return null;

  const dailyReturns = calculateDailyReturns(prices);
  const avgDailyReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
  const stdDev = calculateStandardDeviation(dailyReturns);

  if (stdDev === 0) return null;

  // Convert to annual
  const annualReturn = avgDailyReturn * 365;
  const annualStdDev = stdDev * Math.sqrt(365);
  const dailyRiskFreeRate = (riskFreeRate * 100) / 365;

  // Sharpe = (Return - Risk-free) / StdDev
  const sharpe = (annualReturn - riskFreeRate * 100) / annualStdDev;

  return sharpe;
};

/**
 * Calculate compound annual growth rate (CAGR)
 * @param {number} startValue - Starting value
 * @param {number} endValue - Ending value
 * @param {number} years - Number of years
 * @returns {number} CAGR as percentage
 */
export const calculateCAGR = (startValue, endValue, years) => {
  if (!startValue || !endValue || !years || years === 0) return 0;

  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
};

/**
 * Calculate maximum drawdown
 * @param {number[]} values - Array of portfolio values
 * @returns {number} Maximum drawdown percentage
 */
export const calculateMaxDrawdown = (values) => {
  if (!values || values.length < 2) return 0;

  let maxDrawdown = 0;
  let peak = values[0];

  for (const value of values) {
    if (value > peak) {
      peak = value;
    }

    const drawdown = ((peak - value) / peak) * 100;

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
};

/**
 * Determine the best performing asset
 * @param {object} results - Object with asset results
 * @returns {string} Asset ID of best performer
 */
export const findBestPerformer = (results) => {
  let best = { id: null, percent: -Infinity };

  for (const [id, data] of Object.entries(results)) {
    if (data.gainLossPercent > best.percent) {
      best = { id, percent: data.gainLossPercent };
    }
  }

  return best.id;
};

/**
 * Determine the worst performing asset
 * @param {object} results - Object with asset results
 * @returns {string} Asset ID of worst performer
 */
export const findWorstPerformer = (results) => {
  let worst = { id: null, percent: Infinity };

  for (const [id, data] of Object.entries(results)) {
    if (data.gainLossPercent < worst.percent) {
      worst = { id, percent: data.gainLossPercent };
    }
  }

  return worst.id;
};
