'use client';

import {
  CheckCircle, Shield, Star, Award, ThumbsUp,
  Zap, Heart, Users, Phone, Mail, MapPin,
  Clock, Wrench, Home, DollarSign, Check, Droplets, Flame
} from 'lucide-react';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { FeaturesSectionConfig, IconName } from '@/lib/site-config/types';
import { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  'check-circle': CheckCircle,
  'shield': Shield,
  'shield-check': Shield,
  'star': Star,
  'award': Award,
  'thumbs-up': ThumbsUp,
  'zap': Zap,
  'heart': Heart,
  'users': Users,
  'phone': Phone,
  'mail': Mail,
  'map-pin': MapPin,
  'clock': Clock,
  'wrench': Wrench,
  'home': Home,
  'dollar-sign': DollarSign,
  'check': Check,
  'droplets': Droplets,
  'flame': Flame,
};

function getIcon(iconName?: IconName) {
  if (!iconName) return CheckCircle;
  return iconMap[iconName] || CheckCircle;
}

export function FeaturesSection({ config }: SectionComponentProps<FeaturesSectionConfig>) {
  const { content, styles } = config;
  const features = content.features || [];
  const layout = styles?.layout || 'grid';

  return (
    <section
      className="py-16 lg:py-24 bg-[var(--color-background)]"
      data-section-id={config.id}
      data-section-type={config.type}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {content.eyebrow && (
            <span className="text-[var(--color-accent)] font-semibold text-sm uppercase tracking-wider">
              {content.eyebrow}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mt-2">
            {content.heading}
          </h2>
        </div>

        {features.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)]">
            No features added yet.
          </p>
        ) : layout === 'list' ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {features.map((feature) => {
              const Icon = getIcon(feature.icon);
              return (
                <div key={feature.id} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = getIcon(feature.icon);
              return (
                <div
                  key={feature.id}
                  className="p-6 rounded-xl bg-[var(--color-background-alt)] border border-[var(--color-text)]/5"
                >
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--color-text-muted)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
