import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import type { Lead, SMSCampaign } from '@/lib/types';

// Stat card component
function StatCard({
  label,
  value,
  change,
  accentColor,
  delay,
}: {
  label: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  accentColor: string;
  delay: number;
}) {
  return (
    <div
      className="stat-card animate-fade-in"
      style={{
        '--stat-accent': accentColor,
        animationDelay: `${delay}ms`,
      } as React.CSSProperties}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className={`stat-change ${change.positive ? 'positive' : 'negative'}`}>
          {change.positive ? '↑' : '↓'} {change.value}
        </div>
      )}
    </div>
  );
}

// Recent activity item
function ActivityItem({
  type,
  title,
  subtitle,
  time,
}: {
  type: 'sms' | 'lead' | 'form';
  title: string;
  subtitle: string;
  time: string;
}) {
  const icons = {
    sms: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
      </svg>
    ),
    lead: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
    form: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd" />
      </svg>
    ),
  };

  const colors = {
    sms: 'var(--status-contacted)',
    lead: 'var(--status-new)',
    form: 'var(--status-interested)',
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--admin-border-subtle)] last:border-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${colors[type]}20`, color: colors[type] }}
      >
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--admin-text)] truncate">{title}</p>
        <p className="text-xs text-[var(--admin-text-muted)]">{subtitle}</p>
      </div>
      <span className="text-xs text-[var(--admin-text-muted)] font-mono flex-shrink-0">
        {time}
      </span>
    </div>
  );
}

export default async function AdminDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as any;

  // Fetch stats
  const [leadsResult, campaignsResult] = await Promise.all([
    supabase.from('leads').select('status', { count: 'exact' }) as Promise<{
      data: Pick<Lead, 'status'>[] | null;
      count: number | null;
    }>,
    supabase.from('sms_campaigns').select('*', { count: 'exact' }) as Promise<{
      data: SMSCampaign[] | null;
      count: number | null;
    }>,
  ]);

  const totalLeads = leadsResult.count || 0;
  const totalCampaigns = campaignsResult.count || 0;

  // Count leads by status
  const leadsByStatus = (leadsResult.data || []).reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      {/* Header */}
      <header className="admin-page-header">
        <h1 className="admin-page-title">Command Center</h1>
        <p className="admin-page-subtitle">
          Overview of your leads and campaigns
        </p>
      </header>

      <div className="admin-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            label="Total Leads"
            value={totalLeads}
            change={{ value: '12% this week', positive: true }}
            accentColor="var(--status-new)"
            delay={0}
          />
          <StatCard
            label="New Leads"
            value={leadsByStatus['new'] || 0}
            accentColor="var(--status-new)"
            delay={50}
          />
          <StatCard
            label="Contacted"
            value={leadsByStatus['contacted'] || 0}
            accentColor="var(--status-contacted)"
            delay={100}
          />
          <StatCard
            label="Interested"
            value={leadsByStatus['interested'] || 0}
            accentColor="var(--status-interested)"
            delay={150}
          />
          <StatCard
            label="Customers"
            value={leadsByStatus['customer'] || 0}
            change={{ value: '3 this month', positive: true }}
            accentColor="var(--status-customer)"
            delay={200}
          />
          <StatCard
            label="Campaigns"
            value={totalCampaigns}
            accentColor="var(--status-demo)"
            delay={250}
          />
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="admin-card animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/leads"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-hover)] transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--status-new-bg)] flex items-center justify-center text-[var(--status-new)] group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--admin-text)]">View Leads</span>
              </Link>

              <Link
                href="/admin/campaigns/new"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-hover)] transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--status-contacted-bg)] flex items-center justify-center text-[var(--status-contacted)] group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--admin-text)]">New Campaign</span>
              </Link>

              <Link
                href="/admin/campaigns"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-hover)] transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--status-demo-bg)] flex items-center justify-center text-[var(--status-demo)] group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--admin-text)]">Campaigns</span>
              </Link>

              <Link
                href="/admin/settings"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-hover)] transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--status-lost-bg)] flex items-center justify-center text-[var(--status-lost)] group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--admin-text)]">Settings</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="admin-card animate-fade-in" style={{ animationDelay: '350ms' }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">Recent Activity</h2>
              <Link
                href="/admin/leads"
                className="text-xs text-[var(--admin-accent)] hover:underline"
              >
                View all
              </Link>
            </div>
            <div>
              <ActivityItem
                type="lead"
                title="New lead imported"
                subtitle="Marco Plumbing - Naples, FL"
                time="2m ago"
              />
              <ActivityItem
                type="sms"
                title="Campaign sent"
                subtitle="Initial Outreach - 45 recipients"
                time="1h ago"
              />
              <ActivityItem
                type="form"
                title="Form submission"
                subtitle="Joe's Plumbing requested quote"
                time="3h ago"
              />
              <ActivityItem
                type="lead"
                title="Status changed"
                subtitle="ABC Plumbing → Interested"
                time="5h ago"
              />
            </div>
          </div>
        </div>

        {/* Lead Pipeline Mini Preview */}
        <div className="admin-card mt-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Lead Pipeline</h2>
            <Link href="/admin/leads" className="admin-btn admin-btn-secondary text-xs">
              Open Kanban
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {/* Pipeline visualization */}
          <div className="flex gap-3">
            {[
              { label: 'New', count: leadsByStatus['new'] || 0, color: 'var(--status-new)' },
              { label: 'Contacted', count: leadsByStatus['contacted'] || 0, color: 'var(--status-contacted)' },
              { label: 'Interested', count: leadsByStatus['interested'] || 0, color: 'var(--status-interested)' },
              { label: 'Demo', count: leadsByStatus['demo'] || 0, color: 'var(--status-demo)' },
              { label: 'Customer', count: leadsByStatus['customer'] || 0, color: 'var(--status-customer)' },
            ].map((stage, i) => (
              <div
                key={stage.label}
                className="flex-1 bg-[var(--admin-surface-elevated)] rounded-lg p-3 border border-[var(--admin-border)]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: stage.color }}
                  />
                  <span className="text-xs font-medium text-[var(--admin-text-secondary)]">
                    {stage.label}
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono" style={{ color: stage.color }}>
                  {stage.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
