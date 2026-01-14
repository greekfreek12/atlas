import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get sessions in time period
    const { data: sessions, error: sessionsError } = await supabase
      .from('analytics_sessions')
      .select('*')
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: false });

    if (sessionsError) {
      console.error('Sessions error:', sessionsError);
    }

    // Get unique visitors
    const uniqueVisitors = new Set((sessions || []).map((s: { visitor_id: string }) => s.visitor_id)).size;

    // Get total page views and clicks
    const totalPageViews = (sessions || []).reduce((sum: number, s: { page_views: number }) => sum + (s.page_views || 0), 0);
    const totalClicks = (sessions || []).reduce((sum: number, s: { total_clicks: number }) => sum + (s.total_clicks || 0), 0);

    // Calculate average session duration
    const sessionsWithDuration = (sessions || []).filter((s: { started_at: string; ended_at: string | null }) => s.ended_at);
    const avgDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum: number, s: { started_at: string; ended_at: string }) => {
          const duration = new Date(s.ended_at).getTime() - new Date(s.started_at).getTime();
          return sum + duration;
        }, 0) / sessionsWithDuration.length / 1000 // Convert to seconds
      : 0;

    // Device breakdown
    const deviceBreakdown: Record<string, number> = {};
    for (const session of (sessions || [])) {
      const device = session.device_type || 'unknown';
      deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;
    }

    // Browser breakdown
    const browserBreakdown: Record<string, number> = {};
    for (const session of (sessions || [])) {
      const browser = session.browser || 'unknown';
      browserBreakdown[browser] = (browserBreakdown[browser] || 0) + 1;
    }

    // Get event type counts
    const { data: events } = await supabase
      .from('analytics_events')
      .select('event_type')
      .gte('created_at', startDate.toISOString());

    const eventCounts: Record<string, number> = {};
    for (const event of (events || [])) {
      eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
    }

    // Sessions by day for chart
    const sessionsByDay: Record<string, number> = {};
    for (const session of (sessions || [])) {
      const day = session.started_at.split('T')[0];
      sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
    }

    return NextResponse.json({
      summary: {
        total_sessions: (sessions || []).length,
        unique_visitors: uniqueVisitors,
        total_page_views: totalPageViews,
        total_clicks: totalClicks,
        avg_duration_seconds: Math.round(avgDuration),
        phone_clicks: eventCounts['phone_click'] || 0,
        form_submits: eventCounts['form_submit'] || 0,
      },
      device_breakdown: deviceBreakdown,
      browser_breakdown: browserBreakdown,
      event_counts: eventCounts,
      sessions_by_day: sessionsByDay,
      period_days: days,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
