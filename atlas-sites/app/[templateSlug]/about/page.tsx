import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBusinessByTemplateSlug, getMockBusiness } from '@/lib/data';
import { parseTemplateSlug } from '@/lib/utils';
import { getOrCreateSiteConfig, generateDefaultConfig } from '@/lib/site-config';
import { PageRenderer } from '@/components/PageRenderer';

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

  return {
    title: `About | ${business.name}`,
    description: `Learn about ${business.name}${business.city ? `, serving ${business.city} and surrounding areas` : ''}. Professional plumbing services you can trust.`,
  };
}

export default async function AboutPage({ params }: PageProps) {
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
  } catch (error) {
    // Fallback to generated default if database unavailable
    siteConfig = generateDefaultConfig(business);
  }

  // Find the about page
  const aboutPage = siteConfig.pages.find((page) => page.slug === 'about');

  if (!aboutPage) {
    notFound();
  }

  return (
    <PageRenderer
      page={aboutPage}
      theme={siteConfig.theme}
      business={business}
      basePath={basePath}
    />
  );
}
