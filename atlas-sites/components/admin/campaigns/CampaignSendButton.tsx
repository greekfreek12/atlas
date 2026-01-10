'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CampaignSendButtonProps {
  campaignId: string;
  recipientCount: number;
}

export default function CampaignSendButton({
  campaignId,
  recipientCount,
}: CampaignSendButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/admin/api/campaigns/${campaignId}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send campaign');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSending(false);
      setIsConfirming(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-3">
        {error && (
          <span className="text-sm text-red-400">{error}</span>
        )}
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg">
          <span className="text-sm text-[var(--admin-text-secondary)]">
            Send to <span className="font-mono font-bold text-[var(--admin-text)]">{recipientCount}</span> leads?
          </span>
          <button
            onClick={() => setIsConfirming(false)}
            disabled={isSending}
            className="px-3 py-1 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 text-white rounded-md transition-colors flex items-center gap-2"
          >
            {isSending ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              'Confirm Send'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      disabled={recipientCount === 0}
      className="admin-btn admin-btn-primary"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
      </svg>
      Send Campaign
    </button>
  );
}
