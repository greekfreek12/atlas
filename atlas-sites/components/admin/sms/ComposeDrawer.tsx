'use client';

import { useState, useEffect } from 'react';
import { interpolateTemplate } from '@/lib/textgrid';

interface Business {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  google_rating: number | null;
  google_reviews_count: number | null;
}

interface Lead {
  id: string;
  contact_name: string | null;
  contact_phone: string | null;
  business: Business;
}

interface Template {
  id: string;
  name: string;
  body: string;
  is_default: boolean;
}

interface PhoneNumber {
  id: string;
  phone_number: string;
  state: string;
  friendly_name: string;
}

interface ComposeDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSent?: () => void;
}

export default function ComposeDrawer({
  lead,
  isOpen,
  onClose,
  onSent,
}: ComposeDrawerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [selectedFromPhone, setSelectedFromPhone] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch templates and phone numbers on mount
  useEffect(() => {
    fetch('/admin/api/sms/templates')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(Array.isArray(data) ? data : []);
        // Auto-select default template
        const defaultTemplate = data.find((t: Template) => t.is_default);
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate.id);
        }
      })
      .catch(console.error);

    fetch('/admin/api/sms/phone-numbers')
      .then((res) => res.json())
      .then((data) => {
        const numbers = Array.isArray(data) ? data : [];
        setPhoneNumbers(numbers);
        if (numbers.length > 0) {
          setSelectedFromPhone(numbers[0].phone_number);
        }
      })
      .catch(console.error);
  }, []);

  // Apply template when selected
  useEffect(() => {
    if (!selectedTemplate || !lead) return;

    const template = templates.find((t) => t.id === selectedTemplate);
    if (template) {
      const interpolated = interpolateTemplate(template.body, {
        businessName: lead.business?.name,
        firstName: lead.contact_name || undefined,
        city: lead.business?.city || undefined,
        state: lead.business?.state || undefined,
        rating: lead.business?.google_rating,
        reviewsCount: lead.business?.google_reviews_count,
        siteUrl: `${window.location.origin}/clean-${lead.business?.slug}`,
      });
      setMessage(interpolated);
    }
  }, [selectedTemplate, lead, templates]);

  // Reset state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      // Re-apply template when opening
      if (selectedTemplate && lead) {
        const template = templates.find((t) => t.id === selectedTemplate);
        if (template) {
          const interpolated = interpolateTemplate(template.body, {
            businessName: lead.business?.name,
            firstName: lead.contact_name || undefined,
            city: lead.business?.city || undefined,
            state: lead.business?.state || undefined,
            rating: lead.business?.google_rating,
            reviewsCount: lead.business?.google_reviews_count,
            siteUrl: `${window.location.origin}/clean-${lead.business?.slug}`,
          });
          setMessage(interpolated);
        }
      }
    }
  }, [isOpen, lead, selectedTemplate, templates]);

  const handleSend = async () => {
    if (!lead || !message.trim() || !selectedFromPhone) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch('/admin/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          fromPhone: selectedFromPhone,
          message: message.trim(),
          templateId: selectedTemplate || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSent?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  if (!lead) return null;

  const b = lead.business;
  const charCount = message.length;
  const segments = Math.ceil(charCount / 160) || 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[420px] bg-[var(--admin-bg)] border-l border-[var(--admin-border)] z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-[var(--admin-border)] p-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-[var(--admin-text)]">Send SMS</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[var(--admin-surface-hover)] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-[var(--admin-text-muted)]">
            To: {b.name} ({lead.contact_phone})
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Lead Preview */}
          <div className="bg-[var(--admin-surface)] rounded-xl p-3 border border-[var(--admin-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--admin-surface-elevated)] flex items-center justify-center text-[var(--admin-text-muted)] font-bold">
                {b.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--admin-text)] truncate">{b.name}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">
                  {b.city}, {b.state} • {b.google_rating}★ ({b.google_reviews_count} reviews)
                </p>
              </div>
            </div>
          </div>

          {/* From Phone Selector */}
          <div>
            <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2">
              Send From
            </label>
            {phoneNumbers.length === 0 ? (
              <p className="text-sm text-[var(--admin-text-muted)]">
                No phone numbers configured. Add numbers in Settings.
              </p>
            ) : (
              <select
                value={selectedFromPhone}
                onChange={(e) => setSelectedFromPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]"
              >
                {phoneNumbers.map((p) => (
                  <option key={p.id} value={p.phone_number}>
                    {p.friendly_name || p.state} ({p.phone_number})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2">
              Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]"
            >
              <option value="">Custom message...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.is_default ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Message Editor */}
          <div>
            <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Type your message..."
              className="w-full px-3 py-2 text-sm bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)] resize-none"
            />
            <div className="flex items-center justify-between mt-1 text-xs text-[var(--admin-text-muted)]">
              <span>{charCount} characters</span>
              <span>{segments} segment{segments !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Variables Help */}
          <div className="bg-[var(--admin-surface)] rounded-lg p-3 border border-[var(--admin-border)]">
            <p className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2">
              Available Variables
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['{business_name}', '{first_name}', '{city}', '{state}', '{rating}', '{reviews_count}', '{site_url}'].map((v) => (
                <button
                  key={v}
                  onClick={() => setMessage((prev) => prev + ' ' + v)}
                  className="px-2 py-1 text-xs bg-[var(--admin-surface-elevated)] text-[var(--admin-text-muted)] rounded hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text)] transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-sm text-green-400">Message sent successfully!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--admin-border)] p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[var(--admin-surface-elevated)] text-[var(--admin-text)] rounded-lg font-medium hover:bg-[var(--admin-surface-hover)] transition-colors border border-[var(--admin-border)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim() || success}
              className="flex-1 px-4 py-2.5 bg-[var(--admin-accent)] text-white rounded-lg font-medium hover:bg-[var(--admin-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Sending...
                </>
              ) : success ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Sent!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send SMS
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
