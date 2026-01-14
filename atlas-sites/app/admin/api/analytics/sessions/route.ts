import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '50');
    const businessId = searchParams.get('businessId');
    const includeAdmin = searchParams.get('includeAdmin') === 'true';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('analytics_sessions')
      .select(`
        *,
        business:businesses(id, name, slug)
      `)
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: false })
      .limit(limit);

    // Filter out admin previews by default
    if (!includeAdmin) {
      query = query.or('is_admin.is.null,is_admin.eq.false');
    }

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Sessions fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate duration for each session
    const sessionsWithDuration = (sessions || []).map((session: {
      started_at: string;
      ended_at: string | null;
      updated_at: string;
    }) => {
      let durationSeconds = 0;
      if (session.ended_at) {
        durationSeconds = Math.round(
          (new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000
        );
      } else if (session.updated_at) {
        // Estimate from last update
        durationSeconds = Math.round(
          (new Date(session.updated_at).getTime() - new Date(session.started_at).getTime()) / 1000
        );
      }
      return {
        ...session,
        duration_seconds: durationSeconds,
      };
    });

    return NextResponse.json(sessionsWithDuration);
  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
