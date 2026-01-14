'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { ContactFormSectionConfig, FormField } from '@/lib/site-config/types';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { trackFormSubmit } from '@/lib/tracking';

export function ContactFormSection({
  config,
  business,
}: SectionComponentProps<ContactFormSectionConfig>) {
  const { content, styles } = config;
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      trackFormSubmit(business.id, 'contact_form');
      setIsSubmitted(true);
      setFormData({});
    } catch (err) {
      setError('Something went wrong. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const renderField = (field: FormField, index: number) => {
    const baseInputClasses = `
      w-full px-4 py-3 rounded-xl border-2 border-gray-200
      bg-white text-[var(--color-text)]
      placeholder:text-gray-400
      focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10
      transition-all duration-300
      outline-none
    `;

    const labelClasses = 'block text-sm font-medium text-[var(--color-text)] mb-2';

    switch (field.type) {
      case 'textarea':
        return (
          <div
            key={field.id}
            className={`transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <label htmlFor={field.name} className={labelClasses}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              rows={4}
              value={formData[field.name] || ''}
              onChange={handleChange}
              className={`${baseInputClasses} resize-none`}
            />
          </div>
        );

      case 'select':
        return (
          <div
            key={field.id}
            className={`transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <label htmlFor={field.name} className={labelClasses}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={field.name}
              name={field.name}
              required={field.required}
              value={formData[field.name] || ''}
              onChange={handleChange}
              className={baseInputClasses}
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return (
          <div
            key={field.id}
            className={`transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <label htmlFor={field.name} className={labelClasses}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              value={formData[field.name] || ''}
              onChange={handleChange}
              className={baseInputClasses}
            />
          </div>
        );
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 bg-[var(--color-background-alt)]"
      data-section-id={config.id}
      data-section-type={config.type}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-4">
            {content.heading}
          </h2>
          {content.subheading && (
            <p className="text-lg text-[var(--color-text-muted)]">
              {content.subheading}
            </p>
          )}
        </div>

        {/* Success State */}
        {isSubmitted ? (
          <div
            className={`text-center p-12 bg-white rounded-3xl shadow-lg transition-all duration-500 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-3">
              Message Sent!
            </h3>
            <p className="text-[var(--color-text-muted)]">
              {content.successMessage}
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 text-[var(--color-accent)] font-medium hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          /* Form */
          <form
            onSubmit={handleSubmit}
            className={`bg-white rounded-3xl shadow-lg p-8 lg:p-12 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="space-y-6">
              {content.fields.map((field, index) => renderField(field, index))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full flex items-center justify-center gap-3
                  bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
                  text-white font-semibold text-lg
                  px-8 py-4 rounded-xl
                  transition-all duration-300
                  disabled:opacity-70 disabled:cursor-not-allowed
                  hover:shadow-lg hover:shadow-[var(--color-accent)]/25
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {content.submitButtonText}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
