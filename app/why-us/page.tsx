'use client';

import {
  Box,
  Typography,
  Grid,
  Paper,
  useTheme,
  Stack,
} from '@mui/material';
import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import { PageContainer } from '../../components/layout';
import { SECTION_SPACING } from '../../constants/layout';
import { usePageTitle } from '../../lib/usePageTitle';

export default function WhyBossCargo() {
  usePageTitle('Why Us');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const values = [
    {
      title: 'Transparent Communication',
      description: 'Focus on openness and clarity in all our interactions and business dealings.'
    },
    {
      title: 'Business Sustainability',
      description: 'Commitment to long-term impact and sustainable business practices.'
    },
    {
      title: 'Continuous Learning',
      description: 'Embracing growth and education through our Boss Cargo University and ongoing development programs.'
    },
    {
      title: 'Cohesive Teamwork',
      description: 'Working as one unit towards our common goal of growth for our clients.'
    }
  ];

  return (
    <Box>
      {/* Slide 1: Mission & Vision */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 4, md: 0 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%' }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left side: Content */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 2, mb: 1, display: 'block' }}>
                  CORE IDENTITY
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.1, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                  Why Choose Boss Cargo?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem', maxWidth: '600px' }}>
                  Our Mission, Vision, and Values define who we are and what we stand for in the logistics industry.
                </Typography>

                <Stack spacing={4}>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: `0 0 10px ${theme.palette.primary.main}` }} />
                      Our Mission
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 3, borderLeft: '2px solid', borderColor: 'divider', py: 0.5, lineHeight: 1.7, color: 'text.primary' }}>
                      To grow and empower businesses across the Philippines by providing customized logistics solutions and developing a highly sustainable business using state-of-the-art technology and creating unprecedented value for customers and employees while embracing the frame of CANI (Constant And Never Ending Improvement).
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: `0 0 10px ${theme.palette.primary.main}` }} />
                      Our Dream (Vision)
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 3, borderLeft: '2px solid', borderColor: 'divider', py: 0.5, lineHeight: 1.7, color: 'text.primary' }}>
                      To be the country's preeminent and technologically driven logistics company.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* Right side: Image */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'primary.main',
                    opacity: 0.1,
                    borderRadius: 4,
                    zIndex: 0
                  }}
                />
                <ImageWithFallback
                  src={IMAGE_URLS.WHY_US_VALUES}
                  alt={getImageMetadata(IMAGE_URLS.WHY_US_VALUES).alt}
                  layout="responsive"
                  aspectRatio="4:3"
                  rounded={16}
                  shadow={6}
                />
              </Box>
            </Grid>
          </Grid>
        </PageContainer>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '15vh',
            background: `linear-gradient(to bottom, transparent, ${theme.palette.background.paper})`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </Box>

      {/* Slide 2: Brand Values & Culture */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          bgcolor: 'background.paper',
          py: { xs: 4, md: 0 },
          position: 'relative'
        }}
      >
        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%' }}>
          <Grid container spacing={4}>
            {/* Left: Brand Values */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
                Our Brand Values
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
                Creating a strong and positive perception of our company in our customers' minds.
              </Typography>

              <Grid container spacing={2}>
                {values.map((value, index) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        height: '100%',
                        bgcolor: isDark ? 'action.hover' : 'action.selected',
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateX(4px)' }
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main', fontWeight: 700 }}>
                        {value.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {value.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Right: Culture */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
                  Our Culture
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: isDark ? 'action.hover' : 'action.selected',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.7, fontStyle: 'italic' }}>
                    "It's who we are. It's what we're about. Honestly, it's hard to describe culture. It's just something you feel. We work as one, towards one common goal: growth for our clients."
                  </Typography>
                </Paper>
                <ImageWithFallback
                  src={IMAGE_URLS.WHY_US_CULTURE}
                  alt={getImageMetadata(IMAGE_URLS.WHY_US_CULTURE).alt}
                  layout="responsive"
                  aspectRatio="16:9"
                  rounded={12}
                  shadow={4}
                />
              </Box>
            </Grid>
          </Grid>
        </PageContainer>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '15vh',
            background: `linear-gradient(to bottom, transparent, ${theme.palette.background.default})`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </Box>
    </Box>
  );
}