'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ClipboardList } from 'lucide-react';
import { NAV_LINKS, scrollToHref, useActiveSection } from '@/constants/navigation';
import { IMAGE_URLS } from '@/constants/images';
import {
  Box,
  Container,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Link as MuiLink,
  useMediaQuery,
  Collapse
} from '@mui/material';
import ThemeSwitcher from '../theme-switcher';

export function UserHeader() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname() || '/';
  const activeSection = useActiveSection();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    // 1. If it's an exact match, it's definitely active
    if (pathname === href) return true;

    // 2. Handle hash links (like /#careers)
    if (href.startsWith('/#')) {
      const section = href.replace('/#', '');

      // On the home page, we use scroll-based active section
      if (pathname === '/') {
        return activeSection === section;
      }

      // On other pages, we check if the current path matches the section name
      // e.g., on /careers or /careers/apply, the Careers link (/#careers) should be active
      return pathname === `/${section}` || pathname.startsWith(`/${section}/`);
    }

    // 3. Handle standard links (like /my-application)
    // Avoid matching '/' to everything
    if (href === '/') return pathname === '/';

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    // If it's a hash link on the home page, use smooth scroll
    if (pathname === '/' && href.startsWith('/#')) {
      if (scrollToHref(href)) {
        e.preventDefault();
      }
    }
    // Always close mobile menu on click
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
    display: 'flex',
    alignItems: 'center',
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
        left: 0,
        right: 0,
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
            href="/"
            onClick={(e: any) => handleNavClick(e, '/')}
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
            </Box>
          </Box>

          {/* Desktop Nav */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}
          >
            {NAV_LINKS.map((item) => {
              const isApplication = item.name === 'My Application';
              const active = isActive(item.href);

              return (
                <MuiLink
                  key={item.name}
                  component={Link}
                  href={item.href}
                  onClick={(e: any) => handleNavClick(e, item.href)}
                  className="nav-group"
                  sx={{
                    ...navItemStyles(item.href),
                    display: 'flex',
                    alignItems: 'center',
                    gap: isApplication ? 0 : 1,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    textDecoration: 'none !important',
                    '&:hover': isApplication ? {
                      gap: 1.5,
                      pr: 2.5
                    } : {},
                  }}
                >
                  {isApplication && (
                    <ClipboardList
                      size={18}
                      style={{
                        flexShrink: 0,
                        transition: 'transform 0.3s ease',
                      }}
                    />
                  )}
                  <Box
                    component="span"
                    sx={{
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      whiteSpace: 'nowrap',
                      ...(isApplication && {
                        maxWidth: 0,
                        opacity: 0,
                        visibility: 'hidden',
                        '.nav-group:hover &': {
                          maxWidth: 150,
                          opacity: 1,
                          visibility: 'visible',
                        }
                      })
                    }}
                  >
                    {item.name}
                  </Box>
                </MuiLink>
              );
            })}
            <Box sx={{ ml: 1, pl: 2, borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.2)}`, display: 'flex', alignItems: 'center' }}>
              <ThemeSwitcher />
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
              {NAV_LINKS.map((item) => {
                const isApplication = item.name === 'My Application';
                const active = isActive(item.href);
                return (
                  <MuiLink
                    key={item.name}
                    component={Link}
                    href={item.href}
                    onClick={(e: any) => handleNavClick(e, item.href)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      textDecoration: 'none !important',
                      transition: 'background-color 0.2s',
                      ...(active
                        ? { bgcolor: 'common.white', color: 'primary.main' }
                        : { color: 'common.white', '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) } }
                      )
                    }}
                  >
                    {isApplication ? (
                      <ClipboardList size={20} style={{ flexShrink: 0 }} />
                    ) : (
                      <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: active ? 'primary.main' : alpha(theme.palette.common.white, 0.4) }} />
                      </Box>
                    )}
                    <Box component="span" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                      {item.name}
                    </Box>
                  </MuiLink>
                );
              })}
            </Stack>
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
}

