import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { NeumorphicCard } from './shared';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3
          }}
        >
          <NeumorphicCard>
            <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
              <Typography variant="h5" color="error" gutterBottom>
                Something went wrong
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                An unexpected error occurred. Please refresh the page to try again.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{ mr: 2 }}
              >
                Refresh Page
              </Button>
              <Button
                variant="outlined"
                onClick={() => this.setState({ hasError: false })}
              >
                Try Again
              </Button>
            </Box>
          </NeumorphicCard>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;