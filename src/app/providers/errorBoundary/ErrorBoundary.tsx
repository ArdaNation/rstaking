import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error }: { error?: Error }) {

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="error-boundary">
      <div className="error-boundary__content">
        <div className="error-boundary__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 className="error-boundary__title">Oops! Something went wrong</h1>
        
        <p className="error-boundary__message">
          An unexpected error occurred. We are already working on fixing it.
        </p>

        {import.meta.env.DEV && error && (
          <details className="error-boundary__details">
            <summary>Error details (only for development)</summary>
            <pre className="error-boundary__error-text">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="error-boundary__actions">
          <button 
            className="btn btn--primary" 
            onClick={handleReload}
          >
            Reload page
          </button>
          
          <button 
            className="btn btn--secondary" 
            onClick={handleGoHome}
          >
            Go home
          </button>
        </div>

        <div className="error-boundary__help">
          <p>If the problem persists, please contact support</p>
        </div>
      </div>
    </div>
  );
}

export function ErrorFallbackComponent() {
  return <ErrorFallback />;
}

export default ErrorBoundaryClass;
