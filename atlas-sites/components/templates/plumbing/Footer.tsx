import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Business } from '@/lib/types';
import { formatPhone, getPhoneHref, formatWorkingHours, is24Hours } from '@/lib/utils';

interface FooterProps {
  business: Business;
  basePath: string;
}

export function Footer({ business, basePath }: FooterProps) {
  const hours = formatWorkingHours(business.working_hours);
  const currentYear = new Date().getFullYear();
  const isOpen24 = is24Hours(business.working_hours);

  const navLinks = [
    { href: basePath, label: 'Home' },
    { href: `${basePath}/services`, label: 'Services' },
    { href: `${basePath}/about`, label: 'About' },
    { href: `${basePath}/contact`, label: 'Contact' },
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Business Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-4">
              {business.name}
            </h3>
            {business.city && business.state && (
              <p className="text-white/70 text-sm">
                Serving {business.city}, {business.state} and surrounding areas.
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/50">
              Navigation
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/50">
              Contact
            </h4>
            <ul className="space-y-3">
              {business.phone && (
                <li>
                  <a
                    href={getPhoneHref(business.phone)}
                    className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {formatPhone(business.phone)}
                  </a>
                </li>
              )}
              {business.email && (
                <li>
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    {business.email}
                  </a>
                </li>
              )}
              {business.city && business.state && (
                <li className="flex items-start gap-2 text-white/70 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {business.city}, {business.state}
                </li>
              )}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/50">
              Hours
            </h4>
            {isOpen24 ? (
              <p className="text-white/70 text-sm">Open 24 hours</p>
            ) : hours.length > 0 ? (
              <ul className="space-y-1 text-sm text-white/70">
                {hours.slice(0, 5).map((hour, index) => (
                  <li key={index}>{hour}</li>
                ))}
                {hours.length > 5 && (
                  <li className="text-white/50">+ weekends</li>
                )}
              </ul>
            ) : (
              <p className="text-white/70 text-sm">Call for hours</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 pt-6 text-center text-white/40 text-sm">
          <p>&copy; {currentYear} {business.name}</p>
        </div>
      </div>
    </footer>
  );
}
