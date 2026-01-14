'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConversationThread from '@/components/admin/sms/ConversationThread';
import { interpolateTemplate } from '@/lib/textgrid';

interface Business {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
}

interface Lead {
  id: string;
  contact_name: string | null;
  contact_phone: string | null;
  status: string;
  business: Business;
}

interface Message {
  id: string;
  to_phone: string;
  from_phone: string;
  message_body: string;
  direction: 'outbound' | 'inbound';
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'received';
  error_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

interface Template {
  id: string;
  name: string;
  body: string;
  is_default: boolean;
}

export default function ConversationPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = use(params);
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch conversation data
  useEffect(() => {
    Promise.all([
      fetch(`/admin/api/sms/conversations/${leadId}`).then((r) => r.json()),
      fetch('/admin/api/sms/templates').then((r) => r.json()),
    ])
      .then(([convData, templatesData]) => {
        setLead(convData.lead);
        setMessages(convData.messages || []);
        setTemplates(templatesData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [leadId]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/admin/api/sms/conversations/${leadId}`)
        .then((r) => r.json())
        .then((data) => {
          setMessages(data.messages || []);
        })
        .catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, [leadId]);

  const handleSend = async () => {
    if (!lead || !message.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/admin/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('');
        // Add the new message to the list
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      } else {
        console.error('Send failed:', data.error);
      }
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    if (!lead) return;

    const interpolated = interpolateTemplate(template.body, {
      businessName: lead.business?.name,
      firstName: lead.contact_name || undefined,
      city: lead.business?.city || undefined,
      state: lead.business?.state || undefined,
      siteUrl: `${window.location.origin}/clean-${lead.business?.slug}`,
    });

    setMessage(interpolated);
    setShowTemplates(false);
    inputRef.current?.focus();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--admin-text-muted)]">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span>Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--admin-text-muted)] mb-4">Conversation not found</p>
          <Link
            href="/admin/messages"
            className="text-[var(--admin-accent)] hover:underline"
          >
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  const b = lead.business;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-[var(--admin-surface)] border-b border-[var(--admin-border)] px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/messages"
            className="p-2 hover:bg-[var(--admin-surface-hover)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="flex items-center gap-3 flex-1">
            {b?.logo ? (
              <img src={b.logo} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--admin-surface-elevated)] flex items-center justify-center text-[var(--admin-text-muted)] font-bold">
                {b?.name?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <h1 className="font-semibold text-[var(--admin-text)]">{b?.name}</h1>
              <p className="text-sm text-[var(--admin-text-muted)]">
                {lead.contact_phone} • {b?.city}, {b?.state}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/clean-${b?.slug}`}
              target="_blank"
              className="px-3 py-1.5 text-sm bg-[var(--admin-surface-elevated)] text-[var(--admin-text)] rounded-lg hover:bg-[var(--admin-surface-hover)] border border-[var(--admin-border)]"
            >
              Preview Site
            </Link>
            <Link
              href={`/admin/leads?search=${encodeURIComponent(b?.name || '')}`}
              className="px-3 py-1.5 text-sm bg-[var(--admin-surface-elevated)] text-[var(--admin-text)] rounded-lg hover:bg-[var(--admin-surface-hover)] border border-[var(--admin-border)]"
            >
              View Lead
            </Link>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-[var(--admin-bg)]">
        <div className="max-w-2xl mx-auto">
          <ConversationThread
            messages={messages}
            contactName={b?.name}
          />
        </div>
      </div>

      {/* Compose */}
      <div className="bg-[var(--admin-surface)] border-t border-[var(--admin-border)] p-4">
        <div className="max-w-2xl mx-auto">
          {/* Templates dropdown */}
          {showTemplates && (
            <div className="mb-3 bg-[var(--admin-surface-elevated)] rounded-lg border border-[var(--admin-border)] divide-y divide-[var(--admin-border)] overflow-hidden">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t)}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--admin-surface-hover)] transition-colors"
                >
                  <p className="font-medium text-sm text-[var(--admin-text)]">
                    {t.name} {t.is_default && <span className="text-xs text-[var(--admin-accent)]">(Default)</span>}
                  </p>
                  <p className="text-xs text-[var(--admin-text-muted)] truncate mt-0.5">
                    {t.body}
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`p-2.5 rounded-lg border transition-colors ${
                showTemplates
                  ? 'bg-[var(--admin-accent)]/10 border-[var(--admin-accent)] text-[var(--admin-accent)]'
                  : 'bg-[var(--admin-surface-elevated)] border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)]'
              }`}
              title="Templates"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </button>

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 text-sm bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)] resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <div className="absolute bottom-1 right-2 text-xs text-[var(--admin-text-muted)]">
                {message.length}/160
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="p-3 bg-[var(--admin-accent)] text-white rounded-xl hover:bg-[var(--admin-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
