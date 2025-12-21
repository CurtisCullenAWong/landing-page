'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Link as MuiLink, 
  Stack, 
  Divider, 
  useTheme,
  alpha // Helper function to handle opacities
} from '@mui/material';
import Grid from '@mui/material/Grid'; // Using Grid2 for modern layout
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { NAV_LINKS, CONTACT_INFO } from '@/constants/navigation';

const BUILD_YEAR = new Date().getFullYear();

export function Footer() {
  const theme = useTheme();
  const [currentYear, setCurrentYear] = useState<number>(BUILD_YEAR);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Footer uses dark background with light text for proper contrast
  const footerStyles = {
    bg: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.dark,
    text: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.primary.contrastText,
    // Secondary text with appropriate opacity
    secondaryText: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.text.primary, 0.7) 
      : alpha(theme.palette.primary.contrastText, 0.8),
    // Border color
    border: theme.palette.mode === 'dark' 
      ? theme.palette.divider 
      : alpha(theme.palette.primary.contrastText, 0.1), 
  };

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: footerStyles.bg, 
        color: footerStyles.text, 
        pt: 8, 
        pb: 4, 
        mt: 'auto',
        borderTop: `1px solid ${footerStyles.border}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          
          {/* Brand Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <Link href="/" className="flex items-center gap-2 group outline-none">
                <img 
                  src="/favicon.ico" 
                  alt="Logo" 
                  width={32} 
                  height={32} 
                  className="brightness-0 invert transition-transform group-hover:scale-105" 
                />
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, color: footerStyles.text }}>
                  BOSS CARGO
                </Typography>
              </Link>
              <Typography variant="body2" sx={{ color: footerStyles.secondaryText, lineHeight: 1.7 }}>
                Delivering excellence across the Philippines with world-class logistics 
                solutions since 2014.
              </Typography>
            </Stack>
          </Grid>

          {/* Navigation Links */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', color: footerStyles.text }}>
              Company
            </Typography>
            <Stack spacing={1.5}>
              {NAV_LINKS.filter(l => !['Home', 'Careers'].includes(l.name)).map((link) => (
                <MuiLink 
                  key={link.name} 
                  component={Link} 
                  href={link.href} 
                  sx={{ 
                    color: footerStyles.secondaryText, 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                    '&:hover': { color: theme.palette.common.white } 
                  }}
                >
                  {link.name}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          {/* Careers Section */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', color: footerStyles.text }}>
              Careers
            </Typography>
            <MuiLink 
              component={Link} 
              href="/job-postings" 
              sx={{ 
                color: footerStyles.secondaryText, 
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: theme.palette.common.white } 
              }}
            >
              Job Postings
            </MuiLink>
          </Grid>

          {/* Contact Section */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', color: footerStyles.text }}>
              Contact Us
            </Typography>
            <Stack spacing={1.5}>
              {Object.entries(CONTACT_INFO).map(([key, info]) => (
                <MuiLink 
                  key={key} 
                  href={info.href} 
                  sx={{ 
                    color: footerStyles.secondaryText, 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'block',
                    '&:hover': { color: theme.palette.common.white } 
                  }}
                >
                  {info.label}
                </MuiLink>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Divider sx={{ mb: 3, borderColor: footerStyles.border }} />
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              color: alpha(footerStyles.text, 0.5),
              fontWeight: 500
            }}
          >
            © {currentYear} Boss Cargo Express. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}