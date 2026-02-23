import { MIN_DATE, MAX_DATE, MAX_SAVINGS_ENTRIES } from './constants';
import { isBefore, isAfter, isValid } from 'date-fns';

/**
 * Validate savings amount
 * @param {number|string} amount - Amount to validate
 * @returns {object} Validation result { isValid, error }
 */
export const validateSavingsAmount = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (amount === '' || amount === null || amount === undefined) {
    return { isValid: false, error: 'Amount is required' };
  }

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (numAmount > 1000000000000) {
    return { isValid: false, error: 'Amount is too large' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate a date
 * @param {Date|string} date - Date to validate
 * @returns {object} Validation result { isValid, error }
 */
export const validateDate = (date) => {
  if (!date) {
    return { isValid: false, error: 'Date is required' };
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (!isValid(dateObj)) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  if (isBefore(dateObj, MIN_DATE)) {
    return { isValid: false, error: `Date must be after ${MIN_DATE.getFullYear()}` };
  }

  if (isAfter(dateObj, MAX_DATE)) {
    return { isValid: false, error: 'Date cannot be in the future' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate a savings entry
 * @param {object} entry - Entry to validate { amount, date, currency }
 * @returns {object} Validation result { isValid, errors }
 */
export const validateSavingsEntry = (entry) => {
  const errors = {};

  const amountValidation = validateSavingsAmount(entry.amount);
  if (!amountValidation.isValid) {
    errors.amount = amountValidation.error;
  }

  const dateValidation = validateDate(entry.date);
  if (!dateValidation.isValid) {
    errors.date = dateValidation.error;
  }

  if (!entry.currency || !['ETB', 'USD'].includes(entry.currency)) {
    errors.currency = 'Invalid currency';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate multiple savings entries
 * @param {Array} entries - Array of entries to validate
 * @returns {object} Validation result { isValid, errors }
 */
export const validateSavingsEntries = (entries) => {
  if (!Array.isArray(entries)) {
    return { isValid: false, errors: ['Entries must be an array'] };
  }

  if (entries.length === 0) {
    return { isValid: false, errors: ['At least one entry is required'] };
  }

  if (entries.length > MAX_SAVINGS_ENTRIES) {
    return {
      isValid: false,
      errors: [`Maximum ${MAX_SAVINGS_ENTRIES} entries allowed`],
    };
  }

  const entryErrors = entries.map((entry, index) => {
    const validation = validateSavingsEntry(entry);
    return validation.isValid ? null : { index, errors: validation.errors };
  }).filter(Boolean);

  return {
    isValid: entryErrors.length === 0,
    errors: entryErrors,
  };
};

/**
 * Sanitize number input
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizeNumberInput = (value) => {
  // Remove everything except digits, decimal point, and minus sign
  let sanitized = value.replace(/[^\d.-]/g, '');

  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }

  // Ensure minus sign is only at the beginning
  if (sanitized.indexOf('-') > 0) {
    sanitized = sanitized.replace(/-/g, '');
  }

  return sanitized;
};

/**
 * Check if API key is valid format
 * @param {string} key - API key to check
 * @returns {boolean} True if valid format
 */
export const isValidApiKey = (key) => {
  if (!key || typeof key !== 'string') return false;

  // Basic format check - most API keys are alphanumeric with dashes
  return /^[a-zA-Z0-9-_]{10,}$/.test(key);
};
