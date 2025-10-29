import { Box, Button, Typography } from '@mui/material';

export default function NotFoundPage() {
  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h3">404</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Page not found</Typography>
      <Button href="/" variant="contained">Go Home</Button>
    </Box>
  );
}

