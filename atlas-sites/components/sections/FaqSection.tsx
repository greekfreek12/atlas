'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { FaqSectionConfig } from '@/lib/site-config/types';

export function FaqSection({ config }: SectionComponentProps<FaqSectionConfig>) {
  const { content } = config;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = content.faqs || [];

  return (
    <section
      className="py-16 lg:py-24 bg-[var(--color-background)]"
      data-section-id={config.id}
      data-section-type={config.type}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {faqs.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)]">
            No FAQs added yet.
          </p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id || index}
                className="border border-[var(--color-text)]/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left bg-[var(--color-background-alt)] hover:bg-[var(--color-background-alt)]/80 transition-colors"
                >
                  <span className="font-semibold text-[var(--color-text)] pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-300 flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="p-5 pt-0 text-[var(--color-text-muted)] leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
