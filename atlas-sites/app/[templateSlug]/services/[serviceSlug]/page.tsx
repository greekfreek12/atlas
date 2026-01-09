import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Clock, Shield, Award, ChevronRight, MapPin } from 'lucide-react';
import { getBusinessByTemplateSlug, getMockBusiness } from '@/lib/data';
import { parseTemplateSlug, slugify, getServiceImage, formatPhone, getPhoneHref, is24Hours, hasStrongRating } from '@/lib/utils';
import { ServiceQuoteForm } from '@/components/templates/clean/ServiceQuoteForm';

interface PageProps {
  params: Promise<{ templateSlug: string; serviceSlug: string }>;
}

// Service-specific content based on service type
const SERVICE_CONTENT: Record<string, {
  benefits: string[];
  process: { step: string; description: string }[];
  faqs: { q: string; a: string }[];
}> = {
  'emergency-plumbing': {
    benefits: [
      'Rapid response times - typically within 60 minutes',
      'Available around the clock, including holidays',
      'Fully stocked trucks for most same-day repairs',
      'Transparent pricing before work begins'
    ],
    process: [
      { step: 'Call us anytime', description: 'Our emergency line is staffed 24/7 by real people, not machines.' },
      { step: 'Fast dispatch', description: 'We dispatch the nearest available technician to your location.' },
      { step: 'Assessment & quote', description: 'We diagnose the problem and provide upfront pricing.' },
      { step: 'Immediate repair', description: 'Most emergencies are resolved in a single visit.' }
    ],
    faqs: [
      { q: 'What counts as a plumbing emergency?', a: 'Burst pipes, severe leaks, sewage backups, no water, or flooding are all emergencies requiring immediate attention.' },
      { q: 'Do you charge extra for nights and weekends?', a: 'Our rates are competitive and transparent. We\'ll always quote you before starting work.' },
      { q: 'How quickly can you arrive?', a: 'We aim to arrive within 60 minutes for true emergencies in our service area.' }
    ]
  },
  'drain-cleaning': {
    benefits: [
      'Professional-grade equipment for tough clogs',
      'Camera inspection to identify root causes',
      'Safe for all pipe types and ages',
      'Preventive maintenance plans available'
    ],
    process: [
      { step: 'Initial assessment', description: 'We identify the location and severity of the clog.' },
      { step: 'Camera inspection', description: 'When needed, we use video to see exactly what\'s blocking your drain.' },
      { step: 'Clear the blockage', description: 'Using the right tool for the job - snakes, hydro-jetting, or other methods.' },
      { step: 'Verify flow', description: 'We confirm the drain is flowing properly before we leave.' }
    ],
    faqs: [
      { q: 'Why does my drain keep clogging?', a: 'Recurring clogs often indicate buildup in the pipes, tree root intrusion, or pipe damage that requires professional assessment.' },
      { q: 'Is hydro-jetting safe for old pipes?', a: 'We assess your pipes before recommending hydro-jetting. It\'s safe for most pipes but we\'ll recommend alternatives if needed.' },
      { q: 'How often should drains be cleaned?', a: 'For most homes, annual preventive cleaning keeps drains flowing smoothly and prevents emergencies.' }
    ]
  },
  'water-heater-services': {
    benefits: [
      'Tank and tankless water heater expertise',
      'Energy-efficient upgrade options',
      'Same-day service for most repairs',
      'Extended warranties available'
    ],
    process: [
      { step: 'Diagnosis', description: 'We thoroughly inspect your water heater to identify the issue.' },
      { step: 'Options review', description: 'We explain repair vs. replacement options with honest recommendations.' },
      { step: 'Professional service', description: 'Our licensed technicians perform the work to code.' },
      { step: 'Testing', description: 'We verify proper operation and temperature before completing the job.' }
    ],
    faqs: [
      { q: 'How long do water heaters last?', a: 'Tank water heaters typically last 8-12 years, while tankless units can last 20+ years with proper maintenance.' },
      { q: 'Should I repair or replace my water heater?', a: 'If your unit is over 10 years old or the repair costs more than 50% of replacement, we typically recommend upgrading.' },
      { q: 'What size water heater do I need?', a: 'This depends on your household size and usage patterns. We\'ll help you choose the right capacity.' }
    ]
  },
  'leak-detection-repair': {
    benefits: [
      'Non-invasive electronic detection technology',
      'Pinpoint accuracy saves time and money',
      'Prevents costly water damage',
      'Expert repairs that address root causes'
    ],
    process: [
      { step: 'Initial consultation', description: 'We discuss your concerns and any signs of potential leaks.' },
      { step: 'Electronic detection', description: 'Using advanced equipment, we locate hidden leaks without destroying walls.' },
      { step: 'Detailed report', description: 'We show you exactly where the leak is and explain repair options.' },
      { step: 'Professional repair', description: 'We fix the leak with minimal disruption to your home.' }
    ],
    faqs: [
      { q: 'How do you find hidden leaks?', a: 'We use acoustic listening devices, thermal imaging, and moisture meters to locate leaks without cutting into walls.' },
      { q: 'What are signs of a hidden leak?', a: 'Unexplained high water bills, musty odors, water stains, warm spots on floors, or sounds of running water when nothing is on.' },
      { q: 'Can small leaks cause big problems?', a: 'Yes, even small leaks can lead to mold growth, structural damage, and significantly higher water bills over time.' }
    ]
  },
  'fixture-installation': {
    benefits: [
      'Expert installation of all fixture types',
      'Proper connections prevent future leaks',
      'Wide selection of quality fixtures available',
      'Old fixture removal and disposal included'
    ],
    process: [
      { step: 'Consultation', description: 'We help you choose the right fixtures for your needs and budget.' },
      { step: 'Preparation', description: 'We protect your home and prepare the work area.' },
      { step: 'Installation', description: 'Professional installation with proper connections and sealing.' },
      { step: 'Testing', description: 'We verify everything works perfectly before cleanup.' }
    ],
    faqs: [
      { q: 'Can you install fixtures I purchased?', a: 'Yes, we can install customer-supplied fixtures, though we recommend letting us verify compatibility first.' },
      { q: 'How long does fixture installation take?', a: 'Most single fixture installations take 1-2 hours. Larger projects may take longer.' },
      { q: 'Do you offer fixture recommendations?', a: 'Yes, we can recommend quality fixtures that fit your style and budget.' }
    ]
  },
  'pipe-repair-replacement': {
    benefits: [
      'Experience with all pipe materials',
      'Trenchless repair options available',
      'Long-lasting repairs backed by warranty',
      'Minimal disruption to your property'
    ],
    process: [
      { step: 'Inspection', description: 'We assess the extent of pipe damage and identify the best repair method.' },
      { step: 'Options presentation', description: 'We explain repair vs. replacement options and provide detailed quotes.' },
      { step: 'Professional work', description: 'Our technicians perform repairs using industry-best practices.' },
      { step: 'Quality check', description: 'We pressure test and inspect all work before completion.' }
    ],
    faqs: [
      { q: 'How do I know if my pipes need replacing?', a: 'Signs include frequent leaks, low water pressure, discolored water, or pipes over 50 years old.' },
      { q: 'What is trenchless pipe repair?', a: 'A minimally invasive method that repairs or replaces pipes without extensive digging.' },
      { q: 'How long do new pipes last?', a: 'Modern copper pipes last 50+ years, PEX pipes 40-50 years with proper installation.' }
    ]
  },
  'sewer-line-services': {
    benefits: [
      'Video camera inspection technology',
      'Hydro-jetting for thorough cleaning',
      'Trenchless repair saves your landscaping',
      'Preventive maintenance programs available'
    ],
    process: [
      { step: 'Camera inspection', description: 'We send a camera through your sewer line to see exactly what\'s happening.' },
      { step: 'Diagnosis', description: 'We identify blockages, damage, or root intrusion and explain the situation.' },
      { step: 'Solution', description: 'Whether cleaning, repair, or replacement, we execute the right solution.' },
      { step: 'Verification', description: 'We re-inspect to confirm the problem is fully resolved.' }
    ],
    faqs: [
      { q: 'What causes sewer line problems?', a: 'Tree roots, aging pipes, ground shifting, flushing inappropriate items, or buildup over time.' },
      { q: 'How often should sewer lines be cleaned?', a: 'Every 1-2 years for preventive maintenance, or immediately if you notice slow drains or backups.' },
      { q: 'Is sewer line replacement expensive?', a: 'Trenchless methods are often more affordable than traditional excavation and cause less property damage.' }
    ]
  },
  'water-treatment': {
    benefits: [
      'Custom solutions for your water quality',
      'Improves taste and removes contaminants',
      'Extends life of appliances and plumbing',
      'Professional installation and maintenance'
    ],
    process: [
      { step: 'Water testing', description: 'We analyze your water to identify specific issues and contaminants.' },
      { step: 'System recommendation', description: 'Based on results, we recommend the ideal treatment solution.' },
      { step: 'Professional installation', description: 'We install your system for optimal performance.' },
      { step: 'Ongoing support', description: 'We provide maintenance and filter replacement services.' }
    ],
    faqs: [
      { q: 'Do I need a water softener?', a: 'If you have hard water (mineral buildup on fixtures, dry skin, spotty dishes), a softener can help significantly.' },
      { q: 'What\'s the difference between softeners and filters?', a: 'Softeners remove minerals that cause hardness. Filters remove contaminants like chlorine, sediment, or specific chemicals.' },
      { q: 'How often do filters need replacement?', a: 'Most filters need replacement every 6-12 months depending on usage and water quality.' }
    ]
  },
  'default': {
    benefits: [
      'Licensed and insured professionals',
      'Upfront, transparent pricing',
      'Quality parts and workmanship guarantee',
      'Satisfaction guaranteed on all work'
    ],
    process: [
      { step: 'Contact us', description: 'Call or fill out our form to schedule service.' },
      { step: 'Assessment', description: 'We evaluate the situation and provide a clear quote.' },
      { step: 'Professional service', description: 'Our skilled technicians complete the work efficiently.' },
      { step: 'Follow-up', description: 'We ensure you\'re satisfied with the completed work.' }
    ],
    faqs: [
      { q: 'Are you licensed and insured?', a: 'Yes, we are fully licensed and insured for your protection.' },
      { q: 'Do you offer warranties?', a: 'Yes, we stand behind our work with comprehensive warranties on parts and labor.' },
      { q: 'What areas do you serve?', a: 'We serve the local area and surrounding communities. Contact us to confirm service availability.' }
    ]
  }
};

function getServiceContent(serviceName: string) {
  const slug = slugify(serviceName);
  return SERVICE_CONTENT[slug] || SERVICE_CONTENT['default'];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { templateSlug, serviceSlug } = await params;
  let business = await getBusinessByTemplateSlug(templateSlug);

  if (!business && process.env.NODE_ENV === 'development') {
    business = getMockBusiness();
  }

  if (!business) {
    return { title: 'Not Found' };
  }

  const service = business.services.find(s => slugify(s.name) === serviceSlug);
  if (!service) {
    return { title: 'Service Not Found' };
  }

  return {
    title: `${service.name}${business.city ? ` in ${business.city}` : ''} | ${business.name}`,
    description: `${service.description} Professional ${service.name.toLowerCase()} services from ${business.name}${business.city ? ` serving ${business.city}, ${business.state}` : ''}.`,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { templateSlug, serviceSlug } = await params;
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

  const service = business.services.find(s => slugify(s.name) === serviceSlug);
  if (!service) {
    notFound();
  }

  const basePath = `/${templateSlug}`;
  const imageUrl = getServiceImage(service.name);
  const isOpen24 = is24Hours(business.working_hours);
  const showRating = hasStrongRating(business.google_rating, business.google_reviews_count);
  const content = getServiceContent(service.name);

  // Get other services for navigation
  const otherServices = business.services.filter(s => s.id !== service.id).slice(0, 4);

  return (
    <>
      {/* Hero Section - Full width image with overlay */}
      <section className="relative h-[50vh] min-h-[400px] lg:h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={service.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1c2e]/95 via-[#0f1c2e]/70 to-[#0f1c2e]/40" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
              <Link href={basePath} className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">{service.name}</span>
            </nav>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
              {service.name}
            </h1>

            {business.city && (
              <p className="flex items-center gap-2 text-white/80 text-lg mb-6">
                <MapPin className="w-5 h-5" />
                Serving {business.city}, {business.state} and surrounding areas
              </p>
            )}

            <p className="text-xl text-white/90 leading-relaxed mb-8">
              {service.description}
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {business.phone && (
                <a
                  href={getPhoneHref(business.phone)}
                  className="inline-flex items-center justify-center gap-3 bg-white text-[#1e3a5f] font-semibold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors text-lg"
                >
                  <Phone className="w-5 h-5" />
                  {formatPhone(business.phone)}
                </a>
              )}
              <a
                href="#quote"
                className="inline-flex items-center justify-center gap-2 bg-[#3b82f6] text-white font-semibold py-4 px-8 rounded-lg hover:bg-[#2563eb] transition-colors text-lg"
              >
                Get Free Quote
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-[#1e3a5f] py-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/90 text-sm">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#3b82f6]" />
              Licensed & Insured
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#3b82f6]" />
              Satisfaction Guaranteed
            </span>
            {isOpen24 && (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3b82f6]" />
                24/7 Emergency Service
              </span>
            )}
            {showRating && (
              <span className="flex items-center gap-2">
                <span className="text-yellow-400">★</span>
                {business.google_rating} ({business.google_reviews_count} reviews)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left Column - Benefits & Process */}
            <div className="lg:col-span-3 space-y-16">
              {/* Benefits */}
              <div>
                <h2 className="text-3xl font-bold text-[#1e3a5f] mb-8">
                  Why Choose Us for {service.name}
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {content.benefits.map((benefit, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#3b82f6]/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process */}
              <div>
                <h2 className="text-3xl font-bold text-[#1e3a5f] mb-8">
                  Our Process
                </h2>
                <div className="space-y-6">
                  {content.process.map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {i + 1}
                      </div>
                      <div className="pt-1">
                        <h3 className="font-semibold text-[#1e3a5f] text-lg mb-1">{item.step}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div>
                <h2 className="text-3xl font-bold text-[#1e3a5f] mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  {content.faqs.map((faq, i) => (
                    <div key={i} className="border-b border-gray-200 pb-6">
                      <h3 className="font-semibold text-[#1e3a5f] text-lg mb-2">{faq.q}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Quote Form */}
            <div className="lg:col-span-2">
              <div id="quote" className="sticky top-24">
                <ServiceQuoteForm
                  businessId={business.id}
                  businessName={business.name}
                  businessPhone={business.phone}
                  serviceName={service.name}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Services */}
      {otherServices.length > 0 && (
        <section className="py-16 bg-[#f8fafc] border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-8">
              Our Other Services
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherServices.map((s) => (
                <Link
                  key={s.id}
                  href={`${basePath}/services/${slugify(s.name)}`}
                  className="group bg-white rounded-lg p-5 hover:shadow-lg transition-all border border-gray-100"
                >
                  <h3 className="font-semibold text-[#1e3a5f] mb-2 group-hover:text-[#3b82f6] transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{s.description}</p>
                  <span className="inline-flex items-center gap-1 text-[#3b82f6] text-sm font-medium mt-3 group-hover:gap-2 transition-all">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-16 bg-[#1e3a5f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Contact {business.name} today for professional {service.name.toLowerCase()} services
            {business.city ? ` in ${business.city}` : ''}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {business.phone && (
              <a
                href={getPhoneHref(business.phone)}
                className="inline-flex items-center justify-center gap-3 bg-white text-[#1e3a5f] font-semibold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                <Phone className="w-5 h-5" />
                Call {formatPhone(business.phone)}
              </a>
            )}
            <Link
              href={`${basePath}/contact`}
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-semibold py-4 px-8 rounded-lg hover:bg-white hover:text-[#1e3a5f] transition-colors text-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
