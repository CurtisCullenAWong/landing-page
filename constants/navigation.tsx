'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export const NAV_LINKS = [
  { name: 'Home', href: '/#home' },
  { name: 'About Us', href: '/#about-us' },
  { name: 'Why Us', href: '/#why-us' },
  { name: 'History', href: '/#history' },
  { name: 'Partnerships', href: '/#partnerships' },
  { name: 'Careers', href: '/#job-postings' },
  { name: 'My Application', href: '/my-application' },
];

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

    const handleScroll = () => {
      const sections = ['home', 'about-us', 'why-us', 'history', 'partnerships', 'job-postings'];
      let current = 'home';
      
      // Check if we're near the bottom of the page
      // This is important for the last section (job-postings) which might not be tall enough 
      // to reach the top 1/3 threshold
      const scrollPosition = window.scrollY + window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      const isAtBottom = scrollPosition >= totalHeight - 100;

      if (isAtBottom) {
        current = sections[sections.length - 1];
      } else {
        // Find the section that is currently most visible in the viewport
        for (const id of sections) {
          const element = document.getElementById(id);
          if (element) {
            const rect = element.getBoundingClientRect();
            // If the top of the section is above the middle of the screen
            if (rect.top <= window.innerHeight / 3) {
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
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  return activeSection;
};

