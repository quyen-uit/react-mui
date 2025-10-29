import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Welcome to React Shop</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" component={Link} to="/dashboard">Dashboard</Button>
        <Button variant="outlined" component={Link} to="/examples/table">Examples/Table</Button>
      </Stack>
    </Box>
  );
}

