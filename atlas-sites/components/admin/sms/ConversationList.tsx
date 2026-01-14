'use client';

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

interface ConversationListProps {
  conversations: Conversation[];
  selectedLeadId?: string;
  onSelect: (leadId: string) => void;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function ConversationList({
  conversations = [],
  selectedLeadId,
  onSelect,
}: ConversationListProps) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--admin-text-muted)] p-8">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-lg font-medium mb-1">No conversations yet</p>
        <p className="text-sm text-center">
          Send your first SMS from a lead&apos;s detail page
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--admin-border)]">
      {conversations.map((conv) => {
        const isSelected = conv.leadId === selectedLeadId;

        return (
          <button
            key={conv.leadId}
            onClick={() => onSelect(conv.leadId)}
            className={`w-full p-4 text-left hover:bg-[var(--admin-surface-hover)] transition-colors ${
              isSelected ? 'bg-[var(--admin-accent)]/10' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              {conv.business?.logo ? (
                <img
                  src={conv.business.logo}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--admin-surface-elevated)] flex items-center justify-center text-[var(--admin-text-muted)] font-bold flex-shrink-0">
                  {conv.business?.name?.charAt(0) || '?'}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium truncate text-[var(--admin-text)]">
                    {conv.business?.name || 'Unknown'}
                  </span>
                  {conv.lastMessage && (
                    <span className="text-xs text-[var(--admin-text-muted)] flex-shrink-0">
                      {formatTimestamp(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                <p className="text-sm truncate text-[var(--admin-text-muted)]">
                  {conv.lastMessage ? (
                    <>
                      {conv.lastMessage.direction === 'outbound' && (
                        <span className="text-[var(--admin-text-muted)]">You: </span>
                      )}
                      {conv.lastMessage.body}
                    </>
                  ) : (
                    'No messages'
                  )}
                </p>

                {/* Location */}
                <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                  {conv.business?.city}, {conv.business?.state}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
