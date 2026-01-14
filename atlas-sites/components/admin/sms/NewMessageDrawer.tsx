'use client';

import { useState, useEffect } from 'react';
import { interpolateTemplate } from '@/lib/textgrid';

interface Business {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  phone: string | null;
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

type InputMode = 'lead' | 'manual';

interface NewMessageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSent?: () => void;
}

export default function NewMessageDrawer({
  isOpen,
  onClose,
  onSent,
}: NewMessageDrawerProps) {
  const [inputMode, setInputMode] = useState<InputMode>('lead');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [manualPhone, setManualPhone] = useState('');
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [selectedFromPhone, setSelectedFromPhone] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Fetch leads and templates on mount
  useEffect(() => {
    if (!isOpen) return;

    // Fetch leads - API returns grouped by status
    fetch('/admin/api/leads?limit=500')
      .then((res) => res.json())
      .then((data) => {
        // Flatten grouped data into single array
        let leadsData: Lead[] = [];
        if (Array.isArray(data)) {
          leadsData = data;
        } else if (typeof data === 'object' && data !== null) {
          // Data is grouped by status: { new: [...], contacted: [...], etc }
          Object.values(data).forEach((group) => {
            if (Array.isArray(group)) {
              leadsData = leadsData.concat(group);
            }
          });
        }
        setLeads(leadsData);
        setFilteredLeads(leadsData.slice(0, 20));
      })
      .catch(console.error)
      .finally(() => setLoadingLeads(false));

    // Fetch templates
    fetch('/admin/api/sms/templates')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(Array.isArray(data) ? data : []);
        const defaultTemplate = data.find((t: Template) => t.is_default);
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate.id);
        }
      })
      .catch(console.error);

    // Fetch phone numbers
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
  }, [isOpen]);

  // Filter leads based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLeads(leads.slice(0, 20));
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = leads.filter(
      (l) =>
        l.business?.name?.toLowerCase().includes(query) ||
        l.contact_name?.toLowerCase().includes(query) ||
        l.contact_phone?.includes(query) ||
        l.business?.city?.toLowerCase().includes(query)
    );
    setFilteredLeads(filtered.slice(0, 20));
  }, [searchQuery, leads]);

  // Apply template when selected
  useEffect(() => {
    if (!selectedTemplate || !selectedLead) return;

    const template = templates.find((t) => t.id === selectedTemplate);
    if (template) {
      const interpolated = interpolateTemplate(template.body, {
        businessName: selectedLead.business?.name,
        firstName: selectedLead.contact_name || undefined,
        city: selectedLead.business?.city || undefined,
        state: selectedLead.business?.state || undefined,
        rating: selectedLead.business?.google_rating,
        reviewsCount: selectedLead.business?.google_reviews_count,
        siteUrl: `${window.location.origin}/clean-${selectedLead.business?.slug}`,
      });
      setMessage(interpolated);
    }
  }, [selectedTemplate, selectedLead, templates]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setInputMode('lead');
      setSelectedLead(null);
      setSearchQuery('');
      setManualPhone('');
      setPhoneConfirmed(false);
      setSelectedFromPhone(phoneNumbers[0]?.phone_number || '');
      setMessage('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, phoneNumbers]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    // Apply default template
    if (selectedTemplate) {
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
  };

  const handleSend = async () => {
    if (inputMode === 'lead' && !selectedLead) return;
    if (inputMode === 'manual' && !manualPhone.trim()) return;
    if (!message.trim()) return;
    if (!selectedFromPhone) return;

    setSending(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        message: message.trim(),
        fromPhone: selectedFromPhone,
        templateId: selectedTemplate || undefined,
      };

      if (inputMode === 'lead' && selectedLead) {
        payload.leadId = selectedLead.id;
      } else {
        payload.toPhone = manualPhone.trim();
      }

      const response = await fetch('/admin/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
        className={`fixed right-0 top-0 h-full w-[480px] bg-[var(--admin-bg)] border-l border-[var(--admin-border)] z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-[var(--admin-border)] p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--admin-text)]">New Message</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[var(--admin-surface-hover)] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedLead && !phoneConfirmed ? (
            /* Recipient Selection */
            <>
              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-[var(--admin-surface)] rounded-lg">
                <button
                  onClick={() => setInputMode('lead')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    inputMode === 'lead'
                      ? 'bg-[var(--admin-surface-elevated)] text-[var(--admin-text)]'
                      : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'
                  }`}
                >
                  Select Lead
                </button>
                <button
                  onClick={() => setInputMode('manual')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    inputMode === 'manual'
                      ? 'bg-[var(--admin-surface-elevated)] text-[var(--admin-text)]'
                      : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'
                  }`}
                >
                  Enter Number
                </button>
              </div>

              {inputMode === 'lead' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2">
                      Search Leads
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by business name, contact, or city..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {loadingLeads ? (
                      <div className="flex items-center justify-center py-8">
                        <svg className="w-6 h-6 animate-spin text-[var(--admin-text-muted)]" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : filteredLeads.length === 0 ? (
                      <p className="text-sm text-[var(--admin-text-muted)] text-center py-8">
                        {searchQuery ? 'No leads found matching your search' : 'No leads found'}
                      </p>
                    ) : (
                      filteredLeads.map((lead) => (
                        <button
                          key={lead.id}
                          onClick={() => handleSelectLead(lead)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--admin-surface-hover)] transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[var(--admin-surface-elevated)] flex items-center justify-center text-[var(--admin-text-muted)] font-bold flex-shrink-0">
                            {lead.business?.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--admin-text)] truncate">
                              {lead.business?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-[var(--admin-text-muted)]">
                              {lead.contact_phone || lead.business?.phone || 'No phone'} • {lead.business?.city}, {lead.business?.state}
                            </p>
                          </div>
                          <svg className="w-4 h-4 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                /* Manual Phone Input */
                <div>
                  <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-2.5 text-sm bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]"
                    autoFocus
                  />
                  <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                    Enter any phone number to send a message
                  </p>

                  {manualPhone.replace(/\D/g, '').length >= 10 && (
                    <button
                      onClick={() => setPhoneConfirmed(true)}
                      className="w-full mt-4 px-4 py-2.5 bg-[var(--admin-accent)] text-white rounded-lg font-medium hover:bg-[var(--admin-accent-hover)] transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Continue to Message
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Compose Message */
            <>
              {/* Recipient Info */}
              <div className="bg-[var(--admin-surface)] rounded-xl p-3 border border-[var(--admin-border)]">
                <div className="flex items-center gap-3">
                  {selectedLead ? (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-[var(--admin-surface-elevated)] flex items-center justify-center text-[var(--admin-text-muted)] font-bold">
                        {selectedLead.business?.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--admin-text)] truncate">{selectedLead.business?.name}</p>
                        <p className="text-xs text-[var(--admin-text-muted)]">
                          {selectedLead.contact_phone || selectedLead.business?.phone} • {selectedLead.business?.city}, {selectedLead.business?.state}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent)]/20 flex items-center justify-center text-[var(--admin-accent)]">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--admin-text)]">Manual Number</p>
                        <p className="text-xs text-[var(--admin-text-muted)]">{manualPhone}</p>
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedLead(null);
                      setPhoneConfirmed(false);
                    }}
                    className="p-1.5 hover:bg-[var(--admin-surface-hover)] rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
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
            </>
          )}
        </div>

        {/* Footer */}
        {(selectedLead || phoneConfirmed) && (
          <div className="border-t border-[var(--admin-border)] p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedLead(null);
                  setPhoneConfirmed(false);
                }}
                className="flex-1 px-4 py-2.5 bg-[var(--admin-surface-elevated)] text-[var(--admin-text)] rounded-lg font-medium hover:bg-[var(--admin-surface-hover)] transition-colors border border-[var(--admin-border)]"
              >
                Back
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
        )}
      </div>
    </>
  );
}
