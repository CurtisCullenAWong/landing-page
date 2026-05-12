import { Box } from '@mui/material';
import { JobListingsSkeleton } from '@/components/loading';

export default function Loading() {
  return (
    <Box
      sx={{
        minHeight: 'calc(100dvh - 80px)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <JobListingsSkeleton />
    </Box>
  );
}

