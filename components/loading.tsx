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
    <Box sx={{ py: 8, width: '100%', overflow: 'hidden' }}>
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

// Header skeleton for Suspense fallback
export function HeaderSkeleton() {
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        bgcolor: 'primary.main',
        color: 'primary.foreground',
        boxShadow: 2,
        backdropFilter: 'blur(12px)',
      }}
    >
      <Box sx={{ maxWidth: '7xl', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
        <Box sx={{ display: 'flex', height: 64, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="text" width={180} height={24} />
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 2, alignItems: 'center' }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} />
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
            ))}
            <Box sx={{ ml: 2, pl: 2, borderLeft: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', gap: 1 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

