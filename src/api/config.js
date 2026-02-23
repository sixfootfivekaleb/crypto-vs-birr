import axios from 'axios';
import { API_CONFIG } from '../utils/constants';

/**
 * Create axios instance for CoinGecko API
 */
export const coingeckoApi = axios.create({
  baseURL: API_CONFIG.COINGECKO_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

// Add API key if available (for paid tier)
const coingeckoApiKey = import.meta.env.VITE_COINGECKO_API_KEY;
if (coingeckoApiKey) {
  coingeckoApi.defaults.headers['x-cg-demo-api-key'] = coingeckoApiKey;
}

/**
 * Create axios instance for Exchange Rate API
 */
const exchangeRateApiKey = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

export const exchangeRateApi = axios.create({
  baseURL: `${API_CONFIG.EXCHANGE_RATE_BASE_URL}/${exchangeRateApiKey || 'demo'}`,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor for logging and debugging
 */
const requestLogger = (config) => {
  if (import.meta.env.DEV) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
};

/**
 * Response interceptor for error handling
 */
const responseErrorHandler = async (error) => {
  const { response, config } = error;

  // Rate limiting handling
  if (response?.status === 429) {
    console.warn('[API] Rate limited. Waiting before retry...');

    // Wait 60 seconds before retrying
    await new Promise((resolve) => setTimeout(resolve, 60000));

    // Retry the request
    return axios(config);
  }

  // Network error
  if (!response) {
    console.error('[API] Network error:', error.message);
    throw new Error('Network error. Please check your connection.');
  }

  // API error
  const errorMessage = response.data?.error || response.data?.message || 'API request failed';
  console.error(`[API] Error ${response.status}:`, errorMessage);

  throw new Error(errorMessage);
};

// Apply interceptors
coingeckoApi.interceptors.request.use(requestLogger);
coingeckoApi.interceptors.response.use((res) => res, responseErrorHandler);

exchangeRateApi.interceptors.request.use(requestLogger);
exchangeRateApi.interceptors.response.use((res) => res, responseErrorHandler);

/**
 * Check if demo mode is enabled
 * @returns {boolean}
 */
export const isDemoMode = () => {
  return API_CONFIG.DEMO_MODE || !exchangeRateApiKey;
};

/**
 * Get API status (useful for debugging)
 * @returns {object}
 */
export const getApiStatus = () => ({
  demoMode: isDemoMode(),
  hasExchangeRateKey: !!exchangeRateApiKey,
  hasCoinGeckoKey: !!coingeckoApiKey,
  refreshInterval: API_CONFIG.REFRESH_INTERVAL,
});
