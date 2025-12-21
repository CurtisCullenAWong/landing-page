'use client';

import { Truck, Globe, Users, Award } from 'lucide-react';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { usePageTitle } from '../../lib/usePageTitle';

export default function HomePage() {
  usePageTitle('Home');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 10, md: 15 },
          background: isDark
            ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
            : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: isDark ? 'text.primary' : 'primary.contrastText',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.2,
            zIndex: 0,
          }}
        >
          <ImageWithFallback
            src={IMAGE_URLS.HERO_CARGO_CONTAINERS}
            alt={getImageMetadata(IMAGE_URLS.HERO_CARGO_CONTAINERS).alt}
            layout="fill"
            priority
          />
        </Box>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography variant="h1" sx={{ mb: 3, fontWeight: 700 }}>
            Synergy beyond compare
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
            Boss Cargo Express is focused on building partnerships that inspire growth. We at Boss Cargo Express take pride in what we do and we will always be there when you need and where you need us the most. Our goal is to help you grow your business and we provide you with this by working holistically with our partners and our team. Success is a moving target. To stay ahead, we're always thinking, sharing and debating.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/job-postings"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'background.paper',
                color: isDark ? 'text.primary' : 'primary.main',
                '&:hover': {
                  bgcolor: isDark ? 'action.hover' : 'action.selected',
                  color: isDark ? 'text.primary' : 'primary.main',
                },
              }}
            >
              Join Our Team
            </Button>
            <Button
              component={Link}
              href="/about-us"
              variant="outlined"
              size="large"
              sx={{
                borderColor: isDark ? 'text.primary' : 'primary.contrastText',
                color: isDark ? 'text.primary' : 'primary.contrastText',
                '&:hover': {
                  borderColor: isDark ? 'text.primary' : 'primary.contrastText',
                  bgcolor: 'action.hover',
                },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Boss Cargo Philosophy Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            The Boss Cargo Philosophy
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 4,
                  bgcolor: isDark ? 'action.hover' : 'action.selected',
                }}
              >
                <Typography variant="body1" color="text.primary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  The heart of Boss Cargo Express is centered on businesses. We understand that you have your top priorities in order to stay competitive and financially sound. Outsource your logistics requirements to us so you can focus on your core. Our ability to integrate proven cargo handling expertise and provide flexible and personalized customer services enables Boss Cargo Express to deliver the most efficient and economical cargo solutions that is ideally fit to your needs.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ImageWithFallback
                src={IMAGE_URLS.HOME_TEAM_COLLABORATION}
                alt={getImageMetadata(IMAGE_URLS.HOME_TEAM_COLLABORATION).alt}
                layout="responsive"
                aspectRatio="4:3"
                rounded={8}
                shadow={2}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Overview Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ textAlign: 'center', mb: 6, fontWeight: 600 }}>
            Our Services
          </Typography>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ImageWithFallback
                src={IMAGE_URLS.HOME_LOGISTICS_SERVICES}
                alt={getImageMetadata(IMAGE_URLS.HOME_LOGISTICS_SERVICES).alt}
                layout="responsive"
                aspectRatio="16:9"
                rounded={8}
                shadow={2}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: isDark ? 'action.hover' : 'action.selected',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body1" color="text.primary" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
                  The Boss Cargo Express Services in Focus: What is the need that the transport and storage sector satisfy? What is the need that Boss Cargo Express (BCE) satisfies? Being part of the entire value chain, we play a crucial role in adding value to the customers. It's more than just merely shipping cargoes via land, air, and sea. It is deeper than delivering parcels via trucks or motorcycles to different parts of the country. There's a greater meaning than crafting a supply chain management software or warehousing tons of products.
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  Logistics encompass far more than planes, trains and automobiles. They are more than having a dedicated, do-whatever-it-takes team member to make things happen in a pinch. Logistics are a part of everyday routine... At BCE, we promise to deliver these and more.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Truck size={48} style={{ color: theme.palette.primary.main, marginBottom: 16 }} />
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    International Freight
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Air freight, sea freight (FCL & LCL), and brokerage services
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Globe size={48} style={{ color: theme.palette.primary.main, marginBottom: 16 }} />
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    Customs Clearance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Import/export clearance, trade classification, and PEZA facilitation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Users size={48} style={{ color: theme.palette.primary.main, marginBottom: 16 }} />
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    Domestic Services
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Air, land, and sea freight across the Philippine archipelago
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Award size={48} style={{ color: theme.palette.primary.main, marginBottom: 16 }} />
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    Value-Added Services
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Packing, crating, warehousing, and specialized permits
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          bgcolor: isDark ? 'primary.dark' : 'primary.main',
          color: isDark ? 'text.primary' : 'primary.contrastText',
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            Partner with Boss Cargo Express
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            We take pride in growing the business together with firms by being dependable, cost-effective, and on-time in Domestic, International Forwarding, and Brokerage settings.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/job-postings"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'background.paper',
                color: isDark ? 'text.primary' : 'primary.main',
                '&:hover': {
                  bgcolor: isDark ? 'action.hover' : 'action.selected',
                  color: isDark ? 'text.primary' : 'primary.main',
                },
              }}
            >
              View Open Positions
            </Button>
            <Button
              component={Link}
              href="/partnerships"
              variant="outlined"
              size="large"
              sx={{
                borderColor: isDark ? 'text.primary' : 'primary.contrastText',
                color: isDark ? 'text.primary' : 'primary.contrastText',
                '&:hover': {
                  borderColor: isDark ? 'text.primary' : 'primary.contrastText',
                  bgcolor: 'action.hover',
                },
              }}
            >
              Partnership Opportunities
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}