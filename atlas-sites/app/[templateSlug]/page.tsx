import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBusinessByTemplateSlug, getMockBusiness } from '@/lib/data';
import { parseTemplateSlug, hasSignificantReviews } from '@/lib/utils';

// Clean template components
import {
  Hero as CleanHero,
  Services as CleanServices,
  Reviews as CleanReviews,
  Footer as CleanFooter,
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

  // Render template-specific home page
  return (
    <>
      <CleanHero business={business} basePath={basePath} />
      <CleanServices services={business.services} basePath={basePath} />
      {showReviews && <CleanReviews business={business} />}

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />
    </>
  );
}
