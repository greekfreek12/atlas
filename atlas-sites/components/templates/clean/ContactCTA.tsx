import Link from 'next/link';
import { Phone, Clock, MapPin } from 'lucide-react';
import { Business } from '@/lib/types';
import { formatPhone, getPhoneHref, formatWorkingHours } from '@/lib/utils';

interface ContactCTAProps {
  business: Business;
  basePath: string;
}

export function ContactCTA({ business, basePath }: ContactCTAProps) {
  const hours = formatWorkingHours(business.working_hours);
  const todayIndex = new Date().getDay();
  const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayHours = hours.find(h => h.startsWith(daysOrder[todayIndex]));

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left - CTA Content */}
            <div className="p-8 md:p-12 lg:p-16">
              <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Contact us today for a free estimate. We&apos;re here to help with all your plumbing needs.
              </p>

              {/* Phone */}
              {business.phone && (
                <a
                  href={getPhoneHref(business.phone)}
                  className="flex items-center gap-4 mb-6 group"
                >
                  <div className="w-12 h-12 bg-[#3b82f6] rounded-xl flex items-center justify-center group-hover:bg-[#2563eb] transition-colors">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Call us now</p>
                    <p className="text-xl font-semibold text-[#1e3a5f]">
                      {formatPhone(business.phone)}
                    </p>
                  </div>
                </a>
              )}

              {/* Hours */}
              {todayHours && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Today&apos;s hours</p>
                    <p className="text-lg font-medium text-[#1e3a5f]">
                      {todayHours.split(': ')[1]}
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              {business.city && business.state && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Serving</p>
                    <p className="text-lg font-medium text-[#1e3a5f]">
                      {business.city}, {business.state}
                    </p>
                  </div>
                </div>
              )}

              <Link
                href={`${basePath}/contact`}
                className="inline-flex items-center justify-center bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Request a Free Quote
              </Link>
            </div>

            {/* Right - Image */}
            <div
              className="hidden md:block bg-cover bg-center min-h-[400px]"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1581094794329-c8112c4e5190?auto=format&fit=crop&w=1000&q=80')`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
