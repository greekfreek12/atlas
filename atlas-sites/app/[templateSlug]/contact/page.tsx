'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Phone, Mail, MapPin, Clock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Business } from '@/lib/types';
import { parseTemplateSlug, formatPhone, getPhoneHref, formatWorkingHours, is24Hours } from '@/lib/utils';

export default function ContactPage() {
  const params = useParams();
  const templateSlug = params.templateSlug as string;
  const parsed = parseTemplateSlug(templateSlug);

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchBusiness() {
      if (!parsed) return;

      const supabase = createClient();
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', parsed.slug)
        .eq('is_published', true)
        .single();

      if (data) {
        setBusiness(data as unknown as Business);
      }
      setLoading(false);
    }
    fetchBusiness();
  }, [parsed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          ...formData,
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600">Business not found</p>
      </div>
    );
  }

  const hours = formatWorkingHours(business.working_hours);
  const isOpen24 = is24Hours(business.working_hours);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1e3a5f] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-['Playfair_Display'] text-3xl lg:text-4xl font-semibold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-white/70 text-lg">
            Get in touch with {business.name} today.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <div>
              {submitted ? (
                <div className="bg-green-50 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Message Sent
                  </h2>
                  <p className="text-gray-600">
                    Thank you for reaching out. We&apos;ll get back to you shortly.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1e3a5f] mb-6">
                    Send us a message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all resize-none text-gray-900"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#3b82f6]/70 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1e3a5f] mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                {business.phone && (
                  <a href={getPhoneHref(business.phone)} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-[#3b82f6]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#3b82f6] transition-colors">
                      <Phone className="w-5 h-5 text-[#3b82f6] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Phone</div>
                      <div className="text-lg font-medium text-[#1e3a5f] group-hover:text-[#3b82f6] transition-colors">
                        {formatPhone(business.phone)}
                      </div>
                    </div>
                  </a>
                )}

                {business.email && (
                  <a href={`mailto:${business.email}`} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-[#3b82f6]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#3b82f6] transition-colors">
                      <Mail className="w-5 h-5 text-[#3b82f6] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Email</div>
                      <div className="text-lg font-medium text-[#1e3a5f] group-hover:text-[#3b82f6] transition-colors">
                        {business.email}
                      </div>
                    </div>
                  </a>
                )}

                {business.full_address && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#3b82f6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Address</div>
                      <div className="text-gray-700">
                        {business.full_address}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#3b82f6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Hours</div>
                    {isOpen24 ? (
                      <div className="text-gray-700">Open 24 hours</div>
                    ) : hours.length > 0 ? (
                      <ul className="text-gray-700 text-sm space-y-1">
                        {hours.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-700">Call for hours</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              {business.latitude && business.longitude && (
                <div className="mt-8">
                  <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3b82f6] hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
