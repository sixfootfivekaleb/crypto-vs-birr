import { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import { useSavingsStore } from '../../store/savingsStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { validateSavingsAmount, validateDate, sanitizeNumberInput } from '../../utils/validators';
import { MIN_DATE, MAX_DATE } from '../../utils/constants';

/**
 * Individual savings entry row
 */
export const SavingsEntry = ({ entry, index, canDelete }) => {
  const setEntryAmount = useSavingsStore((state) => state.setEntryAmount);
  const setEntryDate = useSavingsStore((state) => state.setEntryDate);
  const setEntryCurrency = useSavingsStore((state) => state.setEntryCurrency);
  const removeEntry = useSavingsStore((state) => state.removeEntry);
  const baseCurrency = useSettingsStore((state) => state.baseCurrency);

  const [localAmount, setLocalAmount] = useState(entry.amount?.toString() || '');
  const [amountError, setAmountError] = useState(null);
  const [dateError, setDateError] = useState(null);

  // Sync entry currency with baseCurrency toggle
  useEffect(() => {
    if (entry.currency !== baseCurrency) {
      setEntryCurrency(entry.id, baseCurrency);
    }
  }, [baseCurrency, entry.id, entry.currency, setEntryCurrency]);

  // Debounced amount update
  const debouncedSetAmount = useDebouncedCallback((value) => {
    const validation = validateSavingsAmount(value);
    if (validation.isValid) {
      setEntryAmount(entry.id, value);
      setAmountError(null);
    } else {
      setAmountError(validation.error);
    }
  }, 300);

  const handleAmountChange = useCallback((e) => {
    const sanitized = sanitizeNumberInput(e.target.value);
    setLocalAmount(sanitized);
    debouncedSetAmount(sanitized);
  }, [debouncedSetAmount]);

  const handleDateChange = useCallback((date) => {
    const validation = validateDate(date);
    if (validation.isValid) {
      setEntryDate(entry.id, date);
      setDateError(null);
    } else {
      setDateError(validation.error);
    }
  }, [entry.id, setEntryDate]);

  const handleRemove = useCallback(() => {
    removeEntry(entry.id);
  }, [entry.id, removeEntry]);

  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      {/* Entry number badge */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-birr-green/10 text-birr-green font-semibold text-sm shrink-0">
        {index + 1}
      </div>

      {/* Amount Input */}
      <div className="flex-1">
        <Input
          type="text"
          inputMode="decimal"
          value={localAmount}
          onChange={handleAmountChange}
          placeholder="100,000"
          prefix={baseCurrency === 'ETB' ? 'ETB' : '$'}
          error={amountError}
          size="md"
          aria-label={`Savings amount for entry ${index + 1}`}
        />
      </div>

      {/* Date Picker */}
      <div className="flex-1">
        <DatePicker
          selected={entry.date ? new Date(entry.date) : null}
          onChange={handleDateChange}
          dateFormat="MMM d, yyyy"
          minDate={MIN_DATE}
          maxDate={MAX_DATE}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          className="input-field w-full font-mono"
          placeholderText="Select start date"
          aria-label={`Start date for entry ${index + 1}`}
          portalId="root"
        />
        {dateError && (
          <p className="mt-1 text-sm text-red-500">{dateError}</p>
        )}
      </div>

      {/* Delete Button */}
      {canDelete && (
        <Button
          variant="ghost"
          size="md"
          onClick={handleRemove}
          className="text-red-500 hover:bg-red-500/10 shrink-0"
          aria-label={`Remove entry ${index + 1}`}
        >
          <FiTrash2 className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
};

SavingsEntry.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.string.isRequired,
    amount: PropTypes.number,
    date: PropTypes.string,
    currency: PropTypes.string,
    label: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  canDelete: PropTypes.bool.isRequired,
};

export default SavingsEntry;
