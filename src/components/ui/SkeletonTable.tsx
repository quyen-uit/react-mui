import { Skeleton, Box, Stack } from '@mui/material';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable = ({ rows = 5, columns = 4 }: SkeletonTableProps) => (
  <Box>
    {/* Header */}
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} variant="text" height={40} sx={{ flex: 1 }} />
      ))}
    </Stack>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <Stack key={`row-${i}`} direction="row" spacing={2} sx={{ mb: 1 }}>
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton
            key={`cell-${i}-${j}`}
            variant="rectangular"
            height={50}
            sx={{ flex: 1 }}
          />
        ))}
      </Stack>
    ))}
  </Box>
);
