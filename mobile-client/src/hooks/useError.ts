import {useState, useCallback} from 'react';

interface ErrorState {
  error: string | null;
  isVisible: boolean;
}

export const useError = () => {
  const [state, setState] = useState<ErrorState>({
    error: null,
    isVisible: false,
  });

  const showError = useCallback((message: string) => {
    setState({
      error: message,
      isVisible: true,
    });

    // Auto-hide error after 5 seconds
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isVisible: false,
      }));
    }, 5000);
  }, []);

  const hideError = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState({
      error: null,
      isVisible: false,
    });
  }, []);

  const handleError = useCallback((error: unknown) => {
    let message = 'An unexpected error occurred';

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    showError(message);
  }, [showError]);

  return {
    ...state,
    showError,
    hideError,
    clearError,
    handleError,
  };
}; 