import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/store';
import { Box, Button, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { isAdmin, hasRole } from '@/utils/permissions';
import type { UserRole } from '@/types/auth';

type Props = PropsWithChildren<{ roles?: UserRole[] }>;

export default function ProtectedRoute({ roles, children }: Props) {
  const { isAuthenticated, initialized, isLoading, user } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!initialized || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !hasRole(user, roles)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h5">Unauthorized</Typography>
          <Typography color="text.secondary">
            You do not have permission to access this page.
          </Typography>
          <Button variant="outlined" href="/">
            Go Home
          </Button>
        </Stack>
      </Container>
    );
  }

  return <>{children}</>;
}

