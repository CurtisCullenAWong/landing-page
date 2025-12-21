'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '@/constants/navigation';
import { ThemeSwitcher } from '../theme-switcher';
import { AuthButton } from '../auth-button';

export function Header() {
  const pathname = usePathname() ?? '';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdminPage = pathname.startsWith('/admin');

  // Filtered navigation based on context
  const navigation = useMemo(() => 
    isAdminPage 
      ? NAV_LINKS.filter(item => ['Home', 'Careers'].includes(item.name)) 
      : NAV_LINKS, 
  [isAdminPage]);

  const isActive = (href: string) => 
    href === '/' ? pathname === '/' || pathname === '/home' : pathname.startsWith(href);

  const navItemClasses = (href: string) => `
    px-3 py-2 rounded-md text-sm font-medium transition-all
    ${isActive(href) 
      ? 'bg-white text-primary shadow-sm' 
      : 'text-white/80 hover:bg-white/10 hover:text-white'}
  `;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary text-primary-foreground shadow-md backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2 outline-none">
            <img 
              src="/favicon.ico" 
              alt="Boss Cargo Express" 
              className="h-8 w-8 object-contain brightness-0 invert transition-transform group-hover:scale-105" 
            />
            <span className="text-xl font-bold tracking-tight text-white">Boss Cargo Express</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
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
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
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