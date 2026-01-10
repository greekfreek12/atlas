'use client';

import type { LeadWithBusiness } from '@/lib/types';

interface LeadCardProps {
  lead: LeadWithBusiness;
  isDragging: boolean;
  isUpdating: boolean;
}

// Star icon component
function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// Phone icon
function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

// Get score badge class
function getScoreBadgeClass(score: number): string {
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// Format phone number
function formatPhone(phone: string | null): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export default function LeadCard({ lead, isDragging, isUpdating }: LeadCardProps) {
  const business = lead.business;
  const phone = lead.contact_phone || business?.phone;

  return (
    <div
      className={`lead-card ${isDragging ? 'dragging' : ''} ${isUpdating ? 'opacity-70' : ''}`}
    >
      {/* Loading indicator */}
      {isUpdating && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Business name */}
      <h3 className="lead-card-name">
        {business?.name || 'Unknown Business'}
      </h3>

      {/* Location */}
      <p className="lead-card-location">
        {business?.city && business?.state
          ? `${business.city}, ${business.state}`
          : 'Location unknown'}
      </p>

      {/* Meta info row */}
      <div className="lead-card-meta">
        {/* Rating */}
        {business?.google_rating && (
          <div className="lead-card-rating">
            <StarIcon />
            <span>{business.google_rating.toFixed(1)}</span>
            {business.google_reviews_count && (
              <span className="text-[var(--admin-text-muted)]">
                ({business.google_reviews_count})
              </span>
            )}
          </div>
        )}

        {/* Score */}
        <div className="lead-card-score">
          <span
            className={`lead-card-score-badge ${getScoreBadgeClass(lead.score)}`}
          >
            {lead.score}
          </span>
        </div>

        {/* Phone */}
        {phone && (
          <div className="lead-card-phone flex items-center gap-1">
            <PhoneIcon />
            <span>{formatPhone(phone)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
