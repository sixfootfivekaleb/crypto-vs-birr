import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiAward, FiAlertTriangle } from 'react-icons/fi';
import { Card } from '../common/Card';
import { ASSET_CONFIG } from '../../utils/constants';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { getGainLossColor, getGainLossBgColor } from '../../utils/colors';

/**
 * Individual asset performance card
 */
export const AssetCard = ({
  asset,
  currentValue,
  gainLoss,
  gainLossPercent,
  isBest = false,
  isWorst = false,
  className = '',
}) => {
  const config = ASSET_CONFIG[asset];
  const isPositive = gainLossPercent >= 0;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`
          relative overflow-hidden
          ${isBest ? 'ring-2 ring-emerald-500' : ''}
          ${isWorst ? 'ring-2 ring-red-500' : ''}
        `}
        hover
      >
        {/* Best/Worst Badge */}
        {(isBest || isWorst) && (
          <div
            className={`
              absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              ${isBest ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}
            `}
          >
            {isBest ? <FiAward className="w-3 h-3" /> : <FiAlertTriangle className="w-3 h-3" />}
            {isBest ? 'Best' : 'Worst'}
          </div>
        )}

        {/* Asset Icon & Name */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${config?.color}20` }}
          >
            <span style={{ color: config?.color }}>
              {config?.icon}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-dark-900 dark:text-dark-50">
              {config?.name || asset}
            </h4>
            <p className="text-xs text-dark-500 dark:text-dark-400">
              {config?.symbol}
            </p>
          </div>
        </div>

        {/* Current Value */}
        <div className="mb-3">
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">
            Current Value
          </p>
          <p className="text-2xl font-bold font-mono text-dark-900 dark:text-dark-50">
            {formatCurrency(currentValue, 'ETB')}
          </p>
        </div>

        {/* Gain/Loss */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              {isPositive ? 'Gain' : 'Loss'}
            </p>
            <p className={`font-medium font-mono ${getGainLossColor(gainLoss)}`}>
              {formatCurrency(Math.abs(gainLoss), 'ETB', { showSign: true })}
            </p>
          </div>

          <div
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium
              ${getGainLossBgColor(gainLossPercent)}
            `}
          >
            {isPositive ? (
              <FiTrendingUp className="w-4 h-4" />
            ) : (
              <FiTrendingDown className="w-4 h-4" />
            )}
            {formatPercent(gainLossPercent)}
          </div>
        </div>

        {/* Colored bottom border */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: config?.color }}
        />
      </Card>
    </motion.div>
  );
};

AssetCard.propTypes = {
  asset: PropTypes.string.isRequired,
  currentValue: PropTypes.number,
  gainLoss: PropTypes.number,
  gainLossPercent: PropTypes.number,
  isBest: PropTypes.bool,
  isWorst: PropTypes.bool,
  className: PropTypes.string,
};

export default AssetCard;
