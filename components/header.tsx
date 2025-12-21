'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import { ThemeSwitcher } from './theme-switcher';
import { AuthButtonWithSuspense } from './auth-button';

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const allNavigation = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Why Us', href: '/why-us' },
    { name: 'History', href: '/history' },
    { name: 'Partnerships', href: '/partnerships' },
    { name: 'Careers', href: '/job-postings' },
  ];

  // Only show auth components on admin-related pages
  const isAdminPage = pathname?.startsWith('/admin');

  // Filter navigation for admin pages - only show Home and Careers
  const navigation = isAdminPage
    ? allNavigation.filter(item => item.name === 'Home' || item.name === 'Careers')
    : allNavigation;

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/home';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <header className="bg-background border-b border-border shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/favicon.ico" 
                alt="Boss Cargo Express" 
                width={32} 
                height={32}
                className="object-contain"
              />
              <span className="text-xl font-bold text-primary dark:text-primary">Boss Cargo Express</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary bg-accent'
                    : 'text-foreground hover:text-primary hover:bg-accent/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side - Auth & Theme */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <ThemeSwitcher />
            {isAdminPage && <AuthButtonWithSuspense />}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary bg-accent'
                      : 'text-foreground hover:text-primary hover:bg-accent/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {isAdminPage && (
                <div className="pt-4 border-t border-border">
                  <AuthButtonWithSuspense />
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
