import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { AppError, ErrorType } from '@/types/errors';

interface ErrorAlertProps {
  error: AppError | Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorAlert = ({ error, onRetry, onDismiss }: ErrorAlertProps) => {
  if (!error) return null;

  const isAppError = error instanceof AppError;
  const severity =
    isAppError && error.type === ErrorType.VALIDATION ? 'warning' : 'error';

  const title = isAppError
    ? error.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Error';

  return (
    <Alert severity={severity} onClose={onDismiss} sx={{ mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {error.message}
      {onRetry && (
        <Box sx={{ mt: 1 }}>
          <Button size="small" variant="outlined" onClick={onRetry}>
            Try Again
          </Button>
        </Box>
      )}
    </Alert>
  );
};
