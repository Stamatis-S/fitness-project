import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
  showDetails?: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError, showDetails = false }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try refreshing the page or go back to home.
          </p>
        </div>

        {showDetails && error && (
          <details className="text-left bg-muted p-3 rounded-md">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Error Details
            </summary>
            <pre className="text-xs text-muted-foreground overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex gap-2 justify-center">
          <Button onClick={resetError} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={handleReload} variant="outline" size="sm">
            Reload Page
          </Button>
          <Button onClick={handleGoHome} size="sm">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Specialized error boundary for form components
export function FormErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={FormErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Form error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

function FormErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Card className="p-4 border-destructive/50 bg-destructive/5">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Form Error
          </p>
          <p className="text-xs text-muted-foreground">
            There was a problem with this form. Please try again.
          </p>
          <Button onClick={resetError} size="sm" variant="outline">
            Reset Form
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Specialized error boundary for data components
export function DataErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={DataErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Data loading error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

function DataErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Card className="p-6 text-center space-y-4">
      <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">Failed to load data</h3>
        <p className="text-sm text-muted-foreground">
          There was a problem loading this content. Please try again.
        </p>
      </div>
      <Button onClick={resetError} size="sm">
        Retry
      </Button>
    </Card>
  );
}

export default ErrorBoundary;