import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme';
import { getDoughnutChartOptions } from './chartConfig';
import { ASSET_CONFIG, ASSETS } from '../../utils/constants';
import { COLORS } from '../../utils/colors';
import { formatCurrency, formatPercent } from '../../utils/formatters';

/**
 * Doughnut chart showing portfolio allocation comparison
 */
export const DoughnutChart = ({ currentValues, centerValue, centerLabel }) => {
  const { isDark } = useTheme();

  const data = useMemo(() => {
    if (!currentValues) return null;

    const assets = [ASSETS.BITCOIN, ASSETS.ETHEREUM, ASSETS.USDT, ASSETS.USD];

    const labels = assets.map((asset) => ASSET_CONFIG[asset]?.name || asset);
    const values = assets.map((asset) => currentValues[asset]?.currentValueETB || 0);

    const backgroundColors = [
      COLORS.bitcoin.primary,
      COLORS.ethereum.primary,
      COLORS.usdt.primary,
      COLORS.usd.primary,
    ];

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }, [currentValues]);

  const options = useMemo(() => {
    return getDoughnutChartOptions(isDark);
  }, [isDark]);

  if (!data) return null;

  return (
    <div className="relative">
      <Doughnut data={data} options={options} />

      {/* Center content */}
      {(centerValue || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="text-2xl font-bold text-dark-900 dark:text-dark-50">
              {typeof centerValue === 'number'
                ? formatCurrency(centerValue, 'ETB', { compact: true })
                : centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-sm text-dark-500 dark:text-dark-400">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

DoughnutChart.propTypes = {
  currentValues: PropTypes.object,
  centerValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  centerLabel: PropTypes.string,
};

export default DoughnutChart;
