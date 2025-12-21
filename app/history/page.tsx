'use client';

import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
} from '@mui/material';
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
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
            Our Journey
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
            Embark on a sustainable and transformative journey with us.
          </Typography>
        </Box>

        {/* Story Section */}
        <Card sx={{ mb: 8 }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, lg: 6 }}>
                <Typography variant="h3" sx={{ mb: 3, fontWeight: 600 }}>
                  The Boss Cargo Express Story
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body1" color="text.primary">
                    Founded in 2014, Boss Cargo Express started its roots in Puerto Princesa City, Palawan. Since then, the company has grown and delivered the best cargo solutions to various clients across a wide range of industries across the Philippine archipelago. Our team consists of skilled professionals with years of solid experience in handling ground freight, sea freight, and air freight.
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    Boss Cargo Express (BCE) recognizes the potential changes in the macroenvironment of the wider transportation and storage sector. Thus, the BCE management continuously prepares the firm amidst the industry and customer trends that will have a direct impact on its overall business operations. Coming up with corporate directives and initiatives that add value to existing and potential clients, strengthening the organization's functional areas, and making the corporation highly competitive are top priorities.
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    At BCE, we constantly and keenly listen to companies' overwhelming advocacy for the adoption of technology within supply chains, infrastructural developments, economic growth, booming markets, and other pertinent factors. Our key strategies for expansion, customer satisfaction, fiscal standing, and enterprise sustainability are geared towards extending our product scope, expanding our geographical locations, and serving a wider market segment. Through effective resource management, sound financial planning, and sales prospecting, we're able to attain our objectives and surmount the unforeseen business challenges.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <ImageWithFallback
                  src={IMAGE_URLS.HISTORY_CARGO_TRUCK}
                  alt={getImageMetadata(IMAGE_URLS.HISTORY_CARGO_TRUCK).alt}
                  layout="responsive"
                  aspectRatio="4:3"
                  rounded={8}
                  shadow={3}
                  hoverZoom
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Box>
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 6, fontWeight: 600 }}>
            Key Milestones
          </Typography>
          <Box sx={{ position: 'relative' }}>
            {/* Timeline Line - Hidden on mobile, visible on desktop */}
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '2px',
                height: '100%',
                bgcolor: isDark ? 'action.hover' : 'action.selected',
                zIndex: 0,
              }}
            />
            
            {/* Milestones */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {milestones.map((milestone, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' },
                    gap: 4,
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      textAlign: { xs: 'left', md: index % 2 === 0 ? 'right' : 'left' },
                    }}
                  >
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h4" sx={{ color: 'primary.main', mb: 1, fontWeight: 700 }}>
                          {milestone.year}
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                          {milestone.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {milestone.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  
                  {/* Timeline Dot */}
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      border: `4px solid ${theme.palette.background.paper}`,
                      boxShadow: 2,
                      zIndex: 1,
                      flexShrink: 0,
                    }}
                  />
                  
                  <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Future Vision */}
        <Paper
          sx={{
            mt: 10,
            p: 6,
            textAlign: 'center',
            background: isDark
              ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
            color: isDark ? 'text.primary' : 'primary.contrastText',
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            Looking Ahead
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: '800px', mx: 'auto' }}>
            As we move forward, Boss Cargo Express remains committed to innovation, sustainability, and 
            creating opportunities for our team members to grow and succeed. We continue to embrace the frame 
            of CANI (Constant And Never Ending Improvement) as we write the next chapter of our story.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
