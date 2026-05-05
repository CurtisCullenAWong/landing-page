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
  alpha,
} from '@mui/material';
import { SECTION_SPACING } from '../../constants/layout';
import { usePageTitle } from '../../lib/usePageTitle';
import React from 'react';

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

  // Shared "Corner Brackets" component
  const CornerBrackets = () => (
    <>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 12,
        height: 12,
        borderTop: `2px solid ${tertiaryMain}`,
        borderLeft: `2px solid ${tertiaryMain}`,
        borderTopLeftRadius: 4,
        zIndex: 2
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderBottom: `2px solid ${tertiaryMain}`,
        borderRight: `2px solid ${tertiaryMain}`,
        borderBottomRightRadius: 4,
        zIndex: 2
      }} />
    </>
  );

  return (
    <Box sx={{ bgcolor: bgColor }}>
      {/* Slide 1: Introduction & Identity */}
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
          <Box sx={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: '1400px',
            height: '800px',
            bgcolor: alpha(primaryMain, 0.12),
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            transform: 'rotate(-15deg)',
          }} />
          {/* Massive Squiggly Shape 2 (Yellow) */}
          <Box sx={{
            position: 'absolute',
            bottom: '-10%',
            left: '-15%',
            width: '1000px',
            height: '1000px',
            bgcolor: alpha(tertiaryMain, 0.15),
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            transform: 'rotate(20deg)',
          }} />
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
                  p: 3,
                  mb: 2.5,
                  bgcolor: alpha(isDark ? primaryDark : primaryMain, 0.08),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(primaryMain, 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <CornerBrackets />
                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700, color: primaryMain }}>
                  Who We Are
                </Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9375rem', lineHeight: 1.7 }}>
                    Founded in 2014, Boss Cargo Express started its roots in Puerto Princesa City, Palawan. Since then, the company has grown and delivered the best cargo solutions to various clients across the Philippine archipelago.
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9375rem', lineHeight: 1.7 }}>
                    Coming up with corporate directives and initiatives that add value to existing and potential clients, strengthening the organization's functional areas, and making the corporation highly competitive are top priorities.
                  </Typography>
                </Stack>
              </Paper>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ height: '100%', position: 'relative', bgcolor: isDark ? 'action.hover' : 'background.paper', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CornerBrackets />
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: primaryMain, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Our Mission
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        To provide world-class logistics solutions that exceed customer expectations while fostering a culture of excellence.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ height: '100%', position: 'relative', bgcolor: isDark ? 'action.hover' : 'background.paper', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CornerBrackets />
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: primaryMain, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Our Dreams
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        To be the most trusted and innovative logistics partner globally, setting industry standards for reliability and sustainability.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Right: Hero Image with Offset Decorative Frame */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ position: 'relative', p: 1 }}>
                {/* Decorative Frame */}
                <Box sx={{
                  position: 'absolute',
                  inset: '-10px 10px 10px -10px',
                  border: `2px solid ${tertiaryMain}`,
                  borderRadius: '24px 8px 24px 8px',
                  zIndex: 0,
                  opacity: 0.6
                }} />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <ImageWithFallback
                    src={IMAGE_URLS.ABOUT_WAREHOUSE_TEAM}
                    alt={getImageMetadata(IMAGE_URLS.ABOUT_WAREHOUSE_TEAM).alt}
                    layout="responsive"
                    aspectRatio="4:3"
                    rounded={16}
                    shadow={8}
                    priority
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </PageContainer>

        {/* Smooth transition to Slide 2 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '15vh',
            background: `linear-gradient(to bottom, transparent, ${theme.palette.background.paper})`,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      </Box>

      {/* Slide 2: Company Officials */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          bgcolor: paperColor,
          py: { xs: 10, md: 12 }, // Increased vertical padding
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
          {/* Massive Squiggly Shape (Yellow) */}
          <Box sx={{
            position: 'absolute',
            top: '10%',
            left: '-15%',
            width: '1600px',
            height: '600px',
            bgcolor: alpha(tertiaryMain, 0.12),
            borderRadius: '50% 20% 50% 20% / 20% 50% 20% 50%',
            transform: 'rotate(15deg)',
          }} />
          {/* Organic Shape (Teal) */}
          <Box sx={{
            position: 'absolute',
            bottom: '-15%',
            right: '-10%',
            width: '900px',
            height: '900px',
            bgcolor: alpha(primaryMain, 0.15),
            borderRadius: '67% 33% 47% 53% / 37% 20% 80% 63%',
          }} />
        </Box>

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
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
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: isDark ? 12 : 6,
                      borderColor: primaryMain
                    },
                    bgcolor: 'background.default',
                    boxShadow: isDark ? 4 : 2,
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                >
                  <CornerBrackets />
                  <Box
                    sx={{
                      width: '100%',
                      height: 260,
                      bgcolor: isDark ? 'action.hover' : 'grey.50',
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
                      <Stack alignItems="center" spacing={1.5}>
                        <Box sx={{ p: 2, borderRadius: '50%', bgcolor: alpha(primaryMain, 0.1), color: primaryMain }}>
                          <User size={48} />
                        </Box>
                        <Typography variant="overline" color="text.disabled" sx={{ fontWeight: 700 }}>
                          No Image Available
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: -0.5 }}>
                        {official.name}
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: tertiaryMain,
                        bgcolor: alpha(tertiaryMain, 0.1),
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 1.5
                      }}>
                        {official.title}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2, opacity: 0.4 }} />
                    <Stack spacing={2}>
                      {official.phones && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, letterSpacing: 0.5 }}>
                            <Phone size={14} /> Contact
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{official.phones[0]}</Typography>
                        </Box>
                      )}
                      {official.emails && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, letterSpacing: 0.5 }}>
                            <Mail size={14} /> Email
                          </Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.875rem', color: primaryMain, fontWeight: 500 }}>{official.emails[0]}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </PageContainer>

        {/* Smooth transition to Slide 3 */}
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

      {/* Slide 3: Contact Information */}
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
          <Box sx={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '1000px',
            height: '1200px',
            bgcolor: alpha(primaryMain, 0.1),
            borderRadius: '40% 60% 30% 70% / 60% 30% 70% 40%',
            maskImage: 'linear-gradient(to right, black, transparent)',
          }} />
          {/* Secondary Squiggle (Yellow) */}
          <Box sx={{
            position: 'absolute',
            bottom: '-20%',
            right: '-5%',
            width: '800px',
            height: '800px',
            bgcolor: alpha(tertiaryMain, 0.08),
            borderRadius: '50% 50% 20% 80% / 25% 80% 20% 75%',
            transform: 'rotate(-10deg)'
          }} />
        </Box>

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <Box sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${primaryMain} 0%, ${primaryDark} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 8
          }}>
            <Box sx={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '400px',
              height: '400px',
              bgcolor: alpha('#fff', 0.1),
              borderRadius: '50%',
            }} />
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, textTransform: 'uppercase', letterSpacing: -1 }}>
              Get In Touch
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600 }}>
              We're ready to handle your logistics needs with precision and care.
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="stretch">
            {offices.map((office, index) => (
              <React.Fragment key={index}>
                {/* Left side: Contact Details */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Stack spacing={3} sx={{ height: '100%' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: primaryMain, fontWeight: 800, mb: 1, textTransform: 'uppercase', letterSpacing: -1 }}>
                        {office.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
                        Corporate headquarters providing comprehensive logistics solutions.
                      </Typography>
                    </Box>

                    <Stack spacing={2}>
                      {/* Address */}
                      <Paper variant="outlined" sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: alpha(primaryMain, 0.03),
                        borderColor: alpha(primaryMain, 0.2),
                        position: 'relative'
                      }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Box sx={{ p: 1, borderRadius: 2, bgcolor: primaryMain, color: 'white', display: 'flex', boxShadow: 2 }}>
                            <MapPin size={24} />
                          </Box>
                          <Box>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: tertiaryDark, lineHeight: 1 }}>Location</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>{office.address}</Typography>
                            <Typography variant="body2" color="text.secondary">{office.city}</Typography>
                          </Box>
                        </Box>
                      </Paper>

                      {/* Phone Numbers */}
                      <Paper variant="outlined" sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: alpha(tertiaryMain, 0.03),
                        borderColor: alpha(tertiaryMain, 0.2)
                      }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <Box sx={{ p: 1, borderRadius: 2, bgcolor: tertiaryMain, color: secondaryDark, display: 'flex', boxShadow: 2, alignSelf: 'flex-start' }}>
                            <Phone size={24} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: primaryDark, lineHeight: 1 }}>Communication</Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid size={6}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, display: 'block' }}>General</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>{office.phone}</Typography>
                              </Grid>
                              <Grid size={6}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, display: 'block' }}>Cust. Service</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>{office.customerService}</Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 1.5, opacity: 0.2 }} />
                        <Box sx={{ pl: 5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', display: 'block', mb: 0.5 }}>Mobile Contacts</Typography>
                          <Stack direction="row" spacing={3}>
                            {office.mobile.map((num, i) => (
                              <Typography key={i} variant="body1" sx={{ fontWeight: 800, color: primaryMain }}>{num}</Typography>
                            ))}
                          </Stack>
                        </Box>
                      </Paper>

                      {/* Emails & Socials */}
                      <Box sx={{ px: 1 }}>
                        <Grid container spacing={3} alignItems="center">
                          <Grid size={7}>
                            <Stack spacing={1}>
                              {[office.email, 'people@bosscargo.express'].map((email, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Mail size={16} color={primaryMain} />
                                  <Typography component="a" href={`mailto:${email}`} sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 700, '&:hover': { color: primaryMain } }}>
                                    {email}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Grid>
                          <Grid size={5}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                              {[
                                { icon: <Linkedin size={22} />, url: "https://www.linkedin.com/company/boss-cargo-express" },
                                { icon: <Facebook size={22} />, url: "https://www.facebook.com/ikawangbossko20" },
                                { icon: <ExternalLink size={22} />, url: "https://ph.indeed.com/cmp/Boss-Cargo-Express-3/jobs" }
                              ].map((social, i) => (
                                <Typography key={i} component="a" href={social.url} target="_blank" sx={{ color: 'text.secondary', transition: 'color 0.2s', '&:hover': { color: primaryMain } }}>
                                  {social.icon}
                                </Typography>
                              ))}
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Box sx={{ position: 'relative', height: '100%', minHeight: { xs: 300, md: 500 } }}>
                    {/* Decorative Frame for Map */}
                    <Box sx={{
                      position: 'absolute',
                      inset: '20px -20px -20px 20px',
                      border: `2px solid ${tertiaryMain}`,
                      borderRadius: 4,
                      zIndex: 0
                    }} />
                    <Paper
                      elevation={12}
                      sx={{
                        borderRadius: 4,
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