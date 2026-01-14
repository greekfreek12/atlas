'use client';

/**
 * GlobalFooter
 *
 * Config-driven site footer with multiple variants,
 * flexible columns, and social links support.
 */

import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Youtube,
} from 'lucide-react';
import { FooterConfig, FooterColumn } from '@/lib/site-config/types';
import { Business } from '@/lib/types';
import { formatPhone, getPhoneHref, formatWorkingHours, is24Hours } from '@/lib/utils';
import { trackPhoneClick } from '@/lib/tracking';

interface GlobalFooterProps {
  config: FooterConfig;
  business: Business;
  basePath: string;
}

export function GlobalFooter({ config, business, basePath }: GlobalFooterProps) {
  const currentYear = new Date().getFullYear();
  const variant = config.variant || 'standard';

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

  // Render a column based on its type
  const renderColumn = (column: FooterColumn, index: number) => {
    return (
      <div key={`${column.title}-${index}`}>
        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/50">
          {column.title}
        </h4>

        {/* Links Column */}
        {column.type === 'links' && column.links && (
          <ul className="space-y-2.5">
            {column.links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <Link
                  href={getHref(link.href)}
                  className="text-white/70 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Contact Column */}
        {column.type === 'contact' && (
          <ul className="space-y-3">
            {business.phone && (
              <li>
                <a
                  href={getPhoneHref(business.phone)}
                  onClick={handlePhoneClick}
                  className="flex items-center gap-3 text-white/70 hover:text-white text-sm transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-[var(--color-accent)] transition-colors">
                    <Phone className="w-4 h-4" />
                  </span>
                  {formatPhone(business.phone)}
                </a>
              </li>
            )}
            {business.email && (
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-3 text-white/70 hover:text-white text-sm transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-[var(--color-accent)] transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  {business.email}
                </a>
              </li>
            )}
            {business.city && business.state && (
              <li className="flex items-center gap-3 text-white/70 text-sm">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </span>
                {business.city}, {business.state}
              </li>
            )}
          </ul>
        )}

        {/* Hours Column */}
        {column.type === 'hours' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/70">
              <Clock className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-sm font-medium">Business Hours</span>
            </div>
            {is24Hours(business.working_hours) ? (
              <div className="bg-[var(--color-accent)]/20 rounded-xl px-4 py-3">
                <p className="text-white font-semibold">Open 24 Hours</p>
                <p className="text-white/60 text-sm">Emergency service available</p>
              </div>
            ) : formatWorkingHours(business.working_hours).length > 0 ? (
              <ul className="space-y-1.5 text-sm text-white/70">
                {formatWorkingHours(business.working_hours)
                  .slice(0, 5)
                  .map((hour, hourIndex) => (
                    <li key={hourIndex} className="flex justify-between">
                      <span>{hour.split(':')[0]}:</span>
                      <span className="text-white/90">
                        {hour.split(':').slice(1).join(':')}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-white/70 text-sm">Call for hours</p>
            )}
          </div>
        )}

        {/* Text Column */}
        {column.type === 'text' && column.content && (
          <p className="text-white/70 text-sm leading-relaxed">{column.content}</p>
        )}
      </div>
    );
  };

  // Minimal variant - simple one-line footer
  if (variant === 'minimal') {
    return (
      <footer className="bg-[var(--color-primary)] text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              {config.bottomText ||
                `© ${currentYear} ${business.name}. All rights reserved.`}
            </p>
            <div className="flex items-center gap-6">
              {business.phone && (
                <a
                  href={getPhoneHref(business.phone)}
                  onClick={handlePhoneClick}
                  className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {formatPhone(business.phone)}
                </a>
              )}
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {business.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Standard and expanded variants
  return (
    <footer className="bg-[var(--color-primary)] text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-14 lg:py-20">
        {/* Main Grid */}
        <div
          className={`grid gap-10 lg:gap-16 ${
            variant === 'expanded'
              ? 'sm:grid-cols-2 lg:grid-cols-5'
              : 'sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {/* Business Info - always first */}
          <div className={variant === 'expanded' ? 'lg:col-span-2' : ''}>
            <h3
              className="text-2xl font-bold mb-4 text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {business.name}
            </h3>
            {business.city && business.state && (
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Proudly serving {business.city}, {business.state} and the
                surrounding areas with professional service.
              </p>
            )}

            {/* Social Links */}
            {config.showSocialLinks && (business.facebook || business.instagram || business.youtube) && (
              <div className="flex items-center gap-3">
                {business.facebook && (
                  <a
                    href={business.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[var(--color-accent)] text-white/70 hover:text-white transition-all duration-300"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {business.instagram && (
                  <a
                    href={business.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[var(--color-accent)] text-white/70 hover:text-white transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {business.youtube && (
                  <a
                    href={business.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[var(--color-accent)] text-white/70 hover:text-white transition-all duration-300"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Columns */}
          {config.columns.map((column, index) => renderColumn(column, index))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              {config.bottomText ||
                `© ${currentYear} ${business.name}. All rights reserved.`}
            </p>
            <div className="flex items-center gap-6 text-white/40 text-sm">
              <Link
                href={getHref('/privacy')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href={getHref('/terms')}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default GlobalFooter;
