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
import { useEffect } from 'react';
import { scrollToHref } from '../../constants/navigation';

export default function HomePage() {
  usePageTitle('Home');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Defensive color access
  const primaryMain = theme.palette.primary?.main || '#00A39D';
  const primaryDark = theme.palette.primary?.dark || '#007A76';
  const tertiaryMain = theme.palette.tertiary?.main || primaryMain;
  const tertiaryLight = theme.palette.tertiary?.light || primaryMain;
  const tertiaryDark = theme.palette.tertiary?.dark || primaryDark;

  // Handle initial hash scroll when navigating from another page
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure all components (especially JobPostings with async data) 
      // have started rendering and the DOM is ready for scroll snapping
      const timer = setTimeout(() => {
        scrollToHref(hash);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        id="home"
        sx={{
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            background: isDark
              ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: isDark ? 'text.primary' : 'primary.contrastText',
          }}
        >
          {/* Background Image with Bottom Fade */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.25,
                zIndex: 0,
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
            {/* Smooth transition to the next section */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '20vh',
                background: `linear-gradient(to bottom, transparent, ${theme.palette.background.default})`,
                zIndex: 1,
              }}
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
              Logistics Driven by Culture
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
              At Boss Cargo Express, we believe that taking care of our people is the key to delivering exceptional logistics.
              By empowering our team and building partnerships that inspire growth, we ensure your business is
              supported by a community that truly cares about your success.
            </Typography>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/#why-us"
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
                Why Boss Cargo?
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
      </Box>

      {/* Compressed Overview Section (Philosophy + CTA + Services) */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.default',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Abstract Background Elements Container with Vertical Fade */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          }}
        >
          {/* Massive Bold Tertiary Slash */}
          <Box
            sx={{
              position: 'absolute',
              top: '-15%',
              left: '-10%',
              width: '1200px',
              height: '1000px',
              borderRadius: '0 0 80% 0',
              background: `linear-gradient(135deg, ${tertiaryMain} 0%, ${tertiaryLight} 100%)`,
              opacity: isDark ? 0.12 : 0.18,
              transform: 'rotate(-5deg)',
            }}
          />
          {/* Massive Slanted Tertiary Bar */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              right: '-20%',
              width: '1500px',
              height: '150px',
              background: tertiaryMain,
              opacity: 0.06,
              transform: 'rotate(-25deg)',
            }}
          />
          {/* Massive Bold Primary Slash */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '-20%',
              right: '-10%',
              width: '1400px',
              height: '1200px',
              borderRadius: '80% 0 0 0',
              background: `linear-gradient(315deg, ${primaryMain} 0%, ${primaryDark} 100%)`,
              opacity: isDark ? 0.1 : 0.15,
              transform: 'rotate(5deg)',
            }}
          />
          {/* Additional Primary Squiggle */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '10%',
              left: '-5%',
              width: '800px',
              height: '600px',
              borderRadius: '30% 70% 40% 60% / 50% 30% 70% 50%',
              background: primaryMain,
              opacity: 0.08,
              transform: 'rotate(-10deg)',
            }}
          />
          {/* Overlapping Sharp Accent */}
          <Box
            sx={{
              position: 'absolute',
              top: '40%',
              right: '-5%',
              width: '600px',
              height: '400px',
              borderRadius: '100% 0 0 100%',
              background: tertiaryMain,
              opacity: isDark ? 0.08 : 0.12,
            }}
          />
          {/* Decorative Floating Ring (Sharper) */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              border: `3px solid ${tertiaryMain}`,
              opacity: 0.2,
            }}
          />
          {/* Subtle Primary Grid Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: '30%',
              left: '5%',
              width: '300px',
              height: '300px',
              backgroundImage: `radial-gradient(${primaryMain} 2px, transparent 0)`,
              backgroundSize: '30px 30px',
              opacity: 0.15,
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6}>
            {/* Top Row: Philosophy & Image */}
            <Grid size={12}>
              <Grid container spacing={4} alignItems="center">
                <Grid size={{ xs: 12, md: 7 }}>
                  <Typography variant="h2" sx={{ mb: 3, fontWeight: 600 }}>
                    A People-First Philosophy
                  </Typography>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: isDark ? 'action.hover' : 'action.selected',
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontSize: '1rem', lineHeight: 1.6 }}
                    >
                      The heart of Boss Cargo Express is our people. We believe that a supported, empowered team is the foundation of a resilient logistics industry. By prioritizing the well-being and growth of our staff, we deliver the flexible, personalized, and efficient cargo solutions that keep your business competitive and financially sound. When we take care of our people, they take better care of you.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{ position: 'relative', p: 1 }}>
                    {/* Decorative Image Frame */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '80%',
                        height: '80%',
                        border: `2px solid ${tertiaryMain}`,
                        borderRadius: '24px 4px 24px 4px',
                        zIndex: 0,
                        opacity: 0.6,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        mt: 2,
                        mr: 2,
                      }}
                    >
                      <ImageWithFallback
                        src={IMAGE_URLS.HOME_TEAM_COLLABORATION.src}
                        alt={getImageMetadata(IMAGE_URLS.HOME_TEAM_COLLABORATION).alt}
                        layout="responsive"
                        rounded={24}
                        shadow={6}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Middle Row: Services Overview */}
            <Grid size={12}>
              <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontWeight: 600 }}>
                Our Services
              </Typography>
              <Grid container spacing={2}>
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
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                          '& .service-icon': {
                            transform: 'scale(1.1) rotate(5deg)',
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          width: '20px',
                          height: '20px',
                          borderTop: `3px solid ${tertiaryMain}`,
                          borderLeft: `3px solid ${tertiaryMain}`,
                          borderRadius: '4px 0 0 0',
                          zIndex: 1,
                        }
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 2,
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center'
                        }}
                      >
                        <service.icon
                          className="service-icon"
                          size={32}
                          style={{
                            color: primaryMain,
                            marginBottom: 12,
                            transition: 'transform 0.3s ease'
                          }}
                        />
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '1rem' }}>
                          {service.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {service.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Bottom Row: Compact CTA */}
            <Grid size={12}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: isDark
                    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'primary.contrastText',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: tertiaryMain,
                    opacity: 0.1,
                    filter: 'blur(40px)',
                  }
                }}
              >
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                  Partner with Boss Cargo Express
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  We grow by empowering our people and our partners, ensuring a logistics experience that is as dependable as it is human.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    component={Link}
                    href="/#why-us"
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: 'background.paper',
                      color: isDark ? 'text.primary' : 'primary.main',
                      fontWeight: 600,
                      '&:hover': { bgcolor: isDark ? 'action.hover' : 'action.selected' },
                    }}
                  >
                    Why Choose Us?
                  </Button>
                  <Button
                    component={Link}
                    href="/#partnerships"
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: isDark ? 'text.primary' : 'primary.contrastText',
                      color: isDark ? 'text.primary' : 'primary.contrastText',
                      fontWeight: 600,
                      '&:hover': { borderColor: isDark ? 'text.primary' : 'primary.contrastText', bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    Partnerships
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Embedded Sections */}
      <Box id="about-us">
        <AboutPage />
      </Box>
      <Box id="why-us">
        <WhyUsPage />
      </Box>
      <Box id="history">
        <HistoryPage />
      </Box>
      <Box id="partnerships" sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
        <PartnershipsPage />
      </Box>
      <Box id="careers" sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
        <JobPostingsPage />
      </Box>
    </Box>
  );
}