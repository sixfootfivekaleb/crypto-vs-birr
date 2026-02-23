import PropTypes from 'prop-types';
import { FiAlertCircle, FiRefreshCw, FiWifi, FiServer } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Button } from './Button';

/**
 * Error state component for displaying errors in UI
 */
export const ErrorState = ({
  title = 'Error',
  message = 'Something went wrong. Please try again.',
  type = 'generic',
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) => {
  const icons = {
    generic: FiAlertCircle,
    network: FiWifi,
    server: FiServer,
  };

  const Icon = icons[type] || icons.generic;

  const titles = {
    generic: title,
    network: 'Connection Error',
    server: 'Server Error',
  };

  const messages = {
    generic: message,
    network: 'Please check your internet connection and try again.',
    server: 'Our servers are having issues. Please try again later.',
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-14 h-14 mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <Icon className="w-7 h-7 text-red-500" />
      </div>

      <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2">
        {titles[type]}
      </h3>

      <p className="text-dark-500 dark:text-dark-400 mb-6 max-w-sm">
        {messages[type]}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          icon={FiRefreshCw}
        >
          {retryLabel}
        </Button>
      )}
    </motion.div>
  );
};

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.oneOf(['generic', 'network', 'server']),
  onRetry: PropTypes.func,
  retryLabel: PropTypes.string,
  className: PropTypes.string,
};

export default ErrorState;
