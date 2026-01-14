'use client';

import { MapPin, Phone } from 'lucide-react';
import { Business } from '@/lib/types';
import { formatPhone, getPhoneHref } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface ServiceAreaProps {
  business: Business;
}

export function ServiceArea({ business }: ServiceAreaProps) {
  const { city, state, latitude, longitude, phone, name } = business;
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Generate static Google Maps URL if we have coordinates
  const mapUrl = latitude && longitude
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${latitude},${longitude}&zoom=12`
    : null;

  // Nearby areas - typically would come from database, hardcoded for plumbing businesses
  const nearbyAreas = city ? [
    `${city}`,
    `Greater ${city} Area`,
    'Surrounding Communities',
  ] : [];

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-12 lg:mb-16 transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="text-[var(--color-accent)] uppercase tracking-[0.15em] text-sm font-medium">
              Service Area
            </span>
          </div>

          <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-semibold text-[var(--color-primary)] mb-5">
            Proudly Serving {city || 'Your Area'}
          </h2>

          <div className="w-16 h-1 mx-auto rounded-full bg-[var(--color-accent)] mb-6" />

          <p className="text-gray-600 text-lg leading-relaxed">
            {name} provides reliable plumbing services to {city}{state ? `, ${state}` : ''} and surrounding communities.
          </p>
        </div>

        {/* Map and Info Grid */}
        <div
          className={`grid lg:grid-cols-3 gap-8 transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '150ms' }}
        >
          {/* Map */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
            {mapUrl ? (
              <iframe
                src={mapUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${name} service area map`}
                className="w-full h-[300px] lg:h-[400px]"
              />
            ) : (
              <div className="w-full h-[300px] lg:h-[400px] bg-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Serving {city || 'your area'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Service Info Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
            <h3 className="font-display text-xl font-semibold text-[var(--color-primary)] mb-4">
              Areas We Serve
            </h3>

            <ul className="space-y-3 mb-8">
              {nearbyAreas.map((area, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                  {area}
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-gray-600 text-sm mb-4">
                Not sure if we service your area? Give us a call!
              </p>

              {phone && (
                <a
                  href={getPhoneHref(phone)}
                  className="flex items-center justify-center gap-3 w-full btn-primary py-4"
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-semibold">{formatPhone(phone)}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
