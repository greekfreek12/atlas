'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Phone, ArrowRight, Mail } from 'lucide-react';
import { CtaSectionConfig } from '@/lib/site-config/types';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { formatPhone, getPhoneHref } from '@/lib/utils';
import { trackPhoneClick, trackCtaClick } from '@/lib/tracking';

export function CtaSection({
  config,
  business,
  basePath,
}: SectionComponentProps<CtaSectionConfig>) {
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
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const variant = styles?.variant ?? 'banner';

  const getCtaHref = (cta: typeof content.primaryCta): string => {
    switch (cta.action) {
      case 'phone':
        return getPhoneHref(business.phone || '');
      case 'email':
        return `mailto:${cta.target || business.email || ''}`;
      case 'link':
        return cta.target?.startsWith('/')
          ? `${basePath}${cta.target}`
          : cta.target || '#';
      default:
        return '#';
    }
  };

  const handleCtaClick = (cta: typeof content.primaryCta, ctaName: string) => {
    if (cta.action === 'phone') {
      trackPhoneClick(business.id);
    } else {
      trackCtaClick(business.id, ctaName);
    }
  };

  const getCtaClasses = (variant: string): string => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white';
      case 'secondary':
        return 'bg-white/10 hover:bg-white/20 text-white border border-white/30';
      case 'outline':
        return 'bg-transparent hover:bg-white/10 text-white border-2 border-white';
      default:
        return 'bg-[var(--color-accent)] text-white';
    }
  };

  // Simple Banner Variant
  if (variant === 'simple') {
    return (
      <section
        ref={sectionRef}
        className="py-16 lg:py-20 bg-[var(--color-primary)]"
        data-section-id={config.id}
        data-section-type={config.type}
      >
        <div
          className={`max-w-4xl mx-auto px-4 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {content.heading}
          </h2>
          {content.subheading && (
            <p className="text-white/70 text-lg mb-8">{content.subheading}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CtaButton
              cta={content.primaryCta}
              href={getCtaHref(content.primaryCta)}
              onClick={() => handleCtaClick(content.primaryCta, 'cta_primary')}
              className={getCtaClasses(content.primaryCta.variant)}
              phone={business.phone}
            />
            {content.secondaryCta && (
              <CtaButton
                cta={content.secondaryCta}
                href={getCtaHref(content.secondaryCta)}
                onClick={() =>
                  handleCtaClick(content.secondaryCta!, 'cta_secondary')
                }
                className={getCtaClasses(content.secondaryCta.variant)}
                phone={business.phone}
              />
            )}
          </div>
        </div>
      </section>
    );
  }

  // Banner Variant (with background)
  if (variant === 'banner') {
    return (
      <section
        ref={sectionRef}
        className="relative py-20 lg:py-28 overflow-hidden"
        data-section-id={config.id}
        data-section-type={config.type}
        style={{
          backgroundColor: styles?.backgroundColor || 'var(--color-primary)',
        }}
      >
        {/* Background Image */}
        {content.backgroundImage && (
          <div className="absolute inset-0">
            <Image
              src={content.backgroundImage.src}
              alt={content.backgroundImage.alt}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[var(--color-primary)]/80" />
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[var(--color-accent)]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

        <div
          className={`relative max-w-4xl mx-auto px-4 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {content.heading}
          </h2>
          {content.subheading && (
            <p className="text-white/70 text-xl mb-10 max-w-2xl mx-auto">
              {content.subheading}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CtaButton
              cta={content.primaryCta}
              href={getCtaHref(content.primaryCta)}
              onClick={() => handleCtaClick(content.primaryCta, 'cta_primary')}
              className={`${getCtaClasses(content.primaryCta.variant)} text-lg px-8 py-4 rounded-xl`}
              phone={business.phone}
              large
            />
            {content.secondaryCta && (
              <CtaButton
                cta={content.secondaryCta}
                href={getCtaHref(content.secondaryCta)}
                onClick={() =>
                  handleCtaClick(content.secondaryCta!, 'cta_secondary')
                }
                className={`${getCtaClasses(content.secondaryCta.variant)} text-lg px-8 py-4 rounded-xl`}
                phone={business.phone}
                large
              />
            )}
          </div>
        </div>
      </section>
    );
  }

  // Split Variant
  return (
    <section
      ref={sectionRef}
      className="relative bg-[var(--color-background-alt)] overflow-hidden"
      data-section-id={config.id}
      data-section-type={config.type}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 min-h-[500px]">
          {/* Content Side */}
          <div
            className={`flex items-center p-8 lg:p-16 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-6">
                {content.heading}
              </h2>
              {content.subheading && (
                <p className="text-[var(--color-text-muted)] text-lg mb-8">
                  {content.subheading}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <CtaButton
                  cta={content.primaryCta}
                  href={getCtaHref(content.primaryCta)}
                  onClick={() =>
                    handleCtaClick(content.primaryCta, 'cta_primary')
                  }
                  className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-4 rounded-xl"
                  phone={business.phone}
                  large
                />
              </div>
            </div>
          </div>

          {/* Image Side */}
          {content.backgroundImage && (
            <div
              className={`relative min-h-[300px] lg:min-h-full transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
            >
              <Image
                src={content.backgroundImage.src}
                alt={content.backgroundImage.alt}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background-alt)] via-transparent to-transparent lg:hidden" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Helper component
interface CtaButtonProps {
  cta: { text: string; action: string; variant: string };
  href: string;
  onClick: () => void;
  className: string;
  phone?: string | null;
  large?: boolean;
}

function CtaButton({
  cta,
  href,
  onClick,
  className,
  phone,
  large,
}: CtaButtonProps) {
  const isExternal =
    href.startsWith('http') ||
    href.startsWith('tel:') ||
    href.startsWith('mailto:');

  const content = (
    <>
      {cta.action === 'phone' && <Phone className={large ? 'w-6 h-6' : 'w-5 h-5'} />}
      {cta.action === 'email' && <Mail className={large ? 'w-6 h-6' : 'w-5 h-5'} />}
      <span>
        {cta.text}
        {cta.action === 'phone' && phone && ` ${formatPhone(phone)}`}
      </span>
      {cta.action === 'link' && (
        <ArrowRight
          className={`${large ? 'w-5 h-5' : 'w-4 h-4'} group-hover:translate-x-1 transition-transform`}
        />
      )}
    </>
  );

  const baseClasses = `group inline-flex items-center justify-center gap-3 font-semibold transition-all duration-300 ${className}`;

  if (isExternal) {
    return (
      <a href={href} onClick={onClick} className={baseClasses}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={baseClasses}>
      {content}
    </Link>
  );
}
