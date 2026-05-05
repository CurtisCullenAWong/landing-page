'use client';

import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import { PageContainer, PageHeader } from '../../components/layout';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
  Stack,
  Divider,
} from '@mui/material';
import { SECTION_SPACING } from '../../constants/layout';
import { usePageTitle } from '../../lib/usePageTitle';

export default function HistoryPage() {
  usePageTitle('History');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const milestones = [
    {
      year: '2014',
      title: 'Company Founded',
      description: 'Boss Cargo Express started its roots in Puerto Princesa City, Palawan, with a vision to deliver the best cargo solutions across the Philippine archipelago.'
    },
    {
      year: '2015-2018',
      title: 'Growth & Expansion',
      description: 'Expanded operations across the Philippines, serving various clients across a wide range of industries. Built a team of skilled professionals with years of solid experience in handling ground freight, sea freight, and air freight.'
    },
    {
      year: '2019-2022',
      title: 'Strategic Development',
      description: 'Established corporate directives and initiatives that add value to existing and potential clients. Strengthened the organization\'s functional areas and made the corporation highly competitive.'
    },
    {
      year: '2023-Present',
      title: 'Technology & Sustainability',
      description: 'Focused on adopting technology within supply chains, expanding geographical locations, and serving a wider market segment. Through effective resource management, sound financial planning, and sales prospecting, we continue to attain our objectives.'
    }
  ];

  return (
    <Box>
      {/* Slide 1: Introduction & Story */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 4, md: 0 }
        }}
      >
        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%' }}>
          <PageHeader
            title="Our Journey"
            subtitle="Embark on a sustainable and transformative journey with us."
            bottomSpacing={SECTION_SPACING.small}
          />

          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: isDark ? 'action.hover' : 'action.selected',
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
                  The Boss Cargo Express Story
                </Typography>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                    Founded in 2014, Boss Cargo Express started its roots in Puerto Princesa City, Palawan. Since then, the company has grown and delivered the best cargo solutions to various clients across a wide range of industries across the Philippine archipelago. Our team consists of skilled professionals with years of solid experience in handling ground freight, sea freight, and air freight.
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                    Boss Cargo Express (BCE) recognizes the potential changes in the macroenvironment of the wider transportation and storage sector. Thus, the BCE management continuously prepares the firm amidst the industry and customer trends that will have a direct impact on its overall business operations. Coming up with corporate directives and initiatives that add value to existing and potential clients, strengthening the organization's functional areas, and making the corporation highly competitive are top priorities.
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                    At BCE, we constantly and keenly listen to companies' overwhelming advocacy for the adoption of technology within supply chains, infrastructural developments, economic growth, booming markets, and other pertinent factors. Our key strategies for expansion, customer satisfaction, fiscal standing, and enterprise sustainability are geared towards extending our product scope and serving a wider market segment.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <ImageWithFallback
                src={IMAGE_URLS.HISTORY_CARGO_TRUCK}
                alt={getImageMetadata(IMAGE_URLS.HISTORY_CARGO_TRUCK).alt}
                layout="responsive"
                aspectRatio="4:3"
                rounded={12}
                shadow={4}
                hoverZoom
              />
            </Grid>
          </Grid>
        </PageContainer>
      </Box>

      {/* Slide 2: Early Milestones (Alternating) */}
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
        {/* Timeline Connecting Line */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '2px',
            bgcolor: 'primary.main',
            opacity: 0.15,
            display: { xs: 'none', md: 'block' }
          }}
        />

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{ mb: 8, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
            Early Milestones
          </Typography>

          <Stack spacing={4}>
            {/* Milestone 1 (Left) */}
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <Card sx={{ borderRight: `4px solid ${theme.palette.primary.main}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 1 }}>{milestones[0].year}</Typography>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>{milestones[0].title}</Typography>
                    <Typography variant="body2" color="text.secondary">{milestones[0].description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 0, md: 2 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'primary.main', border: `4px solid ${theme.palette.background.paper}`, boxShadow: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }} />
            </Grid>

            {/* Milestone 2 (Right) */}
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }} />
              <Grid size={{ xs: 0, md: 2 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'primary.main', border: `4px solid ${theme.palette.background.paper}`, boxShadow: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Card sx={{ borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 1 }}>{milestones[1].year}</Typography>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>{milestones[1].title}</Typography>
                    <Typography variant="body2" color="text.secondary">{milestones[1].description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </PageContainer>
      </Box>

      {/* Slide 3: Recent Milestones & Vision (Alternating) */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 4, md: 0 },
          position: 'relative'
        }}
      >
        {/* Timeline Connecting Line */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: '40%',
            width: '2px',
            bgcolor: 'primary.main',
            opacity: 0.15,
            display: { xs: 'none', md: 'block' }
          }}
        />

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <Stack spacing={4}>
            {/* Milestone 3 (Left) */}
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <Card sx={{ borderRight: `4px solid ${theme.palette.primary.main}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 1 }}>{milestones[2].year}</Typography>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>{milestones[2].title}</Typography>
                    <Typography variant="body2" color="text.secondary">{milestones[2].description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 0, md: 2 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'primary.main', border: `4px solid ${theme.palette.background.paper}`, boxShadow: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }} />
            </Grid>

            {/* Milestone 4 (Right) */}
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }} />
              <Grid size={{ xs: 0, md: 2 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'primary.main', border: `4px solid ${theme.palette.background.paper}`, boxShadow: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Card sx={{ borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 1 }}>{milestones[3].year}</Typography>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>{milestones[3].title}</Typography>
                    <Typography variant="body2" color="text.secondary">{milestones[3].description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Vision Section */}
            <Box sx={{ mt: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  bgcolor: isDark ? 'action.hover' : 'action.selected',
                  borderRadius: 3,
                  textAlign: 'center',
                  background: isDark
                    ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: isDark ? 'text.primary' : 'primary.contrastText',
                }}
              >
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Looking Ahead</Typography>
                <Typography variant="body1" sx={{ maxWidth: '800px', mx: 'auto', lineHeight: 1.8, fontSize: '1.1rem' }}>
                  As we move forward, Boss Cargo Express remains committed to innovation, sustainability, and
                  creating opportunities for our team members to grow and succeed. We continue to embrace the frame
                  of CANI (Constant And Never Ending Improvement) as we write the next chapter of our story.
                </Typography>
              </Paper>
            </Box>
          </Stack>
        </PageContainer>
      </Box>
    </Box>
  );
}
