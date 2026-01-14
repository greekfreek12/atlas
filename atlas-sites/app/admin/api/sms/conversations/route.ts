import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Get all leads with their SMS messages
    const { data: conversations, error } = await supabase
      .from('leads')
      .select(`
        id,
        contact_name,
        contact_phone,
        status,
        business:businesses(
          id,
          name,
          logo,
          city,
          state
        ),
        messages:sms_messages(
          id,
          message_body,
          direction,
          status,
          created_at
        )
      `)
      .order('created_at', { foreignTable: 'sms_messages', ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process conversations to get useful summary data
    const processedConversations = (conversations || [])
      .filter((c: { messages?: unknown[] }) => c.messages && c.messages.length > 0)
      .map((conv: {
        id: string;
        contact_name: string | null;
        contact_phone: string | null;
        status: string;
        business: {
          id: string;
          name: string;
          logo: string | null;
          city: string | null;
          state: string | null;
        };
        messages: Array<{
          id: string;
          message_body: string;
          direction: string;
          status: string;
          created_at: string;
        }>;
      }) => {
        const messages = conv.messages || [];
        const latestMessage = messages[0];

        return {
          leadId: conv.id,
          contactName: conv.contact_name,
          contactPhone: conv.contact_phone,
          leadStatus: conv.status,
          business: conv.business,
          lastMessage: latestMessage ? {
            body: latestMessage.message_body,
            direction: latestMessage.direction,
            status: latestMessage.status,
            createdAt: latestMessage.created_at,
          } : null,
          messageCount: messages.length,
        };
      })
      .sort((a: { lastMessage: { createdAt: string } | null }, b: { lastMessage: { createdAt: string } | null }) => {
        // Sort by latest message time
        const aTime = a.lastMessage?.createdAt || '1970-01-01';
        const bTime = b.lastMessage?.createdAt || '1970-01-01';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

    return NextResponse.json(processedConversations);
  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
