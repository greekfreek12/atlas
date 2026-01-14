import { createServerClient } from './supabase';
import { Business, BusinessWithServices, BusinessReview, TemplateName } from './types';
import { parseTemplateSlug } from './utils';

/**
 * Get a business by its template-slug combination
 */
export async function getBusinessByTemplateSlug(
  templateSlug: string
): Promise<BusinessWithServices | null> {
  const parsed = parseTemplateSlug(templateSlug);
  if (!parsed) return null;

  const { template, slug } = parsed;
  const supabase = createServerClient();

  // Fetch business
  const { data: businessData, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (businessError || !businessData) {
    console.error('Error fetching business:', businessError);
    return null;
  }

  const business = businessData as unknown as Business;

  // Hardcoded plumbing services (same as used in Services component)
  const services = [
    {
      id: '1',
      business_id: business.id,
      name: 'Emergency Plumbing',
      description: 'Available 24/7 for burst pipes, severe leaks, and plumbing emergencies. Fast response when you need it most.',
      icon: 'alert-triangle',
      sort_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      business_id: business.id,
      name: 'Drain Cleaning',
      description: 'Professional drain cleaning for clogged sinks, showers, and main sewer lines. We clear the toughest blockages.',
      icon: 'droplets',
      sort_order: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      business_id: business.id,
      name: 'Water Heater Services',
      description: 'Installation, repair, and maintenance for tank and tankless water heaters. Hot water when you need it.',
      icon: 'flame',
      sort_order: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      business_id: business.id,
      name: 'Leak Detection & Repair',
      description: 'Advanced leak detection to find hidden leaks before they cause major damage. Expert repairs that last.',
      icon: 'search',
      sort_order: 4,
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      business_id: business.id,
      name: 'Fixture Installation',
      description: 'Professional installation of faucets, toilets, sinks, and showers. Quality workmanship guaranteed.',
      icon: 'wrench',
      sort_order: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: '6',
      business_id: business.id,
      name: 'Pipe Repair & Replacement',
      description: 'From minor pipe repairs to complete repiping. We work with all pipe materials and sizes.',
      icon: 'cylinder',
      sort_order: 6,
      created_at: new Date().toISOString(),
    },
  ];

  return {
    ...business,
    // Override template with the one from URL (allows showing same business in different templates)
    template: template as TemplateName,
    services,
  } as BusinessWithServices;
}

/**
 * Minimum character length for a "substantial" review
 * Reviews shorter than this will only be used if we don't have enough longer ones
 */
const MIN_SUBSTANTIAL_REVIEW_LENGTH = 80; // roughly 15-20 words

/**
 * Get 5-star reviews with text for a business (for displaying on site)
 * Prioritizes reviews with more substantial text content
 */
export async function getFiveStarReviews(
  businessId: string,
  limit: number = 5
): Promise<BusinessReview[]> {
  const supabase = createServerClient();

  // Fetch more reviews than we need so we can filter/sort by quality
  const { data, error } = await supabase
    .from('business_reviews')
    .select('*')
    .eq('business_id', businessId)
    .eq('rating', 5)
    .not('review_text', 'is', null)
    .order('published_at', { ascending: false })
    .limit(20); // Fetch extra to allow for quality filtering

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Cast to BusinessReview[] for type safety
  const reviews = data as unknown as BusinessReview[];

  // Separate into substantial and short reviews
  const substantialReviews = reviews.filter(
    (r) => r.review_text && r.review_text.length >= MIN_SUBSTANTIAL_REVIEW_LENGTH
  );
  const shortReviews = reviews.filter(
    (r) => r.review_text && r.review_text.length < MIN_SUBSTANTIAL_REVIEW_LENGTH
  );

  // Sort substantial reviews by length (longest first) to get the best ones
  substantialReviews.sort((a, b) => (b.review_text?.length || 0) - (a.review_text?.length || 0));

  // Take substantial reviews first, then fill with short ones if needed
  const selectedReviews = [
    ...substantialReviews.slice(0, limit),
    ...shortReviews.slice(0, Math.max(0, limit - substantialReviews.length)),
  ].slice(0, limit);

  return selectedReviews;
}

/**
 * Get a business by slug only (without template)
 */
export async function getBusinessBySlug(
  slug: string
): Promise<Business | null> {
  const supabase = createServerClient();

  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !business) {
    return null;
  }

  return business as Business;
}

/**
 * Get all published businesses (for sitemap, etc.)
 */
export async function getAllBusinesses(): Promise<Business[]> {
  const supabase = createServerClient();

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_published', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  return (businesses || []) as Business[];
}

/**
 * Get all template-slug combinations for static generation
 */
export async function getAllTemplateSlugPaths(): Promise<string[]> {
  const businesses = await getAllBusinesses();
  return businesses.map((b) => `${b.template}-${b.slug}`);
}

/**
 * Get reviews for a business
 */
export async function getBusinessReviews(
  businessId: string,
  limit: number = 10
): Promise<BusinessReview[]> {
  const supabase = createServerClient();

  const { data: reviews, error } = await supabase
    .from('business_reviews')
    .select('*')
    .eq('business_id', businessId)
    .gte('rating', 4) // Only show 4+ star reviews
    .not('review_text', 'is', null) // Must have text
    .order('rating', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return (reviews || []) as BusinessReview[];
}

/**
 * Mock reviews for development
 */
export function getMockReviews(): BusinessReview[] {
  return [
    {
      id: '1',
      business_id: 'mock-id',
      review_id: 'review-1',
      reviewer_name: 'Michael R.',
      reviewer_link: null,
      is_local_guide: true,
      reviewer_reviews_count: 45,
      reviewer_photos_count: 12,
      rating: 5,
      review_text: 'Outstanding service from start to finish. They arrived on time, explained everything clearly, and fixed our leak quickly. Highly recommend for any plumbing needs!',
      review_date: '2 months ago',
      published_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      photos: null,
      source_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      business_id: 'mock-id',
      review_id: 'review-2',
      reviewer_name: 'Sarah T.',
      reviewer_link: null,
      is_local_guide: false,
      reviewer_reviews_count: 23,
      reviewer_photos_count: 5,
      rating: 5,
      review_text: 'Professional, courteous, and extremely knowledgeable. They went above and beyond to ensure everything was done right. Will definitely use them again.',
      review_date: '1 month ago',
      published_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      photos: null,
      source_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      business_id: 'mock-id',
      review_id: 'review-3',
      reviewer_name: 'David K.',
      reviewer_link: null,
      is_local_guide: true,
      reviewer_reviews_count: 78,
      reviewer_photos_count: 34,
      rating: 5,
      review_text: 'Called for an emergency leak at 10pm and they were here within the hour. Saved us from major water damage. Fair pricing and excellent work.',
      review_date: '3 weeks ago',
      published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      photos: null,
      source_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      business_id: 'mock-id',
      review_id: 'review-4',
      reviewer_name: 'Jennifer L.',
      reviewer_link: null,
      is_local_guide: false,
      reviewer_reviews_count: 12,
      reviewer_photos_count: 3,
      rating: 5,
      review_text: 'Finally found a reliable plumber I can trust! They diagnosed the issue quickly and the repair has held up perfectly. Great communication throughout.',
      review_date: '2 weeks ago',
      published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      photos: null,
      source_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

/**
 * Mock data for development/preview when DB is not available
 */
export function getMockBusiness(): BusinessWithServices {
  return {
    id: 'mock-id',
    slug: 'marco-plumbing',
    template: 'plumbing',
    name: 'Marco Plumbing',
    phone: '+1 239-529-5397',
    email: 'info@marcoplumbing.com',
    full_address: '3887 Mannix Dr STE 624, Naples, FL 34114',
    street: '3887 Mannix Dr STE 624',
    city: 'Naples',
    state: 'Florida',
    postal_code: '34114',
    latitude: 26.1553385,
    longitude: -81.678438,
    google_rating: 4.4,
    google_reviews_count: 60,
    google_reviews_link: 'https://search.google.com/local/reviews?placeid=ChIJdy-qEzIf24gRSudNPyE4b24',
    google_place_id: 'ChIJdy-qEzIf24gRSudNPyE4b24',
    working_hours: {
      Monday: 'Open 24 hours',
      Tuesday: 'Open 24 hours',
      Wednesday: 'Open 24 hours',
      Thursday: 'Open 24 hours',
      Friday: 'Open 24 hours',
      Saturday: 'Open 24 hours',
      Sunday: 'Open 24 hours',
    },
    facebook: null,
    instagram: null,
    youtube: null,
    logo: null,
    custom_domain: null,
    status: 'prospect',
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    services: [
      {
        id: '1',
        business_id: 'mock-id',
        name: 'Emergency Plumbing',
        description: 'Available 24/7 for burst pipes, severe leaks, and plumbing emergencies. Fast response when you need it most.',
        icon: 'alert-triangle',
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        business_id: 'mock-id',
        name: 'Drain Cleaning',
        description: 'Professional drain cleaning for clogged sinks, showers, and main sewer lines. We clear the toughest blockages.',
        icon: 'droplets',
        sort_order: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        business_id: 'mock-id',
        name: 'Water Heater Services',
        description: 'Installation, repair, and maintenance for tank and tankless water heaters. Hot water when you need it.',
        icon: 'flame',
        sort_order: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: '4',
        business_id: 'mock-id',
        name: 'Leak Detection & Repair',
        description: 'Advanced leak detection to find hidden leaks before they cause major damage. Expert repairs that last.',
        icon: 'search',
        sort_order: 4,
        created_at: new Date().toISOString(),
      },
      {
        id: '5',
        business_id: 'mock-id',
        name: 'Fixture Installation',
        description: 'Professional installation of faucets, toilets, sinks, and showers. Quality workmanship guaranteed.',
        icon: 'wrench',
        sort_order: 5,
        created_at: new Date().toISOString(),
      },
      {
        id: '6',
        business_id: 'mock-id',
        name: 'Pipe Repair & Replacement',
        description: 'From minor pipe repairs to complete repiping. We work with all pipe materials and sizes.',
        icon: 'cylinder',
        sort_order: 6,
        created_at: new Date().toISOString(),
      },
    ],
  };
}
