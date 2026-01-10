import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import type { SMSCampaign } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'admin-badge-draft',
    active: 'admin-badge-active',
    completed: 'admin-badge-completed',
    paused: 'admin-badge-draft',
  };

  return (
    <span className={`admin-badge ${styles[status] || styles.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function CampaignsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as any;

  const { data: campaigns, error } = await supabase
    .from('sms_campaigns')
    .select('*')
    .order('created_at', { ascending: false }) as {
      data: SMSCampaign[] | null;
      error: Error | null;
    };

  if (error) {
    console.error('Error fetching campaigns:', error);
  }

  return (
    <div>
      {/* Header */}
      <header className="admin-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="admin-page-title">SMS Campaigns</h1>
            <p className="admin-page-subtitle">
              Create and manage your outreach campaigns
            </p>
          </div>
          <Link href="/admin/campaigns/new" className="admin-btn admin-btn-primary">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Campaign
          </Link>
        </div>
      </header>

      <div className="admin-content">
        {campaigns && campaigns.length > 0 ? (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Delivered</th>
                  <th>Responded</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign, index) => (
                  <tr
                    key={campaign.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td>
                      <div className="font-medium text-[var(--admin-text)]">
                        {campaign.name}
                      </div>
                      <div className="text-xs text-[var(--admin-text-muted)] font-mono mt-1 max-w-[300px] truncate">
                        {campaign.message_template}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="font-mono">{campaign.total_sent}</td>
                    <td className="font-mono">{campaign.total_delivered}</td>
                    <td className="font-mono">{campaign.total_responded}</td>
                    <td className="text-[var(--admin-text-secondary)]">
                      {formatDate(campaign.created_at)}
                    </td>
                    <td>
                      <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="text-[var(--admin-accent)] hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-card">
            <div className="empty-state py-12">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-12 h-12 text-[var(--admin-text-muted)]">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              <h3 className="empty-state-title">No campaigns yet</h3>
              <p className="empty-state-text">
                Create your first SMS campaign to start reaching out to leads.
              </p>
              <Link
                href="/admin/campaigns/new"
                className="admin-btn admin-btn-primary mt-4"
              >
                Create Campaign
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
