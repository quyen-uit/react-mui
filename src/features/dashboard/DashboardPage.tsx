import { Box, Typography } from '@mui/material';

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Dashboard</Typography>
      <Typography color="text.secondary">Protected area. Use the sidebar to navigate.</Typography>
    </Box>
  );
}

