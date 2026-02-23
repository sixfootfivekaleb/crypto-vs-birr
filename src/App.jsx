import { useEffect } from 'react';
import { Layout } from './components/layout';
import { ErrorBoundary } from './components/common';
import { SavingsInput } from './components/savings';
import { Dashboard } from './components/dashboard';
import { useTheme } from './hooks/useTheme';
import { useUrlParams } from './hooks/useUrlParams';
import { usePrefetch } from './hooks/usePrefetch';
import { getApiStatus } from './api/config';

/**
 * Main application component
 */
function App() {
  // Initialize theme
  useTheme();

  // Handle URL parameters on mount
  const { updateUrl } = useUrlParams();

  // Prefetch data for instant calculations
  usePrefetch();

  // Log API status on startup
  useEffect(() => {
    const status = getApiStatus();
    console.log('%c========================================', 'color: #00ff00; font-weight: bold');
    console.log('%c   CRYPTO VS BIRR - API STATUS', 'color: #00ff00; font-size: 16px; font-weight: bold');
    console.log('%c========================================', 'color: #00ff00; font-weight: bold');
    console.log('%cDemo Mode:', 'font-weight: bold', status.demoMode ? 'ENABLED (using mock data)' : 'DISABLED (using live APIs)');
    console.log('%cExchange Rate API Key:', 'font-weight: bold', status.hasExchangeRateKey ? 'SET' : 'NOT SET');
    console.log('%cCoinGecko API Key:', 'font-weight: bold', status.hasCoinGeckoKey ? 'SET' : 'NOT SET (using free tier)');
    console.log('%c========================================', 'color: #00ff00; font-weight: bold');

    if (status.demoMode) {
      console.warn('App is running in DEMO MODE - calculations use mock data, not real API data!');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Layout>
        <div className="space-y-8">
          {/* Savings Input Section */}
          <section>
            <SavingsInput />
          </section>

          {/* Dashboard Section */}
          <section>
            <Dashboard />
          </section>
        </div>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
