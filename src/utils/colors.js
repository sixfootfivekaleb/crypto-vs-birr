/**
 * Color definitions for charts and UI
 */

export const COLORS = {
  // Ethiopian flag colors for Birr
  birr: {
    primary: '#009639',
    secondary: '#FEDD00',
    accent: '#EF2118',
    light: 'rgba(0, 150, 57, 0.1)',
  },

  // Cryptocurrency colors
  bitcoin: {
    primary: '#F7931A',
    light: 'rgba(247, 147, 26, 0.1)',
    gradient: ['#F7931A', '#FF9500'],
  },

  ethereum: {
    primary: '#627EEA',
    light: 'rgba(98, 126, 234, 0.1)',
    gradient: ['#627EEA', '#8B5CF6'],
  },

  usdt: {
    primary: '#26A17B',
    light: 'rgba(38, 161, 123, 0.1)',
    gradient: ['#26A17B', '#10B981'],
  },

  // USD
  usd: {
    primary: '#3B82F6',
    dark: '#1E40AF',
    light: 'rgba(59, 130, 246, 0.1)',
    gradient: ['#1E40AF', '#3B82F6'],
  },

  // Status colors
  positive: {
    primary: '#10B981',
    light: 'rgba(16, 185, 129, 0.1)',
  },

  negative: {
    primary: '#EF4444',
    light: 'rgba(239, 68, 68, 0.1)',
  },

  neutral: {
    primary: '#6B7280',
    light: 'rgba(107, 114, 128, 0.1)',
  },

  // Chart specific
  grid: {
    light: 'rgba(148, 163, 184, 0.1)',
    dark: 'rgba(71, 85, 105, 0.3)',
  },

  tooltip: {
    light: '#ffffff',
    dark: '#1e293b',
  },
};

/**
 * Get chart colors for a specific asset
 * @param {string} assetId - Asset identifier
 * @param {number} opacity - Opacity value (0-1)
 * @returns {object} Color configuration for Chart.js
 */
export const getAssetChartColors = (assetId, opacity = 1) => {
  const colorMap = {
    birr: COLORS.birr.primary,
    bitcoin: COLORS.bitcoin.primary,
    ethereum: COLORS.ethereum.primary,
    tether: COLORS.usdt.primary,
    usd: COLORS.usd.primary,
  };

  const color = colorMap[assetId] || COLORS.neutral.primary;

  return {
    borderColor: color,
    backgroundColor: opacity < 1
      ? color.replace(')', `, ${opacity})`).replace('rgb', 'rgba')
      : color,
    pointBackgroundColor: color,
    pointBorderColor: '#ffffff',
  };
};

/**
 * Generate gradient for Chart.js
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} colorStart - Start color
 * @param {string} colorEnd - End color
 * @param {number} height - Chart height
 * @returns {CanvasGradient} Gradient object
 */
export const createChartGradient = (ctx, colorStart, colorEnd, height = 400) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

/**
 * Get color class for gain/loss display
 * @param {number} value - The value to check
 * @returns {string} Tailwind color class
 */
export const getGainLossColor = (value) => {
  if (value > 0) return 'text-emerald-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-500';
};

/**
 * Get background color class for gain/loss badges
 * @param {number} value - The value to check
 * @returns {string} Tailwind background class
 */
export const getGainLossBgColor = (value) => {
  if (value > 0) return 'bg-emerald-500/10 text-emerald-500';
  if (value < 0) return 'bg-red-500/10 text-red-500';
  return 'bg-gray-500/10 text-gray-500';
};
