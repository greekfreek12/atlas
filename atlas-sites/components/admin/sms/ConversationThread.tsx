'use client';

import { useEffect, useRef } from 'react';
import { formatPhoneNumber } from '@/lib/textgrid';

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

interface ConversationThreadProps {
  messages: Message[];
  contactName?: string;
  compact?: boolean;
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
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getStatusIcon(status: Message['status']) {
  switch (status) {
    case 'queued':
      return (
        <svg className="w-3 h-3 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
        </svg>
      );
    case 'sent':
      return (
        <svg className="w-3 h-3 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'delivered':
      return (
        <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
        </svg>
      );
    case 'failed':
      return (
        <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ConversationThread({
  messages,
  contactName,
  compact = false,
}: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[var(--admin-text-muted)]">
        <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm">No messages yet</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${compact ? 'space-y-2' : 'space-y-3'}`}>
      {messages.map((message) => {
        const isOutbound = message.direction === 'outbound';

        return (
          <div
            key={message.id}
            className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] ${compact ? 'max-w-[90%]' : ''} ${
                isOutbound
                  ? 'bg-[var(--admin-accent)] text-white rounded-2xl rounded-br-md'
                  : 'bg-[var(--admin-surface-elevated)] text-[var(--admin-text)] rounded-2xl rounded-bl-md border border-[var(--admin-border)]'
              } ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
            >
              {/* Sender label for inbound */}
              {!isOutbound && !compact && contactName && (
                <p className="text-xs font-medium text-[var(--admin-accent)] mb-1">
                  {contactName}
                </p>
              )}

              {/* Message body */}
              <p className={`${compact ? 'text-sm' : 'text-sm'} whitespace-pre-wrap break-words`}>
                {message.message_body}
              </p>

              {/* Timestamp and status */}
              <div
                className={`flex items-center gap-1.5 mt-1 ${
                  isOutbound ? 'justify-end' : 'justify-start'
                }`}
              >
                <span
                  className={`text-xs ${
                    isOutbound ? 'text-white/70' : 'text-[var(--admin-text-muted)]'
                  }`}
                >
                  {formatTimestamp(message.created_at)}
                </span>
                {isOutbound && getStatusIcon(message.status)}
              </div>

              {/* Error message */}
              {message.status === 'failed' && message.error_message && (
                <p className="text-xs text-red-300 mt-1">
                  {message.error_message}
                </p>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

// Compact version for showing in LeadDetailDrawer
export function CompactThread({ messages }: { messages: Message[] }) {
  const recentMessages = messages.slice(-3); // Show last 3 messages

  if (recentMessages.length === 0) return null;

  return (
    <div className="space-y-2">
      {recentMessages.map((message) => {
        const isOutbound = message.direction === 'outbound';

        return (
          <div
            key={message.id}
            className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 ${
                isOutbound
                  ? 'bg-[var(--admin-accent)]/20 text-[var(--admin-text)] rounded-lg rounded-br-sm'
                  : 'bg-[var(--admin-surface-elevated)] text-[var(--admin-text)] rounded-lg rounded-bl-sm border border-[var(--admin-border)]'
              }`}
            >
              <p className="text-sm line-clamp-2">{message.message_body}</p>
              <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
                {formatTimestamp(message.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
