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
    title: `Contact | ${business.name}`,
    description: `Contact ${business.name} for professional plumbing services. ${business.phone ? `Call ${business.phone}` : 'Get in touch'} for a free quote.`,
  };
}

export default async function ContactPage({ params }: PageProps) {
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

  // Find the contact page
  const contactPage = siteConfig.pages.find((page) => page.slug === 'contact');

  if (!contactPage) {
    notFound();
  }

  return (
    <PageRenderer
      page={contactPage}
      theme={siteConfig.theme}
      business={business}
      basePath={basePath}
    />
  );
}
