'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Wrench } from 'lucide-react';
import { Business } from '@/lib/types';
import { slugify, getServiceImage, is24Hours } from '@/lib/utils';
import { trackServiceClick } from '@/lib/tracking';
import { useEffect, useRef, useState } from 'react';

interface PlumbingService {
  id: string;
  name: string;
  description: string;
  image?: string;
}

function getServices(businessName: string, isOpen24: boolean): PlumbingService[] {
  const availabilityText = isOpen24
    ? `${businessName} is available 24/7 for burst pipes, severe leaks, and plumbing emergencies.`
    : `${businessName} provides fast response for burst pipes, severe leaks, and plumbing emergencies.`;

  return [
    {
      id: '1',
      name: 'Emergency Plumbing',
      description: `${availabilityText} Fast response when you need it most.`,
    },
    {
      id: '2',
      name: 'Drain Cleaning',
      description: `Professional drain cleaning by ${businessName} for clogged sinks, showers, and main sewer lines. We clear the toughest blockages.`,
    },
    {
      id: '3',
      name: 'Water Heater Services',
      description: `${businessName} provides installation, repair, and maintenance for tank and tankless water heaters. Hot water when you need it.`,
    },
    {
      id: '4',
      name: 'Leak Detection & Repair',
      description: `Advanced leak detection by ${businessName} to find hidden leaks before they cause major damage. Expert repairs that last.`,
    },
    {
      id: '5',
      name: 'Fixture Installation',
      description: `${businessName} offers professional installation of faucets, toilets, sinks, and showers. Quality workmanship guaranteed.`,
    },
    {
      id: '6',
      name: 'Pipe Repair & Replacement',
      description: `From minor pipe repairs to complete repiping, ${businessName} works with all pipe materials and sizes.`,
    },
  ];
}

interface ServicesProps {
  basePath: string;
  business: Business;
  showAll?: boolean;
}

export function Services({ basePath, business, showAll = false }: ServicesProps) {
  const isOpen24 = is24Hours(business.working_hours);
  const services = getServices(business.name, isOpen24);

  const displayServices = showAll ? services : services.slice(0, 6);
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
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Centered */}
        <div
          className={`text-center max-w-3xl mx-auto mb-14 lg:mb-20 transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wrench className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="text-[var(--color-accent)] uppercase tracking-[0.15em] text-sm font-medium">
              Our Services
            </span>
          </div>

          {/* Title with business name */}
          <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-semibold text-[var(--color-primary)] mb-5">
            What We Do
          </h2>

          {/* Accent line - centered */}
          <div className="w-16 h-1 mx-auto rounded-full bg-[var(--color-accent)] mb-6" />

          {/* Description */}
          <p className="text-gray-600 text-lg leading-relaxed">
            {business.name} provides expert plumbing solutions for your home or business.
            Quality workmanship and reliable service on every job.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayServices.map((service, index) => {
            const serviceSlug = slugify(service.name);
            // Use custom image if available, otherwise default service image
            const imageUrl = service.image || getServiceImage(service.name);
            // Alternate slide direction: left items from left, right items from right
            const slideDirection = index % 3 === 0 ? '-translate-x-12' : index % 3 === 2 ? 'translate-x-12' : 'translate-y-12';

            return (
              <Link
                key={service.id}
                href={`${basePath}/services/${serviceSlug}`}
                onClick={() => trackServiceClick(business.id, service.name)}
                className={`
                  group block transform transition-all duration-700 ease-out
                  ${isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${slideDirection}`}
                `}
                style={{ transitionDelay: `${150 + index * 100}ms` }}
              >
                <article className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[var(--color-accent)]/30 transition-all duration-500 hover-lift">
                  {/* Image Container */}
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={service.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/80 via-[var(--color-primary)]/20 to-transparent" />

                    {/* Service title on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white font-semibold text-lg group-hover:text-[var(--color-accent-light)] transition-colors duration-300">
                        {service.name}
                      </h3>
                    </div>

                    {/* Hover accent border effect */}
                    <div className="absolute inset-0 border-b-4 border-transparent group-hover:border-[var(--color-accent)] transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-5 lg:p-6">
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                      {service.description || `Professional ${service.name.toLowerCase()} services with guaranteed quality and satisfaction.`}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-[var(--color-accent)] text-sm font-medium">
                        Learn more
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </span>

                      {/* Decorative corner */}
                      <div className="w-8 h-8 rounded-full border border-gray-200 group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-accent-muted)] transition-all duration-300 flex items-center justify-center">
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[var(--color-accent)] transition-colors duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* View All Link */}
        {!showAll && services.length > 6 && (
          <div
            className={`mt-14 lg:mt-16 text-center transform transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <Link
              href={`${basePath}/services`}
              className="btn-secondary inline-flex items-center gap-2"
            >
              View All Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
