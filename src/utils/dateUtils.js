import {
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isAfter,
  isBefore,
  isEqual,
  differenceInDays,
  differenceInMonths,
  parseISO,
  format,
} from 'date-fns';
import { TIME_RANGES, MIN_DATE, MAX_DATE } from './constants';

/**
 * Get the start date for a given time range
 * @param {string} range - Time range key ('1M', '3M', '6M', '1Y', 'ALL')
 * @returns {Date} Start date
 */
export const getStartDateForRange = (range) => {
  const today = new Date();
  const config = TIME_RANGES[range];

  if (!config) {
    return subYears(today, 1); // Default to 1 year
  }

  return startOfDay(subDays(today, config.days));
};

/**
 * Get dates for chart x-axis based on time range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} range - Time range for granularity
 * @returns {Date[]} Array of dates
 */
export const getDateRangeArray = (startDate, endDate, range = '1Y') => {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate || new Date());

  // Choose granularity based on range
  switch (range) {
    case '1M':
      // Daily for 1 month
      return eachDayOfInterval({ start, end });
    case '3M':
      // Every 2-3 days for 3 months
      return eachDayOfInterval({ start, end }).filter((_, i) => i % 2 === 0);
    case '6M':
      // Weekly for 6 months
      return eachWeekOfInterval({ start, end });
    case '1Y':
    case 'ALL':
    default:
      // Weekly for longer periods
      return eachWeekOfInterval({ start, end });
  }
};

/**
 * Check if a date is within a valid range
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is valid
 */
export const isDateValid = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }

  return !isBefore(date, MIN_DATE) && !isAfter(date, MAX_DATE);
};

/**
 * Clamp a date to valid range
 * @param {Date} date - Date to clamp
 * @returns {Date} Clamped date
 */
export const clampDate = (date) => {
  if (!date) return new Date();

  if (isBefore(date, MIN_DATE)) return MIN_DATE;
  if (isAfter(date, MAX_DATE)) return MAX_DATE;

  return date;
};

/**
 * Get default start date (1 year ago)
 * @returns {Date} Default start date
 */
export const getDefaultStartDate = () => {
  return startOfDay(subYears(new Date(), 1));
};

/**
 * Format a date for API calls (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForAPI = (date) => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Parse a date string from URL or storage
 * @param {string} dateStr - Date string to parse
 * @returns {Date|null} Parsed date or null
 */
export const parseDateString = (dateStr) => {
  if (!dateStr) return null;

  try {
    const parsed = parseISO(dateStr);
    return isDateValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Get the number of days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of days
 */
export const getDaysBetween = (startDate, endDate = new Date()) => {
  return Math.abs(differenceInDays(endDate, startDate));
};

/**
 * Get the number of months between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of months
 */
export const getMonthsBetween = (startDate, endDate = new Date()) => {
  return Math.abs(differenceInMonths(endDate, startDate));
};

/**
 * Find the closest date in an array to a target date
 * @param {Date[]} dates - Array of dates
 * @param {Date} target - Target date
 * @returns {Date|null} Closest date
 */
export const findClosestDate = (dates, target) => {
  if (!dates || dates.length === 0) return null;

  return dates.reduce((closest, date) => {
    const closestDiff = Math.abs(closest.getTime() - target.getTime());
    const currentDiff = Math.abs(date.getTime() - target.getTime());
    return currentDiff < closestDiff ? date : closest;
  });
};

/**
 * Convert Unix timestamp to Date
 * @param {number} timestamp - Unix timestamp (seconds or milliseconds)
 * @returns {Date} Date object
 */
export const timestampToDate = (timestamp) => {
  // CoinGecko uses milliseconds
  const ms = timestamp > 1e12 ? timestamp : timestamp * 1000;
  return new Date(ms);
};

/**
 * Generate a timestamp for API caching
 * @returns {string} Timestamp string
 */
export const getCacheTimestamp = () => {
  return format(new Date(), 'yyyy-MM-dd-HH');
};
