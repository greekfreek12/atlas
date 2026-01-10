'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Wrench } from 'lucide-react';
import { Service } from '@/lib/types';
import { slugify, getServiceImage } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface ServicesProps {
  services: Service[];
  basePath: string;
  businessName: string;
  showAll?: boolean;
}

export function Services({ services, basePath, businessName, showAll = false }: ServicesProps) {
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

  // Extract first part of business name for a cleaner title
  const shortName = businessName.includes(' ')
    ? businessName.split(' ').slice(0, 2).join(' ')
    : businessName;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`max-w-2xl mb-14 lg:mb-20 transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="text-[var(--color-accent)] uppercase tracking-[0.15em] text-sm font-medium">
              Professional Services
            </span>
          </div>

          {/* Title with business name */}
          <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-semibold text-[var(--color-primary)] mb-5">
            {shortName} Services
          </h2>

          {/* Accent line */}
          <div className="accent-line mb-6" />

          {/* Description */}
          <p className="text-gray-600 text-lg leading-relaxed">
            From emergency repairs to complete installations, our expert team delivers quality workmanship
            with attention to detail on every project.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayServices.map((service, index) => {
            const serviceSlug = slugify(service.name);
            const imageUrl = getServiceImage(service.name);

            return (
              <Link
                key={service.id}
                href={`${basePath}/services/${serviceSlug}`}
                className={`
                  group block transform transition-all duration-700
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
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
