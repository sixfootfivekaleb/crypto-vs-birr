import { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Input component with label and error handling
 */
export const Input = forwardRef(({
  label,
  error,
  helperText,
  prefix,
  suffix,
  fullWidth = true,
  size = 'md',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="text-dark-500 dark:text-dark-400 font-medium">
              {prefix}
            </span>
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`
            input-field
            ${sizeClasses[size]}
            ${prefix ? 'pl-16' : ''}
            ${suffix ? 'pr-16' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            font-mono
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <span className="text-dark-500 dark:text-dark-400 font-medium">
              {suffix}
            </span>
          </div>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-2 text-sm text-dark-500 dark:text-dark-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  id: PropTypes.string,
};

export default Input;
