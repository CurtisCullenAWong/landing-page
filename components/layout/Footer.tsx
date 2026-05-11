'use client';

import {
  Box,
  Container,
  Typography,
  Link as MuiLink,
  Stack,
  Divider,
  useTheme,
  alpha,
  Button
} from '@mui/material';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import {
  FilledAbstractShape,
  MassiveAbstractShape
} from '../decorative/AbstractShapes';
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
    bg: theme.palette.mode === 'dark' ? theme.palette.background.default : '#0B0F14',
    text: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.common.white,
    // Secondary text with appropriate opacity
    secondaryText: theme.palette.mode === 'dark'
      ? alpha(theme.palette.text.primary, 0.7)
      : alpha(theme.palette.common.white, 0.7),
    // Border color
    border: theme.palette.mode === 'dark'
      ? theme.palette.divider
      : alpha(theme.palette.common.white, 0.1),
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: footerStyles.bg,
        color: footerStyles.text,
        pt: 10,
        pb: 6,
        mt: 'auto',
        borderTop: `1px solid ${footerStyles.border}`,
        scrollSnapAlign: 'start',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Massive Abstract Background Shapes for Footer */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <MassiveAbstractShape 
          color={theme.palette.primary.main} 
          opacity={0.55} 
          style={{ top: '-40%', right: '-30%', width: '170%', height: '200%' }} 
        />
        <MassiveAbstractShape 
          color={theme.palette.tertiary.main} 
          opacity={0.6} 
          delay={10}
          style={{ bottom: '-50%', left: '-30%', width: '180%', height: '210%', transform: 'rotate(25deg)' }} 
        />
        <FilledAbstractShape 
          color={theme.palette.tertiary.main} 
          size={550} 
          style={{ bottom: '10%', right: '0%', opacity: 0.45 }} 
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>

          {/* Brand Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <Box
                component={Link}
                href="/"
                onClick={(e: any) => handleNavClick(e, '/')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  outline: 'none',
                  textDecoration: 'none',
                  '&:hover .logo-container': {
                    background: alpha(theme.palette.common.white, 1),
                    transform: 'scale(1.02)',
                  }
                }}
              >
                <Box
                  className="logo-container"
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '32px 12px 48px 8px', // Asymmetrical
                    background: theme.palette.common.white,
                    p: 2.5,
                    border: `3px solid ${theme.palette.tertiary.main}`,
                    boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.15)}`,
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      transform: 'scale(1.05) rotate(-2deg)',
                      borderRadius: '12px 48px 8px 32px',
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={IMAGE_URLS.LOGO_ALT.src}
                    alt="Logo"
                    sx={{
                      height: 72,
                      width: 'auto',
                      display: 'block',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.3s ease',
                      '.logo-container:hover &': { transform: 'scale(1.05)' }
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: footerStyles.secondaryText, lineHeight: 1.7 }}>
                Delivering excellence across the Philippines with world-class logistics
                solutions since 2014.
              </Typography>
              <Box>
                <Button
                  component="a"
                  href="https://ratrix.cerrov5.wyred.tech/ratrix/shipping-calculator"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<CalculateIcon />}
                  variant="contained"
                  sx={{
                    mt: 1,
                    bgcolor: theme.palette.tertiary.main,
                    color: theme.palette.tertiary.contrastText,
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: `0 8px 20px ${alpha(theme.palette.tertiary.main, 0.3)}`,
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      bgcolor: theme.palette.tertiary.dark,
                      transform: 'translateY(-3px) scale(1.02)',
                      boxShadow: `0 12px 25px ${alpha(theme.palette.tertiary.main, 0.4)}`,
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    }
                  }}
                >
                  Get a Quote
                </Button>
              </Box>
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