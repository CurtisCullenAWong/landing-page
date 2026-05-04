'use client';

import { Mail, Phone, MapPin, User, Linkedin, ExternalLink, Facebook } from 'lucide-react';
import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import { PageContainer, PageHeader, Section, ContentGrid } from '../../components/layout';
import {
  Box,
  Typography,
  Button,
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
import React from 'react';

export default function AboutPage() {
  usePageTitle('About Us');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const offices = [
    {
      name: 'Headquarters',
      address: 'Unit B, Block 3 Lot 6, Angelina Canaynay Ave. BF Martinville Subdivision',
      city: 'Barangay Manuyo Dos, Las Piñas 1744, Metro Manila, Philippines',
      phone: '(02) 8805 2402',
      email: 'info@bosscargo.express',
      marketing: '(02) 8643 5469',
      customerService: '(02) 8881 1948',
      finance: '(02) 8887 2369',
      mobile: ['(+63) 917 622 0068', '(+63) 925 770 0370']
    }
  ];

  const officials = [
    {
      name: 'Aris Delos Reyes',
      title: 'Founder, CEO',
      image: '',
      phones: ['09171360195', '09999900195'],
      emails: ['aris@bosscargo.express', 'info@bosscargo.express'],
      website: 'www.bosscargo.express',
      address: 'Lot 6 unit B, Blk 3, A. Canaynay Ave. BF Martinville, Manuyo Dos, Las Pinas City.',
    },
    {
      name: 'Curtis Cullen A. Wong',
      title: 'KALMA! Testing palang ito!',
      image: 'https://media.tenor.com/WX4TeHt4Xt8AAAAe/high-af-high.png',
      phones: ['+63 999 999 9999', '+63 999 999 9999'],
      emails: ['testing@email.com', 'testing@email.com'],
      website: 'www.bosscargo.express',
      address: 'AHH',
    },
    {
      name: 'Curtis Cullen A. Wong',
      title: 'KALMA! Testing palang ito!',
      image: 'https://media.tenor.com/WX4TeHt4Xt8AAAAe/high-af-high.png',
      phones: ['+63 999 999 9999', '+63 999 999 9999'],
      emails: ['testing@email.com', 'testing@email.com'],
      website: 'www.bosscargo.express',
      address: 'AHH',
    }
  ];

  return (
    <Box>
      {/* Slide 1: Introduction & Identity */}
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
            title="About Boss Cargo Express"
            subtitle="Embark on a sustainable and transformative journey with us."
            bottomSpacing={SECTION_SPACING.small}
          />

          <Grid container spacing={4} alignItems="center">
            {/* Left: Who We Are & Mission/Vision */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 2.5,
                  mb: 2,
                  bgcolor: isDark ? 'action.hover' : 'action.selected',
                }}
              >
                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Who We Are
                </Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.875rem' }}>
                    Founded in 2014, Boss Cargo Express started its roots in Puerto Princesa City, Palawan. Since then, the company has grown and delivered the best cargo solutions to various clients across the Philippine archipelago.
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.875rem' }}>
                    Coming up with corporate directives and initiatives that add value to existing and potential clients, strengthening the organization's functional areas, and making the corporation highly competitive are top priorities.
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.875rem' }}>
                    Our key strategies for expansion, customer satisfaction, fiscal standing, and enterprise sustainability are geared towards extending our product scope and serving a wider market segment.
                  </Typography>
                </Stack>
              </Paper>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'primary.main', fontWeight: 600 }}>
                        Our Mission
                      </Typography>
                      <Typography variant="caption" color="text.primary" display="block">
                        To provide world-class logistics solutions that exceed customer expectations while fostering a culture of excellence, innovation, and continuous improvement.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'primary.main', fontWeight: 600 }}>
                        Our Dreams
                      </Typography>
                      <Typography variant="caption" color="text.primary" display="block">
                        To be the most trusted and innovative logistics partner globally, setting industry standards for reliability, sustainability, and customer service.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Right: Hero Image */}
            <Grid size={{ xs: 12, md: 6 }}>
              <ImageWithFallback
                src={IMAGE_URLS.ABOUT_WAREHOUSE_TEAM}
                alt={getImageMetadata(IMAGE_URLS.ABOUT_WAREHOUSE_TEAM).alt}
                layout="responsive"
                aspectRatio="4:3"
                rounded={12}
                shadow={4}
                priority
              />
            </Grid>
          </Grid>
        </PageContainer>
      </Box>

      {/* Slide 2: Company Officials */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          bgcolor: 'background.paper',
          py: { xs: 4, md: 0 }
        }}
      >
        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%' }}>
          <PageHeader
            title="Company Officials"
            titleVariant="h3"
            bottomSpacing={SECTION_SPACING.medium}
            align="center"
          />

          <Grid
            container
            spacing={3}
            justifyContent="center"
            alignItems="stretch"
          >
            {officials.map((official, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    maxWidth: 340,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-4px)' },
                    bgcolor: 'background.default',
                    boxShadow: isDark ? 4 : 2,
                    borderRadius: 3
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: 240,
                      bgcolor: isDark ? 'action.hover' : 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {official.image ? (
                      <ImageWithFallback
                        src={official.image}
                        alt={official.name}
                        layout="fill"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Stack alignItems="center" spacing={1}>
                        <User size={40} color={theme.palette.text.disabled} />
                        <Typography variant="caption" color="text.disabled">
                          NO IMAGE AVAILABLE
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {official.name}
                      </Typography>
                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {official.title}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 1.5, opacity: 0.6 }} />
                    <Stack spacing={1.5}>
                      {official.phones && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Phone size={12} /> Contact
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{official.phones[0]}</Typography>
                        </Box>
                      )}
                      {official.emails && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Mail size={12} /> Email
                          </Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.8125rem' }}>{official.emails[0]}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </PageContainer>
      </Box>

      {/* Slide 3: Contact Information */}
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
            title="Contact Information"
            titleVariant="h3"
            bottomSpacing={SECTION_SPACING.small}
          />
          <Grid container spacing={4} alignItems="center">
            {offices.map((office, index) => (
              <React.Fragment key={index}>                {/* Left side: Contact Details */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 0.5, textTransform: 'uppercase', letterSpacing: -1 }}>
                        {office.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, opacity: 0.8 }}>
                        Corporate headquarters in Las Piñas, Metro Manila.
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      {/* Address */}
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default', borderStyle: 'dashed' }}>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          <Box sx={{ p: 0.75, borderRadius: 1.25, bgcolor: 'primary.main', color: 'white', display: 'flex', boxShadow: 1 }}>
                            <MapPin size={18} />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.disabled', fontSize: '0.6rem' }}>Location</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3, fontSize: '0.8rem' }}>{office.address}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{office.city}</Typography>
                          </Box>
                        </Box>
                      </Paper>

                      {/* Phone Numbers */}
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default', borderStyle: 'dashed' }}>
                        <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                          <Box sx={{ p: 0.75, borderRadius: 1.25, bgcolor: 'primary.main', color: 'white', display: 'flex', boxShadow: 1, alignSelf: 'flex-start' }}>
                            <Phone size={18} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.disabled', fontSize: '0.6rem' }}>Communication</Typography>
                            <Grid container spacing={1} sx={{ mt: 0.25 }}>
                              <Grid size={6}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', display: 'block' }}>General</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{office.phone}</Typography>
                              </Grid>
                              <Grid size={6}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', display: 'block' }}>Cust. Service</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{office.customerService}</Typography>
                              </Grid>
                              <Grid size={6}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', display: 'block' }}>Marketing</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{office.marketing}</Typography>
                              </Grid>
                              <Grid size={6}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', display: 'block' }}>Finance</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{office.finance}</Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 0.75, opacity: 0.4, borderStyle: 'dashed' }} />
                        <Box sx={{ pl: 4 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', fontSize: '0.6rem', display: 'block', mb: 0.25 }}>Mobile Contacts</Typography>
                          <Stack direction="row" spacing={1.5}>
                            {office.mobile.map((num, i) => (
                              <Typography key={i} variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'primary.main' }}>{num}</Typography>
                            ))}
                          </Stack>
                        </Box>
                      </Paper>

                      {/* Emails & Socials */}
                      <Box sx={{ pl: 0.5 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={7}>
                            <Stack spacing={0.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Mail size={12} color={theme.palette.primary.main} />
                                <Typography component="a" href={`mailto:${office.email}`} sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 600, fontSize: '0.7rem', '&:hover': { color: 'primary.main' } }}>
                                  {office.email}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Mail size={12} color={theme.palette.primary.main} />
                                <Typography component="a" href="mailto:people@bosscargo.express" sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 600, fontSize: '0.7rem', '&:hover': { color: 'primary.main' } }}>
                                  people@bosscargo.express
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid size={5}>
                            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                              <Typography component="a" href="https://www.linkedin.com/company/boss-cargo-express" target="_blank" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                <Linkedin size={18} />
                              </Typography>
                              <Typography component="a" href="https://www.facebook.com/ikawangbossko20" target="_blank" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                <Facebook size={18} />
                              </Typography>
                              <Typography component="a" href="https://ph.indeed.com/cmp/Boss-Cargo-Express-3/jobs" target="_blank" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                <ExternalLink size={18} />
                              </Typography>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Paper 
                    elevation={8}
                    sx={{ 
                      borderRadius: 4, 
                      overflow: 'hidden', 
                      height: { xs: 300, md: 420 },
                      border: 2,
                      borderColor: 'primary.main',
                      position: 'relative',
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
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </PageContainer>
      </Box>
    </Box>
  );
}