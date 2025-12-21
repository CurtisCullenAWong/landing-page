'use client';

import { Box, Container, Typography, Link as MuiLink, Grid } from '@mui/material';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';

// Calculate year at module level (executed at build/import time)
// This provides a consistent initial value for SSR and client
const BUILD_YEAR = new Date().getFullYear();

export function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  // Use useState with BUILD_YEAR as initial value to ensure consistency
  // Update in useEffect to get the actual current year (handles year changes)
  const [currentYear, setCurrentYear] = useState<number>(BUILD_YEAR);

  useEffect(() => {
    // Update to actual year after mount (handles edge case of year change)
    const actualYear = new Date().getFullYear();
    if (actualYear !== BUILD_YEAR) {
      setCurrentYear(actualYear);
    }
  }, []);


  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about-us' },
      { name: 'Why Us', href: '/why-us' },
      { name: 'History', href: '/history' },
      { name: 'Partnerships', href: '/partnerships' },
    ],
    careers: [
      { name: 'Job Postings', href: '/job-postings' },
    ],
    contact: [
      { name: 'General: info@bosscargo.express', href: 'mailto:info@bosscargo.express' },
      { name: 'Careers: people@bosscargo.express', href: 'mailto:people@bosscargo.express' },
      { name: 'Phone: (02) 8805 2402', href: 'tel:+63288052402' },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: isDark ? 'background.paper' : 'grey.50',
        borderTop: 1,
        borderColor: 'divider',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ backgroundColor: 'primary.main', p: 2, borderRadius: 1 }}>
                <img 
                  src="/favicon.ico" 
                  alt="Boss Cargo Express" 
                  width={32} 
                  height={32}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Boss Cargo Express
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Providing world-class logistics solutions across the Philippine archipelago since 2014.
            </Typography>
          </Grid>

          {/* Company Links */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.company.map((link) => (
                <MuiLink
                  key={link.name}
                  component={Link}
                  href={link.href}
                  color="text.secondary"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                    fontSize: '0.875rem',
                  }}
                >
                  {link.name}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          {/* Careers Links */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Careers
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.careers.map((link) => (
                <MuiLink
                  key={link.name}
                  component={Link}
                  href={link.href}
                  color="text.secondary"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                    fontSize: '0.875rem',
                  }}
                >
                  {link.name}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          {/* Contact Links */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.contact.map((link) => (
                <MuiLink
                  key={link.name}
                  component={link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? 'a' : Link}
                  href={link.href}
                  color="text.secondary"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                    fontSize: '0.875rem',
                  }}
                >
                  {link.name}
                </MuiLink>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            mt: 4,
            pt: 4,
            borderTop: 1,
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Boss Cargo Express. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

