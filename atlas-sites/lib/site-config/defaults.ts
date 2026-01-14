/**
 * Default Site Config Generator
 *
 * Generates sensible default configurations for new businesses.
 */

import { Business } from '@/lib/types';
import {
  SiteConfig,
  ThemeConfig,
  PageConfig,
  HeroSectionConfig,
  TrustBarSectionConfig,
  ServicesSectionConfig,
  ReviewsSectionConfig,
  CtaSectionConfig,
  ContactFormSectionConfig,
  ServiceItem,
  TrustPoint,
  FormField,
} from './types';
import { generateId } from './utils';

// =============================================================================
// DEFAULT THEME
// =============================================================================

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: '#1e3a5f',
    primaryDark: '#0f172a',
    primaryLight: '#334e6f',
    accent: '#f59e0b',
    accentHover: '#d97706',
    accentMuted: '#fef3c7',
    accentLight: '#fbbf24',
    background: '#ffffff',
    backgroundAlt: '#f8fafc',
    text: '#1f2937',
    textMuted: '#6b7280',
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Inter',
  },
  borderRadius: 'lg',
};

// =============================================================================
// DEFAULT SECTIONS
// =============================================================================

export function createDefaultHeroSection(business: Business): HeroSectionConfig {
  const headline = business.city
    ? `Your Trusted Plumber in ${business.city}`
    : 'Professional Plumbing Services';

  return {
    id: generateId(),
    type: 'hero',
    enabled: true,
    content: {
      headline,
      tagline: 'Fast, reliable service when you need it most. Licensed professionals ready to help 24/7.',
      backgroundImage: {
        src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=2000&q=80',
        alt: 'Professional plumbing services',
      },
      primaryCta: {
        text: 'Call Now',
        action: 'phone',
        variant: 'primary',
      },
      secondaryCta: {
        text: 'Get a Free Quote',
        action: 'link',
        target: '/contact',
        variant: 'secondary',
      },
      trustBadges: ['Licensed & Insured', 'Same-Day Service', 'Upfront Pricing'],
      showRating: true,
    },
    styles: {
      overlayOpacity: 70,
      textAlignment: 'left',
      minHeight: 'large',
    },
  };
}

export function createDefaultTrustBarSection(business: Business): TrustBarSectionConfig {
  const trustPoints: TrustPoint[] = [
    {
      id: generateId(),
      icon: 'home',
      title: 'Local & Family Owned',
      description: "We're your neighbors, treating every home like our own.",
    },
    {
      id: generateId(),
      icon: 'shield-check',
      title: 'Licensed & Insured',
      description: 'Fully licensed, bonded, and insured for your protection.',
    },
    {
      id: generateId(),
      icon: 'dollar-sign',
      title: 'No Hidden Fees',
      description: 'Honest, transparent pricing. Know the cost before we start.',
    },
  ];

  return {
    id: generateId(),
    type: 'trust-bar',
    enabled: true,
    content: {
      heading: `Why Choose ${business.name}`,
      points: trustPoints,
    },
    styles: {
      variant: 'light',
      layout: 'horizontal',
      paddingY: 'lg',
    },
  };
}

export function createDefaultServicesSection(business: Business): ServicesSectionConfig {
  const services: ServiceItem[] = [
    {
      id: generateId(),
      name: 'Emergency Plumbing',
      description: 'Available 24/7 for burst pipes, severe leaks, and plumbing emergencies. Fast response when you need it most.',
      icon: 'alert-triangle',
      image: {
        src: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
        alt: 'Emergency plumbing services',
      },
      link: '/services/emergency-plumbing',
    },
    {
      id: generateId(),
      name: 'Drain Cleaning',
      description: 'Professional drain cleaning for clogged sinks, showers, and main sewer lines. We clear the toughest blockages.',
      icon: 'droplets',
      image: {
        src: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
        alt: 'Drain cleaning services',
      },
      link: '/services/drain-cleaning',
    },
    {
      id: generateId(),
      name: 'Water Heater Services',
      description: 'Installation, repair, and maintenance for tank and tankless water heaters. Hot water when you need it.',
      icon: 'flame',
      image: {
        src: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
        alt: 'Water heater services',
      },
      link: '/services/water-heater',
    },
    {
      id: generateId(),
      name: 'Leak Detection',
      description: 'Advanced leak detection to find hidden leaks before they cause major damage. Expert repairs that last.',
      icon: 'search',
      image: {
        src: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
        alt: 'Leak detection services',
      },
      link: '/services/leak-detection',
    },
    {
      id: generateId(),
      name: 'Fixture Installation',
      description: 'Professional installation of faucets, toilets, sinks, and showers. Quality workmanship guaranteed.',
      icon: 'wrench',
      image: {
        src: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
        alt: 'Fixture installation services',
      },
      link: '/services/fixture-installation',
    },
    {
      id: generateId(),
      name: 'Pipe Repair',
      description: 'From minor pipe repairs to complete repiping. We work with all pipe materials and sizes.',
      icon: 'cylinder',
      image: {
        src: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
        alt: 'Pipe repair services',
      },
      link: '/services/pipe-repair',
    },
  ];

  return {
    id: generateId(),
    type: 'services',
    enabled: true,
    content: {
      eyebrow: 'What We Do',
      heading: 'Our Services',
      subheading: 'Professional plumbing solutions for your home or business',
      services,
      showViewAll: false,
    },
    styles: {
      columns: 3,
      cardStyle: 'elevated',
      paddingY: 'xl',
    },
  };
}

export function createDefaultReviewsSection(business: Business): ReviewsSectionConfig {
  return {
    id: generateId(),
    type: 'reviews',
    enabled: true,
    content: {
      heading: 'What Our Customers Say',
      subheading: 'Real reviews from real customers',
      showGoogleRating: true,
      showGoogleLink: true,
      displayMode: 'carousel',
      maxReviews: 5,
      customReviews: [], // Will use database reviews
    },
    styles: {
      variant: 'dark',
      paddingY: 'xl',
    },
  };
}

export function createDefaultCtaSection(business: Business): CtaSectionConfig {
  return {
    id: generateId(),
    type: 'cta',
    enabled: true,
    content: {
      heading: 'Ready to Get Started?',
      subheading: 'Call now for fast, reliable plumbing service',
      primaryCta: {
        text: 'Call Now',
        action: 'phone',
        variant: 'primary',
      },
      secondaryCta: {
        text: 'Request a Quote',
        action: 'link',
        target: '/contact',
        variant: 'outline',
      },
    },
    styles: {
      variant: 'banner',
      backgroundColor: '#1e3a5f',
      paddingY: 'lg',
    },
  };
}

export function createDefaultContactFormSection(business: Business): ContactFormSectionConfig {
  const fields: FormField[] = [
    {
      id: generateId(),
      type: 'text',
      name: 'name',
      label: 'Your Name',
      placeholder: 'John Smith',
      required: true,
    },
    {
      id: generateId(),
      type: 'phone',
      name: 'phone',
      label: 'Phone Number',
      placeholder: '(555) 123-4567',
      required: true,
    },
    {
      id: generateId(),
      type: 'email',
      name: 'email',
      label: 'Email Address',
      placeholder: 'john@example.com',
      required: false,
    },
    {
      id: generateId(),
      type: 'textarea',
      name: 'message',
      label: 'How Can We Help?',
      placeholder: 'Describe your plumbing issue...',
      required: false,
    },
  ];

  return {
    id: generateId(),
    type: 'contact-form',
    enabled: true,
    content: {
      heading: 'Get a Free Quote',
      subheading: "Fill out the form below and we'll get back to you shortly",
      fields,
      submitButtonText: 'Send Message',
      successMessage: "Thanks for reaching out! We'll contact you soon.",
    },
    styles: {
      paddingY: 'xl',
    },
  };
}

// =============================================================================
// DEFAULT PAGES
// =============================================================================

export function createDefaultHomePage(business: Business): PageConfig {
  const title = business.city
    ? `${business.name} | Plumber in ${business.city}, ${business.state}`
    : `${business.name} | Professional Plumbing Services`;

  const description = business.city
    ? `${business.name} provides professional plumbing services in ${business.city}. Call for emergency plumbing, drain cleaning, water heater repair & more.`
    : `${business.name} provides professional plumbing services. Call for emergency plumbing, drain cleaning, water heater repair & more.`;

  return {
    id: generateId(),
    slug: '',
    title,
    description,
    sections: [
      createDefaultHeroSection(business),
      createDefaultTrustBarSection(business),
      createDefaultServicesSection(business),
      createDefaultReviewsSection(business),
      createDefaultCtaSection(business),
    ],
  };
}

export function createDefaultAboutPage(business: Business): PageConfig {
  return {
    id: generateId(),
    slug: 'about',
    title: `About | ${business.name}`,
    description: `Learn about ${business.name}${business.city ? `, serving ${business.city} and surrounding areas` : ''}. Professional plumbing services you can trust.`,
    sections: [
      {
        id: generateId(),
        type: 'hero',
        enabled: true,
        content: {
          headline: `About ${business.name}`,
          tagline: business.city
            ? `Serving ${business.city}, ${business.state} and surrounding areas`
            : 'Professional plumbing services you can trust',
          backgroundImage: {
            src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=2000&q=80',
            alt: 'About us',
          },
          primaryCta: {
            text: 'Contact Us',
            action: 'link',
            target: '/contact',
            variant: 'primary',
          },
          trustBadges: [],
          showRating: false,
        },
        styles: {
          minHeight: 'small',
          textAlignment: 'center',
          overlayOpacity: 80,
        },
      } as HeroSectionConfig,
      createDefaultCtaSection(business),
    ],
  };
}

export function createDefaultContactPage(business: Business): PageConfig {
  return {
    id: generateId(),
    slug: 'contact',
    title: `Contact | ${business.name}`,
    description: `Contact ${business.name} for professional plumbing services. ${business.phone ? `Call ${business.phone}` : 'Get in touch'} for a free quote.`,
    sections: [
      {
        id: generateId(),
        type: 'hero',
        enabled: true,
        content: {
          headline: 'Contact Us',
          tagline: "We're here to help with all your plumbing needs",
          backgroundImage: {
            src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=2000&q=80',
            alt: 'Contact us',
          },
          primaryCta: {
            text: 'Call Now',
            action: 'phone',
            variant: 'primary',
          },
          trustBadges: [],
          showRating: false,
        },
        styles: {
          minHeight: 'small',
          textAlignment: 'center',
          overlayOpacity: 80,
        },
      } as HeroSectionConfig,
      createDefaultContactFormSection(business),
    ],
  };
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

/**
 * Generate a complete default site config for a business
 */
export function generateDefaultConfig(business: Business): SiteConfig {
  return {
    version: 1,
    theme: { ...DEFAULT_THEME },
    pages: [
      createDefaultHomePage(business),
      createDefaultAboutPage(business),
      createDefaultContactPage(business),
    ],
    globals: {
      header: {
        variant: 'standard',
        showLogo: true,
        showPhone: true,
        navigation: [
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
        ctaButton: {
          text: 'Call Now',
          action: 'phone',
          variant: 'primary',
        },
      },
      footer: {
        variant: 'standard',
        columns: [
          {
            title: 'Quick Links',
            type: 'links',
            links: [
              { label: 'Home', href: '/' },
              { label: 'Services', href: '/services' },
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
            ],
          },
          { title: 'Contact', type: 'contact' },
          { title: 'Hours', type: 'hours' },
        ],
        showSocialLinks: true,
        bottomText: `© ${new Date().getFullYear()} ${business.name}. All rights reserved.`,
      },
    },
  };
}
