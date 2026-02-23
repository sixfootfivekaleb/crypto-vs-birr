import PropTypes from 'prop-types';
import { FiMoon, FiSun, FiShare2, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTheme } from '../../hooks/useTheme';
import { useUrlParams } from '../../hooks/useUrlParams';
import { Button } from '../common/Button';

/**
 * Application header component
 */
export const Header = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const { copyShareUrl } = useUrlParams();

  const handleShare = async () => {
    const result = await copyShareUrl();
    if (result.success) {
      toast.success('Share link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  return (
    <header className={`sticky top-0 z-40 ${className}`}>
      <div className="absolute inset-0 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-200/50 dark:border-dark-700/50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo and Title */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Logo */}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-birr-green via-birr-yellow to-bitcoin">
              <span className="text-xl font-bold text-white">₿</span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-lg md:text-xl font-bold text-dark-900 dark:text-dark-50">
                Crypto vs Birr
              </h1>
              <p className="text-xs text-dark-500 dark:text-dark-400 hidden sm:block">
                Savings Comparison Tracker
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              icon={FiShare2}
              className="hidden sm:flex"
            >
              Share
            </Button>

            {/* Mobile Share Icon */}
            <button
              onClick={handleShare}
              className="sm:hidden p-2 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Share"
            >
              <FiShare2 className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDark ? (
                  <FiSun className="w-5 h-5" />
                ) : (
                  <FiMoon className="w-5 h-5" />
                )}
              </motion.div>
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
