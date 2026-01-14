import React from 'react';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { BaseSectionConfig } from '@/lib/site-config/types';

interface PricingSectionConfig extends BaseSectionConfig {
  type: 'pricing';
  content: {
    headline: string;
    tagline?: string;
    tiers: Array<{
      name: string;
      price: string;
      period?: string;
      description?: string;
      features: string[];
      cta: {
        text: string;
        variant: 'primary' | 'secondary';
      };
      featured?: boolean;
    }>;
  };
}

export function PricingSection({ config, business }: SectionComponentProps<PricingSectionConfig>) {
  const { content, styles } = config;

  return (
    <section className="py-16 bg-[var(--color-background)]" style={styles}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">
            {content.headline}
          </h2>
          {content.tagline && (
            <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
              {content.tagline}
            </p>
          )}
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {content.tiers.map((tier, index) => (
            <div 
              key={index}
              className={`relative rounded-lg p-8 border-2 ${
                tier.featured 
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-105' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                  {tier.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-[var(--color-primary)]">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-[var(--color-text-muted)] ml-1">
                      {tier.period}
                    </span>
                  )}
                </div>
                {tier.description && (
                  <p className="text-[var(--color-text-muted)]">
                    {tier.description}
                  </p>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg 
                      className="w-5 h-5 text-[var(--color-primary)] mr-3 mt-0.5 flex-shrink-0" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span className="text-[var(--color-text)]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                className={`w-full py-3 px-6 rounded-md font-semibold transition-colors ${
                  tier.cta.variant === 'primary'
                    ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90'
                    : 'bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
                }`}
                onClick={() => window.location.href = `tel:${business.phone}`}
              >
                {tier.cta.text}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}