import { TemplateName, WorkingHours } from './types';

/**
 * Parse template-slug format to extract template and slug
 * Example: "clean-marco-plumbing" -> { template: "clean", slug: "marco-plumbing" }
 */
export function parseTemplateSlug(templateSlug: string): {
  template: TemplateName;
  slug: string;
} | null {
  const validTemplates: TemplateName[] = ['industrial', 'clean', 'friendly'];

  for (const template of validTemplates) {
    if (templateSlug.startsWith(`${template}-`)) {
      return {
        template,
        slug: templateSlug.slice(template.length + 1),
      };
    }
  }

  return null;
}

/**
 * Create a URL-friendly slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string | null): string {
  if (!phone) return '';

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Format as +X (XXX) XXX-XXXX for international
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

/**
 * Get phone href for click-to-call
 */
export function getPhoneHref(phone: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return `tel:+${digits.startsWith('1') ? '' : '1'}${digits}`;
}

/**
 * Format working hours for display
 */
export function formatWorkingHours(hours: WorkingHours | null): string[] {
  if (!hours) return [];

  const days: (keyof WorkingHours)[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  return days
    .map((day) => {
      const value = hours[day];
      if (!value || value === 'Closed') {
        return `${day}: Closed`;
      }
      return `${day}: ${value}`;
    })
    .filter(Boolean);
}

/**
 * Check if business is currently open
 */
export function isCurrentlyOpen(hours: WorkingHours | null): boolean | null {
  if (!hours) return null;

  const now = new Date();
  const days: (keyof WorkingHours)[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const today = days[now.getDay()];
  const todayHours = hours[today];

  if (!todayHours || todayHours === 'Closed') {
    return false;
  }

  if (todayHours === 'Open 24 hours') {
    return true;
  }

  // Parse hours like "8AM-5PM"
  const match = todayHours.match(/(\d+)(AM|PM)-(\d+)(AM|PM)/i);
  if (!match) return null;

  const [, openHour, openPeriod, closeHour, closePeriod] = match;
  let open = parseInt(openHour);
  let close = parseInt(closeHour);

  if (openPeriod.toUpperCase() === 'PM' && open !== 12) open += 12;
  if (closePeriod.toUpperCase() === 'PM' && close !== 12) close += 12;
  if (openPeriod.toUpperCase() === 'AM' && open === 12) open = 0;
  if (closePeriod.toUpperCase() === 'AM' && close === 12) close = 0;

  const currentHour = now.getHours();
  return currentHour >= open && currentHour < close;
}

/**
 * Get default headline for business
 */
export function getDefaultHeadline(businessName: string): string {
  return `${businessName} - Your Trusted Local Plumber`;
}

/**
 * Get default tagline for business
 */
export function getDefaultTagline(city: string | null, state: string | null): string {
  if (city && state) {
    return `Proudly serving ${city} and surrounding areas`;
  }
  if (city) {
    return `Proudly serving ${city} and surrounding areas`;
  }
  return 'Professional plumbing services you can trust';
}

/**
 * Get default about text for business
 */
export function getDefaultAbout(
  businessName: string,
  city: string | null,
  state: string | null
): string {
  const location = city && state ? `${city} and the surrounding ${state} area` : 'our community';

  return `${businessName} has been proudly serving ${location} with professional plumbing services. Our experienced team is committed to providing reliable, high-quality work at fair prices.

We understand that plumbing issues can be stressful, which is why we focus on clear communication, honest pricing, and getting the job done right the first time. Whether you need a simple repair or a complete installation, we're here to help.

Licensed, insured, and dedicated to customer satisfaction – that's the ${businessName} difference.`;
}

/**
 * Generate star rating display
 */
export function generateStars(rating: number | null): string {
  if (!rating) return '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Check if business operates 24/7 based on working hours
 */
export function is24Hours(hours: WorkingHours | null): boolean {
  if (!hours) return false;

  const days: (keyof WorkingHours)[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Check if all days are "Open 24 hours"
  return days.every(day => {
    const value = hours[day];
    return value && value.toLowerCase().includes('24 hour');
  });
}

/**
 * Check if business has meaningful reviews (worth displaying)
 */
export function hasSignificantReviews(rating: number | null, count: number | null): boolean {
  // Only show reviews if they have at least 5 reviews and a rating
  return rating !== null && count !== null && count >= 5;
}

/**
 * Check if rating is strong enough to feature prominently
 */
export function hasStrongRating(rating: number | null, count: number | null): boolean {
  // Feature prominently if 4.5+ with 10+ reviews, or 4.0+ with 20+ reviews
  if (!rating || !count) return false;
  return (rating >= 4.5 && count >= 10) || (rating >= 4.0 && count >= 20);
}

/**
 * Service image mapping - curated stock photos per service type
 */
// Generated service images (2 per service type)
export const SERVICE_IMAGES: Record<string, string[]> = {
  'emergency-plumbing': ['/images/services/emergency-plumbing-1.jpg', '/images/services/emergency-plumbing-2.jpg'],
  'drain-cleaning': ['/images/services/drain-cleaning-1.jpg', '/images/services/drain-cleaning-2.jpg'],
  'water-heater-services': ['/images/services/water-heater-services-1.jpg', '/images/services/water-heater-services-2.jpg'],
  'leak-detection-repair': ['/images/services/leak-detection-1.jpg', '/images/services/leak-detection-2.jpg'],
  'fixture-installation': ['/images/services/fixture-installation-1.jpg', '/images/services/fixture-installation-2.jpg'],
  'pipe-repair-replacement': ['/images/services/pipe-repair-1.jpg', '/images/services/pipe-repair-2.jpg'],
  'sewer-line-services': ['/images/services/sewer-line-services-1.jpg', '/images/services/sewer-line-services-2.jpg'],
  'water-treatment': ['/images/services/water-treatment-1.jpg', '/images/services/water-treatment-2.jpg'],
  'default': ['/images/services/emergency-plumbing-1.jpg'],
};

/**
 * Get stock image URL for a service
 * Returns the first image by default, or a specific index if provided
 */
export function getServiceImage(serviceName: string, index: number = 0): string {
  const slug = slugify(serviceName);
  const images = SERVICE_IMAGES[slug] || SERVICE_IMAGES['default'];
  return images[index % images.length];
}

/**
 * Get all images for a service
 */
export function getServiceImages(serviceName: string): string[] {
  const slug = slugify(serviceName);
  return SERVICE_IMAGES[slug] || SERVICE_IMAGES['default'];
}
