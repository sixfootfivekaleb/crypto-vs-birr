import numeral from 'numeral';
import { format as formatDate, formatDistance, formatRelative } from 'date-fns';

/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @param {string} currency - Currency code (ETB, USD, BTC, ETH, USDT)
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'ETB', options = {}) => {
  const { compact = false, showSign = false, decimals = 2 } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const sign = showSign && value > 0 ? '+' : '';

  // Currency symbols and formatting
  const currencyConfig = {
    ETB: { symbol: 'ETB ', decimals: 2, position: 'prefix' },
    USD: { symbol: '$', decimals: 2, position: 'prefix' },
    BTC: { symbol: '', decimals: 8, position: 'suffix', suffix: ' BTC' },
    ETH: { symbol: '', decimals: 6, position: 'suffix', suffix: ' ETH' },
    USDT: { symbol: '', decimals: 2, position: 'suffix', suffix: ' USDT' },
  };

  const config = currencyConfig[currency] || currencyConfig.USD;
  const actualDecimals = decimals !== undefined ? decimals : config.decimals;

  // Use compact notation for large numbers
  if (compact && Math.abs(value) >= 1000000) {
    const formatted = numeral(value).format('0.00a').toUpperCase();
    return `${sign}${config.symbol}${formatted}${config.suffix || ''}`;
  }

  // Format based on value size
  let format;
  if (Math.abs(value) >= 1000) {
    format = `0,0.${'0'.repeat(Math.min(actualDecimals, 2))}`;
  } else if (Math.abs(value) >= 1) {
    format = `0,0.${'0'.repeat(actualDecimals)}`;
  } else {
    // Small numbers (like crypto amounts)
    format = `0,0.${'0'.repeat(actualDecimals)}`;
  }

  const formatted = numeral(value).format(format);

  if (config.position === 'suffix') {
    return `${sign}${formatted}${config.suffix || ''}`;
  }

  return `${sign}${config.symbol}${formatted}`;
};

/**
 * Format a percentage value
 * @param {number} value - The percentage value
 * @param {object} options - Formatting options
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value, options = {}) => {
  const { decimals = 2, showSign = true } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const sign = showSign && value > 0 ? '+' : '';
  const formatted = numeral(value / 100).format(`0.${'0'.repeat(decimals)}%`);

  return `${sign}${formatted}`;
};

/**
 * Format a large number with abbreviations
 * @param {number} value - The number to format
 * @returns {string} Formatted number (e.g., 1.2M, 500K)
 */
export const formatCompactNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  return numeral(value).format('0.00a').toUpperCase();
};

/**
 * Format a number with thousands separators
 * @param {number} value - The number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const format = decimals > 0 ? `0,0.${'0'.repeat(decimals)}` : '0,0';
  return numeral(value).format(format);
};

/**
 * Format a date for display
 * @param {Date|string|number} date - The date to format
 * @param {string} formatStr - Format string (date-fns format)
 * @returns {string} Formatted date string
 */
export const formatDateDisplay = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '—';

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return formatDate(dateObj, formatStr);
  } catch {
    return '—';
  }
};

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '—';

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch {
    return '—';
  }
};

/**
 * Format a date for chart axis labels
 * @param {Date|string|number} date - The date to format
 * @param {string} range - Time range ('1M', '3M', '6M', '1Y', 'ALL')
 * @returns {string} Formatted date for chart
 */
export const formatChartDate = (date, range = '1Y') => {
  if (!date) return '';

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    switch (range) {
      case '1M':
        return formatDate(dateObj, 'MMM d');
      case '3M':
        return formatDate(dateObj, 'MMM d');
      case '6M':
        return formatDate(dateObj, 'MMM yyyy');
      case '1Y':
      case 'ALL':
      default:
        return formatDate(dateObj, 'MMM yyyy');
    }
  } catch {
    return '';
  }
};

/**
 * Format volatility (standard deviation) value
 * @param {number} value - The volatility value
 * @returns {string} Formatted volatility string
 */
export const formatVolatility = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  return `${numeral(value).format('0.00')}%`;
};

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 * @param {number} n - The number
 * @returns {string} Number with ordinal suffix
 */
export const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
