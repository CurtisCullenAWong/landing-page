'use client';

import { Mail, Phone, MapPin, User, Linkedin, ExternalLink, Facebook, Zap, Globe, Target } from 'lucide-react';
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
  alpha,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { SECTION_SPACING } from '../../constants/layout';
import { usePageTitle } from '../../lib/usePageTitle';
import React, { useState, useEffect } from 'react';
import { SITE_CONTENT } from '../../constants/site-content';
import { motion } from 'framer-motion';

export default function AboutPage() {
  usePageTitle('About Us');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Defensive Theme Extraction
  const primaryMain = theme.palette.primary?.main || '#00A39D';
  const primaryDark = theme.palette.primary?.dark || '#007A76';
  const secondaryDark = theme.palette.secondary?.dark || '#111626';
  const tertiaryMain = (theme.palette as any).tertiary?.main || primaryMain;
  const tertiaryDark = (theme.palette as any).tertiary?.dark || primaryDark;
  const bgColor = theme.palette.background?.default || '#ffffff';
  const paperColor = theme.palette.background?.paper || '#F8FAFC';

  const offices = [
    {
      name: 'Headquarters',
      address: SITE_CONTENT.contact.headquarters.address.split(', Barangay')[0],
      city: 'Barangay' + SITE_CONTENT.contact.headquarters.address.split(', Barangay')[1],
      phone: SITE_CONTENT.contact.phones.find(p => p.label === 'General Hotline')?.number,
      email: SITE_CONTENT.contact.emails.find(e => e.label === 'General Inquiries')?.address,
      marketing: SITE_CONTENT.contact.phones.find(p => p.label === 'Marketing')?.number,
      customerService: SITE_CONTENT.contact.phones.find(p => p.label === 'Customer Service')?.number,
      finance: SITE_CONTENT.contact.phones.find(p => p.label === 'Finance')?.number,
      mobile: SITE_CONTENT.contact.phones.filter(p => p.label.includes('Mobile')).map(p => p.number)
    }
  ];





  return (
    <Box sx={{ bgcolor: bgColor }}>
      {/* Slide 1: Introduction & Identity */}
      <Box
        sx={{
          minHeight: 'calc(100dvh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 10, md: 15 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Architectural Elements */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
        }}>
          {/* Massive Squiggly Shape 1 (Teal) */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
            whileInView={{
              opacity: 0.12,
              scale: [1, 1.05, 1],
              y: [0, 40, 0],
              rotate: [-15, -10, -15],
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              y: { duration: 20, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 20, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 20, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.2 }
            }}
            sx={{
              position: 'absolute',
              top: '-15%',
              right: '-10%',
              width: '1400px',
              height: '800px',
              bgcolor: alpha(primaryMain, 0.12),
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              transform: 'rotate(-15deg)',
            }}
          />
          {/* Massive Squiggly Shape 2 (Yellow) */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.8, rotate: 20 }}
            whileInView={{
              opacity: 0.15,
              x: [0, -30, 0],
              y: [0, 20, 0],
              rotate: [20, 25, 20],
              scale: [1, 1.02, 1],
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              x: { duration: 15, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 15, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 15, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 15, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.2 }
            }}
            sx={{
              position: 'absolute',
              bottom: '-10%',
              left: '-15%',
              width: '1000px',
              height: '1000px',
              bgcolor: alpha(tertiaryMain, 0.15),
              borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
              transform: 'rotate(20deg)',
            }}
          />
          {/* Industrial Grid */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${alpha(isDark ? '#fff' : '#000', 0.1)} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            opacity: 0.5
          }} />
        </Box>

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <PageHeader
              title="About Boss Cargo Express"
              subtitle="Embark on a sustainable and transformative journey with us."
              bottomSpacing={SECTION_SPACING.medium}
              sx={{
                '& .MuiTypography-h2': { fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' } },
                '& .MuiTypography-h6': { fontSize: { xs: '1rem', md: '1.125rem' }, opacity: 0.8, maxWidth: '700px' }
              }}
            />
          </motion.div>

          <Grid container spacing={4} alignItems="center">
            {/* Left: Who We Are & Mission/Vision */}
            <Grid size={{ xs: 12, md: 6 }}>

              <Stack spacing={4} sx={{ mt: 3 }}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.9, color: 'text.secondary', fontSize: '1.05rem', mb: 2 }}>
                    Founded in 2014 in Puerto Princesa City, Palawan, <Box component="span" sx={{ fontWeight: 900, color: 'text.primary' }}>Boss Cargo Express (BCE)</Box> has grown from its local roots into a formidable logistics presence across the Philippine archipelago. Our journey is driven by a team of skilled professionals with years of solid experience in ground, sea, and air freight, dedicated to delivering transformative solutions to a diverse range of industries.
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.9, color: 'text.secondary', fontSize: '1.05rem' }}>
                    Our commitment to expansion and sustainability allows us to surmount unforeseen challenges through sound financial planning and effective resource management.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {[
                    {
                      title: 'Strategic Roots',
                      text: 'From our 2014 origins in Palawan to a nationwide network serving various industries.',
                      icon: <Globe size={18} />
                    },
                    {
                      title: 'Expert Solutions',
                      text: 'Multimodal freight handling powered by a team with years of deep operational experience.',
                      icon: <Zap size={18} />
                    },
                    {
                      title: 'Future Readiness',
                      text: 'Adopting tech-driven supply chain strategies to ensure long-term enterprise sustainability.',
                      icon: <Target size={18} />
                    }
                  ].map((point, i) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={i}>
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                        sx={{
                          p: 2.5,
                          height: '100%',
                          borderRadius: 2,
                          bgcolor: alpha(isDark ? '#fff' : '#000', 0.03),
                          borderLeft: `4px solid ${i % 2 === 0 ? primaryMain : tertiaryMain}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: alpha(i % 2 === 0 ? primaryMain : tertiaryMain, 0.05),
                            transform: 'translateY(-5px)'
                          }
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                          <Box sx={{ color: i % 2 === 0 ? primaryMain : tertiaryMain, display: 'flex' }}>
                            {point.icon}
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 2 }}>
                            {point.title}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                          {point.text}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>

            {/* Right: Hero Image with Offset Decorative Frame */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 1, ease: "easeOut" }}
                sx={{ position: 'relative', p: 1 }}
              >
                {/* Decorative Squiggly Frame */}
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{
                    opacity: 0.6,
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 0.95, 1],
                  }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 1 }
                  }}
                  sx={{
                    position: 'absolute',
                    inset: '-15px 15px 15px -15px',
                    border: `2px solid ${tertiaryMain}`,
                    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                    zIndex: 0,
                    opacity: 0.6
                  }}
                />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <ImageWithFallback
                    src={IMAGE_URLS.ABOUT_WAREHOUSE_TEAM}
                    alt={getImageMetadata(IMAGE_URLS.ABOUT_WAREHOUSE_TEAM).alt}
                    layout="responsive"
                    aspectRatio="4:3"
                    sizes="(max-width: 900px) 100vw, 50vw"
                    rounded={6}
                    shadow={8}
                    priority
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </PageContainer>

      </Box>

      {/* Slide 3: Contact Information */}
      <Box
        sx={{
          minHeight: 'calc(100dvh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 10, md: 15 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Architectural Elements */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(${alpha(tertiaryMain, 0.1)} 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
        }}>
          {/* Massive Organic Shape (Teal) */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{
              opacity: 0.18,
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.05, 1],
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              x: { duration: 25, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 25, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 25, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.5 }
            }}
            sx={{
              position: 'absolute',
              top: '-20%',
              left: '-15%',
              width: '1800px',
              height: '1500px',
              bgcolor: alpha(primaryMain, 0.18),
              borderRadius: '40% 60% 30% 70% / 60% 30% 70% 40%',
              maskImage: 'linear-gradient(to bottom right, black, transparent 70%)',
            }}
          />
          {/* Secondary Squiggle (Yellow) */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            whileInView={{
              opacity: 0.12,
              rotate: [-10, -5, -12, -10],
              scale: [1, 1.1, 1],
              x: [0, -40, 0],
            }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              rotate: { duration: 28, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 28, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.5 }
            }}
            sx={{
              position: 'absolute',
              bottom: '-25%',
              right: '-10%',
              width: '1400px',
              height: '1200px',
              bgcolor: alpha(tertiaryMain, 0.12),
              borderRadius: '50% 50% 20% 80% / 25% 80% 20% 75%',
              transform: 'rotate(-10deg)',
              filter: 'blur(40px)'
            }}
          />
        </Box>

        <PageContainer maxWidth="xl" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="stretch">
            {/* Column 1: Get In Touch Banner */}
            <Grid
              size={{ xs: 12, md: 4, lg: 3.5 }}
              component={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <Box
                sx={{
                  p: { xs: 4, md: 6, lg: 8 },
                  height: '100%',
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${primaryMain} 0%, ${primaryDark} 100%)`,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 8,
                  borderLeft: `4px solid ${tertiaryMain}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                {/* Tertiary Squiggle Overlay */}
                <Box sx={{
                  position: 'absolute',
                  top: '-15%',
                  right: '-5%',
                  width: '200px',
                  height: '200px',
                  bgcolor: alpha(tertiaryMain, 0.15),
                  borderRadius: '40% 60% 70% 30% / 30% 30% 70% 70%',
                  zIndex: 0,
                  transform: 'rotate(15deg)',
                }} />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h3" sx={{
                    fontWeight: 900,
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: -1,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    lineHeight: 1
                  }}>
                    Get In <br /> Touch
                  </Typography>
                  <Typography variant="body1" sx={{
                    opacity: 0.9,
                    fontWeight: 400,
                    fontSize: { xs: '0.9375rem', md: '1.125rem' }
                  }}>
                    We're ready to handle your logistics needs with precision and care.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {offices.map((office, index) => (
              <React.Fragment key={index}>
                {/* Column 2: Contact Details */}
                <Grid
                  size={{ xs: 12, md: 4, lg: 4 }}
                  component={motion.div}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Stack spacing={4} sx={{ height: '100%', justifyContent: 'center' }}>
                    <Box>
                      <Typography variant="h4" sx={{
                        color: primaryMain,
                        fontWeight: 800,
                        mb: 2,
                        textTransform: 'uppercase',
                        letterSpacing: -1,
                        fontSize: { xs: '1.75rem', sm: '2.25rem' }
                      }}>
                        {office.name}
                      </Typography>
                    </Box>

                    <Stack spacing={3}>
                      {/* Address */}
                      <Paper variant="outlined" sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: alpha(primaryMain, 0.03),
                        borderColor: alpha(primaryMain, 0.2)
                      }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: primaryMain, color: 'white', display: 'flex' }}>
                            <MapPin size={20} />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: tertiaryDark, display: 'block', lineHeight: 1 }}>Location</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>{office.address}</Typography>
                            <Typography variant="caption" color="text.secondary">{office.city}</Typography>
                          </Box>
                        </Box>
                      </Paper>

                      {/* Phone Numbers */}
                      <Paper variant="outlined" sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: alpha(tertiaryMain, 0.03),
                        borderColor: alpha(tertiaryMain, 0.2)
                      }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: tertiaryMain, color: secondaryDark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Phone size={20} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: primaryDark, display: 'block', lineHeight: 1 }}>Communication</Typography>
                            <Stack spacing={0.5} sx={{ mt: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{office.phone}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{office.customerService}</Typography>
                            </Stack>
                          </Box>
                        </Box>
                      </Paper>

                      {/* Emails & Socials */}
                      <Box sx={{ px: 1, pt: 1 }}>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Mail size={16} color={primaryMain} />
                            <Typography component="a" href={`mailto:${office.email}`} variant="body2" sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 700, '&:hover': { color: primaryMain } }}>
                              {office.email}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={2.5}>
                            {[
                              { icon: <Linkedin size={20} />, url: "https://www.linkedin.com/company/boss-cargo-express" },
                              { icon: <Facebook size={20} />, url: "https://www.facebook.com/ikawangbossko20" },
                              { icon: <ExternalLink size={20} />, url: "https://ph.indeed.com/cmp/Boss-Cargo-Express-3/jobs" }
                            ].map((social, i) => (
                              <Typography key={i} component="a" href={social.url} target="_blank" sx={{ color: 'text.secondary', transition: 'color 0.2s', '&:hover': { color: primaryMain } }}>
                                {social.icon}
                              </Typography>
                            ))}
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>

                {/* Column 3: Map */}
                <Grid
                  size={{ xs: 12, md: 4, lg: 4.5 }}
                  component={motion.div}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Box sx={{ position: 'relative', height: '100%', minHeight: { xs: 400, md: 550, lg: 650 } }}>
                    {/* Decorative Squiggly Frame for Map */}
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{
                        opacity: 1,
                        rotate: [0, -3, 3, 0],
                        scale: [1, 1.02, 0.98, 1],
                      }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{
                        rotate: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                        opacity: { duration: 1 }
                      }}
                      sx={{
                        position: 'absolute',
                        inset: '15px -15px -15px 15px',
                        border: `2px solid ${tertiaryMain}`,
                        borderRadius: '40% 60% 30% 70% / 60% 30% 70% 40%',
                        zIndex: 0
                      }}
                    />
                    <Paper
                      elevation={12}
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        height: '100%',
                        width: '100%',
                        border: `1px solid ${alpha(primaryMain, 0.3)}`,
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      <iframe
                        src={`https://www.google.com/maps?q=${encodeURIComponent(`${office.address}, ${office.city}`)}&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Office Location"
                      />
                    </Paper>
                  </Box>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </PageContainer>

        {/* Smooth transition to next page section */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '15vh',
            background: `linear-gradient(to bottom, transparent, ${theme.palette.background.default})`,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />

      </Box>
    </Box>
  );
}