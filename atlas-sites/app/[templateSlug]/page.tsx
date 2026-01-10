import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBusinessByTemplateSlug, getMockBusiness } from '@/lib/data';
import { parseTemplateSlug, hasSignificantReviews, is24Hours } from '@/lib/utils';

// Clean template components
import {
  Hero as CleanHero,
  TrustBar as CleanTrustBar,
  Services as CleanServices,
  Reviews as CleanReviews,
} from '@/components/templates/clean';

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
  const showReviews = hasSignificantReviews(business.google_rating, business.google_reviews_count);
  const isOpen24 = is24Hours(business.working_hours);

  // Build JSON-LD structured data for SEO (all values are from trusted database, not user input)
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

  // Render template-specific home page
  return (
    <>
      <CleanHero business={business} basePath={basePath} />
      <CleanTrustBar businessName={business.name} is24Hours={isOpen24} />
      <CleanServices services={business.services} basePath={basePath} businessName={business.name} />
      {showReviews && <CleanReviews business={business} />}

      {/* JSON-LD Schema for SEO - data is from trusted database source */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
