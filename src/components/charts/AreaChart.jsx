import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme';
import { getLineChartOptions } from './chartConfig';
import { COLORS } from '../../utils/colors';

/**
 * Area chart showing opportunity cost (gap between best performer and Birr)
 */
export const AreaChart = ({ chartData, bestAsset = 'bitcoin' }) => {
  const { isDark } = useTheme();

  const data = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    // Get the best performing asset data
    const bestData = chartData.map((d) => ({
      x: d.date,
      y: d[bestAsset],
    }));

    // Get birr data
    const birrData = chartData.map((d) => ({
      x: d.date,
      y: d.birr,
    }));

    return {
      datasets: [
        {
          label: 'Best Performer',
          data: bestData,
          borderColor: COLORS.positive.primary,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          fill: true,
          tension: 0.4,
          order: 1,
        },
        {
          label: 'Birr Value',
          data: birrData,
          borderColor: COLORS.negative.primary,
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          fill: true,
          tension: 0.4,
          order: 2,
        },
      ],
    };
  }, [chartData, bestAsset]);

  const options = useMemo(() => {
    return getLineChartOptions(isDark, {
      plugins: {
        filler: {
          propagate: true,
        },
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              if (items.length >= 2) {
                const diff = items[0].parsed.y - items[1].parsed.y;
                const percent = ((diff / items[1].parsed.y) * 100).toFixed(1);
                return `\nOpportunity Cost: ${percent}%`;
              }
              return '';
            },
          },
        },
      },
    });
  }, [isDark]);

  if (!data) return null;

  return <Line data={data} options={options} />;
};

AreaChart.propTypes = {
  chartData: PropTypes.array,
  bestAsset: PropTypes.string,
};

export default AreaChart;
