import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Chart } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme';
import { getLineChartOptions, getThemeColors } from './chartConfig';
import { COLORS } from '../../utils/colors';

/**
 * Mixed chart combining line and bar elements
 * Shows value progression with monthly change bars
 */
export const MixedChart = ({ chartData, asset = 'bitcoin' }) => {
  const { isDark } = useTheme();

  const data = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    // Line data - cumulative value
    const lineData = chartData.map((d) => ({
      x: d.date,
      y: d[asset],
    }));

    // Calculate monthly changes for bar chart
    const barData = chartData.map((d, i) => {
      if (i === 0) return { x: d.date, y: 0 };
      const prevValue = chartData[i - 1][asset];
      const change = prevValue > 0 ? ((d[asset] - prevValue) / prevValue) * 100 : 0;
      return { x: d.date, y: change };
    });

    return {
      datasets: [
        {
          type: 'line',
          label: 'Value (ETB)',
          data: lineData,
          borderColor: COLORS.bitcoin.primary,
          backgroundColor: 'transparent',
          yAxisID: 'y',
          tension: 0.4,
          order: 1,
        },
        {
          type: 'bar',
          label: 'Daily Change %',
          data: barData,
          backgroundColor: barData.map((d) =>
            d.y >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
          ),
          yAxisID: 'y1',
          order: 2,
          barThickness: 3,
          maxBarThickness: 5,
        },
      ],
    };
  }, [chartData, asset]);

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
            text: 'Value (ETB)',
            color: colors.textSecondary,
          },
          grid: {
            color: colors.grid,
          },
          ticks: {
            color: colors.textSecondary,
          },
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Change %',
            color: colors.textSecondary,
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: colors.textSecondary,
            callback: (value) => `${value.toFixed(1)}%`,
          },
        },
      },
    };
  }, [isDark]);

  if (!data) return null;

  return <Chart type="bar" data={data} options={options} />;
};

MixedChart.propTypes = {
  chartData: PropTypes.array,
  asset: PropTypes.string,
};

export default MixedChart;
