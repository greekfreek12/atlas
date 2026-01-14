import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendSMS, normalizePhoneNumber, interpolateTemplate } from '@/lib/textgrid';

export const dynamic = 'force-dynamic';

interface SendSMSRequest {
  leadId?: string;
  toPhone?: string;
  fromPhone: string;
  message: string;
  templateId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendSMSRequest = await request.json();
    const { leadId, toPhone: manualPhone, fromPhone, message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      );
    }

    if (!fromPhone) {
      return NextResponse.json(
        { error: 'fromPhone is required' },
        { status: 400 }
      );
    }

    if (!leadId && !manualPhone) {
      return NextResponse.json(
        { error: 'Either leadId or toPhone is required' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    let toPhone: string;
    let lead: Record<string, unknown> | null = null;

    if (leadId) {
      // Get lead with business info
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select(`
          *,
          business:businesses(*)
        `)
        .eq('id', leadId)
        .single();

      if (leadError || !leadData) {
        return NextResponse.json(
          { error: 'Lead not found' },
          { status: 404 }
        );
      }

      lead = leadData;
      // Get the phone number to send to
      toPhone = leadData.contact_phone || leadData.business?.phone;
      if (!toPhone) {
        return NextResponse.json(
          { error: 'Lead has no phone number' },
          { status: 400 }
        );
      }
    } else {
      // Manual phone number
      toPhone = manualPhone!;
    }

    // Interpolate any remaining template variables in the message
    const business = lead?.business as Record<string, unknown> | undefined;
    const finalMessage = lead ? interpolateTemplate(message, {
      businessName: business?.name as string,
      firstName: lead.contact_name as string,
      city: business?.city as string,
      state: business?.state as string,
      rating: business?.google_rating as number,
      reviewsCount: business?.google_reviews_count as number,
      siteUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/clean-${business?.slug}`,
    }) : message;

    // Send via TextGrid
    const result = await sendSMS({
      to: normalizePhoneNumber(toPhone),
      from: normalizePhoneNumber(fromPhone),
      body: finalMessage,
    });

    if (!result.success) {
      // Still save the message with failed status
      const { data: failedMessage } = await supabase
        .from('sms_messages')
        .insert({
          lead_id: leadId,
          to_phone: normalizePhoneNumber(toPhone),
          from_phone: normalizePhoneNumber(fromPhone),
          message_body: finalMessage,
          direction: 'outbound',
          status: 'failed',
          error_message: result.error,
        })
        .select()
        .single();

      return NextResponse.json(
        { error: result.error, message: failedMessage },
        { status: 500 }
      );
    }

    // Save successful message
    const { data: savedMessage, error: saveError } = await supabase
      .from('sms_messages')
      .insert({
        lead_id: leadId,
        to_phone: normalizePhoneNumber(toPhone),
        from_phone: normalizePhoneNumber(fromPhone),
        message_body: finalMessage,
        textgrid_message_id: result.messageId,
        direction: 'outbound',
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save message:', saveError);
    }

    // Log activity
    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      activity_type: 'sms_sent',
      description: `SMS sent: "${finalMessage.substring(0, 50)}..."`,
      metadata: {
        message_id: savedMessage?.id,
        textgrid_message_id: result.messageId,
      },
    });

    return NextResponse.json({
      success: true,
      message: savedMessage,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
