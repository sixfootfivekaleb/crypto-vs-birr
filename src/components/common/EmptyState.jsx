import PropTypes from 'prop-types';
import { FiInbox, FiPlusCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Button } from './Button';

/**
 * Empty state component for displaying when no data is available
 */
export const EmptyState = ({
  title = 'No data',
  message = 'There is no data to display yet.',
  icon: CustomIcon,
  action,
  actionLabel = 'Add Data',
  className = '',
}) => {
  const Icon = CustomIcon || FiInbox;

  return (
    <motion.div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center">
        <Icon className="w-8 h-8 text-dark-400 dark:text-dark-500" />
      </div>

      <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2">
        {title}
      </h3>

      <p className="text-dark-500 dark:text-dark-400 mb-6 max-w-sm">
        {message}
      </p>

      {action && (
        <Button variant="primary" onClick={action} icon={FiPlusCircle}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  icon: PropTypes.elementType,
  action: PropTypes.func,
  actionLabel: PropTypes.string,
  className: PropTypes.string,
};

export default EmptyState;
