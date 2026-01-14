'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Phone,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { BusinessReview, Business, Service } from '@/lib/types';
import { formatPhone, getPhoneHref, slugify } from '@/lib/utils';

// ===========================================
// Animated Section Wrapper
// ===========================================
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ===========================================
// Benefits Grid with Animation
// ===========================================
interface BenefitsGridProps {
  benefits: string[];
  serviceName: string;
}

export function BenefitsGrid({ benefits, serviceName }: BenefitsGridProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 lg:py-20 bg-[var(--color-primary)] overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Accent gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className={`font-display text-3xl lg:text-4xl font-semibold text-white mb-3 transform transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            The {serviceName} Advantage
          </h2>
          <p className={`text-white/60 text-lg transform transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            What sets us apart
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className={`group text-center transform transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${150 + i * 100}ms` }}
            >
              {/* Icon with glow */}
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute inset-0 rounded-full bg-[var(--color-accent)] opacity-20 blur-xl scale-150 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative w-14 h-14 rounded-full border-2 border-[var(--color-accent)] flex items-center justify-center group-hover:bg-[var(--color-accent)] transition-all duration-300">
                  <CheckCircle className="w-6 h-6 text-[var(--color-accent)] group-hover:text-white transition-colors duration-300" />
                </div>
              </div>

              {/* Benefit text */}
              <p className="text-white/90 text-base leading-relaxed group-hover:text-white transition-colors">
                {benefit}
              </p>

              {/* Decorative line */}
              <div className="mt-4 flex justify-center">
                <div className="w-8 h-0.5 bg-[var(--color-accent)] opacity-30 group-hover:w-16 group-hover:opacity-60 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accent gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
    </div>
  );
}

// ===========================================
// Process Timeline
// ===========================================
interface ProcessTimelineProps {
  process: { step: string; description: string }[];
}

export function ProcessTimeline({ process }: ProcessTimelineProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Header */}
      <div className="text-center mb-12">
        <h2
          className={`font-display text-3xl lg:text-4xl font-semibold text-[var(--color-primary)] mb-3 transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          How It Works
        </h2>
        <p className={`text-gray-500 text-lg transform transition-all duration-700 delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          Simple steps to get your plumbing fixed
        </p>
      </div>

      {/* Process steps */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {process.map((item, i) => (
          <div
            key={i}
            className={`group relative transform transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{ transitionDelay: `${200 + i * 150}ms` }}
          >
            {/* Connecting line (hidden on last item) */}
            {i < process.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/20" />
            )}

            {/* Step number with glow */}
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-2xl bg-[var(--color-accent)] opacity-20 blur-xl scale-150 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[var(--color-accent)]/30 group-hover:scale-110 transition-transform duration-300">
                {i + 1}
              </div>
            </div>

            {/* Content */}
            <h3 className="font-display font-semibold text-[var(--color-primary)] text-xl mb-2 group-hover:text-[var(--color-accent)] transition-colors">
              {item.step}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {item.description}
            </p>

            {/* Decorative line */}
            <div className="mt-4">
              <div className="w-12 h-0.5 bg-[var(--color-primary)] opacity-20 group-hover:w-20 group-hover:bg-[var(--color-accent)] group-hover:opacity-60 transition-all duration-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================
// FAQ Accordion
// ===========================================
interface FAQSectionProps {
  faqs: { q: string; a: string }[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef<HTMLDivElement>(null);

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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Background decoration */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <Quote className="w-5 h-5 text-[var(--color-accent)]" />
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-accent)]/50 to-transparent" />
      </div>
      <h2
        className={`font-display text-2xl lg:text-3xl font-semibold text-[var(--color-primary)] mb-2 transform transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        Frequently Asked Questions
      </h2>
      <p className={`text-gray-500 mb-8 transform transition-all duration-700 delay-100 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        Get answers to common questions
      </p>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`group rounded-2xl border overflow-hidden transform transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } ${openIndex === i
              ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] border-transparent shadow-xl'
              : 'bg-white border-gray-100 hover:border-[var(--color-accent)]/30 hover:shadow-md'
            }`}
            style={{ transitionDelay: `${100 + i * 80}ms` }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <h3 className={`font-semibold pr-4 transition-colors ${
                openIndex === i ? 'text-white' : 'text-[var(--color-primary)]'
              }`}>{faq.q}</h3>
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  openIndex === i
                    ? 'bg-white/20 rotate-180'
                    : 'bg-[var(--color-accent)]/10 group-hover:bg-[var(--color-accent)]/20'
                }`}
              >
                <svg
                  className={`w-5 h-5 transition-colors ${openIndex === i ? 'text-white' : 'text-[var(--color-accent)]'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === i ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <p className={`px-5 pb-5 leading-relaxed ${
                openIndex === i ? 'text-white/80' : 'text-gray-600'
              }`}>{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================
// Reviews Carousel
// ===========================================
interface ServiceReviewsProps {
  reviews: BusinessReview[];
  business: Business;
}

export function ServiceReviews({ reviews, business }: ServiceReviewsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const { google_rating, google_reviews_count, google_reviews_link } = business;

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

  useEffect(() => {
    if (!isAutoPlaying || !isVisible || reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isVisible, reviews.length]);

  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    pauseAutoPlay();
  }, [pauseAutoPlay, reviews.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    pauseAutoPlay();
  }, [pauseAutoPlay, reviews.length]);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      pauseAutoPlay();
    },
    [pauseAutoPlay]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
  };

  if (reviews.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-16 lg:py-20 bg-[var(--color-primary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {google_rating && google_reviews_count && (
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 border border-white/10">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(google_rating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white font-medium text-sm">{google_rating}</span>
              <span className="text-white/40 text-sm">({google_reviews_count} reviews)</span>
            </div>
          )}
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
            What Our Customers Say
          </h2>
        </div>

        {/* Carousel */}
        <div
          className={`relative transition-all duration-700 delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Navigation Arrows */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="hidden md:flex absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 items-center justify-center text-white transition-all duration-200"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={goToNext}
                className="hidden md:flex absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 items-center justify-center text-white transition-all duration-200"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Carousel Track */}
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="w-full flex-shrink-0 px-2 sm:px-4">
                  <div className="max-w-xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-white/10">
                      <Quote className="w-8 h-8 text-[var(--color-accent)]/40 mb-4" />

                      {/* Stars */}
                      <div className="flex gap-0.5 mb-4">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>

                      {/* Review text */}
                      <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-6">
                        &ldquo;{review.review_text}&rdquo;
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] font-semibold text-sm">
                          {review.reviewer_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{review.reviewer_name}</p>
                          <p className="text-white/40 text-xs flex items-center gap-1.5">
                            {review.is_local_guide && (
                              <span className="text-[var(--color-accent)]">Local Guide</span>
                            )}
                            {review.is_local_guide && review.review_date && (
                              <span className="text-white/20">&middot;</span>
                            )}
                            {review.review_date}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-[var(--color-accent)] w-6'
                      : 'bg-white/20 w-2 hover:bg-white/40'
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Read More Reviews */}
        {google_reviews_link && (
          <div
            className={`text-center mt-8 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <a
              href={google_reviews_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              Read More Reviews on Google
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ===========================================
// Service Area Section for Service Page
// ===========================================
interface ServiceAreaSectionProps {
  business: Business;
  serviceName: string;
}

export function ServiceAreaSection({ business, serviceName }: ServiceAreaSectionProps) {
  const { city, state, phone, name } = business;
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Generate nearby areas based on city - these would ideally come from database
  const nearbyAreas = city
    ? [
        city,
        `North ${city}`,
        `South ${city}`,
        `East ${city}`,
        `West ${city}`,
        `Greater ${city} Area`,
      ]
    : [];

  if (!city) return null;

  return (
    <section ref={ref} className="py-16 lg:py-20 bg-[var(--color-background-alt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left - Content */}
          <div
            className={`transform transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="text-[var(--color-accent)] uppercase tracking-[0.15em] text-sm font-medium">
                Service Area
              </span>
            </div>

            <h2 className="font-display text-2xl lg:text-3xl xl:text-4xl font-semibold text-[var(--color-primary)] mb-5">
              {serviceName} in {city}, {state}
            </h2>

            <div className="w-16 h-1 rounded-full bg-[var(--color-accent)] mb-6" />

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {name} proudly provides professional {serviceName.toLowerCase()} services to {city},{' '}
              {state} and the surrounding communities. Our local team knows the area and can respond
              quickly to your needs.
            </p>

            {/* Areas list */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {nearbyAreas.map((area, i) => (
                <div
                  key={area}
                  className={`flex items-center gap-2 text-gray-700 transform transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${200 + i * 80}ms` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>

            {phone && (
              <a
                href={getPhoneHref(phone)}
                className="inline-flex items-center gap-3 btn-primary"
              >
                <Phone className="w-5 h-5" />
                <span>{formatPhone(phone)}</span>
              </a>
            )}
          </div>

          {/* Right - Map placeholder or visual */}
          <div
            className={`relative transform transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-[var(--color-accent)]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[var(--color-primary)] mb-2">
                    Serving {city}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    and surrounding {state} communities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===========================================
// Related Services Grid
// ===========================================
interface RelatedServicesProps {
  services: Service[];
  basePath: string;
  currentServiceId: string;
}

export function RelatedServices({ services, basePath, currentServiceId }: RelatedServicesProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const otherServices = services.filter((s) => s.id !== currentServiceId).slice(0, 4);

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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (otherServices.length === 0) return null;

  return (
    <section ref={ref} className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className={`font-display text-2xl lg:text-3xl font-semibold text-[var(--color-primary)] mb-8 transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Our Other Services
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherServices.map((s, i) => (
            <Link
              key={s.id}
              href={`${basePath}/services/${slugify(s.name)}`}
              className={`group bg-[var(--color-background-alt)] rounded-xl p-5 hover:shadow-lg hover:bg-white transition-all duration-300 border border-transparent hover:border-[var(--color-accent)]/20 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${100 + i * 100}ms` }}
            >
              <h3 className="font-semibold text-[var(--color-primary)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                {s.name}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{s.description}</p>
              <span className="inline-flex items-center gap-1 text-[var(--color-accent)] text-sm font-medium group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
