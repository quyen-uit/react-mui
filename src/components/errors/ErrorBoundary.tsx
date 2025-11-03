import React from 'react';
import { Button, Container, Typography, Stack, Box, Alert } from '@mui/material';
import { captureException } from '@/services/sentry';

type State = {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
};

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Send to Sentry
    captureException(error, { extra: errorInfo });
  }

  handleReload = () => window.location.reload();

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4">Something went wrong.</Typography>
            <Typography color="text.secondary" textAlign="center">
              An unexpected error occurred. Try reloading the page or contact support if the problem persists.
            </Typography>

            {isDev && this.state.error && (
              <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {this.state.error.name}: {this.state.error.message}
                </Typography>
                {this.state.error.stack && (
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      p: 1,
                      bgcolor: 'grey.900',
                      color: 'grey.100',
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.75rem',
                      maxHeight: 200,
                    }}
                  >
                    {this.state.error.stack}
                  </Box>
                )}
              </Alert>
            )}

            <Button variant="contained" onClick={this.handleReload} size="large">
              Reload Page
            </Button>
          </Stack>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

