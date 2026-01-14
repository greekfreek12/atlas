'use client';

import { useEffect, useRef, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, ExternalLink, Quote } from 'lucide-react';
import { ReviewsSectionConfig, CustomReview } from '@/lib/site-config/types';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { Business, BusinessReview } from '@/lib/types';

interface ReviewsProps extends SectionComponentProps<ReviewsSectionConfig> {
  realReviews?: BusinessReview[];
}

export function ReviewsSection({
  config,
  business,
  realReviews = [],
}: ReviewsProps) {
  const { content, styles } = config;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Use custom reviews if provided, otherwise use real reviews from DB
  const reviews: Array<CustomReview | BusinessReview> =
    content.customReviews && content.customReviews.length > 0
      ? content.customReviews
      : realReviews.slice(0, content.maxReviews);

  const variant = styles?.variant ?? 'dark';
  const displayMode = content.displayMode ?? 'carousel';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Autoplay for carousel
  useEffect(() => {
    if (displayMode === 'carousel' && reviews.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 6000);

      return () => {
        if (autoplayRef.current) {
          clearInterval(autoplayRef.current);
        }
      };
    }
  }, [displayMode, reviews.length]);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Get reviewer name from either type
  const getReviewerName = (review: CustomReview | BusinessReview): string => {
    if ('name' in review) return review.name;
    return review.reviewer_name || 'Anonymous';
  };

  // Get review text from either type
  const getReviewText = (review: CustomReview | BusinessReview): string => {
    if ('text' in review) return review.text;
    return review.review_text || '';
  };

  // Get rating from either type
  const getRating = (review: CustomReview | BusinessReview): number => {
    return review.rating;
  };

  const bgClasses = {
    dark: 'bg-[var(--color-primary)]',
    light: 'bg-white',
  };

  const textClasses = {
    dark: 'text-white',
    light: 'text-[var(--color-primary)]',
  };

  if (reviews.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`relative py-20 lg:py-28 ${bgClasses[variant]} overflow-hidden`}
      data-section-id={config.id}
      data-section-type={config.type}
    >
      {/* Background decorations */}
      {variant === 'dark' && (
        <>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-[var(--color-accent)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2
            className={`font-display text-4xl md:text-5xl font-bold mb-4 ${textClasses[variant]}`}
          >
            {content.heading}
          </h2>
          {content.subheading && (
            <p
              className={`text-lg ${variant === 'dark' ? 'text-white/60' : 'text-[var(--color-text-muted)]'}`}
            >
              {content.subheading}
            </p>
          )}

          {/* Google Rating Badge */}
          {content.showGoogleRating &&
            business.google_rating &&
            business.google_reviews_count && (
              <div className="inline-flex items-center gap-3 mt-6 px-5 py-3 rounded-full bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1">
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
                <span className={`font-semibold ${textClasses[variant]}`}>
                  {business.google_rating}
                </span>
                <span
                  className={variant === 'dark' ? 'text-white/60' : 'text-gray-500'}
                >
                  ({business.google_reviews_count} reviews)
                </span>
              </div>
            )}
        </div>

        {/* Carousel Display */}
        {displayMode === 'carousel' && (
          <div className="relative max-w-4xl mx-auto">
            {/* Quote Icon */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <Quote
                className={`w-16 h-16 ${variant === 'dark' ? 'text-[var(--color-accent)]/20' : 'text-[var(--color-accent)]/30'}`}
              />
            </div>

            {/* Review Card */}
            <div
              className={`
                relative p-8 lg:p-12 rounded-3xl
                ${variant === 'dark' ? 'bg-white/5 backdrop-blur-sm' : 'bg-gray-50'}
                transition-all duration-500
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < getRating(reviews[currentIndex])
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <blockquote
                className={`text-xl lg:text-2xl leading-relaxed text-center mb-8 ${textClasses[variant]}`}
              >
                &ldquo;{getReviewText(reviews[currentIndex])}&rdquo;
              </blockquote>

              {/* Reviewer Info */}
              <div className="text-center">
                <p
                  className={`font-semibold text-lg ${textClasses[variant]}`}
                >
                  {getReviewerName(reviews[currentIndex])}
                </p>
                {'location' in reviews[currentIndex] &&
                  reviews[currentIndex].location && (
                    <p
                      className={
                        variant === 'dark' ? 'text-white/50' : 'text-gray-500'
                      }
                    >
                      {(reviews[currentIndex] as CustomReview).location}
                    </p>
                  )}
              </div>
            </div>

            {/* Navigation */}
            {reviews.length > 1 && (
              <>
                <button
                  onClick={prevReview}
                  className={`
                    absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${variant === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}
                    transition-colors duration-300
                  `}
                  aria-label="Previous review"
                >
                  <ChevronLeft className={`w-6 h-6 ${textClasses[variant]}`} />
                </button>
                <button
                  onClick={nextReview}
                  className={`
                    absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${variant === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}
                    transition-colors duration-300
                  `}
                  aria-label="Next review"
                >
                  <ChevronRight className={`w-6 h-6 ${textClasses[variant]}`} />
                </button>

                {/* Dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {reviews.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`
                        w-2 h-2 rounded-full transition-all duration-300
                        ${
                          index === currentIndex
                            ? 'w-8 bg-[var(--color-accent)]'
                            : variant === 'dark'
                            ? 'bg-white/30 hover:bg-white/50'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }
                      `}
                      aria-label={`Go to review ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Grid Display */}
        {displayMode === 'grid' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className={`
                  p-6 rounded-2xl
                  ${variant === 'dark' ? 'bg-white/5' : 'bg-gray-50'}
                  transition-all duration-500
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < getRating(review)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-sm leading-relaxed mb-4 ${
                    variant === 'dark' ? 'text-white/80' : 'text-gray-600'
                  }`}
                >
                  &ldquo;{getReviewText(review)}&rdquo;
                </p>
                <p className={`font-semibold ${textClasses[variant]}`}>
                  {getReviewerName(review)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Google Reviews Link */}
        {content.showGoogleLink && business.google_reviews_link && (
          <div className="text-center mt-12">
            <a
              href={business.google_reviews_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                inline-flex items-center gap-2 px-6 py-3 rounded-full
                ${variant === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                font-medium transition-colors duration-300
              `}
            >
              See All Reviews on Google
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
