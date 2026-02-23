# Crypto vs Ethiopian Birr Savings Tracker

A professional-grade web application that compares Ethiopian Birr savings against cryptocurrency investments. See how your savings would have performed if invested in Bitcoin, Ethereum, USDT, or held in USD.

![Crypto vs Birr Screenshot](./public/og-image.png)

## Features

- **Multi-Asset Comparison**: Compare Birr, Bitcoin, Ethereum, USDT, and USD performance
- **Interactive Charts**: 6 different chart types powered by Chart.js
  - Multi-line comparison chart
  - Area chart for opportunity cost visualization
  - Bar chart for current value comparison
  - Doughnut chart for portfolio allocation
  - Inflation rate chart
  - Mixed chart (line + bar)
- **Multiple Savings Entries**: Track up to 10 different investment scenarios
- **Real-time Data**: Auto-refresh every 60 seconds
- **Historical Analysis**: View performance over 1M, 3M, 6M, 1Y, or all-time periods
- **Key Metrics**: Inflation rate, volatility, Sharpe ratio, max drawdown, and more
- **Dark/Light Theme**: Beautiful glassmorphism design in both modes
- **Export Options**: Export charts as PNG or data as CSV
- **Shareable URLs**: Share your comparison with others via URL parameters
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Demo Mode**: Works without API keys using realistic mock data

## Tech Stack

- **React 18** - UI framework with functional components and hooks
- **Vite** - Fast build tool and dev server
- **Chart.js + react-chartjs-2** - All data visualizations
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **TanStack Query (React Query)** - Data fetching and caching
- **Framer Motion** - Animations
- **date-fns** - Date manipulation
- **Axios** - HTTP client

## APIs Used

- **[CoinGecko API](https://www.coingecko.com/en/api)** - Cryptocurrency prices (free tier available)
- **[ExchangeRate-API](https://www.exchangerate-api.com/)** - USD/ETB exchange rates (free tier: 1,500 requests/month)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

   ```bash
   cd ~/Desktop/"Crypto vs. Birr"
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment file:

   ```bash
   cp .env.example .env
   ```

4. Add your ExchangeRate-API key to `.env`:

   ```
   VITE_EXCHANGE_RATE_API_KEY=your_api_key_here
   ```

   **Getting an API Key:**
   1. Go to [https://www.exchangerate-api.com/](https://www.exchangerate-api.com/)
   2. Click "Get Free Key"
   3. Enter your email address
   4. Verify your email
   5. Copy your API key from the dashboard

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Mode

If you don't have an API key, the app will automatically run in demo mode with realistic mock data. You can also enable demo mode explicitly:

```env
VITE_DEMO_MODE=true
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── api/                 # API configuration and calls
│   ├── config.js        # Axios instances and interceptors
│   ├── coingecko.js     # CoinGecko API functions
│   └── exchangeRate.js  # Exchange rate API functions
│
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Header, Footer, Layout
│   ├── charts/          # Chart.js chart components
│   ├── savings/         # Savings input components
│   ├── dashboard/       # Dashboard and metrics
│   └── features/        # Feature components (export, etc.)
│
├── hooks/               # Custom React hooks
│   ├── useTheme.js      # Theme management
│   ├── useCryptoData.js # Crypto data fetching
│   ├── useExchangeRate.js # Exchange rate fetching
│   └── useSavingsCalculator.js # Core calculations
│
├── store/               # Zustand state stores
│   ├── settingsStore.js # App settings
│   └── savingsStore.js  # Savings entries
│
├── utils/               # Utility functions
│   ├── constants.js     # App constants
│   ├── calculations.js  # Financial calculations
│   ├── formatters.js    # Number/date formatting
│   └── validators.js    # Input validation
│
├── data/
│   └── mockData.js      # Demo mode data
│
├── styles/
│   └── index.css        # Global styles and Tailwind
│
├── App.jsx              # Root component
├── main.jsx             # Entry point
└── queryClient.js       # React Query configuration
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Build

```bash
npm run build
```

The `dist` folder is ready to be deployed to any static hosting service.

## Environment Variables

| Variable                     | Required | Description                                  |
| ---------------------------- | -------- | -------------------------------------------- |
| `VITE_EXCHANGE_RATE_API_KEY` | Yes\*    | ExchangeRate-API key                         |
| `VITE_COINGECKO_API_KEY`     | No       | CoinGecko API key (for higher rate limits)   |
| `VITE_DEMO_MODE`             | No       | Enable demo mode (`true`/`false`)            |
| `VITE_REFRESH_INTERVAL`      | No       | Data refresh interval in ms (default: 60000) |

\*Not required if running in demo mode

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Disclaimer

This tool is for educational and informational purposes only. Cryptocurrency investments are highly volatile and risky. Past performance does not guarantee future results. This is not financial advice. Always do your own research and consult with a qualified financial advisor before making investment decisions.

## License

MIT License - feel free to use this project for personal or commercial purposes.

---
