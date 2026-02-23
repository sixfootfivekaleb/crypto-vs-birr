/**
 * Persistent localStorage cache with TTL support
 */

const CACHE_PREFIX = 'cvb_cache_';
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Get cached data from localStorage
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if expired/not found
 */
export const getCache = (key) => {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const { data, timestamp, ttl } = JSON.parse(cached);
    const now = Date.now();

    // Check if expired
    if (now - timestamp > ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
};

/**
 * Set cache data in localStorage
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 */
export const setCache = (key, data, ttl = DEFAULT_TTL) => {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('Cache write error:', error);
    // If localStorage is full, clear old cache entries
    clearOldCache();
  }
};

/**
 * Clear expired cache entries
 */
export const clearOldCache = () => {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    const now = Date.now();

    for (const key of keys) {
      try {
        const cached = JSON.parse(localStorage.getItem(key));
        if (!cached || now - cached.timestamp > cached.ttl) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
};

/**
 * Generate cache key from parameters
 */
export const getCacheKey = (...args) => {
  return args.map(arg => {
    if (arg instanceof Date) return arg.toISOString().split('T')[0];
    if (typeof arg === 'object') return JSON.stringify(arg);
    return String(arg);
  }).join('_');
};
