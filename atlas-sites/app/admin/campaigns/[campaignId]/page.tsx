import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import CampaignSendButton from '@/components/admin/campaigns/CampaignSendButton';
import type { SMSCampaign, LeadWithBusiness } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Stat card
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg p-4">
      <div className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold font-mono" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as any;

  // Fetch campaign
  const { data: campaign, error } = await supabase
    .from('sms_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single() as { data: SMSCampaign | null; error: Error | null };

  if (error || !campaign) {
    notFound();
  }

  // Fetch matching leads count
  const targetCriteria = campaign.target_criteria as {
    status?: string[];
    min_score?: number;
    max_score?: number;
  } | null;

  let leadsQuery = supabase
    .from('leads')
    .select('*, business:businesses(*)', { count: 'exact' });

  if (targetCriteria?.status && targetCriteria.status.length > 0) {
    leadsQuery = leadsQuery.in('status', targetCriteria.status);
  }
  if (targetCriteria?.min_score !== undefined) {
    leadsQuery = leadsQuery.gte('score', targetCriteria.min_score);
  }
  if (targetCriteria?.max_score !== undefined) {
    leadsQuery = leadsQuery.lte('score', targetCriteria.max_score);
  }

  const { data: leads, count: matchingLeadsCount } = await leadsQuery.limit(5) as {
    data: LeadWithBusiness[] | null;
    count: number | null;
  };

  return (
    <div>
      {/* Header */}
      <header className="admin-page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/campaigns"
              className="p-2 rounded-lg hover:bg-[var(--admin-surface-elevated)] transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[var(--admin-text-secondary)]">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <div>
              <h1 className="admin-page-title">{campaign.name}</h1>
              <p className="admin-page-subtitle">
                Created {new Date(campaign.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`admin-badge ${
                campaign.status === 'draft'
                  ? 'admin-badge-draft'
                  : campaign.status === 'active'
                  ? 'admin-badge-active'
                  : 'admin-badge-completed'
              }`}
            >
              {campaign.status}
            </span>
            {campaign.status === 'draft' && (
              <CampaignSendButton
                campaignId={campaignId}
                recipientCount={matchingLeadsCount || 0}
              />
            )}
          </div>
        </div>
      </header>

      <div className="admin-content">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Recipients"
            value={matchingLeadsCount || 0}
            color="var(--status-new)"
          />
          <StatCard
            label="Sent"
            value={campaign.total_sent}
            color="var(--status-contacted)"
          />
          <StatCard
            label="Delivered"
            value={campaign.total_delivered}
            color="var(--status-interested)"
          />
          <StatCard
            label="Responded"
            value={campaign.total_responded}
            color="var(--status-customer)"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Message Preview */}
          <div className="admin-card animate-fade-in">
            <h2 className="admin-card-title mb-4">Message Template</h2>
            <div className="bg-[var(--admin-bg)] rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {campaign.message_template}
            </div>
          </div>

          {/* Target Criteria */}
          <div className="admin-card animate-fade-in" style={{ animationDelay: '50ms' }}>
            <h2 className="admin-card-title mb-4">Target Criteria</h2>
            <dl className="space-y-3">
              {targetCriteria?.status && (
                <div>
                  <dt className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider">
                    Lead Status
                  </dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {targetCriteria.status.map((s: string) => (
                      <span
                        key={s}
                        className="px-2 py-1 bg-[var(--admin-surface-elevated)] rounded text-sm capitalize"
                      >
                        {s}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {(targetCriteria?.min_score !== undefined ||
                targetCriteria?.max_score !== undefined) && (
                <div>
                  <dt className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wider">
                    Score Range
                  </dt>
                  <dd className="mt-1 font-mono">
                    {targetCriteria.min_score ?? 0} - {targetCriteria.max_score ?? 100}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Preview Recipients */}
        {leads && leads.length > 0 && (
          <div className="admin-card mt-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">Preview Recipients</h2>
              <span className="text-xs text-[var(--admin-text-muted)] font-mono">
                Showing {leads.length} of {matchingLeadsCount}
              </span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Location</th>
                  <th>Score</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="font-medium">{lead.business?.name}</td>
                    <td className="text-[var(--admin-text-secondary)]">
                      {lead.business?.city}, {lead.business?.state}
                    </td>
                    <td className="font-mono">{lead.score}</td>
                    <td className="font-mono text-[var(--admin-text-muted)]">
                      {lead.contact_phone || lead.business?.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
