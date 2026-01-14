/**
 * Section Components Registry
 *
 * This file imports all section components and registers them with the
 * section registry. Import this file once at the app level to ensure
 * all sections are available for rendering.
 */

import { registerSection } from '@/lib/site-config/registry';
import {
  HeroSectionConfig,
  TrustBarSectionConfig,
  ServicesSectionConfig,
  ReviewsSectionConfig,
  CtaSectionConfig,
  ContactFormSectionConfig,
  GallerySectionConfig,
  FaqSectionConfig,
  FeaturesSectionConfig,
  TextBlockSectionConfig,
  ServiceAreaSectionConfig,
} from '@/lib/site-config/types';

// Import section components
import { HeroSection } from './HeroSection';
import { TrustBarSection } from './TrustBarSection';
import { ServicesSection } from './ServicesSection';
import { ReviewsSection } from './ReviewsSection';
import { CtaSection } from './CtaSection';
import { ContactFormSection } from './ContactFormSection';
import { GallerySection } from './GallerySection';
import { FaqSection } from './FaqSection';
import { FeaturesSection } from './FeaturesSection';
import { TextBlockSection } from './TextBlockSection';
import { ServiceAreaSection } from './ServiceAreaSection';

// Register all section components
registerSection<HeroSectionConfig>('hero', HeroSection);
registerSection<TrustBarSectionConfig>('trust-bar', TrustBarSection);
registerSection<ServicesSectionConfig>('services', ServicesSection);
registerSection<ReviewsSectionConfig>('reviews', ReviewsSection);
registerSection<CtaSectionConfig>('cta', CtaSection);
registerSection<ContactFormSectionConfig>('contact-form', ContactFormSection);
registerSection<GallerySectionConfig>('gallery', GallerySection);
registerSection<FaqSectionConfig>('faq', FaqSection);
registerSection<FeaturesSectionConfig>('features', FeaturesSection);
registerSection<TextBlockSectionConfig>('text-block', TextBlockSection);
registerSection<ServiceAreaSectionConfig>('service-area', ServiceAreaSection);

// Re-export components for direct imports if needed
export { HeroSection } from './HeroSection';
export { TrustBarSection } from './TrustBarSection';
export { ServicesSection } from './ServicesSection';
export { ReviewsSection } from './ReviewsSection';
export { CtaSection } from './CtaSection';
export { ContactFormSection } from './ContactFormSection';
export { GallerySection } from './GallerySection';
export { FaqSection } from './FaqSection';
export { FeaturesSection } from './FeaturesSection';
export { TextBlockSection } from './TextBlockSection';
export { ServiceAreaSection } from './ServiceAreaSection';
export { GenericSection } from './GenericSection';

// Import generated sections (auto-created by site-agent)
import './generated';
