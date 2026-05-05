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
  { name: 'Careers', href: '/admin/careers' },
  { name: 'Job Applications', href: '/admin/job-applications' },
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
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

  useEffect(() => {
    // If not on the main page, don't bother tracking sections
    if (pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sections = ['home', 'about-us', 'why-us', 'history', 'partnerships', 'careers'];

    const handleScroll = () => {
      let current = 'home';

      // 1. Check if we're near the bottom of the page
      const scrollPosition = window.scrollY + window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      const isAtBottom = scrollPosition >= totalHeight - 100;

      if (isAtBottom) {
        current = sections[sections.length - 1];
      } else {
        // 2. Find the section that is currently most visible in the viewport
        // We use a more precise check: the section whose top is closest to the top of the viewport
        // but still within a reasonable range (top 1/3)
        let closestSection = 'home';
        let minDistance = Infinity;

        for (const id of sections) {
          const element = document.getElementById(id);
          if (element) {
            const rect = element.getBoundingClientRect();
            // If the section is in view or coming into view
            if (rect.top <= window.innerHeight / 3) {
              closestSection = id;
            }
          }
        }
        current = closestSection;
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
    };
  }, [pathname]);

  return activeSection;
};

