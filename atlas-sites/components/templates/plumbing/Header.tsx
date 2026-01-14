'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, ChevronDown, MapPin } from 'lucide-react';
import { BusinessWithServices } from '@/lib/types';
import { formatPhone, getPhoneHref, slugify } from '@/lib/utils';

// Plumbing services for navigation
const SERVICES = [
  'Emergency Plumbing',
  'Drain Cleaning',
  'Water Heater Services',
  'Leak Detection & Repair',
  'Fixture Installation',
  'Pipe Repair & Replacement',
];

interface HeaderProps {
  business: BusinessWithServices;
  basePath: string;
}

export function Header({ business, basePath }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Top bar with contact info */}
      <div className="hidden lg:block bg-primary text-white/80 text-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {business.city && business.state && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                Serving {business.city}, {business.state}
              </span>
            )}
          </div>
          {business.phone && (
            <a
              href={getPhoneHref(business.phone)}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-accent" />
              <span>{formatPhone(business.phone)}</span>
            </a>
          )}
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-white'
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden px-4 py-3">
          {/* Top row: hamburger, logo, call button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>

            <Link href={basePath} className="flex-1 flex justify-center px-2">
              {business.logo ? (
                <Image
                  src={business.logo}
                  alt={business.name}
                  width={200}
                  height={80}
                  className="h-16 w-auto object-contain"
                  style={{ width: 'auto' }}
                />
              ) : (
                <span className="text-xl font-display font-bold text-primary text-center">
                  {business.name}
                </span>
              )}
            </Link>

            {business.phone ? (
              <a
                href={getPhoneHref(business.phone)}
                className="w-10 h-10 flex items-center justify-center bg-accent text-white rounded-full"
              >
                <Phone className="w-4 h-4" />
              </a>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo / Business Name */}
            <Link href={basePath} className="flex-shrink-0 group">
              {business.logo ? (
                <Image
                  src={business.logo}
                  alt={business.name}
                  width={160}
                  height={56}
                  className="h-14 w-auto object-contain"
                  style={{ width: 'auto' }}
                />
              ) : (
                <span className="text-2xl font-display font-bold text-primary tracking-tight group-hover:text-accent transition-colors duration-300">
                  {business.name}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href={basePath}
                className="relative px-4 py-2 text-gray-700 text-sm font-medium transition-colors hover:text-primary underline-animate"
              >
                Home
              </Link>

              {/* Services Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  className="relative flex items-center gap-1.5 px-4 py-2 text-gray-700 text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setServicesOpen(!servicesOpen)}
                  onMouseEnter={() => setServicesOpen(true)}
                >
                  Services
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      servicesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-300 ${
                    servicesOpen
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <div className="w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                        Our Services
                      </span>
                    </div>
                    {SERVICES.map((serviceName, index) => (
                      <Link
                        key={serviceName}
                        href={`${basePath}/services/${slugify(serviceName)}`}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-accent-muted hover:text-primary transition-all duration-200 border-l-2 border-transparent hover:border-accent"
                        onClick={() => setServicesOpen(false)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {serviceName}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href={`${basePath}/about`}
                className="relative px-4 py-2 text-gray-700 text-sm font-medium transition-colors hover:text-primary underline-animate"
              >
                About
              </Link>

              <Link
                href={`${basePath}/contact`}
                className="relative px-4 py-2 text-gray-700 text-sm font-medium transition-colors hover:text-primary underline-animate"
              >
                Contact
              </Link>
            </nav>

            {/* Phone CTA - Desktop */}
            {business.phone && (
              <a
                href={getPhoneHref(business.phone)}
                className="hidden lg:flex items-center gap-3 btn-primary"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider opacity-80">
                    Call Now
                  </div>
                  <div className="font-semibold text-sm">
                    {formatPhone(business.phone)}
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            mobileMenuOpen ? 'max-h-[80vh]' : 'max-h-0'
          }`}
        >
          <div className="bg-white border-t border-gray-100">
            <div className="px-6 py-6 space-y-1">
              <Link
                href={basePath}
                className="block py-3 text-gray-900 font-medium text-lg border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>

              {/* Services section for mobile */}
              <div className="border-b border-gray-100 py-3">
                <div className="text-gray-900 font-medium text-lg mb-3">Services</div>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map((serviceName) => (
                    <Link
                      key={serviceName}
                      href={`${basePath}/services/${slugify(serviceName)}`}
                      className="block py-2 px-3 text-gray-600 text-sm bg-gray-50 rounded-lg hover:bg-accent-muted hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {serviceName}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href={`${basePath}/about`}
                className="block py-3 text-gray-900 font-medium text-lg border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              <Link
                href={`${basePath}/contact`}
                className="block py-3 text-gray-900 font-medium text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile CTA */}
              {business.phone && (
                <div className="pt-4">
                  <a
                    href={getPhoneHref(business.phone)}
                    className="flex items-center justify-center gap-3 w-full btn-primary py-4"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="font-semibold">Call {formatPhone(business.phone)}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
