'use client';

import { useState } from 'react';
import { Search, FileText, ArrowRight } from 'lucide-react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function MyApplicationSection() {
  const [applicationId, setApplicationId] = useState('');
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicationId.trim()) {
      router.push(`/my-application/${applicationId.trim()}`);
    }
  };

  return (
    <Box sx={{ py: 12, bgcolor: isDark ? 'background.default' : 'grey.50' }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 8 },
            textAlign: 'center',
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative background element */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 150,
              height: 150,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              opacity: 0.05,
              zIndex: 0,
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                mb: 4,
              }}
            >
              <FileText size={32} />
            </Box>

            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
              Track Your Application
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}>
              Stay updated on your journey with Boss Cargo Express. Enter your application ID below to check your current status.
            </Typography>

            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              <TextField
                fullWidth
                placeholder="Enter Application ID (e.g., app_123...)"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                size="large"
                type="submit"
                disabled={!applicationId.trim()}
                endIcon={<ArrowRight size={20} />}
                sx={{
                  px: 4,
                  py: { xs: 1.5, sm: 0 },
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                }}
              >
                Check Status
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
              Can't find your ID? Check the confirmation email we sent after you applied.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
