import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { SMSCampaign, LeadWithBusiness, Business } from '@/lib/types';

interface LeadWithBusinessData {
  id: string;
  status: string;
  contact_name: string | null;
  contact_phone: string | null;
  business: Business | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('sms_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single() as { data: SMSCampaign | null; error: Error | null };

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Campaign has already been sent or is not in draft status' },
        { status: 400 }
      );
    }

    const targetCriteria = campaign.target_criteria as {
      status?: string[];
      min_score?: number;
      max_score?: number;
    } | null;

    // Build query for leads
    let leadsQuery = supabase
      .from('leads')
      .select('*, business:businesses(*)');

    if (targetCriteria?.status && targetCriteria.status.length > 0) {
      leadsQuery = leadsQuery.in('status', targetCriteria.status);
    }
    if (targetCriteria?.min_score !== undefined) {
      leadsQuery = leadsQuery.gte('score', targetCriteria.min_score);
    }
    if (targetCriteria?.max_score !== undefined) {
      leadsQuery = leadsQuery.lte('score', targetCriteria.max_score);
    }

    const { data: leads, error: leadsError } = await leadsQuery as {
      data: LeadWithBusinessData[] | null;
      error: Error | null;
    };

    if (leadsError) {
      return NextResponse.json({ error: leadsError.message }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { error: 'No leads match the target criteria' },
        { status: 400 }
      );
    }

    // Filter leads with valid phone numbers
    const leadsWithPhone = leads.filter((lead) => {
      const phone = lead.contact_phone || lead.business?.phone;
      return phone && phone.replace(/\D/g, '').length >= 10;
    });

    if (leadsWithPhone.length === 0) {
      return NextResponse.json(
        { error: 'No leads have valid phone numbers' },
        { status: 400 }
      );
    }

    // Personalize and queue messages
    const messages = leadsWithPhone.map((lead) => {
      const business = lead.business;
      const phone = lead.contact_phone || business?.phone;

      // Replace template variables
      const messageBody = campaign.message_template
        .replace(/{name}/g, lead.contact_name || business?.name || 'there')
        .replace(/{first_name}/g, (lead.contact_name || business?.name || 'there').split(' ')[0])
        .replace(/{business_name}/g, business?.name || '')
        .replace(/{city}/g, business?.city || '')
        .replace(/{state}/g, business?.state || '')
        .replace(/{rating}/g, business?.google_rating?.toString() || '')
        .replace(/{reviews}/g, business?.google_reviews_count?.toString() || '');

      return {
        campaign_id: campaignId,
        lead_id: lead.id,
        to_phone: phone,
        from_phone: process.env.TEXTGRID_PHONE_NUMBER || '+10000000000',
        message_body: messageBody,
        direction: 'outbound',
        status: 'queued',
      };
    });

    // Insert messages into database
    const { error: insertError } = await supabase
      .from('sms_messages')
      .insert(messages);

    if (insertError) {
      console.error('Error inserting messages:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Update campaign status and stats
    const { error: updateError } = await supabase
      .from('sms_campaigns')
      .update({
        status: 'active',
        total_sent: messages.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    if (updateError) {
      console.error('Error updating campaign:', updateError);
    }

    // Update lead statuses to 'contacted'
    const leadIds = leadsWithPhone
      .filter((l) => l.status === 'new')
      .map((l) => l.id);

    if (leadIds.length > 0) {
      await supabase
        .from('leads')
        .update({ status: 'contacted', updated_at: new Date().toISOString() })
        .in('id', leadIds);
    }

    // Log activities
    const activities = leadsWithPhone.map((lead) => ({
      lead_id: lead.id,
      activity_type: 'sms_sent',
      description: `Campaign "${campaign.name}" message sent`,
      metadata: { campaign_id: campaignId },
    }));

    await supabase.from('lead_activities').insert(activities);

    return NextResponse.json({
      success: true,
      sent: messages.length,
      message: `Campaign sent to ${messages.length} leads`,
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
