import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { leadIds, status } = await request.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'leadIds array is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Update all leads
    const { data, error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', leadIds)
      .select();

    if (error) {
      console.error('Error updating leads:', error);
      return NextResponse.json(
        { error: 'Failed to update leads' },
        { status: 500 }
      );
    }

    // Log activities for each lead
    const activities = leadIds.map((leadId: string) => ({
      lead_id: leadId,
      activity_type: 'status_change',
      description: `Status changed to ${status}`,
      metadata: { new_status: status },
    }));

    await supabase.from('lead_activities').insert(activities);

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
    });
  } catch (error) {
    console.error('Bulk status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
