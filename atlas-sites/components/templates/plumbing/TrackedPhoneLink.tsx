'use client';

import { Phone } from 'lucide-react';
import { trackPhoneClick, trackCtaClick } from '@/lib/tracking';
import { formatPhone, getPhoneHref } from '@/lib/utils';

interface TrackedPhoneLinkProps {
  businessId: string;
  phone: string;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export function TrackedPhoneLink({
  businessId,
  phone,
  variant = 'primary',
  className = '',
  showIcon = true,
  label,
}: TrackedPhoneLinkProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-3 font-semibold py-4 px-8 rounded-lg transition-all text-lg';

  const variantStyles = {
    primary: 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-lg',
    secondary: 'bg-white text-[var(--color-primary)] hover:bg-gray-100 shadow-lg',
    outline: 'border-2 border-white text-white hover:bg-white hover:text-[var(--color-primary)]',
  };

  return (
    <a
      href={getPhoneHref(phone)}
      onClick={() => trackPhoneClick(businessId)}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {showIcon && <Phone className="w-5 h-5" />}
      {label || formatPhone(phone)}
    </a>
  );
}

interface TrackedCtaButtonProps {
  businessId: string;
  ctaName: string;
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function TrackedCtaButton({
  businessId,
  ctaName,
  href,
  children,
  className = '',
}: TrackedCtaButtonProps) {
  return (
    <a
      href={href}
      onClick={() => trackCtaClick(businessId, ctaName)}
      className={className}
    >
      {children}
    </a>
  );
}
