'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, Phone, Loader2, Clock, Shield, Award } from 'lucide-react';
import { Business } from '@/lib/types';
import { formatPhone, getPhoneHref, hasStrongRating, is24Hours } from '@/lib/utils';

interface HeroProps {
  business: Business;
  basePath: string;
}

export function Hero({ business, basePath }: HeroProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const showRating = hasStrongRating(business.google_rating, business.google_reviews_count);
  const isOpen24Hours = is24Hours(business.working_hours);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          ...formData,
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {/*
          Hero Image Strategy:
          - Recommended size: 2000x1200px minimum
          - Aspect ratio: 16:9 or wider
          - Good subjects: Professional plumber at work, modern bathroom/kitchen, pipe work close-up
          - Style: High contrast, dramatic lighting, professional quality
        */}
        <Image
          src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=2000&q=80"
          alt="Professional plumbing services"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-dark)]/95 via-[var(--color-primary-dark)]/80 to-[var(--color-primary-dark)]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-dark)]/60 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Text content */}
          <div className="animate-fade-in-up">
            {/* Rating badge */}
            {showRating && (
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in delay-200">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(business.google_rating!)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-white/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white/90 text-sm font-medium">
                  {business.google_rating} · {business.google_reviews_count} reviews
                </span>
              </div>
            )}

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display text-white leading-[1.05] tracking-tight mb-6">
              {business.city ? (
                <>
                  <span className="block text-white/60 text-2xl sm:text-3xl lg:text-4xl font-normal mb-2">
                    {business.name}
                  </span>
                  Expert Plumbing
                  <br />
                  <span className="text-accent">in {business.city}</span>
                </>
              ) : (
                <>
                  <span className="block text-white/60 text-2xl sm:text-3xl lg:text-4xl font-normal mb-2">
                    {business.name}
                  </span>
                  Professional
                  <br />
                  <span className="text-accent">Plumbing Services</span>
                </>
              )}
            </h1>

            {/* Subhead */}
            <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-lg leading-relaxed animate-fade-in delay-300">
              Trusted by homeowners for reliable repairs, installations, and emergency service
              {isOpen24Hours && ' — available around the clock'}.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 mb-10 animate-fade-in delay-400">
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm">Licensed & Insured</span>
              </div>
              {isOpen24Hours && (
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm">24/7 Emergency</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm">Satisfaction Guaranteed</span>
              </div>
            </div>

            {/* Phone CTA */}
            {business.phone && (
              <div className="animate-fade-in delay-500">
                <a
                  href={getPhoneHref(business.phone)}
                  className="inline-flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="text-sm text-white/60 uppercase tracking-wider">
                      Call us now
                    </div>
                    <div className="text-2xl font-semibold group-hover:text-accent transition-colors">
                      {formatPhone(business.phone)}
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Right - Contact Form */}
          <div className="animate-slide-in-right delay-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 relative overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px]" />

              {submitted ? (
                <div className="text-center py-8 relative z-10">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-display text-primary mb-3">
                    Request Received!
                  </h3>
                  <p className="text-gray-600">
                    We&apos;ll get back to you shortly.
                  </p>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="mb-8">
                    <div className="accent-line mb-4" />
                    <h2 className="text-2xl lg:text-3xl font-display text-primary mb-2">
                      Get a Free Quote
                    </h2>
                    <p className="text-gray-500">
                      Describe your issue and we&apos;ll respond quickly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <input
                        type="text"
                        placeholder="Your name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="How can we help?"
                        required
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl border border-gray-200 resize-none text-gray-900 placeholder:text-gray-400 transition-all duration-300"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary py-4 text-lg disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Request Free Quote'
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-gray-400 text-center mt-6">
                    We respect your privacy. No spam, ever.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
