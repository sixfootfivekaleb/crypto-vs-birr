import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Card component with glassmorphism styling
 */
export const Card = ({
  children,
  className = '',
  hover = false,
  gradient = false,
  padding = 'md',
  onClick,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  const baseClasses = `
    glass-card
    ${paddingClasses[padding]}
    ${hover ? 'card-hover cursor-pointer' : ''}
    ${gradient ? 'gradient-border' : ''}
    ${className}
  `;

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={baseClasses}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </Component>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  gradient: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  onClick: PropTypes.func,
};

/**
 * Card header component
 */
export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card title component
 */
export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-dark-900 dark:text-dark-50 ${className}`}>
    {children}
  </h3>
);

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card description component
 */
export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-dark-500 dark:text-dark-400 ${className}`}>
    {children}
  </p>
);

CardDescription.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card content component
 */
export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card footer component
 */
export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-dark-200 dark:border-dark-700 ${className}`}>
    {children}
  </div>
);

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
