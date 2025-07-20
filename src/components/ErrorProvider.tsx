import React, { createContext, useContext, useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorContextType {
  reportError: (error: Error, context?: string) => void;
  handleAsyncError: (asyncFn: () => Promise<any>, context?: string) => Promise<any>;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: React.ReactNode;
  onError?: (error: Error, context?: string) => void;
}

export function ErrorProvider({ children, onError }: ErrorProviderProps) {
  const reportError = useCallback((error: Error, context?: string) => {
    // Log to console for debugging
    console.error(context ? `Error in ${context}:` : 'Error:', error);
    
    // Show user-friendly toast
    toast.error('Something went wrong. Please try again.');
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, context);
    }

    // Here you could integrate with error reporting services like Sentry
    // Example: Sentry.captureException(error, { tags: { context } });
  }, [onError]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    context?: string
  ): Promise<any> => {
    try {
      return await asyncFn();
    } catch (error) {
      reportError(error as Error, context);
      return null;
    }
  }, [reportError]);

  const value = {
    reportError,
    handleAsyncError,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useErrorContext() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

// Convenience hook for components that need error handling
export function useErrorReporting() {
  const { reportError, handleAsyncError } = useErrorContext();
  
  return {
    reportError,
    handleAsyncError,
    // Wrapper for event handlers that might throw
    withErrorHandling: (fn: (...args: any[]) => any, context?: string) => {
      return (...args: any[]) => {
        try {
          return fn(...args);
        } catch (error) {
          reportError(error as Error, context);
        }
      };
    },
  };
}