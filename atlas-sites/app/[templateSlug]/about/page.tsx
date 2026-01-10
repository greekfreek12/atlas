import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { getBusinessByTemplateSlug, getMockBusiness } from '@/lib/data';
import { parseTemplateSlug, getDefaultAbout, formatPhone, getPhoneHref, is24Hours } from '@/lib/utils';

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
  const aboutText = business.custom_about || getDefaultAbout(business.name, business.city, business.state);
  const isOpen24 = is24Hours(business.working_hours);

  return (
    <>
      {/* Hero */}
      <section className="bg-primary py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-['Playfair_Display'] text-3xl lg:text-4xl font-semibold text-white mb-4">
            About {business.name}
          </h1>
          {business.city && business.state && (
            <p className="text-white/70 text-lg">
              Serving {business.city}, {business.state} and surrounding areas
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none">
                {aboutText.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Service Area */}
              {business.city && (
                <div className="mt-12 p-6 bg-background-alt rounded-xl">
                  <h2 className="font-semibold text-primary mb-3">Service Area</h2>
                  <p className="text-gray-600">
                    We proudly serve {business.city}, {business.state} and the surrounding communities.
                    {isOpen24 && ' Emergency services available 24/7.'}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background-alt rounded-xl p-6 lg:p-8 sticky top-24">
                <h3 className="font-semibold text-primary mb-4">
                  Get in Touch
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Have questions? We&apos;re here to help.
                </p>

                {business.phone && (
                  <a
                    href={getPhoneHref(business.phone)}
                    className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-hover text-white font-medium py-3 px-4 rounded-lg transition-colors mb-3"
                  >
                    <Phone className="w-4 h-4" />
                    {formatPhone(business.phone)}
                  </a>
                )}

                <Link
                  href={`${basePath}/contact`}
                  className="block text-center w-full border border-primary text-primary hover:bg-primary hover:text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
