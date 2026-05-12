'use client';

import { Truck, Globe, Users, Award } from 'lucide-react';
import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import { motion } from 'framer-motion';
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
          minHeight: 'calc(100dvh - 80px)',
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
                height: '20dvh',
                background: `linear-gradient(to bottom, transparent, ${theme.palette.background.default})`,
                zIndex: 1,
              }}
            />
            {/* Subtle Hero Abstract Shapes */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
              whileInView={{
                opacity: 0.1,
                scale: 1,
                y: [0, -20, 0],
                rotate: [0, 5, 0],
              }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{
                y: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 1.5 },
                scale: { duration: 1.5 },
              }}
              sx={{
                position: 'absolute',
                top: '15%',
                right: '5%',
                width: '300px',
                height: '300px',
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                background: tertiaryMain,
                opacity: 0,
                filter: 'blur(60px)',
                zIndex: 0,
              }}
            />
          </Box>
          <Container
            maxWidth="lg"
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
              component={motion.h1}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
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
              component={motion.h3}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
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
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}
            >
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
          minHeight: 'calc(100dvh - 80px)',
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
          {/* Massive Squiggly Tertiary Blob */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.8, rotate: -15, x: 0, y: 0 }}
            whileInView={{
              opacity: isDark ? 0.12 : 0.18,
              scale: 1,
              rotate: -5,
              x: [0, 30, -20, 0],
              y: [0, -40, 20, 0],
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              x: { duration: 15, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 18, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.5 },
              scale: { duration: 1.5 },
              rotate: { duration: 1.5 }
            }}
            sx={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '1200px',
              height: '1000px',
              borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
              background: `linear-gradient(135deg, ${tertiaryMain} 0%, ${tertiaryLight} 100%)`,
              transformOrigin: 'center center',
            }}
          />
          {/* Massive Squiggly Primary Blob */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.8, rotate: 15, x: 0, y: 0 }}
            whileInView={{
              opacity: isDark ? 0.1 : 0.15,
              scale: 1,
              rotate: 5,
              x: [0, -40, 30, 0],
              y: [0, 30, -40, 0],
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 16, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.8 },
              scale: { duration: 1.8 },
              rotate: { duration: 1.8 }
            }}
            sx={{
              position: 'absolute',
              bottom: '-25%',
              right: '-10%',
              width: '1400px',
              height: '1200px',
              borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
              background: `linear-gradient(315deg, ${primaryMain} 0%, ${primaryDark} 100%)`,
              transformOrigin: 'center center',
            }}
          />
          {/* Additional Primary Squiggle */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -100, rotate: -10, scale: 1 }}
            whileInView={{
              opacity: 0.08,
              x: 0,
              rotate: [-10, -5, -12, -10],
              scale: [1, 1.05, 0.98, 1],
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              rotate: { duration: 12, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.2 },
              x: { duration: 1.2 }
            }}
            sx={{
              position: 'absolute',
              bottom: '10%',
              left: '-5%',
              width: '800px',
              height: '600px',
              borderRadius: '30% 70% 40% 60% / 50% 30% 70% 50%',
              background: primaryMain,
              transform: 'rotate(-10deg)',
            }}
          />
          {/* Overlapping Squiggly Accent */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 100, y: 0 }}
            whileInView={{
              opacity: isDark ? 0.08 : 0.12,
              x: 0,
              y: [0, 20, -20, 0],
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.2 },
              x: { duration: 1.2 }
            }}
            sx={{
              position: 'absolute',
              top: '40%',
              right: '-5%',
              width: '600px',
              height: '400px',
              borderRadius: '50% 50% 0 50% / 50% 50% 0 50%',
              background: tertiaryMain,
            }}
          />
          {/* Decorative Floating Ring (Sharper) */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
            whileInView={{
              opacity: 0.2,
              scale: [1, 1.1, 1],
              rotate: [0, 360],
            }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: { duration: 15, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1 },
            }}
            sx={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              border: `3px solid ${tertiaryMain}`,
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6}>
            {/* Top Row: Philosophy & Image */}
            <Grid size={12}>
              <Grid container spacing={4} alignItems="center">
                <Grid size={{ xs: 12, md: 7 }}>
                  <Typography
                    component={motion.h2}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8 }}
                    variant="h2"
                    sx={{ mb: 3, fontWeight: 600 }}
                  >
                    A People-First Philosophy
                  </Typography>
                  <Paper
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
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
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.9, x: 30 }}
                    whileInView={{ opacity: 1, scale: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    sx={{ position: 'relative', p: 1 }}
                  >
                    {/* Decorative Image Frame */}
                    <Box
                      component={motion.div}
                      whileInView={{
                        opacity: 0.6,
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.02, 0.98, 1],
                      }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{
                        rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                        opacity: { duration: 1 }
                      }}
                      sx={{
                        position: 'absolute',
                        top: '-5%',
                        right: '-5%',
                        width: '90%',
                        height: '90%',
                        border: `2px solid ${tertiaryMain}`,
                        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
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
                {/* Service Cards with Staggered Entry */}
                {[
                  { icon: Users, title: 'Domestic Services', desc: 'Air, land, and sea freight across the Philippine archipelago' },
                  { icon: Globe, title: 'Customs Clearance', desc: 'Import/export clearance, trade classification, and PEZA facilitation' },
                  { icon: Award, title: 'Value-Added Services', desc: 'Packing, crating, warehousing, and specialized permits' },
                  { icon: Truck, title: 'International Freight', desc: 'Air freight, sea freight (FCL & LCL), and brokerage services' }
                ].map((service, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                    <Card
                      component={motion.div}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
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
                          width: '24px',
                          height: '24px',
                          borderTop: `3px solid ${tertiaryMain}`,
                          borderLeft: `3px solid ${tertiaryMain}`,
                          borderRadius: '12px 0 0 0',
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
                component={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8 }}
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