import { NextResponse } from 'next/server';
import { getAvailableSectionTypes, getAllSectionMetadata } from '@/lib/site-config/registry';
import {
  createDefaultHeroSection,
  createDefaultTrustBarSection,
  createDefaultServicesSection,
  createDefaultReviewsSection,
  createDefaultCtaSection,
  createDefaultContactFormSection,
} from '@/lib/site-config/defaults';
import { SectionType } from '@/lib/site-config/types';

// Mock business for generating default sections
const mockBusiness = {
  id: 'temp',
  slug: 'temp',
  name: 'Your Business',
  city: 'Your City',
  state: 'ST',
  phone: null,
  email: null,
  template: 'plumbing' as const,
  status: 'active' as const,
  is_published: true,
  created_at: '',
  updated_at: '',
  full_address: null,
  street: null,
  postal_code: null,
  latitude: null,
  longitude: null,
  google_rating: null,
  google_reviews_count: null,
  google_reviews_link: null,
  google_place_id: null,
  working_hours: null,
  facebook: null,
  instagram: null,
  youtube: null,
  logo: null,
  custom_domain: null,
};

/**
 * GET /admin/api/site-config/sections
 *
 * Get available section types with metadata and default configs.
 * Used by admin UI for the "Add Section" picker.
 */
export async function GET() {
  try {
    // Get available (implemented) sections
    const available = getAvailableSectionTypes();

    // Get all metadata (including unimplemented)
    const allMetadata = getAllSectionMetadata();

    // Create default section configs for each type
    const defaults: Record<string, unknown> = {};

    const sectionCreators: Record<string, () => unknown> = {
      'hero': () => createDefaultHeroSection(mockBusiness),
      'trust-bar': () => createDefaultTrustBarSection(mockBusiness),
      'services': () => createDefaultServicesSection(mockBusiness),
      'reviews': () => createDefaultReviewsSection(mockBusiness),
      'cta': () => createDefaultCtaSection(mockBusiness),
      'contact-form': () => createDefaultContactFormSection(mockBusiness),
    };

    for (const section of available) {
      const creator = sectionCreators[section.type];
      if (creator) {
        defaults[section.type] = creator();
      }
    }

    return NextResponse.json({
      success: true,
      available: available.map((section) => ({
        ...section,
        isImplemented: true,
      })),
      upcoming: allMetadata
        .filter((m) => !available.find((a) => a.type === m.type))
        .map((m) => ({
          ...m,
          isImplemented: false,
        })),
      defaults,
    });
  } catch (error) {
    console.error('Error fetching section types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section types' },
      { status: 500 }
    );
  }
}
