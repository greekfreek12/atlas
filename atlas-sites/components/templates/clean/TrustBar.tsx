'use client';

import { Shield, Clock, Award, Wrench, ThumbsUp, BadgeCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TrustBarProps {
  businessName: string;
  is24Hours?: boolean;
}

const trustPoints = [
  {
    icon: Shield,
    title: 'Licensed & Insured',
    description: 'Fully certified professionals you can trust',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Emergency service when you need it most',
  },
  {
    icon: ThumbsUp,
    title: 'Satisfaction Guaranteed',
    description: 'We stand behind every job we complete',
  },
];

const trustPointsStandard = [
  {
    icon: Shield,
    title: 'Licensed & Insured',
    description: 'Fully certified professionals you can trust',
  },
  {
    icon: BadgeCheck,
    title: 'Quality Guaranteed',
    description: 'Expert workmanship on every project',
  },
  {
    icon: ThumbsUp,
    title: 'Satisfaction Promised',
    description: 'We stand behind every job we complete',
  },
];

export function TrustBar({ businessName, is24Hours = false }: TrustBarProps) {
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const points = is24Hours ? trustPoints : trustPointsStandard;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-20 bg-primary overflow-hidden"
    >
      {/* Subtle background pattern */}
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Optional tagline */}
        <div className="text-center mb-10 lg:mb-14">
          <p className="text-[var(--color-accent-light)] uppercase tracking-[0.2em] text-sm font-medium">
            Why Choose {businessName.split(' ')[0]}
          </p>
        </div>

        {/* Trust Points Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {points.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className={`
                  group text-center transform transition-all duration-700
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Icon */}
                <div className="relative inline-flex items-center justify-center mb-5">
                  {/* Icon background glow */}
                  <div className="absolute inset-0 rounded-full bg-[var(--color-accent)] opacity-20 blur-xl scale-150 group-hover:opacity-30 transition-opacity duration-500" />

                  {/* Icon circle */}
                  <div className="relative w-16 h-16 rounded-full border-2 border-[var(--color-accent)] flex items-center justify-center group-hover:bg-[var(--color-accent)] transition-all duration-300">
                    <Icon className="w-7 h-7 text-[var(--color-accent)] group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[var(--color-accent-light)] transition-colors duration-300">
                  {point.title}
                </h3>

                {/* Description */}
                <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                  {point.description}
                </p>

                {/* Decorative line */}
                <div className="mt-5 flex justify-center">
                  <div className="w-12 h-0.5 bg-[var(--color-accent)] opacity-30 group-hover:w-20 group-hover:opacity-60 transition-all duration-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accent gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
    </section>
  );
}
