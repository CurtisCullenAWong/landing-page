'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ADMIN_NAV_LINKS } from '@/constants/navigation';
import { IMAGE_URLS } from '@/constants/images';
import {
  Box,
  Container,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Collapse
} from '@mui/material';
import { ThemeSwitcher } from '../theme-switcher';
import { AuthButton } from '../auth-button';

export function AdminHeader() {
  const theme = useTheme();
  const pathname = usePathname() ?? '';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    // Exact match
    if (pathname === href) return true;

    // For base /admin route, only match exactly (not child routes)
    if (href === '/admin') return pathname === '/admin';

    // For other routes, match exact or child routes
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const navItemStyles = (href: string) => ({
    px: 2,
    py: 1,
    borderRadius: 1,
    fontSize: '0.875rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: theme.transitions.create(['background-color', 'color', 'box-shadow']),
    ...(isActive(href)
      ? {
        bgcolor: 'common.white',
        color: 'primary.main',
        boxShadow: theme.shadows[1],
      }
      : {
        color: alpha(theme.palette.common.white, 0.8),
        '&:hover': {
          bgcolor: alpha(theme.palette.common.white, 0.1),
          color: 'common.white',
        },
      }),
  });

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        width: '100%',
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        boxShadow: theme.shadows[3],
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', height: 80, alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Brand Logo */}
          <Box
            component={Link}
            href="/admin"
            sx={{
              display: 'flex',
              alignItems: 'center',
              outline: 'none',
              textDecoration: 'none',
              '&:hover .logo-container': {
                background: alpha(theme.palette.common.white, 0.3),
                transform: 'scale(1.02)',
              }
            }}
          >
            <Box
              className="logo-container"
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.2)} 0%, ${alpha(theme.palette.common.white, 0.05)} 100%)`,
                p: 1,
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                component="img"
                src={IMAGE_URLS.LOGO.src}
                alt="Boss Cargo Express"
                sx={{
                  height: 40,
                  width: 'auto',
                  display: 'block',
                  transition: 'transform 0.3s ease',
                  '.logo-container:hover &': { transform: 'scale(1.05)' }
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', pr: 1 }}>
                <Box
                  component="span"
                  sx={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: alpha(theme.palette.common.white, 0.6),
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    lineHeight: 1,
                  }}
                >
                  Admin
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: alpha(theme.palette.common.white, 0.6),
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    lineHeight: 1,
                  }}
                >
                  Panel
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Desktop Nav */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}
          >
            {ADMIN_NAV_LINKS.map((item) => (
              <Box
                key={item.name}
                component={Link}
                href={item.href}
                sx={navItemStyles(item.href)}
              >
                {item.name}
              </Box>
            ))}
            <Box sx={{ ml: 2, pl: 2, borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.2)}`, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ThemeSwitcher />
              <AuthButton />
            </Box>
          </Stack>

          {/* Mobile Toggle */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <ThemeSwitcher />
            <IconButton
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              sx={{ color: 'common.white', '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) } }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
          </Box>
        </Box>

        {/* Mobile Nav Menu */}
        <Collapse in={isMobileMenuOpen}>
          <Box sx={{ pb: 2, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
            <Stack spacing={1} sx={{ pt: 2 }}>
              {ADMIN_NAV_LINKS.map((item) => (
                <Box
                  key={item.name}
                  component={Link}
                  href={item.href}
                  onClick={handleNavClick}
                  sx={{
                    display: 'block',
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    textDecoration: 'none',
                    color: 'common.white',
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'background-color 0.2s',
                    ...(isActive(item.href)
                      ? { bgcolor: alpha(theme.palette.common.white, 0.2) }
                      : { '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) } }
                    )
                  }}
                >
                  {item.name}
                </Box>
              ))}
              <Box sx={{ pt: 2, mt: 2, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
                <AuthButton />
              </Box>
            </Stack>
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
}

