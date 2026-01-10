import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { SMSCampaign } from '@/lib/types';

export async function GET() {
  try {
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, message_template, target_criteria } = body;

    if (!name || !message_template) {
      return NextResponse.json(
        { error: 'Name and message template are required' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    const { data: campaign, error } = await supabase
      .from('sms_campaigns')
      .insert({
        name,
        message_template,
        target_criteria,
        status: 'draft',
      })
      .select()
      .single() as { data: SMSCampaign | null; error: Error | null };

    if (error) {
      console.error('Error creating campaign:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error in campaign creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
