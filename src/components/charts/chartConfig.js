import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { COLORS } from '../../utils/colors';
import { formatCurrency, formatPercent, formatDateDisplay } from '../../utils/formatters';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  zoomPlugin
);

// Global Chart.js defaults
ChartJS.defaults.font.family = "'Inter', 'system-ui', sans-serif";
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;

/**
 * Get theme-aware colors
 */
export const getThemeColors = (isDark) => ({
  text: isDark ? '#f8fafc' : '#0f172a',
  textSecondary: isDark ? '#94a3b8' : '#64748b',
  grid: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)',
  tooltipBg: isDark ? '#1e293b' : '#ffffff',
  tooltipBorder: isDark ? '#334155' : '#e2e8f0',
});

/**
 * Default line chart options
 */
export const getLineChartOptions = (isDark, options = {}) => {
  const colors = getThemeColors(isDark);

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: colors.textSecondary,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.text,
        bodyColor: colors.textSecondary,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            return formatDateDisplay(items[0].parsed.x, 'MMM d, yyyy');
          },
          label: (context) => {
            const value = context.parsed.y;
            const label = context.dataset.label || '';
            return `${label}: ${formatCurrency(value, 'ETB')}`;
          },
        },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
        pan: {
          enabled: true,
          mode: 'x',
        },
      },
      ...options.plugins,
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: {
            day: 'MMM d',
            week: 'MMM d',
            month: 'MMM yyyy',
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11,
          },
          maxRotation: 0,
        },
        border: {
          display: false,
        },
        ...options.scales?.x,
      },
      y: {
        beginAtZero: false,
        grid: {
          color: colors.grid,
          drawBorder: false,
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11,
          },
          callback: (value) => formatCurrency(value, 'ETB', { compact: true }),
        },
        border: {
          display: false,
        },
        ...options.scales?.y,
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        hitRadius: 30,
      },
    },
    ...options,
  };
};

/**
 * Default bar chart options
 */
export const getBarChartOptions = (isDark, options = {}) => {
  const colors = getThemeColors(isDark);

  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.text,
        bodyColor: colors.textSecondary,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            return formatCurrency(context.parsed.y, 'ETB');
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11,
            weight: 500,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: colors.grid,
          drawBorder: false,
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 11,
          },
          callback: (value) => formatCurrency(value, 'ETB', { compact: true }),
        },
        border: {
          display: false,
        },
      },
    },
    ...options,
  };
};

/**
 * Default doughnut chart options
 */
export const getDoughnutChartOptions = (isDark, options = {}) => {
  const colors = getThemeColors(isDark);

  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: colors.textSecondary,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.text,
        bodyColor: colors.textSecondary,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value, 'ETB')} (${percentage}%)`;
          },
        },
      },
    },
    ...options,
  };
};

/**
 * Dataset color configurations for each asset
 */
export const DATASET_COLORS = {
  birr: {
    borderColor: COLORS.birr.primary,
    backgroundColor: COLORS.birr.light,
    pointBackgroundColor: COLORS.birr.primary,
  },
  bitcoin: {
    borderColor: COLORS.bitcoin.primary,
    backgroundColor: COLORS.bitcoin.light,
    pointBackgroundColor: COLORS.bitcoin.primary,
  },
  ethereum: {
    borderColor: COLORS.ethereum.primary,
    backgroundColor: COLORS.ethereum.light,
    pointBackgroundColor: COLORS.ethereum.primary,
  },
  tether: {
    borderColor: COLORS.usdt.primary,
    backgroundColor: COLORS.usdt.light,
    pointBackgroundColor: COLORS.usdt.primary,
  },
  usd: {
    borderColor: COLORS.usd.primary,
    backgroundColor: COLORS.usd.light,
    pointBackgroundColor: COLORS.usd.primary,
  },
};

/**
 * Create a dataset configuration
 */
export const createDataset = (asset, data, options = {}) => {
  const colors = DATASET_COLORS[asset] || DATASET_COLORS.birr;

  return {
    label: options.label || asset,
    data,
    ...colors,
    fill: options.fill || false,
    ...options,
  };
};
