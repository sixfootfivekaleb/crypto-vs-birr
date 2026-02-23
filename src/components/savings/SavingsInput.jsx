import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiPlay, FiRefreshCw } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';
import { useSavingsStore } from '../../store/savingsStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../common/Card';
import { Button } from '../common/Button';
import { Toggle } from '../common/Toggle';
import { SavingsEntryList } from './SavingsEntryList';

/**
 * Main savings input section
 */
export const SavingsInput = ({ className = '' }) => {
  const isValid = useSavingsStore((state) => state.isValid);
  const entries = useSavingsStore((state) => state.entries);
  const baseCurrency = useSettingsStore((state) => state.baseCurrency);
  const toggleBaseCurrency = useSettingsStore((state) => state.toggleBaseCurrency);
  const triggerCalculation = useSettingsStore((state) => state.triggerCalculation);
  const isCalculating = useSettingsStore((state) => state.isCalculating);
  const hasCalculated = useSettingsStore((state) => state.hasCalculated);

  const canCalculate = isValid();

  const handleCalculate = useCallback(() => {
    if (canCalculate) {
      // Pass current entries to create a snapshot
      triggerCalculation(entries);
    }
  }, [canCalculate, triggerCalculation, entries]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Savings Input</CardTitle>
            <CardDescription>
              Enter your savings amount and start date to compare performance
            </CardDescription>
          </div>

          {/* Currency Toggle */}
          <Toggle
            checked={baseCurrency === 'USD'}
            onChange={toggleBaseCurrency}
            labelLeft="ETB"
            labelRight="USD"
            size="sm"
          />
        </div>
      </CardHeader>

      {/* Savings Entry */}
      <SavingsEntryList />

      {/* Calculate Button */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleCalculate}
          disabled={!canCalculate}
          loading={isCalculating}
          icon={hasCalculated ? FiRefreshCw : FiPlay}
        >
          {isCalculating
            ? 'Calculating...'
            : hasCalculated
            ? 'Update Comparison'
            : 'Calculate Comparison'}
        </Button>
        {!canCalculate && (
          <p className="mt-2 text-sm text-center text-red-500">
            Please enter valid amounts and dates
          </p>
        )}
      </motion.div>
    </Card>
  );
};

SavingsInput.propTypes = {
  className: PropTypes.string,
};

export default SavingsInput;
