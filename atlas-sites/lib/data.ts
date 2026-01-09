import { createServerClient } from './supabase';
import { Business, Service, BusinessWithServices, TemplateName } from './types';
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

  // Fetch services for this business
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', business.id)
    .order('sort_order', { ascending: true });

  if (servicesError) {
    console.error('Error fetching services:', servicesError);
  }

  return {
    ...business,
    // Override template with the one from URL (allows showing same business in different templates)
    template: template as TemplateName,
    services: (services || []) as Service[],
  } as BusinessWithServices;
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
 * Get services for a business
 */
export async function getServicesForBusiness(
  businessId: string
): Promise<Service[]> {
  const supabase = createServerClient();

  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }

  return (services || []) as Service[];
}

/**
 * Get all template-slug combinations for static generation
 */
export async function getAllTemplateSlugPaths(): Promise<string[]> {
  const businesses = await getAllBusinesses();
  const templates: TemplateName[] = ['industrial', 'clean', 'friendly'];

  // Generate paths for each business with their assigned template
  return businesses.map((b) => `${b.template}-${b.slug}`);
}

/**
 * Mock data for development/preview when DB is not available
 */
export function getMockBusiness(): BusinessWithServices {
  return {
    id: 'mock-id',
    slug: 'marco-plumbing',
    template: 'clean',
    niche_id: null,  // Will be set when plumber niche is created
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
    facebook_url: null,
    instagram_url: null,
    youtube_url: null,
    custom_headline: null,
    custom_tagline: null,
    custom_about: null,
    primary_color: null,
    accent_color: null,
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
