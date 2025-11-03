import { Skeleton, Card, CardContent, Box, Stack } from '@mui/material';

interface SkeletonCardProps {
  count?: number;
  withImage?: boolean;
}

export const SkeletonCard = ({ count = 1, withImage = true }: SkeletonCardProps) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={`skeleton-card-${i}`} sx={{ mb: 2 }}>
        {withImage && <Skeleton variant="rectangular" height={140} />}
        <CardContent>
          <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
          <Stack spacing={1}>
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
          </Stack>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="rectangular" width={80} height={36} />
            <Skeleton variant="rectangular" width={80} height={36} />
          </Box>
        </CardContent>
      </Card>
    ))}
  </>
);
