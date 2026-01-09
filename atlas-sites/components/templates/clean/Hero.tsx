'use client';

import { useState } from 'react';
import { Star, Phone, Loader2 } from 'lucide-react';
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
    <section className="relative min-h-[90vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1c2e]/95 via-[#0f1c2e]/80 to-[#0f1c2e]/60" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text content */}
          <div>
            {/* Rating - only if strong */}
            {showRating && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
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
            <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-6">
              {business.city ? (
                <>
                  Professional Plumbing<br />
                  <span className="text-[#60a5fa]">in {business.city}</span>
                </>
              ) : (
                <>
                  Professional<br />
                  <span className="text-[#60a5fa]">Plumbing Services</span>
                </>
              )}
            </h1>

            {/* Subhead */}
            <p className="text-lg sm:text-xl text-white/70 mb-8 max-w-lg leading-relaxed">
              {business.name} delivers reliable plumbing solutions
              {isOpen24Hours && ' around the clock'}.
              Get your free estimate today.
            </p>

            {/* Phone CTA - mobile prominent */}
            {business.phone && (
              <a
                href={getPhoneHref(business.phone)}
                className="inline-flex items-center gap-3 text-white group lg:hidden mb-8"
              >
                <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center group-hover:bg-[#2563eb] transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-white/60">Call now</div>
                  <div className="text-lg font-semibold">{formatPhone(business.phone)}</div>
                </div>
              </a>
            )}

            {/* Desktop phone */}
            {business.phone && (
              <div className="hidden lg:flex items-center gap-3 text-white/80">
                <Phone className="w-5 h-5" />
                <span>Or call us directly:</span>
                <a
                  href={getPhoneHref(business.phone)}
                  className="text-white font-semibold hover:text-[#60a5fa] transition-colors"
                >
                  {formatPhone(business.phone)}
                </a>
              </div>
            )}
          </div>

          {/* Right - Contact Form */}
          <div className="lg:justify-self-end w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Request Received
                  </h3>
                  <p className="text-gray-600">
                    We&apos;ll get back to you shortly.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1e3a5f] mb-2">
                    Get a Free Quote
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Describe your issue and we&apos;ll respond quickly.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Your name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="How can we help?"
                        required
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#3b82f6]/70 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Request Quote'
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-gray-400 text-center mt-4">
                    We respect your privacy. No spam, ever.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
