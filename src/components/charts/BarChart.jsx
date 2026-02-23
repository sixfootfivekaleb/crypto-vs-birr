import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme';
import { getBarChartOptions } from './chartConfig';
import { ASSET_CONFIG, ASSETS } from '../../utils/constants';
import { COLORS } from '../../utils/colors';

/**
 * Bar chart showing current value comparison
 */
export const BarChart = ({ currentValues }) => {
  const { isDark } = useTheme();

  const data = useMemo(() => {
    if (!currentValues) return null;

    const assets = [ASSETS.BIRR, ASSETS.BITCOIN, ASSETS.ETHEREUM, ASSETS.USDT, ASSETS.USD];

    const labels = assets.map((asset) => ASSET_CONFIG[asset]?.name || asset);
    const values = assets.map((asset) => currentValues[asset]?.currentValueETB || 0);

    const backgroundColors = [
      COLORS.birr.primary,
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
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 50,
          maxBarThickness: 60,
        },
      ],
    };
  }, [currentValues]);

  const options = useMemo(() => {
    return getBarChartOptions(isDark, {
      plugins: {
        tooltip: {
          callbacks: {
            title: () => 'Current Value',
          },
        },
      },
    });
  }, [isDark]);

  if (!data) return null;

  return <Bar data={data} options={options} />;
};

BarChart.propTypes = {
  currentValues: PropTypes.object,
};

export default BarChart;
