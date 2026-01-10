import { notFound } from 'next/navigation';
import { getBusinessByTemplateSlug, getMockBusiness } from '@/lib/data';
import { parseTemplateSlug } from '@/lib/utils';

import { Header, Footer } from '@/components/templates/clean';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ templateSlug: string }>;
}

/**
 * Generates CSS custom property overrides for business-specific colors.
 * These variables override the defaults defined in globals.css.
 *
 * To customize a business site, set these fields in the database:
 * - primary_color: Main brand color (headers, titles, footer background)
 * - accent_color: Action color (buttons, links, CTAs)
 *
 * The system will automatically generate darker/lighter variants using CSS color-mix().
 */
function generateColorStyles(primaryColor?: string | null, accentColor?: string | null): React.CSSProperties {
  const styles: Record<string, string> = {};

  if (primaryColor) {
    styles['--color-primary'] = primaryColor;
    // Generate darker variants using CSS color-mix
    styles['--color-primary-dark'] = `color-mix(in srgb, ${primaryColor} 60%, black)`;
    styles['--color-primary-hover'] = `color-mix(in srgb, ${primaryColor} 80%, black)`;
  }

  if (accentColor) {
    styles['--color-accent'] = accentColor;
    styles['--color-accent-hover'] = `color-mix(in srgb, ${accentColor} 80%, black)`;
    styles['--color-accent-light'] = `color-mix(in srgb, ${accentColor} 70%, white)`;
  }

  return styles as React.CSSProperties;
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

  // Generate custom color styles from business settings
  const colorStyles = generateColorStyles(business.primary_color, business.accent_color);

  return (
    <div className="min-h-screen flex flex-col" style={colorStyles}>
      <Header business={business} basePath={basePath} />
      <main className="flex-grow">{children}</main>
      <Footer business={business} basePath={basePath} />
    </div>
  );
}
