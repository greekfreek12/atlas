import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessId, event, metadata } = body;

    if (!businessId || !event) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { error } = await supabase.from('analytics_events').insert({
      business_id: businessId,
      event_type: event,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    } as any);

    if (error) {
      console.error('Error saving analytics event:', error);
      // Don't fail the request for analytics errors
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    // Always return success to not block user actions
    return NextResponse.json({ success: true });
  }
}
