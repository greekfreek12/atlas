import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBusinessByTemplateSlug, getMockBusiness, getFiveStarReviews } from '@/lib/data';
import { parseTemplateSlug } from '@/lib/utils';
import { getOrCreateSiteConfig, generateDefaultConfig } from '@/lib/site-config';
import { PageRenderer } from '@/components/PageRenderer';
import Tracker from '@/components/templates/Tracker';

// Disable caching to always fetch fresh data from database
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ templateSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { templateSlug } = await params;
  let business = await getBusinessByTemplateSlug(templateSlug);

  if (!business && process.env.NODE_ENV === 'development') {
    business = getMockBusiness();
  }

  if (!business) {
    return { title: 'Not Found' };
  }

  const title = business.city
    ? `${business.name} | Plumber in ${business.city}, ${business.state}`
    : `${business.name} | Professional Plumbing Services`;

  return {
    title,
    description: `${business.name} provides professional plumbing services${business.city ? ` in ${business.city}` : ''}. ${business.phone ? `Call ${business.phone} for` : 'Get'} emergency plumbing, drain cleaning, water heater repair & more.`,
    icons: business.logo ? {
      icon: business.logo,
      shortcut: business.logo,
      apple: business.logo,
    } : undefined,
  };
}

export default async function HomePage({ params }: PageProps) {
  const { templateSlug } = await params;
  const parsed = parseTemplateSlug(templateSlug);

  if (!parsed) {
    notFound();
  }

  let business = await getBusinessByTemplateSlug(templateSlug);

  if (!business) {
    if (process.env.NODE_ENV === 'development') {
      business = getMockBusiness();
      business.template = parsed.template;
    } else {
      notFound();
    }
  }

  const basePath = `/${templateSlug}`;

  // Get or create site config
  let siteConfig;
  try {
    siteConfig = await getOrCreateSiteConfig(business);
    console.log('[page.tsx] Got config from database, version:', (siteConfig as any).version || 'unknown');
  } catch (error) {
    console.error('[page.tsx] ERROR getting config:', error);
    // Fallback to generated default if database unavailable
    siteConfig = generateDefaultConfig(business);
    console.log('[page.tsx] Using fallback default config');
  }

  // Find the home page (slug is empty string)
  const homePage = siteConfig.pages.find((page) => page.slug === '') || siteConfig.pages[0];

  // DEBUG: Log sections being rendered
  console.log('[page.tsx] Business:', business.slug);
  console.log('[page.tsx] Home page sections:', homePage?.sections.map(s => ({ id: s.id, type: s.type, enabled: s.enabled })));

  if (!homePage) {
    notFound();
  }

  // Build JSON-LD structured data for SEO
  // Note: All values are from trusted database sources, not user input
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    name: business.name,
    telephone: business.phone,
    address: business.street ? {
      '@type': 'PostalAddress',
      streetAddress: business.street,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.postal_code,
    } : undefined,
    geo: business.latitude && business.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    } : undefined,
    aggregateRating: business.google_rating && business.google_reviews_count ? {
      '@type': 'AggregateRating',
      ratingValue: business.google_rating,
      reviewCount: business.google_reviews_count,
    } : undefined,
  };

  return (
    <>
      <Tracker businessId={business.id} />
      <PageRenderer
        page={homePage}
        theme={siteConfig.theme}
        business={business}
        basePath={basePath}
      />

      {/* JSON-LD Schema for SEO - data is from trusted database source */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
