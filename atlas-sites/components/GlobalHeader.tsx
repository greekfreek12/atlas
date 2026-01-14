'use client';

/**
 * GlobalHeader
 *
 * Config-driven site header with multiple variant styles,
 * dynamic navigation, and responsive mobile menu.
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, ChevronDown, MapPin, ArrowRight } from 'lucide-react';
import { HeaderConfig, NavItem } from '@/lib/site-config/types';
import { Business } from '@/lib/types';
import { formatPhone, getPhoneHref } from '@/lib/utils';
import { trackPhoneClick } from '@/lib/tracking';

interface GlobalHeaderProps {
  config: HeaderConfig;
  business: Business;
  basePath: string;
}

export function GlobalHeader({ config, business, basePath }: GlobalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Track scroll position for sticky header effect
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
      let clickedInside = false;
      dropdownRefs.current.forEach((ref) => {
        if (ref && ref.contains(event.target as Node)) {
          clickedInside = true;
        }
      });
      if (!clickedInside) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneClick = () => {
    trackPhoneClick(business.id);
  };

  // Build href with basePath
  const getHref = (href: string): string => {
    if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return href;
    }
    return href.startsWith('/') ? `${basePath}${href}` : `${basePath}/${href}`;
  };

  // Render navigation item (supports dropdowns)
  const renderNavItem = (item: NavItem, index: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openDropdown === item.label;

    if (hasChildren) {
      return (
        <div
          key={item.label}
          ref={(el) => {
            if (el) dropdownRefs.current.set(item.label, el);
          }}
          className="relative"
        >
          <button
            type="button"
            className="relative flex items-center gap-1.5 px-4 py-2 text-[var(--color-text)] text-sm font-medium transition-colors hover:text-[var(--color-primary)] group"
            onClick={() => setOpenDropdown(isOpen ? null : item.label)}
            onMouseEnter={() => setOpenDropdown(item.label)}
          >
            <span className="relative">
              {item.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[var(--color-accent)] group-hover:w-full transition-all duration-300" />
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 z-50 ${
              isOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <div className="min-w-[220px] bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100/50 py-2 overflow-hidden backdrop-blur-xl">
              {item.children!.map((child, childIndex) => (
                <Link
                  key={child.label}
                  href={getHref(child.href)}
                  className="block px-5 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-accent)]/5 hover:text-[var(--color-primary)] transition-all duration-200 border-l-2 border-transparent hover:border-[var(--color-accent)]"
                  onClick={() => setOpenDropdown(null)}
                  style={{ animationDelay: `${childIndex * 30}ms` }}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        href={getHref(item.href)}
        className="relative px-4 py-2 text-[var(--color-text)] text-sm font-medium transition-colors hover:text-[var(--color-primary)] group"
      >
        <span className="relative">
          {item.label}
          <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[var(--color-accent)] group-hover:w-full transition-all duration-300" />
        </span>
      </Link>
    );
  };

  const variant = config.variant || 'standard';

  return (
    <>
      {/* Top bar - only for standard variant */}
      {variant === 'standard' && (
        <div className="hidden lg:block bg-[var(--color-primary)] text-white/80 text-sm">
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex justify-between items-center">
            <div className="flex items-center gap-6">
              {business.city && business.state && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>
                    Serving {business.city}, {business.state}
                  </span>
                </span>
              )}
            </div>
            {config.showPhone && business.phone && (
              <a
                href={getPhoneHref(business.phone)}
                onClick={handlePhoneClick}
                className="flex items-center gap-2 hover:text-white transition-colors font-medium"
              >
                <Phone className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>{formatPhone(business.phone)}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5'
            : 'bg-white'
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center text-[var(--color-primary)] rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <Link href={basePath} className="flex-1 flex justify-center px-4">
              {config.showLogo && business.logo ? (
                <Image
                  src={business.logo}
                  alt={business.name}
                  width={180}
                  height={60}
                  className="h-12 w-auto object-contain"
                  style={{ width: 'auto' }}
                />
              ) : (
                <span
                  className="text-xl font-bold text-[var(--color-primary)] text-center"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {business.name}
                </span>
              )}
            </Link>

            {config.showPhone && business.phone ? (
              <a
                href={getPhoneHref(business.phone)}
                onClick={handlePhoneClick}
                className="w-12 h-12 flex items-center justify-center bg-[var(--color-accent)] text-white rounded-xl shadow-lg shadow-[var(--color-accent)]/25 hover:shadow-[var(--color-accent)]/40 transition-shadow"
              >
                <Phone className="w-5 h-5" />
              </a>
            ) : (
              <div className="w-12" />
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block max-w-7xl mx-auto px-6">
          <div
            className={`flex items-center ${
              variant === 'centered' ? 'justify-center' : 'justify-between'
            } h-20`}
          >
            {/* Logo */}
            {variant !== 'centered' && (
              <Link href={basePath} className="flex-shrink-0 group">
                {config.showLogo && business.logo ? (
                  <Image
                    src={business.logo}
                    alt={business.name}
                    width={160}
                    height={56}
                    className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    style={{ width: 'auto' }}
                  />
                ) : (
                  <span
                    className="text-2xl font-bold text-[var(--color-primary)] tracking-tight group-hover:text-[var(--color-accent)] transition-colors duration-300"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {business.name}
                  </span>
                )}
              </Link>
            )}

            {/* Centered variant: Logo above nav */}
            {variant === 'centered' && (
              <div className="flex flex-col items-center gap-4">
                <Link href={basePath} className="group">
                  {config.showLogo && business.logo ? (
                    <Image
                      src={business.logo}
                      alt={business.name}
                      width={180}
                      height={64}
                      className="h-16 w-auto object-contain"
                      style={{ width: 'auto' }}
                    />
                  ) : (
                    <span
                      className="text-3xl font-bold text-[var(--color-primary)]"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {business.name}
                    </span>
                  )}
                </Link>
                <nav className="flex items-center gap-1">
                  {config.navigation.map((item, index) =>
                    renderNavItem(item, index)
                  )}
                </nav>
              </div>
            )}

            {/* Standard & Minimal: Inline nav */}
            {variant !== 'centered' && (
              <nav className="flex items-center gap-1">
                {config.navigation.map((item, index) =>
                  renderNavItem(item, index)
                )}
              </nav>
            )}

            {/* CTA Button */}
            {variant !== 'centered' && config.ctaButton && (
              <div className="flex items-center gap-4">
                {config.ctaButton.action === 'phone' && business.phone ? (
                  <a
                    href={getPhoneHref(business.phone)}
                    onClick={handlePhoneClick}
                    className="flex items-center gap-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[var(--color-accent)]/25 hover:shadow-[var(--color-accent)]/40 hover:scale-105"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-wider opacity-80">
                        {config.ctaButton.text || 'Call Now'}
                      </div>
                      <div className="font-semibold text-sm">
                        {formatPhone(business.phone)}
                      </div>
                    </div>
                  </a>
                ) : (
                  <Link
                    href={getHref(config.ctaButton.target || '/contact')}
                    className="flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[var(--color-accent)]/25 hover:shadow-[var(--color-accent)]/40"
                  >
                    {config.ctaButton.text}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            mobileMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white border-t border-gray-100">
            <div className="px-6 py-6 space-y-1">
              {config.navigation.map((item, index) => (
                <div key={item.label}>
                  {item.children && item.children.length > 0 ? (
                    <div className="border-b border-gray-100 py-3">
                      <div className="text-[var(--color-primary)] font-semibold text-lg mb-3">
                        {item.label}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={getHref(child.href)}
                            className="block py-2.5 px-4 text-[var(--color-text-muted)] text-sm bg-gray-50 rounded-xl hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-primary)] transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={getHref(item.href)}
                      className="block py-4 text-[var(--color-primary)] font-semibold text-lg border-b border-gray-100 hover:text-[var(--color-accent)] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile CTA */}
              {config.showPhone && business.phone && (
                <div className="pt-6">
                  <a
                    href={getPhoneHref(business.phone)}
                    onClick={handlePhoneClick}
                    className="flex items-center justify-center gap-3 w-full bg-[var(--color-accent)] text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-[var(--color-accent)]/25"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call {formatPhone(business.phone)}</span>
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

export default GlobalHeader;
