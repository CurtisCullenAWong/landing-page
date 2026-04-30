'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ADMIN_NAV_LINKS } from '@/constants/navigation';
import { ThemeSwitcher } from '../theme-switcher';
import { AuthButton } from '../auth-button';

export function AdminHeader() {
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

  const navItemClasses = (href: string) => `
    px-3 py-2 rounded-md text-sm font-medium transition-all
    ${isActive(href) 
      ? 'bg-white text-primary shadow-sm' 
      : 'text-white/80 hover:bg-white/10 hover:text-white'}
  `;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary text-primary-foreground shadow-md backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/admin" className="group flex items-center outline-none">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/20 to-white/5 p-2 backdrop-blur-md transition-all duration-300 group-hover:from-white/30 group-hover:to-white/10 border border-white/10 shadow-lg group-hover:shadow-white/10 group-hover:scale-[1.02] flex items-center gap-3">
              <img 
                src="/favicon.ico" 
                alt="Boss Cargo Express" 
                className="h-10 w-auto object-contain brightness-0 invert transition-transform group-hover:scale-105" 
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white leading-tight">Boss Cargo</span>
                <span className="text-[10px] font-medium text-white/60 uppercase tracking-widest">Admin Panel</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {ADMIN_NAV_LINKS.map((item) => (
              <Link key={item.name} href={item.href} className={navItemClasses(item.href)}>
                {item.name}
              </Link>
            ))}
            <div className="ml-4 flex items-center gap-2 border-l border-white/20 pl-4">
              <ThemeSwitcher />
              <AuthButton />
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
            {ADMIN_NAV_LINKS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`block rounded-md px-3 py-2 text-base font-medium text-white ${
                  isActive(item.href) ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 border-t border-white/10 pt-4 px-3">
              <AuthButton />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

