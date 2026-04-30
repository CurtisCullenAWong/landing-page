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
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { NAV_LINKS, CONTACT_INFO, scrollToHref } from '@/constants/navigation';
import { IMAGE_URLS } from '@/constants/images';

const BUILD_YEAR = new Date().getFullYear();

export function Footer() {
  const theme = useTheme();
  const pathname = usePathname();
  const [currentYear, setCurrentYear] = useState<number>(BUILD_YEAR);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (pathname === '/' && href.startsWith('/#')) {
      if (scrollToHref(href)) {
        e.preventDefault();
      }
    }
  };

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
        scrollSnapAlign: 'start'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>

          {/* Brand Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <Link
                href="/"
                className="flex items-center group outline-none"
                onClick={(e) => handleNavClick(e, '/')}
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/20 to-white/5 p-2 backdrop-blur-md transition-all duration-300 group-hover:from-white/30 group-hover:to-white/10 border border-white/10 shadow-lg group-hover:shadow-white/10 group-hover:scale-[1.02]">
                  <img
                    src={IMAGE_URLS.LOGO.src}
                    alt="Logo"
                    className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                </div>
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
              {NAV_LINKS.filter(l => !['Careers', 'My Application'].includes(l.name)).map((link) => (
                <MuiLink
                  key={link.name}
                  component={Link}
                  href={link.href}
                  onClick={(e: any) => handleNavClick(e, link.href)}
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
              <MuiLink
                component={Link}
                href="/my-application"
                sx={{
                  color: footerStyles.secondaryText,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: theme.palette.common.white }
                }}
              >
                My Application
              </MuiLink>
            </Stack>
          </Grid>

          {/* Careers Section */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', color: footerStyles.text }}>
              Careers
            </Typography>
            <Stack spacing={1.5}>
              <MuiLink
                component={Link}
                href="/#careers"
                onClick={(e: any) => handleNavClick(e, '/#careers')}
                sx={{
                  color: footerStyles.secondaryText,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: theme.palette.common.white }
                }}
              >
                Careers
              </MuiLink>
              <MuiLink
                href="https://www.linkedin.com/company/boss-cargo-express/?originalSubdomain=ph"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: footerStyles.secondaryText,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: theme.palette.common.white }
                }}
              >
                LinkedIn
              </MuiLink>
              <MuiLink
                href="https://ph.indeed.com/cmp/Boss-Cargo-Express-3/jobs"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: footerStyles.secondaryText,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: theme.palette.common.white }
                }}
              >
                Indeed
              </MuiLink>
              <MuiLink
                href="https://www.facebook.com/ikawangbossko20"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: footerStyles.secondaryText,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: theme.palette.common.white }
                }}
              >
                Facebook
              </MuiLink>
            </Stack>
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