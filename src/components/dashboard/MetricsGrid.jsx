import PropTypes from 'prop-types';
import {
  FiTrendingDown,
  FiActivity,
  FiDollarSign,
  FiPercent,
  FiBarChart2,
  FiTarget,
  FiZap,
  FiShield,
} from 'react-icons/fi';
import { MetricCard } from './MetricCard';
import { SkeletonMetric } from '../common/Skeleton';
import { formatCurrency, formatPercent, formatVolatility } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

/**
 * Grid of key metrics
 */
export const MetricsGrid = ({
  metrics,
  aggregateResults,
  currentRate,
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonMetric key={i} className="p-4 rounded-xl bg-white dark:bg-dark-800" />
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Inflation Rate',
      value: formatPercent(metrics?.inflationRate || 0),
      icon: FiTrendingDown,
      color: COLORS.negative.primary,
      trend: metrics?.inflationRate || 0,
    },
    {
      label: 'Current ETB/USD',
      value: currentRate?.toFixed(2) || '—',
      subValue: 'ETB',
      icon: FiDollarSign,
      color: COLORS.usd.primary,
    },
    {
      label: 'BTC Volatility',
      value: formatVolatility(metrics?.volatility?.bitcoin),
      icon: FiActivity,
      color: COLORS.bitcoin.primary,
    },
    {
      label: 'ETH Volatility',
      value: formatVolatility(metrics?.volatility?.ethereum),
      icon: FiActivity,
      color: COLORS.ethereum.primary,
    },
    {
      label: 'BTC Monthly Avg',
      value: formatPercent(metrics?.monthlyReturn?.bitcoin || 0),
      icon: FiBarChart2,
      color: COLORS.bitcoin.primary,
      trend: metrics?.monthlyReturn?.bitcoin || 0,
    },
    {
      label: 'ETH Monthly Avg',
      value: formatPercent(metrics?.monthlyReturn?.ethereum || 0),
      icon: FiBarChart2,
      color: COLORS.ethereum.primary,
      trend: metrics?.monthlyReturn?.ethereum || 0,
    },
    {
      label: 'BTC Max Drawdown',
      value: formatPercent(-(metrics?.maxDrawdown?.bitcoin || 0)),
      icon: FiShield,
      color: COLORS.bitcoin.primary,
    },
    {
      label: 'BTC Sharpe Ratio',
      value: metrics?.sharpeRatio?.bitcoin?.toFixed(2) || '—',
      icon: FiTarget,
      color: COLORS.bitcoin.primary,
    },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {metricCards.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

MetricsGrid.propTypes = {
  metrics: PropTypes.object,
  aggregateResults: PropTypes.object,
  currentRate: PropTypes.number,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
};

export default MetricsGrid;
