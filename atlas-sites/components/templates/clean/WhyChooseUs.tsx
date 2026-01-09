import { Shield, Clock, Award, ThumbsUp } from 'lucide-react';

export function WhyChooseUs() {
  const reasons = [
    {
      icon: Shield,
      title: 'Licensed & Insured',
      description: 'Fully licensed professionals with comprehensive insurance coverage for your peace of mind.',
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Plumbing emergencies don\'t wait, and neither do we. Available around the clock.',
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'We stand behind our work with a satisfaction guarantee on all services.',
    },
    {
      icon: ThumbsUp,
      title: 'Upfront Pricing',
      description: 'No hidden fees or surprises. We provide clear quotes before any work begins.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
            Why Choose Us
          </h2>
          <p className="text-gray-600 text-lg">
            When you need reliable plumbing services, here&apos;s why local homeowners trust us.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-5">
                <reason.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1e3a5f] mb-3">
                {reason.title}
              </h3>
              <p className="text-gray-600">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
