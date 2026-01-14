'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConversationList from '@/components/admin/sms/ConversationList';
import NewMessageDrawer from '@/components/admin/sms/NewMessageDrawer';

interface Business {
  id: string;
  name: string;
  logo: string | null;
  city: string | null;
  state: string | null;
}

interface Conversation {
  leadId: string;
  contactName: string | null;
  contactPhone: string | null;
  leadStatus: string;
  business: Business;
  lastMessage: {
    body: string;
    direction: string;
    status: string;
    createdAt: string;
  } | null;
  messageCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(false);

  const fetchConversations = () => {
    fetch('/admin/api/sms/conversations')
      .then((res) => res.json())
      .then((data) => {
        setConversations(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/admin/api/sms/conversations')
      .then((res) => res.json())
      .then((data) => {
        // Handle error responses or ensure we have an array
        setConversations(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelectConversation = (leadId: string) => {
    router.push(`/admin/messages/${leadId}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="admin-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="admin-page-title">Messages</h1>
            <p className="admin-page-subtitle">
              SMS conversations with leads
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--admin-text-muted)] font-mono">
              {conversations.length} conversations
            </span>
            <button
              onClick={() => setShowNewMessage(true)}
              className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg font-medium hover:bg-[var(--admin-accent-hover)] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Message
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="admin-content flex-1 overflow-hidden">
        <div className="h-full bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-[var(--admin-text-muted)]">
                <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span>Loading conversations...</span>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <ConversationList
                conversations={conversations}
                onSelect={handleSelectConversation}
              />
            </div>
          )}
        </div>
      </div>

      {/* New Message Drawer */}
      <NewMessageDrawer
        isOpen={showNewMessage}
        onClose={() => setShowNewMessage(false)}
        onSent={() => {
          setShowNewMessage(false);
          fetchConversations();
        }}
      />
    </div>
  );
}
