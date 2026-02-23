import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Toggle switch component
 */
export const Toggle = ({
  checked,
  onChange,
  label,
  labelLeft,
  labelRight,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
  };

  const { track, thumb, translate } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {labelLeft && (
        <span
          className={`text-sm font-medium ${
            !checked ? 'text-dark-900 dark:text-dark-50' : 'text-dark-400 dark:text-dark-500'
          }`}
        >
          {labelLeft}
        </span>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex items-center rounded-full transition-colors
          ${track}
          ${checked ? 'bg-birr-green' : 'bg-dark-300 dark:bg-dark-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-birr-green focus:ring-offset-2
          dark:focus:ring-offset-dark-900
        `}
      >
        <motion.span
          className={`
            inline-block rounded-full bg-white shadow-md
            ${thumb}
          `}
          initial={false}
          animate={{
            x: checked ? parseInt(translate.split('-x-')[1]) * 4 : 2,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>

      {labelRight && (
        <span
          className={`text-sm font-medium ${
            checked ? 'text-dark-900 dark:text-dark-50' : 'text-dark-400 dark:text-dark-500'
          }`}
        >
          {labelRight}
        </span>
      )}

      {label && !labelLeft && !labelRight && (
        <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
          {label}
        </span>
      )}
    </div>
  );
};

Toggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  labelLeft: PropTypes.string,
  labelRight: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Toggle;
