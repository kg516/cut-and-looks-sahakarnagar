'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, Menu, X, Calendar, Scissors } from 'lucide-react';

interface NavbarProps {
  businessSettings?: {
    business_name?: string;
    phone?: string;
    logo_url?: string | null;
  };
}

export default function Navbar({ businessSettings }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const businessName = businessSettings?.business_name || 'Cut & Looks Sahakar Nagar';
  const phone = businessSettings?.phone || '+91 84313 57154';
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Services' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-salon-dark/95 backdrop-blur-md shadow-lg border-b border-salon-cardBorder/60 py-3'
          : 'bg-salon-dark/80 backdrop-blur-sm border-b border-white/5 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <a href="/" className="flex flex-col group">
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-salon-cream group-hover:text-salon-gold transition-colors">
              CUT <span className="text-salon-gold font-normal">&amp;</span> LOOKS
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-salon-muted font-sans font-medium -mt-1">
              Sahakar Nagar · Unisex Salon
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors py-1 relative ${
                    isActive ? 'text-salon-gold' : 'text-salon-cream/80 hover:text-salon-cream'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-salon-gold rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-salon-cream/90 hover:text-salon-gold px-3 py-2 rounded border border-salon-cardBorder transition-colors"
              title="Call the salon"
            >
              <Phone className="w-3.5 h-3.5 text-salon-gold" />
              <span className="hidden md:inline">{phone}</span>
            </a>
            <a
              href="/book"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-salon-gold to-salon-goldDark hover:from-salon-goldLight hover:to-salon-gold text-salon-dark font-medium text-xs uppercase tracking-wider px-4 py-2.5 rounded shadow hover:shadow-md transition-all duration-200"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </a>
          </div>

          {/* Mobile Toggle */}
          <div className="flex sm:hidden items-center space-x-2">
            <a href="/book" className="bg-salon-gold text-salon-dark px-3 py-1.5 rounded text-xs font-medium uppercase tracking-wider">
              Book
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded text-salon-cream hover:text-salon-gold focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-salon-darker border-b border-salon-cardBorder px-4 pt-3 pb-6 animate-fade-in">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium py-2.5 px-3 rounded transition-colors ${
                    isActive
                      ? 'bg-salon-card text-salon-gold'
                      : 'text-salon-cream/90 hover:bg-salon-card/50 hover:text-salon-cream'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}

            <div className="pt-3 border-t border-salon-cardBorder/60 flex flex-col space-y-2.5 mt-2">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded border border-salon-cardBorder text-salon-cream text-sm font-medium"
              >
                <Phone className="w-4 h-4 text-salon-gold" />
                <span>Call {phone}</span>
              </a>
              <a
                href="/book"
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded bg-salon-gold text-salon-dark text-sm font-semibold uppercase tracking-wider shadow"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
