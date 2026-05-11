'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Container,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Link as MuiLink,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Home,
  Info,
  Zap,
  Clock,
  Users,
  Briefcase,
  ClipboardList,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { NAV_LINKS, scrollToHref, useActiveSection } from '@/constants/navigation';
import { IMAGE_URLS } from '@/constants/images';
import {
  AbstractBlob,
  FilledAbstractShape,
  MassiveAbstractShape
} from '../decorative/AbstractShapes';
import ThemeSwitcher from '../theme-switcher';

type NavLink = {
  name: string;
  href: string;
};

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
    textShadow: isActive(href) ? 'none' : '0 1px 2px rgba(0,0,0,0.2)', // Conditional shadow for legibility
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
        bgcolor: alpha(theme.palette.primary.dark, 0.98), // Darker for better contrast
        color: 'primary.contrastText',
        boxShadow: theme.shadows[3],
        backdropFilter: 'blur(16px)',
        overflow: 'hidden', // Contain abstract shapes
      }}
    >
      {/* Massive Abstract Background Shapes */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <MassiveAbstractShape 
          color={theme.palette.tertiary.main} 
          opacity={0.3} 
          style={{ top: '-20%', left: '-20%', width: '140%', height: '160%', mixBlendMode: 'overlay' }} 
        />
        <MassiveAbstractShape 
          color={theme.palette.primary.main} 
          opacity={0.25} 
          delay={5}
          style={{ bottom: '-30%', right: '-20%', width: '150%', height: '170%', transform: 'rotate(-15deg)', mixBlendMode: 'soft-light' }} 
        />
        <FilledAbstractShape 
          color={theme.palette.tertiary.light} 
          size={400} 
          style={{ top: '5%', right: '0%', opacity: 0.2, mixBlendMode: 'overlay' }} 
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
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
                borderRadius: '24px 8px 32px 12px', // Asymmetrical
                background: `linear-gradient(135deg, ${alpha(theme.palette.tertiary.main, 0.2)} 0%, ${alpha(theme.palette.common.white, 0.05)} 100%)`,
                p: 1.5,
                border: `2px solid ${alpha(theme.palette.tertiary.main, 0.3)}`,
                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  borderRadius: '12px 32px 12px 32px', // Dynamic shape shift
                  borderColor: theme.palette.tertiary.main,
                }
              }}
            >
              <Box
                component="img"
                src={IMAGE_URLS.LOGO.src}
                alt="Boss Cargo Express"
                sx={{
                  height: 50,
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
            {NAV_LINKS.map((item: NavLink) => {
              const isApplication = item.name === 'My Application';
              const active = isActive(item.href);

              const getIcon = () => {
                switch (item.name) {
                  case 'Home': return <Home size={18} />;
                  case 'About Us': return <Info size={18} />;
                  case 'Why Us': return <Zap size={18} />;
                  case 'History': return <Clock size={18} />;
                  case 'Partnerships': return <Users size={18} />;
                  case 'Careers': return <Briefcase size={18} />;
                  case 'My Application': return <ClipboardList size={18} />;
                  default: return null;
                }
              };

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
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    position: 'relative',
                    overflow: 'hidden',
                    textDecoration: 'none !important',
                    border: active ? `1px solid ${alpha(theme.palette.tertiary.main, 0.3)}` : '1px solid transparent',
                    '&:hover': {
                      ...(isApplication ? { gap: 1.5, pr: 2.5 } : {}),
                      transform: 'translateY(-2px)',
                      bgcolor: alpha(theme.palette.common.white, 0.15),
                      '& .nav-icon': {
                        color: theme.palette.tertiary.main,
                        transform: 'scale(1.1) rotate(5deg)',
                      }
                    },
                    ...(active && {
                      bgcolor: alpha(theme.palette.tertiary.main, 0.1),
                      color: theme.palette.tertiary.main,
                      fontWeight: 700,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.tertiary.main, 0.2)}`,
                      borderBottom: `2px solid ${theme.palette.tertiary.main}`,
                      borderRadius: '8px 8px 0 0',
                    })
                  }}
                >
                  <Box className="nav-icon" sx={{
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    color: active ? theme.palette.tertiary.main : 'inherit'
                  }}>
                    {getIcon()}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      whiteSpace: 'nowrap',
                      fontSize: '0.8rem',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
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
              {NAV_LINKS.map((item: NavLink) => {
                const active = isActive(item.href);
                const getIcon = () => {
                  switch (item.name) {
                    case 'Home': return <Home size={20} />;
                    case 'About Us': return <Info size={20} />;
                    case 'Why Us': return <Zap size={20} />;
                    case 'History': return <Clock size={20} />;
                    case 'Partnerships': return <Users size={20} />;
                    case 'Careers': return <Briefcase size={20} />;
                    case 'My Application': return <ClipboardList size={20} />;
                    default: return null;
                  }
                };

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
                      px: 2.5,
                      py: 2,
                      borderRadius: '12px 4px 16px 2px', // Asymmetrical
                      textDecoration: 'none !important',
                      transition: 'all 0.3s ease',
                      border: active ? `1px solid ${theme.palette.tertiary.main}` : '1px solid transparent',
                      ...(active
                        ? {
                          bgcolor: alpha(theme.palette.tertiary.main, 0.15),
                          color: theme.palette.tertiary.main,
                          fontWeight: 700,
                        }
                        : {
                          color: alpha(theme.palette.common.white, 0.8),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.common.white, 0.1),
                            color: 'common.white'
                          }
                        }
                      )
                    }}
                  >
                    <Box sx={{
                      color: active ? theme.palette.tertiary.main : 'inherit',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {getIcon()}
                    </Box>
                    <Box component="span" sx={{ fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
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

