'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ServicesSectionConfig, IconName } from '@/lib/site-config/types';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { trackServiceClick } from '@/lib/tracking';

// Dynamic icon imports would go here - for now using a simple mapping
import {
  AlertTriangle,
  Droplets,
  Flame,
  Search,
  Wrench,
  Cylinder,
  Shield,
  Home,
  Zap,
  CheckCircle,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'alert-triangle': AlertTriangle,
  droplets: Droplets,
  flame: Flame,
  search: Search,
  wrench: Wrench,
  cylinder: Cylinder,
  shield: Shield,
  home: Home,
  zap: Zap,
  'check-circle': CheckCircle,
};

export function ServicesSection({
  config,
  business,
  basePath,
}: SectionComponentProps<ServicesSectionConfig>) {
  const { content, styles } = config;
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

  const columns = styles?.columns ?? 3;
  const cardStyle = styles?.cardStyle ?? 'elevated';

  const gridCols: Record<number, string> = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  const cardStyles: Record<string, string> = {
    minimal: 'bg-transparent border-0',
    elevated: 'bg-white shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10',
    bordered: 'bg-white border-2 border-gray-100 hover:border-[var(--color-accent)]',
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-[var(--color-background-alt)] overflow-hidden"
      data-section-id={config.id}
      data-section-type={config.type}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {content.eyebrow && (
            <span className="inline-block text-[var(--color-accent)] text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              {content.eyebrow}
            </span>
          )}
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-4">
            {content.heading}
          </h2>
          {content.subheading && (
            <p className="text-lg text-[var(--color-text-muted)]">
              {content.subheading}
            </p>
          )}
        </div>

        {/* Services Grid */}
        <div className={`grid ${gridCols[columns]} gap-6 lg:gap-8`}>
          {content.services.map((service, index) => {
            const Icon = service.icon ? iconMap[service.icon] : null;
            const href = service.link
              ? service.link.startsWith('/')
                ? `${basePath}${service.link}`
                : service.link
              : '#';

            return (
              <Link
                key={service.id}
                href={href}
                onClick={() => trackServiceClick(business.id, service.name)}
                className={`
                  group relative rounded-2xl overflow-hidden transition-all duration-500
                  ${cardStyles[cardStyle]}
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Service Image */}
                {service.image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image.src}
                      alt={service.image.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Floating Icon Badge */}
                    {Icon && (
                      <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {!service.image && Icon && (
                    <div className="w-14 h-14 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)] transition-colors duration-300">
                      <Icon className="w-7 h-7 text-[var(--color-accent)] group-hover:text-white transition-colors duration-300" />
                    </div>
                  )}

                  <h3 className="font-display text-xl font-semibold text-[var(--color-primary)] mb-2 group-hover:text-[var(--color-accent)] transition-colors duration-300">
                    {service.name}
                  </h3>

                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {/* Learn More Link */}
                  <span className="inline-flex items-center gap-2 text-[var(--color-accent)] font-medium text-sm">
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors duration-300 pointer-events-none" />
              </Link>
            );
          })}
        </div>

        {/* View All Link */}
        {content.showViewAll && content.viewAllLink && (
          <div className="text-center mt-12">
            <Link
              href={`${basePath}${content.viewAllLink}`}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300"
            >
              View All Services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
