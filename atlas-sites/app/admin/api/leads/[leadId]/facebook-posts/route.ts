import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // First get the lead to find the business_id
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('business_id')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Now fetch Facebook posts for this business
    const { data: posts, error: postsError } = await supabase
      .from('facebook_posts')
      .select('*')
      .eq('business_id', lead.business_id)
      .order('posted_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching Facebook posts:', postsError);
      return NextResponse.json({ error: postsError.message }, { status: 500 });
    }

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error('Error in Facebook posts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
