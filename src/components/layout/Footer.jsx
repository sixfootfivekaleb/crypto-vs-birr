import PropTypes from 'prop-types';
import { FiExternalLink, FiGithub, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/settingsStore';
import { formatRelativeTime } from '../../utils/formatters';

/**
 * Application footer component
 */
export const Footer = ({ className = '' }) => {
  const lastUpdate = useSettingsStore((state) => state.lastUpdate);

  return (
    <footer className={`mt-auto py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Data Sources */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-dark-500 dark:text-dark-400">
              <span className="font-medium text-dark-700 dark:text-dark-300">
                Data Sources:
              </span>
              <a
                href="https://www.coingecko.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-birr-green transition-colors"
              >
                CoinGecko
                <FiExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.exchangerate-api.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-birr-green transition-colors"
              >
                ExchangeRate-API
                <FiExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Last Update */}
            {lastUpdate && (
              <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
                <FiClock className="w-4 h-4" />
                <span>Updated {formatRelativeTime(lastUpdate)}</span>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="pt-4 border-t border-dark-200 dark:border-dark-700">
            <p className="text-xs text-dark-400 dark:text-dark-500 leading-relaxed">
              <strong className="text-dark-500 dark:text-dark-400">Disclaimer:</strong>{' '}
              This tool is for educational and informational purposes only. Cryptocurrency
              investments are highly volatile and risky. Past performance does not guarantee
              future results. This is not financial advice. Always do your own research and
              consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>

          {/* Copyright */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
            <p className="text-xs text-dark-400 dark:text-dark-500">
              © {new Date().getFullYear()} Crypto vs Birr Tracker
            </p>

            <div className="flex items-center gap-4">
              <span className="text-xs text-dark-400 dark:text-dark-500">
                🇪🇹 Made for Ethiopian savers
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;
