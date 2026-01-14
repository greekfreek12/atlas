'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Phone, ArrowRight, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HeroSectionConfig } from '@/lib/site-config/types';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { formatPhone, getPhoneHref, hasStrongRating } from '@/lib/utils';
import { trackPhoneClick, trackCtaClick } from '@/lib/tracking';

export function HeroSection({
  config,
  business,
  basePath,
}: SectionComponentProps<HeroSectionConfig>) {
  const { content, styles } = config;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Merge styles with defaults
  const overlayOpacity = styles?.overlayOpacity ?? 70;
  const textAlignment = styles?.textAlignment ?? 'left';
  const minHeight = styles?.minHeight ?? 'large';

  const showRating =
    content.showRating &&
    hasStrongRating(business.google_rating, business.google_reviews_count);

  const heightClasses: Record<string, string> = {
    small: 'min-h-[60vh]',
    medium: 'min-h-[75vh]',
    large: 'min-h-[90vh]',
    full: 'min-h-screen',
  };

  // Handle CTA click based on action type
  const handleCtaClick = (
    cta: typeof content.primaryCta,
    ctaName: string
  ) => {
    if (cta.action === 'phone') {
      trackPhoneClick(business.id);
    } else {
      trackCtaClick(business.id, ctaName);
    }
  };

  // Get CTA href based on action type
  const getCtaHref = (cta: typeof content.primaryCta): string => {
    switch (cta.action) {
      case 'phone':
        return getPhoneHref(business.phone || '');
      case 'email':
        return `mailto:${cta.target || business.email || ''}`;
      case 'link':
        return cta.target?.startsWith('/') ? `${basePath}${cta.target}` : cta.target || '#';
      case 'scroll':
        return `#${cta.target || ''}`;
      default:
        return '#';
    }
  };

  // Get CTA button classes based on variant
  const getCtaClasses = (variant: string): string => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold px-7 py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-accent)]/25';
      case 'secondary':
        return 'bg-white/5 hover:bg-white/10 text-white font-medium px-7 py-4 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300';
      case 'outline':
        return 'bg-transparent hover:bg-white/10 text-white font-medium px-7 py-4 rounded-lg border-2 border-white/40 hover:border-white/60 transition-all duration-300';
      default:
        return 'bg-[var(--color-accent)] text-white px-7 py-4 rounded-lg';
    }
  };

  return (
    <section
      className={`relative ${heightClasses[minHeight]} flex items-center overflow-hidden bg-[var(--color-primary-dark)]`}
      data-section-id={config.id}
      data-section-type={config.type}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={content.backgroundImage.src}
          alt={content.backgroundImage.alt}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Dark overlay with gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-dark)] via-[var(--color-primary-dark)]/90 to-[var(--color-primary-dark)]/60"
          style={{ opacity: overlayOpacity / 100 }}
        />

        {/* Accent color ambient glow */}
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[var(--color-accent)]/20 rounded-full blur-[150px] pointer-events-none" />
      </div>

      {/* Geometric accent elements */}
      <div className="absolute top-20 right-10 w-32 h-32 border border-[var(--color-accent)]/20 rotate-45 hidden lg:block" />
      <div className="absolute bottom-40 right-1/4 w-20 h-20 border border-white/10 rotate-12 hidden lg:block" />

      {/* Content */}
      <div
        className={`relative w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-24 lg:py-32 ${
          textAlignment === 'center' ? 'text-center' : ''
        }`}
      >
        <div
          className={
            textAlignment === 'center' ? 'max-w-3xl mx-auto' : 'max-w-2xl'
          }
        >
          {/* Rating Badge */}
          {showRating && (
            <div
              className={`inline-flex items-center gap-2 mb-8 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } ${textAlignment === 'center' ? 'justify-center' : ''}`}
            >
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full pl-3 pr-4 py-2 border border-white/10">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-semibold text-sm">
                  {business.google_rating}
                </span>
                <span className="text-white/50 text-sm">·</span>
                <span className="text-white/70 text-sm">
                  {business.google_reviews_count} reviews
                </span>
              </div>
            </div>
          )}

          {/* Business Name */}
          <p
            className={`text-[var(--color-accent)] uppercase tracking-[0.2em] text-sm font-medium mb-4 transition-all duration-700 delay-100 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {business.name}
          </p>

          {/* Main Headline */}
          <h1
            className={`font-display text-white leading-[1.05] tracking-tight mb-6 transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
              {content.headline}
            </span>
          </h1>

          {/* Tagline */}
          <p
            className={`text-white/60 text-lg sm:text-xl max-w-lg leading-relaxed mb-10 transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } ${textAlignment === 'center' ? 'mx-auto' : ''}`}
          >
            {content.tagline}
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-[400ms] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } ${textAlignment === 'center' ? 'justify-center' : ''}`}
          >
            {/* Primary CTA */}
            <CtaButtonLink
              cta={content.primaryCta}
              href={getCtaHref(content.primaryCta)}
              onClick={() => handleCtaClick(content.primaryCta, 'hero_primary')}
              className={getCtaClasses(content.primaryCta.variant)}
              phone={business.phone}
            />

            {/* Secondary CTA */}
            {content.secondaryCta && (
              <CtaButtonLink
                cta={content.secondaryCta}
                href={getCtaHref(content.secondaryCta)}
                onClick={() => handleCtaClick(content.secondaryCta!, 'hero_secondary')}
                className={getCtaClasses(content.secondaryCta.variant)}
                phone={business.phone}
              />
            )}
          </div>

          {/* Trust Badges */}
          {content.trustBadges.length > 0 && (
            <div
              className={`flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 pt-8 border-t border-white/10 transition-all duration-700 delay-500 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } ${textAlignment === 'center' ? 'justify-center' : ''}`}
            >
              {content.trustBadges.map((badge: string, index: number) => (
                <span
                  key={index}
                  className="text-white/40 text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom edge gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}

// Helper component for CTA buttons
interface CtaButtonLinkProps {
  cta: { text: string; action: string; variant: string };
  href: string;
  onClick: () => void;
  className: string;
  phone?: string | null;
}

function CtaButtonLink({ cta, href, onClick, className, phone }: CtaButtonLinkProps) {
  const isExternal = href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:');

  const content = (
    <>
      {cta.action === 'phone' && <Phone className="w-5 h-5" />}
      {cta.action === 'email' && <Mail className="w-5 h-5" />}
      <span>
        {cta.text}
        {cta.action === 'phone' && phone && ` ${formatPhone(phone)}`}
      </span>
      {cta.action === 'link' && (
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
      )}
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`group inline-flex items-center justify-center gap-3 ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-3 ${className}`}
    >
      {content}
    </Link>
  );
}
