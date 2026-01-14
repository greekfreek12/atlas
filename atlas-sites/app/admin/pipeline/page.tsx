import { createServerClient } from '@/lib/supabase';
import KanbanBoard from '@/components/admin/leads/KanbanBoard';
import Link from 'next/link';
import type { LeadWithBusiness, LeadStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Pipeline only shows leads that are being actively worked (not 'new')
const PIPELINE_STATUSES: LeadStatus[] = ['contacted', 'interested', 'demo', 'customer', 'lost'];

export default async function PipelinePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as any;

  // Fetch leads that are in the pipeline (status != 'new')
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      *,
      business:businesses(*)
    `)
    .neq('status', 'new')
    .order('updated_at', { ascending: false }) as {
      data: LeadWithBusiness[] | null;
      error: Error | null;
    };

  if (error) {
    console.error('Error fetching leads:', error);
  }

  // Group leads by status
  const leadsByStatus = PIPELINE_STATUSES.reduce((acc, status) => {
    acc[status] = (leads || []).filter(
      (lead) => lead.status === status
    );
    return acc;
  }, {} as Record<LeadStatus, LeadWithBusiness[]>);

  const totalInPipeline = leads?.length || 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="admin-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="admin-page-title">Pipeline</h1>
            <p className="admin-page-subtitle">
              Drag leads between stages to track progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--admin-text-muted)] font-mono">
              {totalInPipeline} active leads
            </span>
            <Link
              href="/admin/leads"
              className="admin-btn admin-btn-secondary text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Leads
            </Link>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="admin-content flex-1 overflow-hidden">
        {totalInPipeline === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-[var(--admin-surface-elevated)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-2">
              No leads in pipeline yet
            </h3>
            <p className="text-[var(--admin-text-muted)] mb-4 max-w-sm">
              Browse the Lead Board to find prospects and add them to your pipeline.
            </p>
            <Link
              href="/admin/leads"
              className="admin-btn admin-btn-primary"
            >
              Browse Lead Board
            </Link>
          </div>
        ) : (
          <KanbanBoard initialLeads={leadsByStatus} pipelineMode />
        )}
      </div>
    </div>
  );
}
