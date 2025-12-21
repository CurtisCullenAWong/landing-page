'use client';

import { Box, Skeleton, CircularProgress, useTheme } from '@mui/material';

// Full page loading spinner
export function PageLoading() {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Box sx={{ color: 'text.secondary', typography: 'body1' }}>
        Loading...
      </Box>
    </Box>
  );
}

// Job listings skeleton loader
export function JobListingsSkeleton() {
  return (
    <Box sx={{ py: 8 }}>
      <Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {/* Header skeleton */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Skeleton variant="text" width="40%" height={60} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto' }} />
        </Box>

        {/* Count skeleton */}
        <Skeleton variant="rectangular" height={100} sx={{ mb: 4, borderRadius: 1 }} />

        {/* Table skeleton (desktop) */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, mb: 4 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Cards skeleton (mobile) */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={200}
              sx={{ mb: 2, borderRadius: 1 }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// Job card skeleton
export function JobCardSkeleton() {
  return (
    <Box sx={{ mb: 2 }}>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
    </Box>
  );
}

// Job details skeleton
export function JobDetailsSkeleton() {
  return (
    <Box sx={{ py: 8 }}>
      <Box sx={{ maxWidth: 'md', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {/* Back button skeleton */}
        <Skeleton variant="rectangular" width={200} height={40} sx={{ mb: 4, borderRadius: 1 }} />

        {/* Header card skeleton */}
        <Skeleton variant="rectangular" height={250} sx={{ mb: 4, borderRadius: 1 }} />

        {/* Description card skeleton */}
        <Skeleton variant="rectangular" height={200} sx={{ mb: 4, borderRadius: 1 }} />

        {/* Responsibilities card skeleton */}
        <Skeleton variant="rectangular" height={300} sx={{ mb: 4, borderRadius: 1 }} />

        {/* Requirements card skeleton */}
        <Skeleton variant="rectangular" height={300} sx={{ mb: 4, borderRadius: 1 }} />
      </Box>
    </Box>
  );
}

// Admin table skeleton
export function AdminTableSkeleton() {
  return (
    <Box sx={{ py: 8 }}>
      <Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {/* Header skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Skeleton variant="text" width={300} height={50} />
            <Skeleton variant="text" width={250} height={30} sx={{ mt: 1 }} />
          </Box>
          <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Table skeleton */}
        <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );
}

// Inline spinner for buttons/actions
export function InlineSpinner({ size = 20 }: { size?: number }) {
  return <CircularProgress size={size} sx={{ display: 'inline-block' }} />;
}

