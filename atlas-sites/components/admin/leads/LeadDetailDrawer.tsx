'use client';

import { useState, useEffect } from 'react';
import ComposeDrawer from '@/components/admin/sms/ComposeDrawer';
import ConversationThread from '@/components/admin/sms/ConversationThread';

interface SMSMessage {
  id: string;
  message_body: string;
  direction: 'outbound' | 'inbound';
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'received';
  created_at: string;
  to_phone: string;
  from_phone: string;
  error_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
}

interface FacebookPost {
  id: string;
  text: string | null;
  likes: number;
  shares: number;
  comments: number;
  media_urls: string[] | null;
  posted_at: string | null;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  site: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  google_rating: number | null;
  google_reviews_count: number | null;
  google_reviews_link: string | null;
  logo: string | null;
  photo: string | null;
  photos_count: number | null;
  verified: boolean;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  youtube: string | null;
  working_hours: string | null;
  owner_name?: string | null;
  owner_email?: string | null;
}

interface Lead {
  id: string;
  business_id: string;
  status: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
  business: Business;
}

interface Note {
  text: string;
  timestamp: string;
  user: string;
}

interface LeadDetailDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToPipeline: (leadId: string) => void;
  onSkip: (leadId: string) => void;
  onViewSite: (slug: string) => void;
}

type TabId = 'overview' | 'messages' | 'photos' | 'social' | 'notes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'messages', label: 'Messages' },
  { id: 'photos', label: 'Photos' },
  { id: 'social', label: 'Social' },
  { id: 'notes', label: 'Notes' },
];

function parseNotes(notesString: string | null): Note[] {
  if (!notesString) return [];
  try {
    const parsed = JSON.parse(notesString);
    if (Array.isArray(parsed)) return parsed;
    return [{ text: notesString, timestamp: new Date().toISOString(), user: 'Admin' }];
  } catch {
    if (notesString.trim()) {
      return [{ text: notesString, timestamp: new Date().toISOString(), user: 'Admin' }];
    }
    return [];
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function formatPostDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function LeadDetailDrawer({
  lead,
  isOpen,
  onClose,
  onAddToPipeline,
  onSkip,
  onViewSite,
}: LeadDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [facebookPosts, setFacebookPosts] = useState<FacebookPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Editable owner fields
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [savingOwner, setSavingOwner] = useState(false);

  useEffect(() => {
    if (lead && isOpen) {
      setActiveTab('overview');
      setOwnerName(lead.business.owner_name || '');
      setOwnerEmail(lead.business.owner_email || '');
    }
  }, [lead?.id, isOpen]);

  useEffect(() => {
    if (lead && isOpen) {
      setLoadingMessages(true);
      fetch(`/admin/api/sms/conversations/${lead.id}`)
        .then((res) => res.json())
        .then((data) => setMessages(data.messages || []))
        .catch(console.error)
        .finally(() => setLoadingMessages(false));
    }
  }, [lead, isOpen]);

  useEffect(() => {
    if (lead && isOpen) {
      setLoadingPosts(true);
      fetch(`/admin/api/leads/${lead.id}/facebook-posts`)
        .then((res) => res.json())
        .then((data) => setFacebookPosts(data.posts || []))
        .catch(console.error)
        .finally(() => setLoadingPosts(false));
    }
  }, [lead, isOpen]);

  useEffect(() => {
    if (lead) {
      setNotes(parseNotes(lead.notes));
      setNewNote('');
    }
  }, [lead]);

  const handleSMSSent = () => {
    if (lead) {
      fetch(`/admin/api/sms/conversations/${lead.id}`)
        .then((res) => res.json())
        .then((data) => setMessages(data.messages || []))
        .catch(console.error);
    }
  };

  const handleSaveOwner = async () => {
    if (!lead) return;
    setSavingOwner(true);
    try {
      const response = await fetch(`/admin/api/leads/${lead.id}/business`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_name: ownerName.trim() || null,
          owner_email: ownerEmail.trim() || null
        }),
      });
      if (!response.ok) throw new Error('Failed to save');
    } catch (error) {
      console.error('Failed to save owner info:', error);
    } finally {
      setSavingOwner(false);
    }
  };

  const handleAddNote = async () => {
    if (!lead || !newNote.trim()) return;
    const note: Note = {
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
      user: 'Admin',
    };
    const updatedNotes = [note, ...notes];
    setSaving(true);
    try {
      const response = await fetch(`/admin/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: JSON.stringify(updatedNotes) }),
      });
      if (response.ok) {
        setNotes(updatedNotes);
        setNewNote('');
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!lead) return null;

  const b = lead.business;
  const hasSocials = b.facebook || b.instagram || b.linkedin || b.twitter || b.youtube;
  const allPhotos = facebookPosts
    .filter((post) => post.media_urls && post.media_urls.length > 0)
    .flatMap((post) => post.media_urls || []);

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 backdrop-blur-sm bg-black/60'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[720px] z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0a0a0b 0%, #111113 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Header */}
        <div className="relative flex-shrink-0 p-6 pb-0">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Business Identity */}
          <div className="flex items-start gap-4 mb-6">
            {b.logo ? (
              <div className="relative">
                <img
                  src={b.logo}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover ring-1 ring-white/10"
                />
                {b.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-[#0a0a0b]">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-400 font-semibold text-xl ring-1 ring-white/10">
                {b.name?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0 pt-1">
              <h2
                className="text-xl font-semibold text-white truncate tracking-tight"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                {b.name}
              </h2>
              <p className="text-sm text-zinc-500 mt-0.5">
                {b.city ? `${b.city}, ${b.state}` : b.state || 'Unknown location'}
              </p>
            </div>
          </div>

          {/* Action Bar - Smaller buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setComposeOpen(true)}
              disabled={!lead.contact_phone}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 text-sm disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              SMS
            </button>
            <button
              onClick={() => onViewSite(b.slug)}
              className="h-10 px-4 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white rounded-lg font-medium transition-all text-sm border border-zinc-700/50"
            >
              Preview
            </button>
            <button
              onClick={() => window.open(`/admin/businesses/${b.slug}/edit`, '_blank')}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all text-sm"
            >
              Edit Site
            </button>
            <button
              onClick={() => onAddToPipeline(lead.id)}
              className="h-10 px-4 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white rounded-lg font-medium transition-all text-sm border border-zinc-700/50"
            >
              Pipeline
            </button>
            <button
              onClick={() => onSkip(lead.id)}
              className="h-10 w-10 flex items-center justify-center bg-zinc-800/80 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-lg transition-all border border-zinc-700/50 hover:border-red-500/30"
              title="Skip"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg ${
                  activeTab === tab.id
                    ? 'text-white bg-zinc-800/60'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div
          className="relative flex-1 overflow-y-auto"
          style={{
            background: 'rgba(24, 24, 27, 0.5)',
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Owner Section - Editable */}
                <section className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Owner / Contact</span>
                    <button
                      onClick={handleSaveOwner}
                      disabled={savingOwner}
                      className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    >
                      {savingOwner ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1.5">Owner Name</label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Enter owner name..."
                        className="w-full h-10 px-3 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1.5">Owner Email</label>
                      <input
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="Enter owner email..."
                        className="w-full h-10 px-3 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                </section>

                {/* Contact Grid */}
                <section className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800/50">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Contact</span>
                  </div>
                  <div className="divide-y divide-zinc-800/50">
                    {lead.contact_phone && (
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-mono text-base text-white tracking-wide">{lead.contact_phone}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">Mobile</p>
                        </div>
                      </div>
                    )}
                    {b.email && (
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base text-white truncate">{b.email}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">Email</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Website */}
                <section className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800/50">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Website</span>
                  </div>
                  <div className="p-4">
                    {b.site ? (
                      <a
                        href={b.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                          </svg>
                        </div>
                        <span className="text-blue-400 group-hover:text-blue-300 truncate flex-1 transition-colors">
                          {b.site.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                        <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 text-zinc-600">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </div>
                        <span className="italic">No website</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Google Stats */}
                <section className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800/50">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Google Presence</span>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 rounded-lg bg-zinc-800/30">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <span
                            className="text-2xl font-bold text-white tabular-nums"
                            style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}
                          >
                            {b.google_rating?.toFixed(1) || '—'}
                          </span>
                          {b.google_rating && (
                            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Rating</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-zinc-800/30">
                        <p
                          className="text-2xl font-bold text-white tabular-nums mb-1"
                          style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}
                        >
                          {b.google_reviews_count || 0}
                        </p>
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Reviews</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-zinc-800/30">
                        <p
                          className="text-2xl font-bold text-white tabular-nums mb-1"
                          style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}
                        >
                          {b.photos_count || 0}
                        </p>
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Photos</p>
                      </div>
                    </div>

                    {b.google_reviews_link && (
                      <a
                        href={b.google_reviews_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full h-10 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white rounded-lg font-medium transition-all text-sm border border-zinc-700/30"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        View on Google
                      </a>
                    )}
                  </div>
                </section>

                {/* Social Links */}
                {hasSocials && (
                  <section className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-800/50">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Social</span>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                      {b.facebook && (
                        <a href={b.facebook} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg transition-colors text-sm font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </a>
                      )}
                      {b.instagram && (
                        <a href={b.instagram} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-pink-600/10 hover:bg-pink-600/20 text-pink-400 rounded-lg transition-colors text-sm font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          Instagram
                        </a>
                      )}
                      {b.linkedin && (
                        <a href={b.linkedin} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 rounded-lg transition-colors text-sm font-medium">
                          LinkedIn
                        </a>
                      )}
                      {b.youtube && (
                        <a href={b.youtube} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors text-sm font-medium">
                          YouTube
                        </a>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="h-full flex flex-col min-h-[400px]">
                {loadingMessages ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto mb-4 -mx-2 px-2">
                      <ConversationThread messages={messages} contactName={lead.contact_name || b.name} />
                    </div>
                    <button
                      onClick={() => setComposeOpen(true)}
                      disabled={!lead.contact_phone}
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      New Message
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <div>
                {loadingPosts ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : allPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {allPhotos.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-xl overflow-hidden bg-zinc-900 hover:opacity-80 transition-opacity ring-1 ring-white/5 hover:ring-white/20"
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                    <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <p className="text-sm font-medium mb-2">No photos found</p>
                    {b.facebook && (
                      <a href={b.facebook} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        View Facebook Page →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <div>
                {loadingPosts ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : facebookPosts.length > 0 ? (
                  <div className="space-y-4">
                    {facebookPosts.map((post) => (
                      <article key={post.id} className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
                        {post.text && (
                          <div className="p-4 pb-3">
                            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{post.text}</p>
                          </div>
                        )}
                        {post.media_urls && post.media_urls.length > 0 && (
                          <div className={`grid gap-0.5 ${post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {post.media_urls.slice(0, 4).map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt=""
                                className="w-full h-40 object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ))}
                          </div>
                        )}
                        <div className="px-4 py-3 border-t border-zinc-800/50 flex items-center gap-4 text-xs text-zinc-500">
                          <span>{formatPostDate(post.posted_at)}</span>
                          {post.likes > 0 && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                              </svg>
                              {post.likes}
                            </span>
                          )}
                          {post.comments > 0 && <span>{post.comments} comments</span>}
                          {post.shares > 0 && <span>{post.shares} shares</span>}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                    <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    <p className="text-sm font-medium mb-2">No posts found</p>
                    {b.facebook && (
                      <a href={b.facebook} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        View Facebook Page →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                {/* Add Note */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 h-11 px-4 text-sm bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={saving || !newNote.trim()}
                    className="h-11 px-5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? '...' : 'Add'}
                  </button>
                </div>

                {/* Notes List */}
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note, index) => (
                      <div key={index} className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
                        <p className="text-sm text-zinc-300 leading-relaxed">{note.text}</p>
                        <p className="text-xs text-zinc-600 mt-3">
                          {note.user} · {formatTimestamp(note.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                    <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    <p className="text-sm font-medium">No notes yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SMS Compose Drawer */}
      <ComposeDrawer
        lead={lead ? { ...lead, business: b } : null}
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSent={handleSMSSent}
      />
    </>
  );
}
