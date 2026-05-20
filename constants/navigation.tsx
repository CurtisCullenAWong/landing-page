'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export const NAV_LINKS = [
  { name: 'Home', href: '/#home' },
  { name: 'About Us', href: '/#about-us' },
  { name: 'Why Us', href: '/#why-us' },
  { name: 'History', href: '/#history' },
  { name: 'Partnerships', href: '/#partnerships' },
  { name: 'Careers', href: '/#careers' },
  { name: 'My Application', href: '/my-application' },
];

export const ADMIN_NAV_LINKS = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Content Manager', href: '/admin/content-manager' },
  { name: 'Recruitment', href: '/admin/careers' },
];

export const CONTACT_INFO = {
  general: { label: 'General: info@bosscargo.express', href: 'mailto:info@bosscargo.express' },
  careers: { label: 'Careers: people@bosscargo.express', href: 'mailto:people@bosscargo.express' },
  phone: { label: 'Phone: (02) 8805 2402', href: 'tel:+63288052402' },
};

/**
 * Smoothly scrolls to the section corresponding to the given href.
 */
export const scrollToHref = (href: string) => {
  if (typeof window === 'undefined') return false;
  let id = href.replace('/#', '').replace('/', '');
  if (!id) id = 'home';
  const element = document.getElementById(id);

  if (element) {
    // Account for header height (80px)
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Update the URL hash without triggering a jump
    const newHash = id === 'home' ? '' : `#${id}`;
    window.history.replaceState(null, '', `${window.location.pathname}${newHash}`);

    return true;
  }
  return false;
};

/**
 * Custom hook to track the active section based on scroll position.
 */
export const useActiveSection = () => {
  const [activeSection, setActiveSection] = useState('home');
  const pathname = usePathname();
  const currentSectionRef = useRef('home');
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // If not on the main page, don't bother tracking sections
    if (pathname !== '/') {
      setActiveSection('');
      return;
    }

    // Set a flag to ignore "at top" hash clearing during initial hydration/scroll-to-hash
    isInitialLoadRef.current = true;
    const loadTimer = setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 1000);

    const sections = ['home', 'news', 'about-us', 'why-us', 'history', 'partnerships', 'careers'];

    const handleScroll = () => {
      // Defensive check: only run this on the home page
      if (window.location.pathname !== '/') return;

      // If we're at the very top, default to home
      if (window.scrollY < 10) {
        // Guard: If we have an initial hash and we're still at the top during the first second,
        // assume we're waiting for the browser or HomePage script to perform the initial scroll.
        if (isInitialLoadRef.current && window.location.hash && window.location.hash !== '#home') {
          return;
        }

        if (currentSectionRef.current !== 'home') {
          currentSectionRef.current = 'home';
          setActiveSection('home');
          window.history.replaceState(null, '', window.location.pathname);
          document.title = `Home | Boss Cargo Express`;
        }
        return;
      }

      let current = 'home';

      // 1. Check if we're near the bottom of the page
      const scrollPosition = window.scrollY + window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      // We only consider "at bottom" if we've actually scrolled down a bit
      // and we are within 50px of the total height.
      const isAtBottom = scrollPosition >= totalHeight - 50 && window.scrollY > 100;

      if (isAtBottom) {
        current = sections[sections.length - 1];
      } else {
        // 2. Find the section that is currently most visible in the viewport
        for (const id of sections) {
          const element = document.getElementById(id);
          if (element) {
            const rect = element.getBoundingClientRect();
            // Threshold is top 1/3 of the screen
            const threshold = window.innerHeight / 3;

            // If the section's top has passed the threshold, it's a candidate
            if (rect.top <= threshold) {
              current = id;
            }
          }
        }
      }

      if (current !== currentSectionRef.current) {
        currentSectionRef.current = current;
        setActiveSection(current);
        const link = NAV_LINKS.find(l => l.href.includes(current));
        if (link) {
          document.title = `${link.name} | Boss Cargo Express`;
          (window as any).__disablePageTitleHook = true;

          // Update the URL hash to match the active section
          const newHash = current === 'home' ? '' : `#${current}`;
          window.history.replaceState(null, '', `${window.location.pathname}${newHash}`);
        }
      }
    };

    // Check if we have an initial hash
    if (window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (sections.includes(hash)) {
        setActiveSection(hash);
        currentSectionRef.current = hash;
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run immediately to catch the current position
    handleScroll();

    // Also run after a short delay to account for browser scroll-to-hash
    const timer = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
      clearTimeout(loadTimer);
    };
  }, [pathname]);

  return activeSection;
};

