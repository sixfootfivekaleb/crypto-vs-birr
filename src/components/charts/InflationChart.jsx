import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme';
import { getLineChartOptions, getThemeColors } from './chartConfig';
import { COLORS } from '../../utils/colors';
import { formatCurrency } from '../../utils/formatters';

/**
 * Inflation chart showing ETB depreciation over time
 */
export const InflationChart = ({ chartData }) => {
  const { isDark } = useTheme();

  const data = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    // Exchange rate data
    const exchangeRateData = chartData.map((d) => ({
      x: d.date,
      y: d.exchangeRate,
    }));

    // Calculate cumulative inflation from start
    const startRate = chartData[0].exchangeRate;
    const inflationData = chartData.map((d) => ({
      x: d.date,
      y: ((d.exchangeRate - startRate) / startRate) * 100,
    }));

    return {
      datasets: [
        {
          label: 'USD/ETB Rate',
          data: exchangeRateData,
          borderColor: COLORS.usd.primary,
          backgroundColor: 'transparent',
          yAxisID: 'y',
          tension: 0.4,
        },
        {
          label: 'Cumulative Inflation %',
          data: inflationData,
          borderColor: COLORS.negative.primary,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          yAxisID: 'y1',
          tension: 0.4,
        },
      ],
    };
  }, [chartData]);

  const options = useMemo(() => {
    const colors = getThemeColors(isDark);

    return {
      ...getLineChartOptions(isDark),
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'month',
            displayFormats: {
              month: 'MMM yyyy',
            },
          },
          grid: {
            display: false,
          },
          ticks: {
            color: colors.textSecondary,
            font: { size: 11 },
            maxRotation: 0,
          },
          border: { display: false },
        },
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'USD/ETB Rate',
            color: colors.textSecondary,
          },
          grid: {
            color: colors.grid,
          },
          ticks: {
            color: colors.textSecondary,
            callback: (value) => `${value.toFixed(0)}`,
          },
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Inflation %',
            color: colors.textSecondary,
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: colors.textSecondary,
            callback: (value) => `${value.toFixed(0)}%`,
          },
        },
      },
    };
  }, [isDark]);

  if (!data) return null;

  return <Line data={data} options={options} />;
};

InflationChart.propTypes = {
  chartData: PropTypes.array,
};

export default InflationChart;
