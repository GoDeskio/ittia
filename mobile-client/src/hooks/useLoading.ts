import {useState, useCallback} from 'react';

interface LoadingState {
  isLoading: boolean;
  message: string | null;
}

export const useLoading = () => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    message: null,
  });

  const startLoading = useCallback((message?: string) => {
    setState({
      isLoading: true,
      message: message || null,
    });
  }, []);

  const stopLoading = useCallback(() => {
    setState({
      isLoading: false,
      message: null,
    });
  }, []);

  const withLoading = useCallback(
    async <T>(promise: Promise<T>, message?: string): Promise<T> => {
      try {
        startLoading(message);
        const result = await promise;
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  return {
    ...state,
    startLoading,
    stopLoading,
    withLoading,
  };
}; 