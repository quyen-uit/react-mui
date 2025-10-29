import React from 'react';
import { Button, Container, Typography, Stack } from '@mui/material';
import { captureException } from '@/services/sentry';

type State = { hasError: boolean };

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    captureException(error, { extra: errorInfo });
  }

  handleReload = () => window.location.reload();

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h4">Something went wrong.</Typography>
            <Typography color="text.secondary">
              An unexpected error occurred. Try reloading the page.
            </Typography>
            <Button variant="contained" onClick={this.handleReload}>
              Reload
            </Button>
          </Stack>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

