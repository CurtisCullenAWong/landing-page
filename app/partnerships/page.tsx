'use client';

import { Handshake, Briefcase, Package, Wrench, UtensilsCrossed, DollarSign, Store } from 'lucide-react';
import Link from 'next/link';
import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
} from '@mui/material';
import { PageContainer, PageHeader } from '../../components/layout';
import { usePageTitle } from '../../lib/usePageTitle';

export default function PartnershipsPage() {
  usePageTitle('Partnerships');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const industries = [
    { name: 'Business Process Outsourcing', icon: Briefcase },
    { name: 'Fast-moving Consumer Goods', icon: Package },
    { name: 'Engineering Services', icon: Wrench },
    { name: 'Food Services', icon: UtensilsCrossed },
    { name: 'Financial Services', icon: DollarSign },
    { name: 'Retail', icon: Store }
  ];

  const memberships = [
    {
      name: 'Supply Chain Management Association of the Philippines (SCMAP)',
      description: 'Active member of the premier supply chain and logistics association in the Philippines.',
      image: IMAGE_URLS.MEMBERSHIP_SCMAP,
      imageAlt: getImageMetadata(IMAGE_URLS.MEMBERSHIP_SCMAP).alt
    },
    {
      name: 'Philippine Economic Zone Authority (PEZA)',
      description: 'Accredited partner for PEZA facilitation services, supporting economic zone operations.',
      image: IMAGE_URLS.MEMBERSHIP_PEZA,
      imageAlt: getImageMetadata(IMAGE_URLS.MEMBERSHIP_PEZA).alt,
      whiteBackground: true
    },
    {
      name: 'JCtrans Network-International Freight Forwarders Network',
      description: 'Premium Member of the international freight forwarders network, connecting us to global logistics partners.',
      image: IMAGE_URLS.MEMBERSHIP_JCTRANS,
      imageAlt: getImageMetadata(IMAGE_URLS.MEMBERSHIP_JCTRANS).alt
    }
  ];


  return (
    <Box>
      {/* Slide 1: Introduction & Industries */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 8, md: 0 }
        }}
      >
        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%' }}>
          {/* Header */}
          <PageHeader
            title="Our Partnerships"
            subtitle="Logistics is a critical component of firms' value chain. However, not all organizations have the capacity to perform the movement and storage of goods within the supply chain. Outsource these capabilities to us. We're experts in these fields."
            bottomSpacing={4}
          />

          {/* Partnership Philosophy */}
          <Paper
            sx={{
              mb: 4,
              overflow: 'hidden',
              background: isDark
                ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              color: isDark ? 'text.primary' : 'primary.contrastText',
              borderRadius: 3,
            }}
          >
            <Grid container>
              <Grid size={{ xs: 12, lg: 7 }} sx={{ p: { xs: 3, md: 4 }, display: 'flex', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                    Strategic Partnerships
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.9 }}>
                    We take pride in growing the business together with firms by being dependable, cost-effective, and on-time in Domestic, International Forwarding, and Brokerage settings. We are no ordinary entity. Our business is built on and guided by our brand values. Partner with a brand that will revolutionize the industry.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }} sx={{ minHeight: { xs: '200px', lg: 'auto' }, p: 2 }}>
                <ImageWithFallback
                  src={IMAGE_URLS.PARTNERSHIPS_HANDSHAKE}
                  alt={getImageMetadata(IMAGE_URLS.PARTNERSHIPS_HANDSHAKE).alt}
                  layout="responsive"
                  aspectRatio="16:9"
                  objectFit="cover"
                  rounded={4}
                  shadow={false}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Industries Served */}
          <Box>
            <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 700, color: 'primary.main' }}>
              Industries That We Serve
            </Typography>
            <Grid container spacing={2}>
              {industries.map((industry, index) => {
                const IconComponent = industry.icon;
                return (
                  <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%', 
                        bgcolor: isDark ? 'action.hover' : 'action.selected',
                        transition: 'transform 0.2s', 
                        '&:hover': { transform: 'translateY(-4px)' } 
                      }}
                    >
                      <CardContent sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconComponent size={20} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>
                          {industry.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </PageContainer>
      </Box>

      {/* Slide 2: Recognition & Opportunities */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          bgcolor: isDark ? 'background.default' : 'grey.50',
          py: { xs: 8, md: 0 }
        }}
      >
        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%' }}>
          <Grid container spacing={4}>
            {/* Memberships */}
            <Grid size={12}>
              <Typography variant="h4" sx={{ textAlign: 'center', mb: 4, fontWeight: 700, color: 'primary.main' }}>
                Memberships & Accreditations
              </Typography>
              <Grid container spacing={3}>
                {memberships.map((membership, index) => (
                  <Grid size={{ xs: 12, md: 4 }} key={index}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2 }}>
                      <Box 
                        sx={{ 
                          p: (membership as any).whiteBackground ? 3 : 2, 
                          pb: (membership as any).whiteBackground ? 3 : 0,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: 140,
                          position: 'relative',
                          ...( (membership as any).whiteBackground && {
                            bgcolor: 'white',
                            borderRadius: 2,
                            m: 2,
                            aspectRatio: '1/1',
                            height: 'auto',
                            maxHeight: 120
                          })
                        }}
                      >
                        <ImageWithFallback
                          src={membership.image}
                          alt={membership.imageAlt}
                          layout={(membership as any).whiteBackground ? "fill" : "responsive"}
                          aspectRatio="auto"
                          objectFit="contain"
                        />
                      </Box>
                      <CardContent sx={{ p: 3, pt: 2, flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main', fontWeight: 700, lineHeight: 1.3 }}>
                          {membership.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {membership.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Opportunities & CTA */}
            <Grid size={12}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Paper
                    sx={{
                      p: 4,
                      height: '100%',
                      bgcolor: isDark ? 'action.hover' : 'white',
                      borderLeft: `6px solid ${theme.palette.primary.main}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                      Investment Opportunities
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, fontSize: '1rem', lineHeight: 1.6 }}>
                      Join Us: We take pride in growing the business together with firms by being dependable, cost-effective, and on-time in Domestic, International Forwarding, and Brokerage settings.
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Contact us to learn more about Investment or Partnership Opportunities.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: isDark
                        ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 100%)`
                        : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      color: 'primary.contrastText'
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Handshake size={48} style={{ marginBottom: 16, opacity: 0.9 }} />
                      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                        Interested in Partnering?
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                        We're always looking for innovative companies to join our network and create mutually beneficial partnerships.
                      </Typography>
                      <Link href="/about-us" style={{ textDecoration: 'none' }}>
                        <Button 
                          variant="contained" 
                          size="large" 
                          sx={{
                            bgcolor: 'white',
                            color: 'primary.main',
                            fontWeight: 700,
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.9)',
                            },
                          }}
                        >
                          Contact Us Today
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </PageContainer>
      </Box>
    </Box>
  );
}
