import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  remoteName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RemoteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Remote Module Error:', {
      remote: this.props.remoteName,
      error,
      errorInfo,
    });

    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-destructive">
                  {this.props.remoteName
                    ? `Failed to load ${this.props.remoteName}`
                    : 'Something went wrong'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {this.state.error?.message ||
                    'An unexpected error occurred while loading this module.'}
                </p>
                <button
                  onClick={this.handleReset}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export function withRemoteErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  remoteName: string
) {
  return function ErrorBoundaryWrapper(props: P) {
    return (
      <RemoteErrorBoundary remoteName={remoteName}>
        <Component {...props} />
      </RemoteErrorBoundary>
    );
  };
}
