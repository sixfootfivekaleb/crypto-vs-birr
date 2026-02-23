import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiLayers,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiGitBranch,
} from 'react-icons/fi';
import { useSettingsStore } from '../../store/settingsStore';
import { CHART_TYPES, CHART_TYPE_CONFIG } from '../../utils/constants';

/**
 * Chart type selection tabs
 */
export const ChartTabs = ({ className = '' }) => {
  const activeChart = useSettingsStore((state) => state.activeChart);
  const setActiveChart = useSettingsStore((state) => state.setActiveChart);

  const iconMap = {
    TrendingUp: FiTrendingUp,
    Layers: FiLayers,
    BarChart2: FiBarChart2,
    PieChart: FiPieChart,
    Activity: FiActivity,
    GitBranch: FiGitBranch,
  };

  const tabs = Object.entries(CHART_TYPE_CONFIG).map(([type, config]) => ({
    type,
    label: config.label,
    Icon: iconMap[config.icon] || FiTrendingUp,
  }));

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map(({ type, label, Icon }) => (
        <button
          key={type}
          onClick={() => setActiveChart(type)}
          className={`
            relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            transition-colors
            ${activeChart === type
              ? 'text-white'
              : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'
            }
          `}
          aria-pressed={activeChart === type}
        >
          {activeChart === type && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-birr-green to-emerald-600 rounded-xl"
              layoutId="chartTabIndicator"
              transition={{ type: 'spring', duration: 0.3 }}
            />
          )}
          <Icon className="relative z-10 w-4 h-4" />
          <span className="relative z-10 hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

ChartTabs.propTypes = {
  className: PropTypes.string,
};

export default ChartTabs;
