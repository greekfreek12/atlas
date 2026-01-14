import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Get lead info
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        id,
        contact_name,
        contact_phone,
        status,
        business:businesses(
          id,
          name,
          slug,
          logo,
          city,
          state,
          phone
        )
      `)
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Get all messages for this lead
    const { data: messages, error: messagesError } = await supabase
      .from('sms_messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }

    return NextResponse.json({
      lead,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Conversation API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
