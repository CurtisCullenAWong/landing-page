'use client';

import { Box, CircularProgress, useTheme } from '@mui/material';

/**
 * Loading component for route transitions
 * Provides a smooth, professional loading experience
 */
export function RouteLoading() {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        zIndex: 9999,
        gap: 2,
      }}
    >
      <CircularProgress 
        size={56} 
        thickness={4}
        sx={{
          color: 'primary.main',
        }}
      />
      <Box 
        sx={{ 
          color: 'text.secondary', 
          typography: 'body1',
          fontWeight: 500,
        }}
      >
        Loading...
      </Box>
    </Box>
  );
}

