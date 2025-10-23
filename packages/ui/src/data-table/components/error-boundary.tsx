/**
 * DataTableErrorBoundary - Error boundary for DataTable component
 * @module data-table
 */

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
}

export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches errors in DataTable and displays a fallback UI
 * 
 * @example
 * ```tsx
 * <DataTableErrorBoundary>
 *   <DataTable data={data} columns={columns} />
 * </DataTableErrorBoundary>
 * ```
 */
export class DataTableErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('DataTable Error:', error);
      console.error('Error Info:', errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        );
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        Something went wrong
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        The data table encountered an error and couldn't render properly.
      </p>

      {import.meta.env.DEV && (
        <details className="mb-4 text-left max-w-2xl w-full">
          <summary className="cursor-pointer text-sm font-medium mb-2 hover:underline">
            Error Details (Development Only)
          </summary>
          <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-48">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}

      <Button
        onClick={resetErrorBoundary}
        variant="outline"
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

/**
 * Hook to create a function that resets the error boundary
 * Useful for programmatically resetting from parent components
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const throwError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  if (error) {
    throw error;
  }

  return { resetError, throwError };
}
