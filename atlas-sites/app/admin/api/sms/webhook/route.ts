import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyWebhookSignature, parseInboundWebhook, normalizePhoneNumber } from '@/lib/textgrid';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-textgrid-signature') || '';

    // Verify webhook signature (optional in dev)
    if (process.env.NODE_ENV === 'production') {
      if (!verifyWebhookSignature(rawBody, signature)) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Parse the webhook payload
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      // Handle form-encoded data (common for SMS webhooks)
      body = Object.fromEntries(new URLSearchParams(rawBody));
    }

    const inbound = parseInboundWebhook(body);

    if (!inbound) {
      console.error('Failed to parse webhook payload:', body);
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Normalize phone numbers for lookup
    const fromPhone = normalizePhoneNumber(inbound.from);
    const toPhone = normalizePhoneNumber(inbound.to);

    // Find the lead by phone number
    // Check both contact_phone on lead and phone on business
    const { data: leads } = await supabase
      .from('leads')
      .select(`
        id,
        contact_phone,
        business:businesses(phone)
      `)
      .or(`contact_phone.eq.${fromPhone},contact_phone.eq.${inbound.from}`);

    let leadId: string | null = null;

    if (leads && leads.length > 0) {
      // Found lead by contact_phone
      leadId = leads[0].id;
    } else {
      // Try to find by business phone
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id')
        .or(`phone.eq.${fromPhone},phone.eq.${inbound.from}`)
        .limit(1);

      if (businesses && businesses.length > 0) {
        // Find the lead for this business
        const { data: businessLeads } = await supabase
          .from('leads')
          .select('id')
          .eq('business_id', businesses[0].id)
          .limit(1);

        if (businessLeads && businessLeads.length > 0) {
          leadId = businessLeads[0].id;
        }
      }
    }

    // Save the inbound message
    const { data: savedMessage, error: saveError } = await supabase
      .from('sms_messages')
      .insert({
        lead_id: leadId, // Can be null if we couldn't match the phone
        to_phone: toPhone,
        from_phone: fromPhone,
        message_body: inbound.body,
        textgrid_message_id: inbound.messageId,
        direction: 'inbound',
        status: 'received',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save inbound message:', saveError);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // Log activity if we found the lead
    if (leadId) {
      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        activity_type: 'sms_received',
        description: `SMS received: "${inbound.body.substring(0, 50)}..."`,
        metadata: {
          message_id: savedMessage?.id,
          textgrid_message_id: inbound.messageId,
        },
      });
    }

    console.log('Inbound SMS saved:', {
      messageId: savedMessage?.id,
      leadId,
      from: fromPhone,
    });

    // Return 200 to acknowledge receipt
    return NextResponse.json({ success: true, messageId: savedMessage?.id });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle delivery status updates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, status, errorCode, errorMessage } = body;

    if (!messageId) {
      return NextResponse.json({ error: 'messageId required' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    const updateData: Record<string, unknown> = {
      status: status || 'delivered',
    };

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    if (errorCode || errorMessage) {
      updateData.error_message = `${errorCode || ''}: ${errorMessage || 'Delivery failed'}`;
    }

    const { error } = await supabase
      .from('sms_messages')
      .update(updateData)
      .eq('textgrid_message_id', messageId);

    if (error) {
      console.error('Failed to update message status:', error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ error: 'Status update failed' }, { status: 500 });
  }
}
