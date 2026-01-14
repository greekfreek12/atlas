import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBusinessByTemplateSlug, getMockBusiness } from '@/lib/data';
import { parseTemplateSlug } from '@/lib/utils';
import { getOrCreateSiteConfig, generateDefaultConfig } from '@/lib/site-config';

import { GlobalHeader } from '@/components/GlobalHeader';
import { GlobalFooter } from '@/components/GlobalFooter';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ templateSlug: string }>;
}

// Dynamic metadata with favicon from business logo
export async function generateMetadata({ params }: { params: Promise<{ templateSlug: string }> }): Promise<Metadata> {
  const { templateSlug } = await params;
  const business = await getBusinessByTemplateSlug(templateSlug);

  if (!business) {
    return {};
  }

  return {
    icons: business.logo ? {
      icon: business.logo,
      shortcut: business.logo,
      apple: business.logo,
    } : undefined,
  };
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

  // Get or create site config
  let siteConfig;
  try {
    siteConfig = await getOrCreateSiteConfig(business);
  } catch (error) {
    // Fallback to generated default if database unavailable
    siteConfig = generateDefaultConfig(business);
  }

  // Generate CSS variables from theme
  const themeStyles = {
    '--color-primary': siteConfig.theme.colors.primary,
    '--color-primary-dark': siteConfig.theme.colors.primaryDark,
    '--color-primary-light': siteConfig.theme.colors.primaryLight,
    '--color-accent': siteConfig.theme.colors.accent,
    '--color-accent-hover': siteConfig.theme.colors.accentHover,
    '--color-accent-muted': siteConfig.theme.colors.accentMuted,
    '--color-accent-light': siteConfig.theme.colors.accentLight,
    '--color-background': siteConfig.theme.colors.background,
    '--color-background-alt': siteConfig.theme.colors.backgroundAlt,
    '--color-text': siteConfig.theme.colors.text,
    '--color-text-muted': siteConfig.theme.colors.textMuted,
    '--font-heading': siteConfig.theme.fonts.heading,
    '--font-body': siteConfig.theme.fonts.body,
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        ...themeStyles,
        fontFamily: 'var(--font-body)',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
      }}
    >
      <GlobalHeader
        config={siteConfig.globals.header}
        business={business}
        basePath={basePath}
      />
      <main className="flex-grow">{children}</main>
      <GlobalFooter
        config={siteConfig.globals.footer}
        business={business}
        basePath={basePath}
      />
    </div>
  );
}
