'use client';

import { Star, Quote, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Business, BusinessReview } from '@/lib/types';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface ReviewsProps {
  business: Business;
  realReviews?: BusinessReview[];
}

const testimonials = [
  {
    id: 1,
    name: 'Michael R.',
    location: 'Homeowner',
    text: 'Outstanding service from start to finish. They arrived on time, explained everything clearly, and fixed our issue quickly. Highly recommend!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah T.',
    location: 'Business Owner',
    text: 'Professional, courteous, and extremely knowledgeable. They went above and beyond to ensure everything was done right.',
    rating: 5,
  },
  {
    id: 3,
    name: 'David K.',
    location: 'Property Manager',
    text: 'Finally found a reliable team I can trust. Fair pricing, quality work, and they clean up after themselves.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Jennifer L.',
    location: 'Homeowner',
    text: 'Called for an emergency leak at 10pm and they were here within the hour. Saved us from major water damage!',
    rating: 5,
  },
  {
    id: 5,
    name: 'Robert M.',
    location: 'Restaurant Owner',
    text: 'They handle all the plumbing for my restaurant. Always professional, always on time. Would not go anywhere else.',
    rating: 5,
  },
];

export function Reviews({ business, realReviews = [] }: ReviewsProps) {
  const { google_rating, google_reviews_count, google_reviews_link } = business;
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Use real reviews if we have 3+ five-star reviews with text, otherwise use placeholders
  const displayReviews = useMemo(() => {
    if (realReviews.length >= 3) {
      return realReviews.map((review, idx) => ({
        id: idx + 1,
        name: review.reviewer_name || 'Customer',
        location: review.is_local_guide ? 'Local Guide' : 'Verified Customer',
        text: review.review_text || '',
        rating: review.rating,
      }));
    }
    return testimonials;
  }, [realReviews]);

  // Intersection observer
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

  // Auto-scroll
  useEffect(() => {
    if (!isAutoPlaying || !isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayReviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isVisible]);

  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayReviews.length) % displayReviews.length);
    pauseAutoPlay();
  }, [pauseAutoPlay]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayReviews.length);
    pauseAutoPlay();
  }, [pauseAutoPlay]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    pauseAutoPlay();
  }, [pauseAutoPlay]);

  // Touch handlers for mobile swipe
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

  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-24 overflow-hidden bg-[var(--color-primary)]"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div
          className={`text-center mb-10 lg:mb-14 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Google Rating */}
          {google_rating && google_reviews_count && (
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 border border-white/10">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(google_rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-white/20'
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
          {/* Navigation Arrows - Desktop */}
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
              {displayReviews.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-2 sm:px-4"
                >
                  <div className="max-w-xl mx-auto">
                    {/* Review Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-white/10">
                      {/* Quote icon */}
                      <Quote className="w-8 h-8 text-[var(--color-accent)]/40 mb-4" />

                      {/* Stars */}
                      <div className="flex gap-0.5 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-amber-400 fill-amber-400"
                          />
                        ))}
                      </div>

                      {/* Review text */}
                      <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-6">
                        "{testimonial.text}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] font-semibold text-sm">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {testimonial.name}
                          </p>
                          <p className="text-white/40 text-xs">
                            {testimonial.location}
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
          <div className="flex justify-center gap-2 mt-6">
            {displayReviews.map((_, index) => (
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
        </div>

        {/* Read More Reviews Button */}
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
