import { Box, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

export default function ColorsPage() {
  const [color, setColor] = useState('#2f6dff');
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Colors</Typography>
      <Stack spacing={2}>
        <TextField type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <Box sx={{ width: 120, height: 60, borderRadius: 1, bgcolor: color }} />
      </Stack>
    </Box>
  );
}

