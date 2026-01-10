'use client';

import { Star, ExternalLink, Quote } from 'lucide-react';
import { Business } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';

interface ReviewsProps {
  business: Business;
}

// Mock testimonials - in production these would come from the database
const mockTestimonials = [
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
    text: 'Professional, courteous, and extremely knowledgeable. They went above and beyond to ensure everything was done right. Will definitely use again.',
    rating: 5,
  },
  {
    id: 3,
    name: 'David K.',
    location: 'Property Manager',
    text: 'Finally found a reliable team I can trust. Fair pricing, quality work, and they clean up after themselves. What more could you ask for?',
    rating: 5,
  },
];

export function Reviews({ business }: ReviewsProps) {
  const { google_rating, google_reviews_count, google_reviews_link, name } = business;
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
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Extract short business name for display
  const shortName = name.split(' ').slice(0, 2).join(' ');

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      {/* Background with image treatment */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-primary-dark)]" />

        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Accent glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-[150px] opacity-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--color-secondary)] rounded-full blur-[150px] opacity-10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-14 lg:mb-20 transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Eyebrow */}
          <span className="text-[var(--color-accent-light)] uppercase tracking-[0.2em] text-sm font-medium">
            Client Testimonials
          </span>

          {/* Title */}
          <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-semibold text-white mt-4 mb-5">
            What People Say About {shortName}
          </h2>

          {/* Accent line */}
          <div className="w-16 h-1 mx-auto rounded-full bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
        </div>

        {/* Google Rating Card */}
        {google_rating && google_reviews_count && (
          <div
            className={`max-w-md mx-auto mb-14 lg:mb-16 transform transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            <div className="glass rounded-2xl p-6 text-center border border-white/10">
              {/* Stars */}
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(google_rating)
                        ? 'text-amber-400 fill-amber-400'
                        : i < google_rating
                        ? 'text-amber-400 fill-amber-400/50'
                        : 'text-gray-400'
                    }`}
                  />
                ))}
              </div>

              {/* Rating number */}
              <div className="text-4xl font-display font-bold text-white mb-1">
                {google_rating}
              </div>

              <p className="text-white/60 text-sm mb-4">
                Based on {google_reviews_count} Google reviews
              </p>

              {google_reviews_link && (
                <a
                  href={google_reviews_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--color-accent-light)] hover:text-[var(--color-accent)] font-medium text-sm transition-colors"
                >
                  Read reviews on Google
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {mockTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`transform transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${250 + index * 100}ms` }}
            >
              <div className="group h-full bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 hover:border-[var(--color-accent)]/30 hover:bg-white/10 transition-all duration-500">
                {/* Quote icon */}
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-[var(--color-accent)] opacity-60" />
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-white/80 leading-relaxed mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-auto">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-white/50 text-xs">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
