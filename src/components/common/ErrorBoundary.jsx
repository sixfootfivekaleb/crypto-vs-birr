import { Component } from 'react';
import PropTypes from 'prop-types';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { Button } from './Button';

/**
 * Error boundary component for graceful error handling
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });

    // Could send to error tracking service here
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <FiAlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-50 mb-2">
              Something went wrong
            </h2>

            <p className="text-dark-500 dark:text-dark-400 mb-6">
              {this.props.message || "We're sorry, but something unexpected happened. Please try again."}
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-dark-500 hover:text-dark-700 dark:hover:text-dark-300">
                  Error details
                </summary>
                <pre className="mt-2 p-4 bg-dark-100 dark:bg-dark-800 rounded-lg text-xs overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={this.handleReset}
                icon={FiRefreshCw}
              >
                Try Again
              </Button>

              <Button variant="primary" onClick={this.handleReload}>
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  message: PropTypes.string,
};

export default ErrorBoundary;
