import { createServerClient } from '@/lib/supabase';
import KanbanBoard from '@/components/admin/leads/KanbanBoard';
import type { LeadWithBusiness, LeadStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STATUSES: LeadStatus[] = ['new', 'contacted', 'interested', 'demo', 'customer', 'lost'];

export default async function LeadsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as any;

  // Fetch all leads with their business data
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      *,
      business:businesses(*)
    `)
    .order('score', { ascending: false }) as {
      data: LeadWithBusiness[] | null;
      error: Error | null;
    };

  if (error) {
    console.error('Error fetching leads:', error);
  }

  // Group leads by status
  const leadsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = (leads || []).filter(
      (lead) => lead.status === status
    );
    return acc;
  }, {} as Record<LeadStatus, LeadWithBusiness[]>);

  return (
    <div className="h-full">
      {/* Header */}
      <header className="admin-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="admin-page-title">Lead Pipeline</h1>
            <p className="admin-page-subtitle">
              Drag leads between stages to track progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--admin-text-muted)] font-mono">
              {leads?.length || 0} total leads
            </span>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="admin-content">
        <KanbanBoard initialLeads={leadsByStatus} />
      </div>
    </div>
  );
}
