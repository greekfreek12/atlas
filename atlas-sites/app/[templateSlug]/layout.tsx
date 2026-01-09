import { notFound } from 'next/navigation';
import { getBusinessByTemplateSlug, getMockBusiness } from '@/lib/data';
import { parseTemplateSlug } from '@/lib/utils';

// Import all template headers and footers
import { Header as CleanHeader, Footer as CleanFooter } from '@/components/templates/clean';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ templateSlug: string }>;
}

export default async function TemplateLayout({ children, params }: LayoutProps) {
  const { templateSlug } = await params;
  const parsed = parseTemplateSlug(templateSlug);

  if (!parsed) {
    notFound();
  }

  // Try to fetch from DB, fallback to mock for development
  let business = await getBusinessByTemplateSlug(templateSlug);

  if (!business) {
    // Use mock data if DB not available (development)
    if (process.env.NODE_ENV === 'development') {
      business = getMockBusiness();
      business.template = parsed.template;
    } else {
      notFound();
    }
  }

  const basePath = `/${templateSlug}`;
  const { template } = parsed;

  // Render template-specific layout
  switch (template) {
    case 'clean':
      return (
        <div className="min-h-screen flex flex-col">
          <CleanHeader business={business} basePath={basePath} />
          <main className="flex-grow">{children}</main>
          <CleanFooter business={business} basePath={basePath} />
        </div>
      );

    case 'industrial':
      // TODO: Industrial template
      return (
        <div className="min-h-screen flex flex-col bg-[#1a1a1a]">
          <CleanHeader business={business} basePath={basePath} />
          <main className="flex-grow">{children}</main>
          <CleanFooter business={business} basePath={basePath} />
        </div>
      );

    case 'friendly':
      // TODO: Friendly template
      return (
        <div className="min-h-screen flex flex-col bg-[#faf7f2]">
          <CleanHeader business={business} basePath={basePath} />
          <main className="flex-grow">{children}</main>
          <CleanFooter business={business} basePath={basePath} />
        </div>
      );

    default:
      notFound();
  }
}
