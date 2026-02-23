import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme';
import { getLineChartOptions, createDataset } from './chartConfig';
import { ASSET_CONFIG, ASSETS } from '../../utils/constants';

/**
 * Multi-line comparison chart showing all assets over time
 */
export const MultiLineChart = ({ chartData, visibleAssets = null }) => {
  const { isDark } = useTheme();

  const data = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    // Default to all assets if not specified
    const assets = visibleAssets || [
      ASSETS.BIRR,
      ASSETS.BITCOIN,
      ASSETS.ETHEREUM,
      ASSETS.USDT,
      ASSETS.USD,
    ];

    const datasets = assets.map((asset) => {
      const config = ASSET_CONFIG[asset];
      const dataPoints = chartData.map((d) => ({
        x: d.date,
        y: d[asset],
      }));

      return createDataset(asset, dataPoints, {
        label: config?.name || asset,
      });
    });

    return { datasets };
  }, [chartData, visibleAssets]);

  const options = useMemo(() => {
    return getLineChartOptions(isDark, {
      plugins: {
        title: {
          display: false,
        },
      },
    });
  }, [isDark]);

  if (!data) return null;

  return <Line data={data} options={options} />;
};

MultiLineChart.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.instanceOf(Date),
      birr: PropTypes.number,
      bitcoin: PropTypes.number,
      ethereum: PropTypes.number,
      tether: PropTypes.number,
      usd: PropTypes.number,
    })
  ),
  visibleAssets: PropTypes.arrayOf(PropTypes.string),
};

export default MultiLineChart;
