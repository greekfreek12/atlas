import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// In-memory deduplication cache (resets on server restart)
const recentEvents = new Map<string, number>();
const DEDUPE_WINDOW_MS = 2000; // 2 seconds

function isDuplicateEvent(key: string): boolean {
  const now = Date.now();
  const lastTime = recentEvents.get(key);

  // Clean old entries periodically
  if (recentEvents.size > 1000) {
    Array.from(recentEvents.entries()).forEach(([k, v]) => {
      if (now - v > DEDUPE_WINDOW_MS) {
        recentEvents.delete(k);
      }
    });
  }

  if (lastTime && now - lastTime < DEDUPE_WINDOW_MS) {
    return true;
  }

  recentEvents.set(key, now);
  return false;
}

// Events that count as "clicks" (all interactions)
const CLICK_EVENTS = [
  'click',
  'button_click',
  'link_click',
  'phone_click',
  'email_click',
  'cta_click',
  'service_click',
  'form_submit',
];

// Events that count as "actions" (meaningful conversions only)
const ACTION_EVENTS = [
  'phone_click',
  'email_click',
  'form_submit',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessId, event, visitorId, sessionId, isAdmin, metadata } = body;

    if (!businessId || !event) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Server-side deduplication
    const dedupeKey = `${sessionId}:${event}:${metadata?.url || ''}`;
    if (isDuplicateEvent(dedupeKey)) {
      return NextResponse.json({ success: true, deduplicated: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Insert the event with scroll depth if present
    const { error: eventError } = await supabase.from('analytics_events').insert({
      business_id: businessId,
      event_type: event,
      visitor_id: visitorId || null,
      session_id: sessionId || null,
      page_path: metadata?.url || null,
      duration_ms: metadata?.durationMs || null,
      is_admin: isAdmin || false,
      metadata: {
        ...metadata,
        scrollDepth: metadata?.scrollDepth || null,
      },
      created_at: new Date().toISOString(),
    });

    if (eventError) {
      console.error('Error saving analytics event:', eventError);
    }

    // Create or update session if we have session info
    if (sessionId && visitorId) {
      // Check if session exists
      const { data: existingSession } = await supabase
        .from('analytics_sessions')
        .select('id, page_views, total_clicks, total_actions, max_scroll_depth')
        .eq('session_id', sessionId)
        .single();

      if (existingSession) {
        // Update existing session
        const updates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (event === 'page_view') {
          updates.page_views = (existingSession.page_views || 0) + 1;
        }

        // Track all click-type events (any interaction)
        if (CLICK_EVENTS.includes(event)) {
          updates.total_clicks = (existingSession.total_clicks || 0) + 1;
        }

        // Track conversion actions (meaningful conversions only)
        if (ACTION_EVENTS.includes(event)) {
          updates.total_actions = (existingSession.total_actions || 0) + 1;
        }

        // Update max scroll depth if this page_exit has higher scroll depth
        if (event === 'page_exit') {
          updates.ended_at = new Date().toISOString();

          if (metadata?.scrollDepth !== undefined) {
            const currentMax = existingSession.max_scroll_depth || 0;
            if (metadata.scrollDepth > currentMax) {
              updates.max_scroll_depth = metadata.scrollDepth;
            }
          }
        }

        await supabase
          .from('analytics_sessions')
          .update(updates)
          .eq('session_id', sessionId);
      } else if (event === 'page_view') {
        // Create new session on first page view
        const { error: sessionError } = await supabase.from('analytics_sessions').insert({
          session_id: sessionId,
          visitor_id: visitorId,
          business_id: businessId,
          started_at: new Date().toISOString(),
          landing_page: metadata?.url || null,
          referrer: metadata?.referrer || null,
          user_agent: null, // Could add this from request headers
          device_type: metadata?.deviceType || null,
          browser: metadata?.browser || null,
          os: metadata?.os || null,
          page_views: 1,
          total_clicks: 0,
          total_actions: 0,
          max_scroll_depth: 0,
          is_admin: isAdmin || false,
        });

        if (sessionError) {
          console.error('Error creating session:', sessionError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ success: true }); // Always return success
  }
}
