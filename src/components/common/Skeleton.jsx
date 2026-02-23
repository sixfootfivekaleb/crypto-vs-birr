import PropTypes from 'prop-types';

/**
 * Skeleton loader component for loading states
 */
export const Skeleton = ({
  width,
  height,
  rounded = 'md',
  className = '',
  animate = true,
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  const style = {
    width: width || '100%',
    height: height || '1rem',
  };

  return (
    <div
      className={`
        shimmer
        ${roundedClasses[rounded]}
        ${animate ? '' : 'after:hidden'}
        ${className}
      `}
      style={style}
      aria-hidden="true"
    />
  );
};

Skeleton.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full']),
  className: PropTypes.string,
  animate: PropTypes.bool,
};

/**
 * Skeleton text - multiple lines
 */
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="1rem"
        width={i === lines - 1 ? '70%' : '100%'}
        rounded="md"
      />
    ))}
  </div>
);

SkeletonText.propTypes = {
  lines: PropTypes.number,
  className: PropTypes.string,
};

/**
 * Skeleton card
 */
export const SkeletonCard = ({ className = '' }) => (
  <div className={`glass-card p-6 ${className}`}>
    <Skeleton height="1.5rem" width="60%" className="mb-4" />
    <Skeleton height="3rem" width="80%" className="mb-2" />
    <SkeletonText lines={2} />
  </div>
);

SkeletonCard.propTypes = {
  className: PropTypes.string,
};

/**
 * Skeleton chart
 */
export const SkeletonChart = ({ height = '300px', className = '' }) => (
  <div className={`chart-container ${className}`} style={{ height }}>
    <div className="flex items-end justify-between h-full gap-2 p-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          width="100%"
          height={`${30 + Math.random() * 60}%`}
          rounded="sm"
        />
      ))}
    </div>
  </div>
);

SkeletonChart.propTypes = {
  height: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Skeleton metric card
 */
export const SkeletonMetric = ({ className = '' }) => (
  <div className={`${className}`}>
    <Skeleton height="0.875rem" width="40%" className="mb-2" />
    <Skeleton height="2rem" width="70%" className="mb-1" />
    <Skeleton height="0.75rem" width="50%" />
  </div>
);

SkeletonMetric.propTypes = {
  className: PropTypes.string,
};

export default Skeleton;
