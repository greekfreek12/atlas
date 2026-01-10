import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { LeadWithBusiness, LeadStatus } from '@/lib/types';

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by status
    const grouped: Record<LeadStatus, LeadWithBusiness[]> = {
      new: [],
      contacted: [],
      interested: [],
      demo: [],
      customer: [],
      lost: [],
    };

    leads?.forEach((lead) => {
      const status = lead.status as LeadStatus;
      if (grouped[status]) {
        grouped[status].push(lead);
      }
    });

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Error in leads API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
