import { createServerClient } from '@/lib/supabase';
import LeadBoard from '@/components/admin/leads/LeadBoard';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as any;

  // Get current page
  const page = parseInt(params.page as string) || 1;
  const offset = (page - 1) * PAGE_SIZE;

  // Get total count of new leads
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  // Fetch leads for current page
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      *,
      business:businesses(*)
    `)
    .eq('status', 'new')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error('Error fetching leads:', error);
  }

  // Get unique states for filter dropdown
  const { data: statesData } = await supabase
    .from('businesses')
    .select('state')
    .not('state', 'is', null);

  const uniqueStates = Array.from(new Set((statesData || []).map((s: { state: string }) => s.state))).sort() as string[];

  // Calculate pagination
  const totalPages = Math.ceil((totalLeads || 0) / PAGE_SIZE);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="admin-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="admin-page-title">Lead Board</h1>
            <p className="admin-page-subtitle">
              Browse and filter leads, add to pipeline when ready
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--admin-text-muted)] font-mono">
              {totalLeads || 0} leads available
            </span>
          </div>
        </div>
      </header>

      {/* Lead Board */}
      <div className="admin-content flex-1 overflow-hidden">
        <LeadBoard
          initialLeads={leads || []}
          states={uniqueStates}
          currentPage={page}
          totalPages={totalPages}
          totalLeads={totalLeads || 0}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}
