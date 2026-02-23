import { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { SkeletonChart } from '../common/Skeleton';
import { ErrorState } from '../common/ErrorState';

/**
 * Chart container with loading and error states
 */
export const ChartContainer = ({
  children,
  isLoading = false,
  error = null,
  onRetry,
  height = '400px',
  title,
  subtitle,
  actions,
  className = '',
}) => {
  return (
    <motion.div
      className={`chart-container ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Chart Area */}
      <div style={{ height }} className="relative">
        {isLoading ? (
          <SkeletonChart height={height} />
        ) : error ? (
          <ErrorState
            type="generic"
            message={error.message || 'Failed to load chart data'}
            onRetry={onRetry}
            className="h-full"
          />
        ) : (
          <Suspense fallback={<SkeletonChart height={height} />}>
            {children}
          </Suspense>
        )}
      </div>
    </motion.div>
  );
};

ChartContainer.propTypes = {
  children: PropTypes.node,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
  onRetry: PropTypes.func,
  height: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  className: PropTypes.string,
};

export default ChartContainer;
