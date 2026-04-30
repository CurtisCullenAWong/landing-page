'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ClipboardList } from 'lucide-react';
import { NAV_LINKS, scrollToHref, useActiveSection } from '@/constants/navigation';
import { IMAGE_URLS } from '@/constants/images';
import { ThemeSwitcher } from '../theme-switcher';

export function UserHeader() {
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

  const navItemClasses = (href: string) => `
    px-3 py-2 rounded-md text-sm font-medium transition-all
    ${isActive(href) 
      ? 'bg-white text-primary shadow-sm' 
      : 'text-white/80 hover:bg-white/10 hover:text-white'}
  `;

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-primary text-primary-foreground shadow-md backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Brand Logo */}
          <Link 
            href="/" 
            className="group flex items-center outline-none"
            onClick={(e) => handleNavClick(e, '/')}
          >
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/20 to-white/5 p-2 backdrop-blur-md transition-all duration-300 group-hover:from-white/30 group-hover:to-white/10 border border-white/10 shadow-lg group-hover:shadow-white/10 group-hover:scale-[1.02]">
              <img 
                src={IMAGE_URLS.LOGO.src} 
                alt="Boss Cargo Express" 
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((item) => {
              const isApplication = item.name === 'My Application';
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`${navItemClasses(item.href)} flex items-center group/nav transition-all duration-300 ${isApplication ? 'gap-0 hover:gap-2' : ''}`}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {isApplication && <ClipboardList size={18} className="shrink-0" />}
                  <span className={`
                    overflow-hidden transition-all duration-300 whitespace-nowrap
                    ${isApplication 
                      ? 'max-w-0 opacity-0 group-hover/nav:max-w-[150px] group-hover/nav:opacity-100 group-hover/nav:ml-1' 
                      : ''}
                  `}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
            <div className="ml-4 flex items-center gap-2 border-l border-white/20 pl-4">
              <ThemeSwitcher />
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {isMobileMenuOpen && (
          <div className="space-y-1 border-t border-white/10 pb-4 pt-2 md:hidden">
            {NAV_LINKS.map((item) => {
              const isApplication = item.name === 'My Application';
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition-colors ${
                    isActive(item.href) 
                      ? 'bg-white text-primary' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {isApplication ? (
                    <ClipboardList size={20} className="shrink-0" />
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${isActive(item.href) ? 'bg-primary' : 'bg-white/40'}`} />
                    </div>
                  )}
                  {item.name}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-white/10 pt-4 px-3">
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

