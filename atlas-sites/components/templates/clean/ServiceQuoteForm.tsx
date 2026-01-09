'use client';

import { useState } from 'react';
import { Phone, Loader2, CheckCircle } from 'lucide-react';
import { formatPhone, getPhoneHref } from '@/lib/utils';

interface ServiceQuoteFormProps {
  businessId: string;
  businessName: string;
  businessPhone: string | null;
  serviceName: string;
}

export function ServiceQuoteForm({ businessId, businessName, businessPhone, serviceName }: ServiceQuoteFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          ...formData,
          message: `[${serviceName}] ${formData.message}`,
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">
          Request Received!
        </h3>
        <p className="text-gray-600 mb-6">
          We&apos;ll get back to you shortly with a quote for {serviceName.toLowerCase()}.
        </p>
        {businessPhone && (
          <p className="text-sm text-gray-500">
            Need immediate help? Call{' '}
            <a href={getPhoneHref(businessPhone)} className="text-[#3b82f6] font-medium">
              {formatPhone(businessPhone)}
            </a>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-[#1e3a5f] px-6 py-5">
        <h3 className="text-xl font-bold text-white">
          Get a Free Quote
        </h3>
        <p className="text-white/70 text-sm mt-1">
          No obligation estimate for {serviceName.toLowerCase()}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Your Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Smith"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(239) 555-0123"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Describe Your Issue *
          </label>
          <textarea
            required
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tell us about your plumbing issue..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all resize-none text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#3b82f6]/70 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            'Request Free Quote'
          )}
        </button>
      </form>

      {/* Phone option */}
      {businessPhone && (
        <div className="px-6 pb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">or call us directly</span>
            </div>
          </div>

          <a
            href={getPhoneHref(businessPhone)}
            className="mt-4 flex items-center justify-center gap-3 w-full border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            <Phone className="w-5 h-5" />
            {formatPhone(businessPhone)}
          </a>
        </div>
      )}
    </div>
  );
}
