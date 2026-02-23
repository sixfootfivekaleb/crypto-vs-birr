/**
 * Application-wide constants
 */

// Asset identifiers
export const ASSETS = {
  BIRR: 'birr',
  BITCOIN: 'bitcoin',
  ETHEREUM: 'ethereum',
  USDT: 'tether',
  USD: 'usd',
};

// Asset display configuration
export const ASSET_CONFIG = {
  [ASSETS.BIRR]: {
    id: ASSETS.BIRR,
    name: 'Ethiopian Birr',
    symbol: 'ETB',
    icon: '🇪🇹',
    color: '#009639',
    colorClass: 'birr',
    gradient: 'from-birr-green to-emerald-600',
  },
  [ASSETS.BITCOIN]: {
    id: ASSETS.BITCOIN,
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    color: '#F7931A',
    colorClass: 'btc',
    gradient: 'from-bitcoin to-orange-500',
  },
  [ASSETS.ETHEREUM]: {
    id: ASSETS.ETHEREUM,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    color: '#627EEA',
    colorClass: 'eth',
    gradient: 'from-ethereum to-indigo-500',
  },
  [ASSETS.USDT]: {
    id: ASSETS.USDT,
    name: 'Tether',
    symbol: 'USDT',
    icon: '₮',
    color: '#26A17B',
    colorClass: 'usdt',
    gradient: 'from-usdt to-emerald-400',
  },
  [ASSETS.USD]: {
    id: ASSETS.USD,
    name: 'US Dollar',
    symbol: 'USD',
    icon: '$',
    color: '#3B82F6',
    colorClass: 'usd',
    gradient: 'from-usd-dark to-usd-light',
  },
};

// Time range options
export const TIME_RANGES = {
  '1M': { label: '1M', days: 30, description: '1 Month' },
  '3M': { label: '3M', days: 90, description: '3 Months' },
  '6M': { label: '6M', days: 180, description: '6 Months' },
  '1Y': { label: '1Y', days: 365, description: '1 Year' },
  'ALL': { label: 'All', days: 730, description: 'All Time' },
};

// Default time range
export const DEFAULT_TIME_RANGE = '1Y';

// Chart types
export const CHART_TYPES = {
  LINE: 'line',
  AREA: 'area',
  BAR: 'bar',
  DOUGHNUT: 'doughnut',
  INFLATION: 'inflation',
  MIXED: 'mixed',
};

// Chart type labels
export const CHART_TYPE_CONFIG = {
  [CHART_TYPES.LINE]: { label: 'Comparison', icon: 'TrendingUp' },
  [CHART_TYPES.AREA]: { label: 'Opportunity', icon: 'Layers' },
  [CHART_TYPES.BAR]: { label: 'Current', icon: 'BarChart2' },
  [CHART_TYPES.DOUGHNUT]: { label: 'Allocation', icon: 'PieChart' },
  [CHART_TYPES.INFLATION]: { label: 'Inflation', icon: 'Activity' },
  [CHART_TYPES.MIXED]: { label: 'Combined', icon: 'GitBranch' },
};

// Maximum savings entries
export const MAX_SAVINGS_ENTRIES = 10;

// API configuration
export const API_CONFIG = {
  COINGECKO_BASE_URL: 'https://api.coingecko.com/api/v3',
  EXCHANGE_RATE_BASE_URL: 'https://v6.exchangerate-api.com/v6',
  REFRESH_INTERVAL: parseInt(import.meta.env.VITE_REFRESH_INTERVAL) || 60000,
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true',
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'crypto-vs-birr-theme',
  SAVINGS: 'crypto-vs-birr-savings',
  SETTINGS: 'crypto-vs-birr-settings',
};

// Ethiopian Birr starting year for historical data
// (CoinGecko has crypto data from around 2013, but ETB rates are more reliable from 2015+)
export const MIN_DATE = new Date('2015-01-01');
export const MAX_DATE = new Date();

// Default savings amount in ETB
export const DEFAULT_SAVINGS_AMOUNT = 100000;

// Debounce delay for inputs (ms)
export const DEBOUNCE_DELAY = 300;

// Animation durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};
