import { Star, ExternalLink } from 'lucide-react';
import { Business } from '@/lib/types';

interface ReviewsProps {
  business: Business;
}

export function Reviews({ business }: ReviewsProps) {
  const { google_rating, google_reviews_count, google_reviews_link } = business;

  if (!google_rating || !google_reviews_count) return null;

  return (
    <section className="py-16 lg:py-20 bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Rating Display */}
        <div className="flex items-center justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-7 h-7 ${
                i < Math.floor(google_rating)
                  ? 'text-amber-400 fill-amber-400'
                  : i < google_rating
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="text-4xl font-semibold text-[#1e3a5f] mb-1">
          {google_rating}
        </div>

        <p className="text-gray-600 mb-6">
          Based on {google_reviews_count} Google reviews
        </p>

        {google_reviews_link && (
          <a
            href={google_reviews_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
          >
            Read reviews on Google
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </section>
  );
}
