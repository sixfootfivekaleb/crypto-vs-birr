import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { getGainLossColor } from '../../utils/colors';

/**
 * Individual metric display card
 */
export const MetricCard = ({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
  color,
  className = '',
}) => {
  return (
    <motion.div
      className={`p-4 rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-dark-500 dark:text-dark-400">
          {label}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: color ? `${color}20` : undefined }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: color }}
            />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold font-mono text-dark-900 dark:text-dark-50">
          {value}
        </span>
        {subValue && (
          <span className="text-sm text-dark-500 dark:text-dark-400 mb-1">
            {subValue}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${getGainLossColor(trend)}`}>
          {trend >= 0 ? (
            <FiArrowUp className="w-3 h-3" />
          ) : (
            <FiArrowDown className="w-3 h-3" />
          )}
          <span>{trendValue || `${Math.abs(trend).toFixed(1)}%`}</span>
        </div>
      )}
    </motion.div>
  );
};

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subValue: PropTypes.string,
  icon: PropTypes.elementType,
  trend: PropTypes.number,
  trendValue: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
};

export default MetricCard;
