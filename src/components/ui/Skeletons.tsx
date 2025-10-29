import { Box, Skeleton, Stack } from '@mui/material';

export function ListSkeleton() {
  return (
    <Stack spacing={1}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton variant="rounded" height={48} key={i} />
      ))}
    </Stack>
  );
}

export function CardSkeleton() {
  return (
    <Box>
      <Skeleton variant="rounded" height={160} />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
    </Box>
  );
}

