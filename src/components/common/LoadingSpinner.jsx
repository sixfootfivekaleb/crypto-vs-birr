import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Loading spinner component
 */
export const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  label = 'Loading...',
  showLabel = false,
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colors = {
    primary: 'border-birr-green',
    white: 'border-white',
    gray: 'border-dark-400',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <motion.div
        className={`
          ${sizes[size]}
          border-2 border-t-transparent rounded-full
          ${colors[color]}
        `}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        aria-label={label}
      />
      {showLabel && (
        <span className="text-sm text-dark-500 dark:text-dark-400">
          {label}
        </span>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'white', 'gray']),
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Full page loading overlay
 */
export const LoadingOverlay = ({ message = 'Loading...', className = '' }) => (
  <motion.div
    className={`
      fixed inset-0 z-50
      flex items-center justify-center
      bg-white/80 dark:bg-dark-900/80
      backdrop-blur-sm
      ${className}
    `}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="text-center">
      <LoadingSpinner size="xl" showLabel label={message} />
    </div>
  </motion.div>
);

LoadingOverlay.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
};

export default LoadingSpinner;
