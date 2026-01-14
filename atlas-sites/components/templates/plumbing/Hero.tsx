'use client';

import Image from 'next/image';
import { Star, Phone, ArrowRight } from 'lucide-react';
import { Business } from '@/lib/types';
import { formatPhone, getPhoneHref, hasStrongRating } from '@/lib/utils';
import { trackPhoneClick, trackCtaClick } from '@/lib/tracking';
import { useEffect, useState } from 'react';

interface HeroProps {
  business: Business;
  basePath: string;
}

const HERO_IMAGE = 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=2000&q=80';
const TRUST_BADGES = ['Licensed & Insured', 'Same-Day Service', 'Upfront Pricing'];
const CTA1_TEXT = 'Call';
const CTA2_TEXT = 'Get a Free Quote';

export function Hero({ business, basePath }: HeroProps) {
  const showRating = hasStrongRating(business.google_rating, business.google_reviews_count);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const headline = business.city
    ? `Your Trusted Plumber in ${business.city}`
    : 'Professional Plumbing Services';

  const tagline = 'Fast, reliable service when you need it most. Licensed professionals ready to help 24/7.';

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden bg-[var(--color-primary-dark)]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt={`${business.name} - Professional services`}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-dark)] via-[var(--color-primary-dark)]/90 to-[var(--color-primary-dark)]/60" />

        {/* Accent color ambient glow */}
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[var(--color-accent)]/20 rounded-full blur-[150px] pointer-events-none" />
      </div>

      {/* Geometric accent elements */}
      <div className="absolute top-20 right-10 w-32 h-32 border border-[var(--color-accent)]/20 rotate-45 hidden lg:block" />
      <div className="absolute bottom-40 right-1/4 w-20 h-20 border border-white/10 rotate-12 hidden lg:block" />

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-24 lg:py-32">
        <div className="max-w-2xl">
          {/* Rating Badge - Minimal, elegant */}
          {showRating && (
            <div
              className={`inline-flex items-center gap-2 mb-8 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full pl-3 pr-4 py-2 border border-white/10">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-semibold text-sm">{business.google_rating}</span>
                <span className="text-white/50 text-sm">·</span>
                <span className="text-white/70 text-sm">{business.google_reviews_count} reviews</span>
              </div>
            </div>
          )}

          {/* Business Name - Accent color, understated */}
          <p
            className={`text-[var(--color-accent)] uppercase tracking-[0.2em] text-sm font-medium mb-4 transition-all duration-700 delay-100 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {business.name}
          </p>

          {/* Main Headline - NOW EDITABLE */}
          <h1
            className={`font-display text-white leading-[1.05] tracking-tight mb-6 transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
              {headline}
            </span>
          </h1>

          {/* Subheadline - NOW EDITABLE */}
          <p
            className={`text-white/60 text-lg sm:text-xl max-w-lg leading-relaxed mb-10 transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {tagline}
          </p>

          {/* CTA Buttons - NOW EDITABLE */}
          {business.phone && (
            <div
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-[400ms] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {/* Primary CTA */}
              <a
                href={getPhoneHref(business.phone)}
                onClick={() => trackPhoneClick(business.id)}
                className="group inline-flex items-center justify-center gap-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold px-7 py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-accent)]/25"
              >
                <Phone className="w-5 h-5" />
                <span>{CTA1_TEXT} {formatPhone(business.phone)}</span>
              </a>

              {/* Secondary CTA */}
              <a
                href={getPhoneHref(business.phone)}
                onClick={() => trackCtaClick(business.id, 'get_free_quote')}
                className="group inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-7 py-4 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300"
              >
                <span>{CTA2_TEXT}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          )}

          {/* Trust indicators - NOW EDITABLE */}
          <div
            className={`flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 pt-8 border-t border-white/10 transition-all duration-700 delay-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {TRUST_BADGES.map((badge, index) => (
              <span key={index} className="text-white/40 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom edge gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
