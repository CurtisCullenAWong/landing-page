'use client';

import { Handshake } from 'lucide-react';
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
import { usePageTitle } from '../../lib/usePageTitle';

export default function PartnershipsPage() {
  usePageTitle('Partnerships');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const industries = [
    'Business Process Outsourcing',
    'Fast-moving Consumer Goods',
    'Engineering Services',
    'Food Services',
    'Financial Services',
    'Retail'
  ];

  const memberships = [
    {
      name: 'Supply Chain Management Association of the Philippines (SCMAP)',
      description: 'Active member of the premier supply chain and logistics association in the Philippines.'
    },
    {
      name: 'Philippine Economic Zone Authority (PEZA)',
      description: 'Accredited partner for PEZA facilitation services, supporting economic zone operations.'
    },
    {
      name: 'JCtrans Network-International Freight Forwarders Network',
      description: 'Premium Member of the international freight forwarders network, connecting us to global logistics partners.'
    }
  ];


  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
            Our Partnerships
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
            Logistics is a critical component of firms' value chain. However, not all organizations have the capacity to perform the movement and storage of goods within the supply chain. Outsource these capabilities to us. We're experts in these fields.
          </Typography>
        </Box>

        {/* Partnership Philosophy */}
        <Paper
          sx={{
            mb: 8,
            overflow: 'hidden',
            background: isDark
              ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
              : 'linear-gradient(135deg,rgb(15, 106, 103) 0%,rgb(50, 139, 139) 100%)',
            color: isDark ? 'text.primary' : 'primary.contrastText',
          }}
        >
          <Grid container>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ p: { xs: 4, md: 6 }, display: 'flex', alignItems: 'center' }}>
              <Box>
                <Typography variant="h3" sx={{ mb: 3, fontWeight: 600 }}>
                  Strategic Partnerships
                </Typography>
                <Typography variant="h6">
                  We take pride in growing the business together with firms by being dependable, cost-effective, and on-time in Domestic, International Forwarding, and Brokerage settings. We are no ordinary entity. Our business is built on and guided by our brand values. Partner with a brand that will revolutionize the industry.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ minHeight: { xs: '300px', lg: 'auto' }, p: { xs: 2, md: 3 } }}>
              <ImageWithFallback
                src={IMAGE_URLS.PARTNERSHIPS_HANDSHAKE}
                alt={getImageMetadata(IMAGE_URLS.PARTNERSHIPS_HANDSHAKE).alt}
                layout="responsive"
                aspectRatio="4:3"
                rounded={8}
                shadow={2}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Industries Served */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            Industries That We Serve
          </Typography>
          <Grid container spacing={3}>
            {industries.map((industry, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {industry}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Memberships & Accreditations */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            Memberships & Accreditations
          </Typography>
          <Grid container spacing={4}>
            {memberships.map((membership, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                      {membership.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {membership.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Partnership & Investment Opportunities */}
        <Paper
          sx={{
            p: 4,
            mb: 8,
            bgcolor: isDark ? 'action.hover' : 'action.selected',
          }}
        >
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            Partnership & Investment Opportunities
          </Typography>
          <Typography variant="body1" color="text.primary" sx={{ mb: 3, fontSize: '1.1rem', textAlign: 'center' }}>
            Join Us: We take pride in growing the business together with firms by being dependable, cost-effective, and on-time in Domestic, International Forwarding, and Brokerage settings. We are no ordinary entity. Our business is built on and guided by our brand values. Partner with a brand that will revolutionize the industry.
          </Typography>
          <Typography variant="body1" color="text.primary" sx={{ textAlign: 'center' }}>
            <strong>For Investment or Partnership Opportunities:</strong> Contact us to learn more.
          </Typography>
        </Paper>

        {/* CTA */}
        <Card>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Handshake size={64} style={{ color: theme.palette.primary.main, margin: '0 auto 24px' }} />
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Interested in Partnering with Us?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
              We're always looking for innovative companies to join our network and create 
              mutually beneficial partnerships. Contact us to learn more about investment or partnership opportunities.
            </Typography>
            <Button
              component="a"
              href="mailto:people@bosscargo.express"
              variant="contained"
              size="large"
            >
              Contact Us for Partnership Opportunities
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
