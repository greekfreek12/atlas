'use client';

import { MapPin } from 'lucide-react';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { ServiceAreaSectionConfig } from '@/lib/site-config/types';

export function ServiceAreaSection({ config }: SectionComponentProps<ServiceAreaSectionConfig>) {
  const { content } = config;
  const areas = content.areas || [];

  return (
    <section
      className="py-16 lg:py-24 bg-[var(--color-background-alt)]"
      data-section-id={config.id}
      data-section-type={config.type}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
            {content.heading}
          </h2>
          {content.subheading && (
            <p className="text-lg text-[var(--color-text-muted)]">
              {content.subheading}
            </p>
          )}
        </div>

        {areas.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)]">
            No service areas added yet.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {areas.map((area, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              >
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{area}</span>
              </div>
            ))}
          </div>
        )}

        {content.ctaText && (
          <p className="text-center mt-8 text-[var(--color-text-muted)]">
            {content.ctaText}
          </p>
        )}
      </div>
    </section>
  );
}
