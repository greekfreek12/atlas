import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { Lead, LeadWithBusiness } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Must provide at least one field to update
    if (!status && notes === undefined) {
      return NextResponse.json(
        { error: 'At least one field (status or notes) is required' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Build update object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Handle status update
    let previousStatus: string | undefined;
    if (status) {
      const validStatuses = ['new', 'contacted', 'interested', 'demo', 'customer', 'lost'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }

      // Get the current lead to log the change
      const { data: currentLead } = await supabase
        .from('leads')
        .select('status')
        .eq('id', leadId)
        .single() as { data: { status: string } | null };

      previousStatus = currentLead?.status;
      updateData.status = status;
    }

    // Handle notes update
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update the lead
    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId)
      .select()
      .single() as { data: Lead | null; error: Error | null };

    if (error) {
      console.error('Error updating lead:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log status change activity
    if (status && previousStatus !== status) {
      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        activity_type: 'status_change',
        description: `Status changed from ${previousStatus} to ${status}`,
        metadata: {
          previous_status: previousStatus,
          new_status: status,
        },
      });
    }

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error in lead update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    const { data: lead, error } = await supabase
      .from('leads')
      .select(`
        *,
        business:businesses(*),
        activities:lead_activities(*)
      `)
      .eq('id', leadId)
      .single() as { data: LeadWithBusiness | null; error: Error | null };

    if (error) {
      console.error('Error fetching lead:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error in lead API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
