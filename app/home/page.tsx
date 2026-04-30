'use client';

import { Truck, Globe, Users, Award } from 'lucide-react';
import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
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
import AboutPage from '../about-us/page';
import WhyUsPage from '../why-us/page';
import HistoryPage from '../history/page';
import PartnershipsPage from '../partnerships/page';
import JobPostingsPage from '../careers/page';

export default function HomePage() {
  usePageTitle('Home');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      <Box id="home">
        {/* Hero Section */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            background: isDark
              ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: isDark ? 'text.primary' : 'primary.contrastText',
          }}
        >
          {/* Background Image */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.25,
              zIndex: 0,
              overflow: 'hidden',
            }}
          >
            <ImageWithFallback
              src={IMAGE_URLS.HERO_BACKGROUND.src}
              alt={getImageMetadata(IMAGE_URLS.HERO_BACKGROUND).alt}
              layout="fill"
              objectFit="cover"
              style={{
                objectPosition: 'left 1%',
              }}
              priority
            />
          </Box>
          <Container
            maxWidth="lg"
            className="animate-fade-in-up"
            sx={{
              position: 'relative',
              zIndex: 1,
              textAlign: 'center',
              py: { xs: 8, md: 0 },
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* Main Heading */}
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                lineHeight: 1.1,
                letterSpacing: '-1px',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              Synergy beyond compare
            </Typography>

            {/* Subheading / Description */}
            <Typography
              variant="h3"
              sx={{
                mb: 5,
                fontWeight: 400,
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.6rem' },
                lineHeight: 1.6,
                maxWidth: '800px',
                mx: 'auto',
                opacity: 0.9,
              }}
            >
              Boss Cargo Express is focused on building partnerships that inspire growth.
              We take pride in what we do and are always there when you need us the most.
              Our goal is to help you grow your business by working holistically with our partners and our team.
            </Typography>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/#careers"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '50px',
                  boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                View Open Careers
              </Button>

              <Button
                component={Link}
                href="/#about-us"
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '50px',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
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
                  <Typography
                    variant="body1"
                    sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}
                  >
                    The heart of Boss Cargo Express is centered on businesses. We understand that you have your top priorities in order to stay competitive and financially sound. Outsource your logistics requirements to us so you can focus on your core. Our ability to integrate proven cargo handling expertise and provide flexible and personalized customer services enables Boss Cargo Express to deliver the most efficient and economical cargo solutions that is ideally fit to your needs.
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ImageWithFallback
                  src={IMAGE_URLS.HOME_TEAM_COLLABORATION.src}
                  alt={getImageMetadata(IMAGE_URLS.HOME_TEAM_COLLABORATION).alt}
                  layout="responsive"
                  rounded={8}
                  shadow={2}
                />
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
                href="/#why-us"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'background.paper',
                  color: isDark ? 'text.primary' : 'primary.main',
                  '&:hover': {
                    bgcolor: isDark ? 'action.hover' : 'action.selected',
                  },
                }}
              >
                Why Choose Boss Cargo Express?
              </Button>

              <Button
                component={Link}
                href="/#partnerships"
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

        {/* Services Overview Section */}
        <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
          <Container maxWidth="lg">
            <Typography variant="h2" sx={{ textAlign: 'center', mb: 6, fontWeight: 600 }}>
              Our Services
            </Typography>

            <Grid container spacing={4}>
              {[
                { icon: Truck, title: 'International Freight', desc: 'Air freight, sea freight (FCL & LCL), and brokerage services' },
                { icon: Globe, title: 'Customs Clearance', desc: 'Import/export clearance, trade classification, and PEZA facilitation' },
                { icon: Users, title: 'Domestic Services', desc: 'Air, land, and sea freight across the Philippine archipelago' },
                { icon: Award, title: 'Value-Added Services', desc: 'Packing, crating, warehousing, and specialized permits' }
              ].map((service, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: '0.3s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 3,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                    >
                      <service.icon size={48} style={{ color: theme.palette.primary.main, marginBottom: 16 }} />
                      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* Embedded Sections */}
      <Box id="about-us" sx={{ scrollSnapAlign: 'start' }}>
        <AboutPage />
      </Box>
      <Box id="why-us" sx={{ scrollSnapAlign: 'start' }}>
        <WhyUsPage />
      </Box>
      <Box id="history" sx={{ scrollSnapAlign: 'start' }}>
        <HistoryPage />
      </Box>
      <Box id="partnerships" sx={{ scrollSnapAlign: 'start' }}>
        <PartnershipsPage />
      </Box>
      <Box id="careers" sx={{ scrollSnapAlign: 'start' }}>
        <JobPostingsPage />
      </Box>
    </Box>
  );
}