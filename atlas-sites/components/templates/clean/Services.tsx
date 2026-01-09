import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Service } from '@/lib/types';
import { slugify, getServiceImage } from '@/lib/utils';

interface ServicesProps {
  services: Service[];
  basePath: string;
  showAll?: boolean;
}

export function Services({ services, basePath, showAll = false }: ServicesProps) {
  const displayServices = showAll ? services : services.slice(0, 6);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-12 lg:mb-16">
          <h2 className="font-['Playfair_Display'] text-3xl lg:text-4xl font-semibold text-[#1e3a5f] mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 text-lg">
            From emergency repairs to installations, we handle it all with expertise and care.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayServices.map((service) => {
            const serviceSlug = slugify(service.name);
            const imageUrl = getServiceImage(service.name);

            return (
              <Link
                key={service.id}
                href={`${basePath}/services/${serviceSlug}`}
                className="group block"
              >
                <article className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-5 lg:p-6">
                    <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2 group-hover:text-[#3b82f6] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[#3b82f6] text-sm font-medium group-hover:gap-2 transition-all">
                      Learn more
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* View All Link */}
        {!showAll && services.length > 6 && (
          <div className="mt-12 text-center">
            <Link
              href={`${basePath}/services`}
              className="inline-flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#152a45] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View All Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
