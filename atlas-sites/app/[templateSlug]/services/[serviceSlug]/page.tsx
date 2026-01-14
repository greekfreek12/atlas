import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Clock, Shield, Award, ChevronRight, MapPin, Star } from 'lucide-react';
import { getBusinessByTemplateSlug, getMockBusiness } from '@/lib/data';
import { parseTemplateSlug, slugify, getServiceImage, formatPhone, getPhoneHref, is24Hours, hasStrongRating } from '@/lib/utils';
import { ServiceQuoteForm } from '@/components/templates/plumbing/ServiceQuoteForm';
import { BenefitsGrid, ProcessTimeline, FAQSection } from '@/components/templates/plumbing/ServicePageClient';
import { TrackedPhoneLink, TrackedCtaButton } from '@/components/templates/plumbing/TrackedPhoneLink';
import Tracker from '@/components/templates/Tracker';
import { BusinessWithServices } from '@/lib/types';

interface PageProps {
  params: Promise<{ templateSlug: string; serviceSlug: string }>;
}

const SERVICE_CONTENT: Record<string, {
  benefits: string[];
  process: { step: string; description: string }[];
  faqs: { q: string; a: string }[];
  overview: string;
  extendedContent: string[];
}> = {
  'emergency-plumbing': {
    overview: 'When plumbing emergencies strike, every minute counts. Our emergency plumbing service provides rapid response 24/7, including holidays. We arrive fast with fully-stocked trucks to handle burst pipes, severe leaks, and flooding.',
    extendedContent: [
      'Plumbing emergencies don\'t wait for convenient hours, and neither do we. When a burst pipe is flooding your basement at 2 AM or a sewage backup threatens your home on a holiday weekend, you need a plumber who answers the phone and arrives fast. Our emergency plumbing team is available around the clock, every day of the year, because we understand that water damage compounds by the minute.',
      'Our emergency response trucks are fully stocked with the parts and equipment needed to handle virtually any crisis on the spot. From main line shutoffs and temporary repairs to complete fixes, our licensed technicians are trained to assess situations quickly and take decisive action. We prioritize stopping the damage first, then work methodically to restore your plumbing system to full function.',
      'Common emergencies we handle include burst or frozen pipes, severe water leaks, sewage backups and overflows, water heater failures and flooding, clogged toilets that won\'t clear, and gas line issues requiring immediate attention. We arrive with the tools to handle all of these scenarios, often completing repairs in a single visit so you can get back to normal life as quickly as possible.',
      'Before we begin any work, we provide a clear explanation of the problem and an upfront price quote. There are no surprise charges or hidden fees, even for after-hours calls. We believe emergency situations are stressful enough without worrying about unexpected costs. Our goal is to solve your problem efficiently while treating you and your home with respect.'
    ],
    benefits: [
      'Rapid response - typically within 60 minutes',
      'Available 24/7, including weekends and holidays',
      'Fully stocked trucks for same-day repairs',
      'Transparent pricing before work begins',
      'Licensed, insured technicians',
      'Permanent repairs, not temporary fixes'
    ],
    process: [
      { step: 'Call our 24/7 line', description: 'Real people answer, not machines. We understand emergencies.' },
      { step: 'Fast dispatch', description: 'We send the nearest available technician immediately.' },
      { step: 'Assessment & quote', description: 'We diagnose and provide upfront pricing before starting.' },
      { step: 'Expert repair', description: 'Most emergencies resolved in a single visit.' }
    ],
    faqs: [
      { q: 'What counts as a plumbing emergency?', a: 'Burst pipes, severe leaks, sewage backups, no water, or flooding all require immediate attention.' },
      { q: 'Do you charge extra for nights/weekends?', a: 'Our rates are competitive and transparent. We always quote before starting work.' },
      { q: 'How quickly can you arrive?', a: 'We aim to arrive within 60 minutes for emergencies in our service area.' }
    ]
  },
  'drain-cleaning': {
    overview: 'Professional drain cleaning to clear stubborn clogs and restore proper flow. We use advanced equipment including camera inspection and hydro-jetting to tackle even the toughest blockages safely.',
    extendedContent: [
      'Slow drains and stubborn clogs are more than just an inconvenience; they\'re often warning signs of bigger problems developing in your plumbing system. While store-bought drain cleaners might provide temporary relief, they can actually damage your pipes over time and rarely address the root cause. Professional drain cleaning uses specialized equipment to completely clear blockages and restore optimal flow throughout your system.',
      'Our drain cleaning services go far beyond basic snaking. We utilize high-definition camera inspection technology to see exactly what\'s causing your drainage problems. This allows us to identify issues like tree root intrusion, pipe scale buildup, grease accumulation, or even collapsed sections that no amount of chemical treatment could fix. Once we know what we\'re dealing with, we select the most effective and safest method for your specific situation.',
      'For tough blockages, we employ hydro-jetting technology that uses high-pressure water streams to scour pipe walls clean. This method is incredibly effective at removing years of buildup, cutting through tree roots, and restoring pipes to near-original condition. Unlike mechanical methods that might just punch a hole through a clog, hydro-jetting removes debris completely, which means your drains stay clear longer.',
      'We also offer preventive drain maintenance programs designed to keep your plumbing flowing freely year-round. Regular professional cleaning can prevent emergency clogs, extend the life of your pipes, and help you avoid costly repairs down the road. Whether you\'re dealing with a kitchen sink that drains slowly, a shower that backs up, or a main sewer line issue, our team has the expertise and equipment to solve it right.'
    ],
    benefits: [
      'Professional-grade equipment for tough clogs',
      'Camera inspection to find root causes',
      'Safe for all pipe types and ages',
      'Preventive maintenance plans available',
      'Eco-friendly cleaning options',
      'Satisfaction guaranteed'
    ],
    process: [
      { step: 'Assessment', description: 'We identify the clog location and severity.' },
      { step: 'Camera inspection', description: 'When needed, we see exactly what\'s blocking your drain.' },
      { step: 'Clear the blockage', description: 'Using snakes, hydro-jetting, or specialized tools.' },
      { step: 'Verify flow', description: 'We confirm proper drainage before leaving.' }
    ],
    faqs: [
      { q: 'Why does my drain keep clogging?', a: 'Recurring clogs often indicate buildup, root intrusion, or pipe damage requiring professional assessment.' },
      { q: 'Is hydro-jetting safe for old pipes?', a: 'We assess your pipes first and recommend alternatives if needed for older plumbing.' },
      { q: 'How often should drains be cleaned?', a: 'Annual preventive cleaning keeps most drains flowing smoothly.' }
    ]
  },
  'water-heater-services': {
    overview: 'Complete water heater services including installation, repair, and maintenance for both tank and tankless systems. We help you choose the right solution for your home and budget.',
    extendedContent: [
      'Your water heater works hard every day, providing hot water for showers, dishes, laundry, and countless other household needs. When it starts showing signs of trouble, or when it\'s time for a replacement, you need a plumber who understands all types of systems and can help you make the best choice for your home. Our water heater services cover everything from minor repairs to complete system replacements.',
      'We work with all major brands and both traditional tank-style and modern tankless water heaters. Tank water heaters remain popular for their lower upfront cost and reliable performance, while tankless units offer energy savings and unlimited hot water on demand. Our technicians can explain the pros and cons of each option based on your household size, usage patterns, and budget, helping you make an informed decision.',
      'Common water heater problems we repair include inconsistent water temperature, strange noises from the tank, rusty or discolored water, leaks around the unit, pilot light issues on gas models, and reduced hot water capacity. Often these issues can be resolved with repairs, but if your water heater is over 10 years old or repair costs exceed half the price of replacement, we\'ll recommend upgrading to a new, more efficient model.',
      'Proper installation is critical for water heater safety and longevity. Our licensed technicians ensure all connections, venting, and safety features meet local codes. We also offer maintenance services including tank flushing, anode rod inspection, and efficiency checks that can extend your water heater\'s lifespan by years. Don\'t wait until you\'re taking cold showers; schedule a water heater inspection today.'
    ],
    benefits: [
      'Tank and tankless expertise',
      'Energy-efficient upgrade options',
      'Same-day service for most repairs',
      'Extended warranties available',
      'Proper sizing for your household',
      'Maintenance plans to extend life'
    ],
    process: [
      { step: 'Diagnosis', description: 'We inspect your water heater to identify the issue.' },
      { step: 'Options review', description: 'Honest recommendations on repair vs. replacement.' },
      { step: 'Professional service', description: 'Licensed technicians perform work to code.' },
      { step: 'Testing', description: 'We verify proper operation before completing.' }
    ],
    faqs: [
      { q: 'How long do water heaters last?', a: 'Tank heaters last 8-12 years, tankless units 20+ years with maintenance.' },
      { q: 'Repair or replace?', a: 'If over 10 years old or repair costs exceed 50% of replacement, we recommend upgrading.' },
      { q: 'What size do I need?', a: 'Depends on household size and usage. We help you choose the right capacity.' }
    ]
  },
  'leak-detection-repair': {
    overview: 'Advanced leak detection using electronic equipment to locate hidden leaks without damaging walls or floors. We find and fix leaks fast to prevent costly water damage.',
    extendedContent: [
      'Hidden water leaks are one of the most insidious problems a homeowner can face. A small leak behind a wall or under a slab can go unnoticed for months, causing thousands of dollars in damage, promoting mold growth, and wasting enormous amounts of water. Our leak detection service uses sophisticated technology to pinpoint leaks accurately without destructive exploratory demolition.',
      'Our technicians are trained in multiple detection methods, allowing us to choose the right approach for each situation. Acoustic listening devices can hear the sound of water escaping from pressurized pipes, even through concrete and walls. Thermal imaging cameras detect temperature variations that indicate moisture. Electronic moisture meters identify wet areas in walls, floors, and ceilings. Together, these tools allow us to locate leaks with remarkable precision.',
      'Signs that you might have a hidden leak include unexplained increases in your water bill, the sound of running water when no fixtures are in use, warm spots on floors (indicating hot water line leaks), musty odors, water stains on walls or ceilings, mold growth, and decreased water pressure. If you notice any of these warning signs, don\'t wait. The longer a leak goes unaddressed, the more damage it causes.',
      'Once we locate the leak, we provide a detailed report showing exactly where the problem is and your repair options. Our repairs are designed to be minimally invasive, fixing the problem without unnecessary damage to your home. We work efficiently to stop the leak, repair the pipe properly, and help you understand how to prevent similar issues in the future. Don\'t let a hidden leak turn into a major disaster; call us at the first sign of trouble.'
    ],
    benefits: [
      'Non-invasive detection technology',
      'Pinpoint accuracy saves time and money',
      'Prevents costly water damage',
      'Expert repairs that last',
      'Detailed findings report',
      'Can detect slab and underground leaks'
    ],
    process: [
      { step: 'Consultation', description: 'We discuss signs and check your water meter.' },
      { step: 'Electronic detection', description: 'Acoustic, thermal, and moisture detection without destruction.' },
      { step: 'Detailed report', description: 'We show exactly where the leak is and repair options.' },
      { step: 'Professional repair', description: 'Minimal disruption with quality materials.' }
    ],
    faqs: [
      { q: 'How do you find hidden leaks?', a: 'Acoustic devices, thermal imaging, and moisture meters locate leaks without cutting walls.' },
      { q: 'Signs of a hidden leak?', a: 'High water bills, musty odors, water stains, warm floor spots, or sounds of running water.' },
      { q: 'Can small leaks cause big problems?', a: 'Yes - mold growth, structural damage, and high bills add up quickly.' }
    ]
  },
  'fixture-installation': {
    overview: 'Professional installation of faucets, toilets, sinks, showers, and all plumbing fixtures. Quality workmanship ensures proper function and prevents future leaks.',
    extendedContent: [
      'New plumbing fixtures can transform the look and function of your kitchen or bathroom, but improper installation can lead to leaks, damage, and frustration. Whether you\'re upgrading a single faucet or remodeling an entire bathroom, professional installation ensures your new fixtures work perfectly from day one and continue performing reliably for years to come.',
      'We install all types of plumbing fixtures including kitchen and bathroom faucets, toilets and bidets, pedestal and vanity sinks, shower heads and hand showers, bathtubs and shower surrounds, garbage disposals, and dishwasher connections. Our technicians are experienced with fixtures from all major manufacturers and can work with products you\'ve already purchased or help you select the right fixtures for your needs and budget.',
      'Proper installation involves much more than just connecting water lines. We ensure fixtures are level and secure, connections are watertight, supply lines are appropriate for the water pressure, drain assemblies are correctly installed, and all components meet local plumbing codes. We also test thoroughly before leaving, checking for leaks and verifying proper operation under normal use conditions.',
      'Our fixture installation service includes removal and disposal of old fixtures, so you don\'t have to worry about hauling away that old toilet or faucet. We protect your home during the work and clean up completely when we\'re done. If you\'re not sure which fixtures to choose, our technicians can offer recommendations based on your style preferences, water efficiency goals, and budget. Let us help you get the beautiful, functional fixtures you deserve.'
    ],
    benefits: [
      'Expert installation of all fixture types',
      'Proper connections prevent leaks',
      'Quality fixture recommendations',
      'Old fixture removal included',
      'Tested before we leave',
      'Workmanship warranty'
    ],
    process: [
      { step: 'Consultation', description: 'We help choose fixtures and verify compatibility.' },
      { step: 'Preparation', description: 'Protect your home and remove old fixtures.' },
      { step: 'Installation', description: 'Proper connections and sealing.' },
      { step: 'Testing', description: 'Verify everything works perfectly.' }
    ],
    faqs: [
      { q: 'Can you install fixtures I purchased?', a: 'Yes, we recommend verifying compatibility first.' },
      { q: 'How long does installation take?', a: 'Most single fixtures take 1-2 hours.' },
      { q: 'Do you offer recommendations?', a: 'Yes, we suggest quality fixtures for your budget.' }
    ]
  },
  'pipe-repair-replacement': {
    overview: 'Comprehensive pipe repair and replacement for all materials. Trenchless options available for minimal disruption to your property and landscaping.',
    extendedContent: [
      'The pipes running through your home form the backbone of your entire plumbing system. When they develop problems, whether from age, corrosion, damage, or poor original installation, the effects can range from annoying leaks to catastrophic failures. Our pipe repair and replacement services address issues of all sizes, from pinhole leaks in a single section to complete whole-home repiping.',
      'We work with all common pipe materials including copper, PEX (cross-linked polyethylene), CPVC, galvanized steel, and cast iron. Each material has its own characteristics and requires specific repair techniques. Our technicians are trained to work with any pipe type you might have in your home, whether it\'s a historic property with original plumbing or a newer construction with modern materials.',
      'For many pipe problems, we can offer trenchless repair options that fix or replace pipes without extensive excavation. Pipe lining involves inserting a flexible, resin-coated tube into the damaged pipe, which then hardens to form a new pipe within the old one. Pipe bursting pulls a new pipe through the old one while breaking up the original pipe. These methods can save your landscaping, driveway, or flooring from destruction while still solving your pipe problems.',
      'Warning signs that your pipes may need attention include recurring leaks, discolored or rusty water, low water pressure throughout the house, visible corrosion on exposed pipes, water stains on walls or ceilings, and unusually high water bills. If your home has galvanized steel pipes and is more than 50 years old, a repiping evaluation is especially worthwhile. We provide honest assessments and detailed quotes so you can make informed decisions about your home\'s plumbing infrastructure.'
    ],
    benefits: [
      'All pipe materials - copper, PEX, CPVC, galvanized',
      'Trenchless repair options',
      'Long-lasting warranty',
      'Minimal property disruption',
      'Code-compliant work',
      'Financing available'
    ],
    process: [
      { step: 'Inspection', description: 'Assess damage and identify best repair method.' },
      { step: 'Options', description: 'Repair vs. replacement with detailed quotes.' },
      { step: 'Professional work', description: 'Industry-best practices and quality materials.' },
      { step: 'Quality check', description: 'Pressure test and inspection before completion.' }
    ],
    faqs: [
      { q: 'Signs pipes need replacing?', a: 'Frequent leaks, low pressure, discolored water, or pipes over 50 years old.' },
      { q: 'What is trenchless repair?', a: 'Repairs or replaces pipes without extensive digging.' },
      { q: 'How long do new pipes last?', a: 'Copper 50+ years, PEX 40-50 years with proper installation.' }
    ]
  },
  'default': {
    overview: 'Professional plumbing services from licensed, insured technicians. We stand behind every job with our satisfaction guarantee and transparent pricing.',
    extendedContent: [
      'Quality plumbing service starts with skilled technicians who care about doing the job right. Our team of licensed, insured plumbers brings years of experience to every job, whether it\'s a simple repair or a complex installation. We invest in ongoing training to stay current with the latest techniques, tools, and code requirements, ensuring you receive the best possible service.',
      'We believe in transparent, upfront pricing with no surprises. Before any work begins, we explain what needs to be done and provide a clear quote. You\'ll know exactly what to expect before we pick up a wrench. This honest approach has earned us the trust of homeowners throughout our service area and keeps customers coming back whenever plumbing needs arise.',
      'Our commitment to quality extends beyond the technical work. We treat your home with respect, using drop cloths to protect floors and cleaning up thoroughly when the job is done. We show up on time, communicate clearly throughout the process, and make sure you\'re completely satisfied before we consider the job complete. It\'s this attention to both the details and the overall customer experience that sets us apart.',
      'Whether you need a minor repair, routine maintenance, or a major plumbing project, we\'re here to help. Our fully equipped service vehicles allow us to handle most jobs on the first visit, minimizing inconvenience to you. Call us today to experience the difference that true professionalism makes in plumbing service.'
    ],
    benefits: [
      'Licensed and insured professionals',
      'Upfront, transparent pricing',
      'Quality parts and workmanship',
      'Satisfaction guaranteed',
      'On-time arrival',
      'Clear communication'
    ],
    process: [
      { step: 'Contact us', description: 'Call or fill out our form to schedule.' },
      { step: 'Assessment', description: 'We evaluate and provide a clear quote.' },
      { step: 'Professional service', description: 'Skilled technicians complete work efficiently.' },
      { step: 'Follow-up', description: 'We ensure your complete satisfaction.' }
    ],
    faqs: [
      { q: 'Are you licensed and insured?', a: 'Yes, fully licensed with comprehensive coverage.' },
      { q: 'Do you offer warranties?', a: 'Yes, comprehensive warranties on parts and labor.' },
      { q: 'What areas do you serve?', a: 'Local area and surrounding communities.' }
    ]
  }
};

interface ServiceContent {
  benefits: string[];
  process: { step: string; description: string }[];
  faqs: { q: string; a: string }[];
  overview: string;
  extendedContent: string[];
}

// Get service content from defaults
function getServiceContent(serviceName: string): ServiceContent {
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

  const content = getServiceContent(service.name);
  const location = business.city ? ` in ${business.city}, ${business.state}` : '';

  return {
    title: `${service.name}${location} | ${business.name}`,
    description: `${content.overview} Call ${business.phone ? formatPhone(business.phone) : 'now'} for fast, reliable service.`,
    icons: business.logo ? {
      icon: business.logo,
      shortcut: business.logo,
      apple: business.logo,
    } : undefined,
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
  const otherServices = business.services.filter(s => s.id !== service.id);

  return (
    <>
      <Tracker businessId={business.id} />
      {/* Hero Section with Image */}
      <section className="relative min-h-[60vh] lg:min-h-[70vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={`${service.name} services`}
            fill
            className="object-cover"
            priority
          />
          {/* Strong overlay for text readability */}
          <div className="absolute inset-0 bg-[var(--color-primary-dark)]/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-dark)] via-[var(--color-primary-dark)]/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
              <Link href={basePath} className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">{service.name}</span>
            </nav>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
              {service.name}
              {business.city && (
                <span className="block text-[var(--color-accent)] mt-2 drop-shadow-lg">
                  in {business.city}, {business.state}
                </span>
              )}
            </h1>

            {/* Overview */}
            <p className="text-xl text-white/90 leading-relaxed mb-10 max-w-xl drop-shadow">
              {content.overview}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              {business.phone && (
                <TrackedPhoneLink
                  businessId={business.id}
                  phone={business.phone}
                  variant="primary"
                />
              )}
              <TrackedCtaButton
                businessId={business.id}
                ctaName="get_free_quote_hero"
                href="#quote"
                className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-primary)] font-semibold py-4 px-8 rounded-lg hover:bg-gray-100 transition-all text-lg shadow-lg"
              >
                Get Free Quote
              </TrackedCtaButton>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-[var(--color-primary)] py-5 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-white text-sm">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--color-accent)]" />
              Licensed & Insured
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--color-accent)]" />
              Satisfaction Guaranteed
            </span>
            {isOpen24 && (
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--color-accent)]" />
                24/7 Emergency Service
              </span>
            )}
            {showRating && (
              <span className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                {business.google_rating} Stars ({business.google_reviews_count} reviews)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-16">
              {/* Extended Service Content */}
              <div className="prose prose-lg max-w-none">
                <h2 className="font-display text-2xl lg:text-3xl font-semibold text-[var(--color-primary)] mb-6">
                  About Our {service.name} Services
                </h2>
                <div className="space-y-5">
                  {content.extendedContent.map((paragraph, index) => (
                    <p key={index} className="text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Benefits - Animated */}
              <BenefitsGrid benefits={content.benefits} serviceName={service.name} />

              {/* Process - Animated */}
              <ProcessTimeline process={content.process} />

              {/* FAQs - Animated Accordion */}
              <FAQSection faqs={content.faqs} />
            </div>

            {/* Right Column - Quote Form */}
            <div className="lg:col-span-1">
              <div id="quote" className="lg:sticky lg:top-24">
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

      {/* Service Area */}
      {business.city && (
        <section className="py-16 lg:py-20 bg-[var(--color-background-alt)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-[var(--color-accent)]" />
                <span className="text-[var(--color-accent)] uppercase tracking-widest text-sm font-medium">
                  Service Area
                </span>
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-semibold text-[var(--color-primary)] mb-4">
                {service.name} in {business.city}, {business.state}
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                {business.name} proudly serves {business.city} and surrounding communities
                with professional {service.name.toLowerCase()} services.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[business.city, `North ${business.city}`, `South ${business.city}`, `Greater ${business.city} Area`].map((area) => (
                  <span
                    key={area}
                    className="px-4 py-2 bg-white rounded-full text-gray-700 text-sm border border-gray-200"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Other Services */}
      {otherServices.length > 0 && (
        <section className="py-16 lg:py-20 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl lg:text-3xl font-semibold text-[var(--color-primary)] mb-3">
                Explore Our Other Services
              </h2>
              <p className="text-gray-600">Professional plumbing solutions for every need</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherServices.map((s) => (
                <Link
                  key={s.id}
                  href={`${basePath}/services/${slugify(s.name)}`}
                  className="group bg-[var(--color-background-alt)] rounded-xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[var(--color-accent)]/30"
                >
                  <h3 className="font-display font-semibold text-[var(--color-primary)] text-lg mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{s.description}</p>
                  <span className="inline-flex items-center gap-2 text-[var(--color-accent)] text-sm font-medium group-hover:gap-3 transition-all">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-16 lg:py-20 bg-[var(--color-primary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Contact {business.name} today for professional {service.name.toLowerCase()} services
            {business.city ? ` in ${business.city}` : ''}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {business.phone && (
              <TrackedPhoneLink
                businessId={business.id}
                phone={business.phone}
                variant="secondary"
                label={`Call ${formatPhone(business.phone)}`}
              />
            )}
            <TrackedCtaButton
              businessId={business.id}
              ctaName="contact_us_bottom"
              href={`${basePath}/contact`}
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-semibold py-4 px-8 rounded-lg hover:bg-white hover:text-[var(--color-primary)] transition-colors text-lg"
            >
              Contact Us
            </TrackedCtaButton>
          </div>
        </div>
      </section>
    </>
  );
}
