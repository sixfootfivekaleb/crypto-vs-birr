import { useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiTrendingUp } from 'react-icons/fi';
import { useSettingsStore } from '../../store/settingsStore';
import { useSavingsCalculator, useChartData, useAnalyticsMetrics } from '../../hooks/useSavingsCalculator';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { ChartContainer, MultiLineChart } from '../charts';
import { ComparisonGrid } from './ComparisonGrid';
import { MetricsGrid } from './MetricsGrid';

/**
 * Main dashboard component
 */
export const Dashboard = ({ className = '' }) => {
  const chartRef = useRef(null);
  const hasCalculated = useSettingsStore((state) => state.hasCalculated);
  const isCalculating = useSettingsStore((state) => state.isCalculating);

  // Fetch and calculate data
  const { aggregateResults, performance, isLoading: calcLoading, currentRate } = useSavingsCalculator();
  const { chartData, isLoading: chartLoading } = useChartData();
  const { metrics, isLoading: metricsLoading } = useAnalyticsMetrics();

  const isLoading = isCalculating || calcLoading || chartLoading || metricsLoading;

  // Show empty state if user hasn't calculated yet
  if (!hasCalculated) {
    return (
      <div className={className}>
        <Card className="py-16">
          <EmptyState
            title="Ready to Compare"
            message="Enter your savings amount and start date above, then click 'Calculate Comparison' to see how different investments would have performed."
            icon={FiTrendingUp}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comparison Cards */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
          Performance Comparison
        </h2>
        <ComparisonGrid
          results={aggregateResults}
          performance={performance}
          isLoading={isLoading}
        />
      </motion.section>

      {/* Chart Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          {/* Chart Header */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">
              Value Over Time
            </h3>
          </div>

          {/* Chart */}
          <div ref={chartRef}>
            <ChartContainer
              isLoading={isLoading}
              height="400px"
            >
              {chartData && <MultiLineChart chartData={chartData} />}
            </ChartContainer>
          </div>
        </Card>
      </motion.section>

      {/* Metrics Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
          Key Metrics
        </h2>
        <MetricsGrid
          metrics={metrics}
          aggregateResults={aggregateResults}
          currentRate={currentRate}
          isLoading={isLoading}
        />
      </motion.section>
    </div>
  );
};

Dashboard.propTypes = {
  className: PropTypes.string,
};

export default Dashboard;
