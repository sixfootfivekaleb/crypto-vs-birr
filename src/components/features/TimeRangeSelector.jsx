import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/settingsStore';
import { TIME_RANGES } from '../../utils/constants';

/**
 * Time range selector buttons
 */
export const TimeRangeSelector = ({ className = '' }) => {
  const timeRange = useSettingsStore((state) => state.timeRange);
  const setTimeRange = useSettingsStore((state) => state.setTimeRange);

  const ranges = Object.entries(TIME_RANGES);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-dark-500 dark:text-dark-400 mr-2">
        Period:
      </span>
      <div className="flex gap-1 p-1 rounded-xl bg-dark-100 dark:bg-dark-800">
        {ranges.map(([key, config]) => (
          <button
            key={key}
            onClick={() => setTimeRange(key)}
            className={`
              relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
              ${timeRange === key
                ? 'text-white'
                : 'text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-200'
              }
            `}
            aria-label={config.description}
            aria-pressed={timeRange === key}
          >
            {timeRange === key && (
              <motion.div
                className="absolute inset-0 bg-birr-green rounded-lg"
                layoutId="timeRangeIndicator"
                transition={{ type: 'spring', duration: 0.3 }}
              />
            )}
            <span className="relative z-10">{config.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

TimeRangeSelector.propTypes = {
  className: PropTypes.string,
};

export default TimeRangeSelector;
