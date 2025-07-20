import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastMessage?: string;
  logToConsole?: boolean;
  onError?: (error: Error) => void;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    showToast = true,
    toastMessage = 'Something went wrong. Please try again.',
    logToConsole = true,
    onError,
  } = options;

  const handleError = useCallback((error: Error | unknown, context?: string) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    if (logToConsole) {
      console.error(context ? `Error in ${context}:` : 'Error:', errorObj);
    }

    if (showToast) {
      toast.error(toastMessage);
    }

    if (onError) {
      onError(errorObj);
    }
  }, [showToast, toastMessage, logToConsole, onError]);

  return { handleError };
}

// Async error handler for use with async operations
export function useAsyncErrorHandler(options: ErrorHandlerOptions = {}) {
  const { handleError } = useErrorHandler(options);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return { handleAsyncError, handleError };
}