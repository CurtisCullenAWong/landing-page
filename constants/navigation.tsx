'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about-us' },
  { name: 'Why Us', href: '/why-us' },
  { name: 'History', href: '/history' },
  { name: 'Partnerships', href: '/partnerships' },
  { name: 'Careers', href: '/job-postings' },
  { name: 'My Application', href: '/my-application' },
];

// Sequence of paths that are interconnected on the landing page
export const MAIN_SEQUENCE = ['/', '/about-us', '/why-us', '/history', '/partnerships', '/job-postings'];

// Mapping of paths to dynamically imported page components
export const PAGE_COMPONENTS: Record<string, any> = {
  '/': dynamic(() => import('../app/home/page'), {
    loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress size={60} thickness={4} /></Box>
  }),
  '/about-us': dynamic(() => import('../app/about-us/page'), {
    loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress size={60} thickness={4} /></Box>
  }),
  '/why-us': dynamic(() => import('../app/why-us/page'), {
    loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress size={60} thickness={4} /></Box>
  }),
  '/history': dynamic(() => import('../app/history/page'), {
    loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress size={60} thickness={4} /></Box>
  }),
  '/partnerships': dynamic(() => import('../app/partnerships/page'), {
    loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress size={60} thickness={4} /></Box>
  }),
  '/my-application': dynamic(() => import('../app/my-application/page'), {
    loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress size={60} thickness={4} /></Box>
  }),
  '/job-postings': dynamic(() => import('../app/job-postings/page'), {
    loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress size={60} thickness={4} /></Box>
  }),
};

export const ADMIN_NAV_LINKS = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Job Postings', href: '/admin/job-postings' },
  { name: 'Job Applications', href: '/admin/job-applications' },
];

export const CONTACT_INFO = {
  general: { label: 'General: info@bosscargo.express', href: 'mailto:info@bosscargo.express' },
  careers: { label: 'Careers: people@bosscargo.express', href: 'mailto:people@bosscargo.express' },
  phone: { label: 'Phone: (02) 8805 2402', href: 'tel:+63288052402' },
};

let isProgrammaticScrolling = false;
let scrollTimeout: NodeJS.Timeout;

/**
 * Custom hook to keep the pathname in sync with manual history state updates (replaceState).
 */
export const useSyncPathname = () => {
  const pathname = usePathname();
  const [syncedPath, setSyncedPath] = useState(pathname || '/');

  useEffect(() => {
    if (pathname) setSyncedPath(pathname);
  }, [pathname]);

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail?.href) setSyncedPath(e.detail.href);
    };
    window.addEventListener('nav-sync', handleSync);
    return () => window.removeEventListener('nav-sync', handleSync);
  }, []);

  return syncedPath;
};

/**
 * Smoothly scrolls to the section corresponding to the given href.
 * @param href The href of the section to scroll to.
 * @returns boolean indicating if the scroll was handled.
 */
export const scrollToHref = (href: string) => {
  if (typeof window === 'undefined') return false;
  const id = href === '/' ? 'home' : href.replace('/', '');
  const element = document.getElementById(id);
  if (element) {
    isProgrammaticScrolling = true;
    if (scrollTimeout) clearTimeout(scrollTimeout);

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Modern way to detect end of smooth scroll
    const handleScrollEnd = () => {
      isProgrammaticScrolling = false;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener('scrollend', handleScrollEnd);
    };

    window.addEventListener('scrollend', handleScrollEnd, { once: true });

    // Fallback for browsers that don't support scrollend
    scrollTimeout = setTimeout(() => {
      isProgrammaticScrolling = false;
      window.removeEventListener('scrollend', handleScrollEnd);
    }, 2500); 

    return true;
  }
  return false;
};

/**
 * InfiniteScrollLoader manages the interconnected pages on the main sequence.
 * It ensures all pages are rendered together and handles scroll synchronization.
 */
export const InfiniteScrollLoader = ({ children }: { children?: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loadedModules, setLoadedModules] = useState<string[]>([]);
  const initialScrollDone = useRef(false);

  const isMainSequence = MAIN_SEQUENCE.includes(pathname);

  useEffect(() => {
    setMounted(true);
    (window as any).__isNavigatingAway = false;
  }, []);

  // Handle initial scroll on deep link
  useEffect(() => {
    if (!mounted || !isMainSequence) return;

    // Reset navigating away flag when entering or navigating within the main sequence
    (window as any).__isNavigatingAway = false;
    initialScrollDone.current = false;

    // Small delay to ensure rendering is complete
    const timer = setTimeout(() => {
      scrollToHref(pathname);
      // Ensure we don't trigger route updates until the initial scroll has had time to settle
      setTimeout(() => {
        initialScrollDone.current = true;
      }, 2000);
    }, 500);

    return () => clearTimeout(timer);
  }, [mounted, isMainSequence, pathname]);

  useEffect(() => {
    if (!mounted || !isMainSequence) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip updates if we are navigating away or still performing initial scroll
        if (!initialScrollDone.current || (window as any).__isNavigatingAway) return;

        entries.forEach(entry => {
          // Trigger when the section enters the detection window
          if (entry.isIntersecting) {
            const href = entry.target.getAttribute('data-href');
            if (href && window.location.pathname !== href) {
              window.history.replaceState(null, '', href);
              window.dispatchEvent(new CustomEvent('nav-sync', { detail: { href } }));
              const link = NAV_LINKS.find(l => l.href === href);
              if (link) {
                document.title = `${link.name} | Boss Cargo Express`;
                (window as any).__disablePageTitleHook = true;
              }
            }
          }
        });
      },
      {
        // Use a broader detection window (from 15% to 50% of the viewport height)
        // to ensure the route sync triggers reliably even during fast scrolling.
        threshold: 0,
        rootMargin: '-15% 0px -50% 0px'
      }
    );

    const handleScroll = () => {
      if (!initialScrollDone.current || (window as any).__isNavigatingAway) return;
      
      // If we're at the very top, ensure we're on the home route
      if (window.scrollY < 50 && window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/');
        window.dispatchEvent(new CustomEvent('nav-sync', { detail: { href: '/' } }));
        const link = NAV_LINKS.find(l => l.href === '/');
        if (link) {
          document.title = `${link.name} | Boss Cargo Express`;
          (window as any).__disablePageTitleHook = true;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Observe all modules in the sequence
    MAIN_SEQUENCE.forEach(href => {
      const id = href === '/' ? 'home' : href.replace('/', '');
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mounted, isMainSequence]);

  if (!mounted) return null;
  if (!isMainSequence) return <>{children}</>;

  return (
    <Box>
      {MAIN_SEQUENCE.map((href) => {
        const PageComponent = PAGE_COMPONENTS[href];
        if (!PageComponent) return null;

        // The current page is already rendered by {children} in layout.tsx
        // but to make them all interconnected and scrollable, we render them all here.
        // We wrap them in a motion.div for smooth appearance and an id for scrolling.
        return (
          <motion.div
            key={href}
            id={href === '/' ? 'home' : href.replace('/', '')}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "200px" }}
            data-href={href}
            style={{ scrollSnapAlign: 'start', minHeight: '100vh' }}
          >
            <PageComponent />
          </motion.div>
        );
      })}
    </Box>
  );
};
