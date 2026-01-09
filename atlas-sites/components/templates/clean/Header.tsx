'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { BusinessWithServices, Service } from '@/lib/types';
import { formatPhone, getPhoneHref, slugify } from '@/lib/utils';

interface HeaderProps {
  business: BusinessWithServices;
  basePath: string;
}

export function Header({ business, basePath }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const navLinks = [
    { href: basePath, label: 'Home' },
    { href: `${basePath}/about`, label: 'About' },
    { href: `${basePath}/contact`, label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo / Business Name */}
          <Link href={basePath} className="flex-shrink-0">
            <span className="text-xl lg:text-2xl font-bold text-[#1e3a5f] tracking-tight">
              {business.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href={basePath}
              className="text-gray-600 hover:text-[#1e3a5f] text-sm font-medium transition-colors"
            >
              Home
            </Link>

            {/* Services Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                className="flex items-center gap-1 text-gray-600 hover:text-[#1e3a5f] text-sm font-medium transition-colors"
                onClick={() => setServicesOpen(!servicesOpen)}
                onMouseEnter={() => setServicesOpen(true)}
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {servicesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2"
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  {business.services.map((service: Service) => (
                    <Link
                      key={service.id}
                      href={`${basePath}/services/${slugify(service.name)}`}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f8fafc] hover:text-[#1e3a5f] transition-colors"
                      onClick={() => setServicesOpen(false)}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href={`${basePath}/about`}
              className="text-gray-600 hover:text-[#1e3a5f] text-sm font-medium transition-colors"
            >
              About
            </Link>

            <Link
              href={`${basePath}/contact`}
              className="text-gray-600 hover:text-[#1e3a5f] text-sm font-medium transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Phone CTA - Desktop */}
          {business.phone && (
            <a
              href={getPhoneHref(business.phone)}
              className="hidden lg:flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#152a45] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              {formatPhone(business.phone)}
            </a>
          )}

          {/* Mobile: Phone + Menu */}
          <div className="flex items-center gap-3 lg:hidden">
            {business.phone && (
              <a
                href={getPhoneHref(business.phone)}
                className="w-10 h-10 flex items-center justify-center bg-[#3b82f6] text-white rounded-full"
              >
                <Phone className="w-5 h-5" />
              </a>
            )}
            <button
              type="button"
              className="p-2 text-gray-600 hover:text-[#1e3a5f]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-1">
            <Link
              href={basePath}
              className="block py-3 text-gray-700 hover:text-[#1e3a5f] font-medium border-b border-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {/* Services section for mobile */}
            <div className="border-b border-gray-50 pb-2">
              <div className="py-3 text-gray-900 font-semibold">Services</div>
              <div className="pl-4 space-y-1">
                {business.services.map((service: Service) => (
                  <Link
                    key={service.id}
                    href={`${basePath}/services/${slugify(service.name)}`}
                    className="block py-2 text-gray-600 hover:text-[#1e3a5f] text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href={`${basePath}/about`}
              className="block py-3 text-gray-700 hover:text-[#1e3a5f] font-medium border-b border-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>

            <Link
              href={`${basePath}/contact`}
              className="block py-3 text-gray-700 hover:text-[#1e3a5f] font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
