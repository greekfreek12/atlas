import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Get session info
    const { data: session, error: sessionError } = await supabase
      .from('analytics_sessions')
      .select(`
        *,
        business:businesses(id, name, slug)
      `)
      .eq('session_id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get all events for this session (the timeline)
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error('Events fetch error:', eventsError);
    }

    // Calculate session duration
    let durationSeconds = 0;
    if (session.ended_at) {
      durationSeconds = Math.round(
        (new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000
      );
    } else if (events && events.length > 0) {
      const lastEvent = events[events.length - 1];
      durationSeconds = Math.round(
        (new Date(lastEvent.created_at).getTime() - new Date(session.started_at).getTime()) / 1000
      );
    }

    // Build timeline with time offsets
    const timeline = (events || []).map((event: {
      id: string;
      event_type: string;
      page_path: string | null;
      duration_ms: number | null;
      metadata: Record<string, unknown>;
      created_at: string;
    }) => {
      const offsetMs = new Date(event.created_at).getTime() - new Date(session.started_at).getTime();
      return {
        id: event.id,
        event_type: event.event_type,
        page_path: event.page_path,
        duration_ms: event.duration_ms,
        metadata: event.metadata,
        created_at: event.created_at,
        offset_seconds: Math.round(offsetMs / 1000),
      };
    });

    return NextResponse.json({
      session: {
        ...session,
        duration_seconds: durationSeconds,
      },
      timeline,
      event_count: (events || []).length,
    });
  } catch (error) {
    console.error('Session detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
