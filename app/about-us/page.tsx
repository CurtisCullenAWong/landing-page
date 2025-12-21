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

  return (
    <PageContainer>
      <PageHeader
        title="About Boss Cargo Express"
        subtitle="Embark on a sustainable and transformative journey with us."
      />

      {/* Hero Image */}
      <Box sx={{ mb: SECTION_SPACING.large }}>
        <ImageWithFallback
          src={IMAGE_URLS.ABOUT_WAREHOUSE_TEAM}
          alt={getImageMetadata(IMAGE_URLS.ABOUT_WAREHOUSE_TEAM).alt}
          layout="responsive"
          aspectRatio="16:9"
          rounded={8}
          shadow={3}
          priority
        />
      </Box>

      {/* Mission & Vision */}
      <ContentGrid spacing="medium" sx={{ mb: SECTION_SPACING.large }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  Our Mission
                </Typography>
                <Typography variant="body1" color="text.primary">
                  To provide world-class logistics solutions that exceed customer expectations while 
                  fostering a culture of excellence, innovation, and continuous improvement. We are 
                  committed to delivering value to our clients, opportunities to our employees, and 
                  positive impact to our communities.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  Our Vision
                </Typography>
                <Typography variant="body1" color="text.primary">
                  To be the most trusted and innovative logistics partner globally, setting industry 
                  standards for reliability, sustainability, and customer service. We envision a future 
                  where Boss Cargo is synonymous with excellence in freight and logistics solutions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
      </ContentGrid>

      {/* About Section */}
      <Section bottomSpacing="large">
        <Paper
          sx={{
            p: 4,
            bgcolor: isDark ? 'action.hover' : 'action.selected',
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 600 }}>
            Who We Are
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
        </Paper>
      </Section>

      {/* Company Officials */}
      <Section bottomSpacing="large">
        {/* Centered the header text */}
        <PageHeader
          title="Company Officials"
          titleVariant="h3"
          bottomSpacing={SECTION_SPACING.medium}
          align="center"
        />
        
        {/* Added justifyContent center to handle 1, 2, or 3 officials gracefully */}
        <Grid 
          container 
          spacing={4} 
          justifyContent="center"
        >
          {[
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
          ].map((official, index) => (
            <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4 }} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  maxWidth: 450, // Prevents card from becoming too wide on single item layouts
                  mx: 'auto',    // Centers the card itself in the grid item
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                {/* Image Placeholder */}
                <Box
                  sx={{
                    width: '100%',
                    height: 320, // Slightly taller for better portrait hierarchy
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
                      <User size={48} color={theme.palette.text.disabled} />
                      <Typography variant="caption" color="text.disabled">
                        NO IMAGE AVAILABLE
                      </Typography>
                    </Stack>
                  )}
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  {/* Centered Name and Title */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {official.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {official.title}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 3, opacity: 0.6 }} />

                  {/* Contact Info - Kept Left Aligned for readability of long strings */}
                  <Stack spacing={2.5}>
                    {official.phones && (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Phone size={14} /> Contact Numbers
                        </Typography>
                        {official.phones.map((phone, idx) => (
                          <Typography
                            key={idx}
                            variant="body2"
                            component="a"
                            href={`tel:${phone.replace(/\s/g, '')}`}
                            sx={{
                              display: 'block',
                              color: 'text.primary',
                              textDecoration: 'none',
                              fontWeight: 500,
                              '&:hover': { color: 'primary.main' },
                            }}
                          >
                            {phone}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {official.emails && (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Mail size={14} /> Email Addresses
                        </Typography>
                        {official.emails.map((email, idx) => (
                          <Typography
                            key={idx}
                            variant="body2"
                            component="a"
                            href={`mailto:${email}`}
                            sx={{
                              display: 'block',
                              color: 'text.primary',
                              textDecoration: 'none',
                              wordBreak: 'break-all',
                              '&:hover': { color: 'primary.main' },
                            }}
                          >
                            {email}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {official.address && (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <MapPin size={14} /> Office Address
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {official.address}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* Contact Information */}
      <Section bottomSpacing="large">
        <PageHeader
          title="Contact Information"
          titleVariant="h3"
          bottomSpacing={SECTION_SPACING.medium}
        />
        <ContentGrid spacing="medium">
            {offices.map((office, index) => (
              <Grid size={{ xs: 12 }} key={index}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                      {office.name}
                    </Typography>
                    <Grid container spacing={4}>
                      {/* Left Column - Address & Map */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {/* Address */}
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <MapPin size={20} style={{ color: theme.palette.text.secondary, marginTop: 4, flexShrink: 0 }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>Address</Typography>
                              <Typography variant="body2" color="text.secondary">{office.address}</Typography>
                              <Typography variant="body2" color="text.secondary">{office.city}</Typography>
                            </Box>
                          </Box>
                          
                          {/* Map */}
                          <Box>
                            <iframe
                              src={`https://www.google.com/maps?q=${encodeURIComponent(`${office.address}, ${office.city}`)}&output=embed`}
                              width="100%"
                              height="300"
                              style={{ border: 0, borderRadius: '8px' }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              title="Boss Cargo Express Location"
                            />
                          </Box>
                        </Box>
                      </Grid>

                      {/* Right Column - Contact Methods */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {/* Email Addresses */}
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                              Email
                            </Typography>
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Mail size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                                <Typography
                                  component="a"
                                  href={`mailto:${office.email}`}
                                  sx={{
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    '&:hover': { color: 'primary.main' },
                                  }}
                                >
                                  {office.email}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Mail size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                                <Typography
                                  component="a"
                                  href="mailto:people@bosscargo.express"
                                  sx={{
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    '&:hover': { color: 'primary.main' },
                                  }}
                                >
                                  people@bosscargo.express <Typography component="span" variant="caption" color="text.secondary">(Careers)</Typography>
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>

                          {/* Phone Numbers */}
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                              Phone
                            </Typography>
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Phone size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                                <Typography
                                  component="a"
                                  href={`tel:${office.phone.replace(/\s/g, '')}`}
                                  variant="body2"
                                  sx={{
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    '&:hover': { color: 'primary.main' },
                                  }}
                                >
                                  <strong>General:</strong> {office.phone}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Phone size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                                <Typography
                                  component="a"
                                  href={`tel:${office.marketing.replace(/\s/g, '')}`}
                                  variant="body2"
                                  sx={{
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    '&:hover': { color: 'primary.main' },
                                  }}
                                >
                                  <strong>Marketing:</strong> {office.marketing}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Phone size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                                <Typography
                                  component="a"
                                  href={`tel:${office.customerService.replace(/\s/g, '')}`}
                                  variant="body2"
                                  sx={{
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    '&:hover': { color: 'primary.main' },
                                  }}
                                >
                                  <strong>Customer Service:</strong> {office.customerService}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Phone size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                                <Typography
                                  component="a"
                                  href={`tel:${office.finance.replace(/\s/g, '')}`}
                                  variant="body2"
                                  sx={{
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    '&:hover': { color: 'primary.main' },
                                  }}
                                >
                                  <strong>Finance:</strong> {office.finance}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <Phone size={18} style={{ color: theme.palette.text.secondary, marginTop: 2, flexShrink: 0 }} />
                                <Box>
                                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    <strong>Mobile:</strong>
                                  </Typography>
                                  <Stack spacing={0.5}>
                                    {office.mobile.map((num, idx) => (
                                      <Typography
                                        key={idx}
                                        component="a"
                                        href={`tel:${num.replace(/\D/g, '')}`}
                                        variant="body2"
                                        sx={{
                                          color: 'text.primary',
                                          textDecoration: 'none',
                                          display: 'block',
                                          '&:hover': { color: 'primary.main' },
                                        }}
                                      >
                                        {num}
                                      </Typography>
                                    ))}
                                  </Stack>
                                </Box>
                              </Box>
                            </Stack>
                          </Box>

                          {/* Social Media */}
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                              Follow Us
                            </Typography>
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Linkedin size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                                <Typography
                                  component="a"
                                  href="https://www.linkedin.com/company/boss-cargo-express/?originalSubdomain=ph"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    '&:hover': { color: 'primary.main' },
                                  }}
                                >
                                  LinkedIn
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Facebook size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                                <Typography
                                  component="a"
                                  href="https://www.facebook.com/ikawangbossko20"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    '&:hover': { color: 'primary.main' },
                                  }}
                                >
                                  Facebook
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <ExternalLink size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                                <Typography
                                  component="a"
                                  href="https://ph.indeed.com/cmp/Boss-Cargo-Express-3/jobs"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    '&:hover': { color: 'primary.main' },
                                  }}
                                >
                                  Indeed Jobs
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </ContentGrid>
      </Section>

      {/* CTA */}
      {/* <Section>
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            background: isDark
              ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: isDark ? 'text.primary' : 'primary.contrastText',
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            Get In Touch
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Have questions? We're here to help! Reach out to us through any of our contact channels.
          </Typography>
          <Button
            component="a"
            href="mailto:info@bosscargo.express"
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
            Contact Us
          </Button>
        </Paper>
      </Section> */}
    </PageContainer>
  );
}