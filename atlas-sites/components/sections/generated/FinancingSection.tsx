'use client';

import React from 'react';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { SectionConfig } from '@/lib/site-config/types';

interface FinancingOption {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

interface FinancingContent {
  headline: string;
  subheadline: string;
  description: string;
  financing_options: FinancingOption[];
  benefits: string[];
  cta_text: string;
  cta_phone: boolean;
}

const getIcon = (iconType: string) => {
  switch (iconType) {
    case 'percent':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'clock':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      );
  }
};

export function FinancingSection({ config, business }: SectionComponentProps<SectionConfig>) {
  const content = config.content as unknown as FinancingContent;
  const { styles } = config;

  return (
    <section className="py-16 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
            {content.headline}
          </h2>
          <p className="text-xl text-[var(--color-primary)] mb-4">
            {content.subheadline}
          </p>
          <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mx-auto">
            {content.description}
          </p>
        </div>

        {/* Financing Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {content.financing_options.map((option, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center"
            >
              <div className="text-[var(--color-primary)] mb-4 flex justify-center">
                {getIcon(option.icon)}
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                {option.title}
              </h3>
              <p className="text-[var(--color-primary)] font-semibold mb-3">
                {option.subtitle}
              </p>
              <p className="text-[var(--color-text-muted)]">
                {option.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits and CTA */}
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-6">
                Why Choose Our Financing?
              </h3>
              <ul className="space-y-3">
                {content.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[var(--color-text)]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="mb-6">
                <p className="text-lg text-[var(--color-text-muted)] mb-4">
                  Ready to get started?
                </p>
                {content.cta_phone && business.phone && (
                  <a 
                    href={`tel:${business.phone}`}
                    className="inline-block bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 mb-4 mr-4"
                  >
                    Call {business.phone}
                  </a>
                )}
                <button className="inline-block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                  {content.cta_text}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Element */}
        <div className="text-center mt-8">
          <p className="text-sm text-[var(--color-text-muted)]">
            * Subject to credit approval. Terms and conditions apply. 
            Licensed plumbing contractor in {business.city || 'your area'}.
          </p>
        </div>
      </div>
    </section>
  );
}