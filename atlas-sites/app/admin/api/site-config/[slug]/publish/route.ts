import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { publishSiteConfig } from '@/lib/site-config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /admin/api/site-config/[slug]/publish
 *
 * Publish the draft config to make it live.
 * Creates a snapshot in history for rollback capability.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = createServerClient() as AnySupabaseClient;

    // Get business by slug
    const { data, error: businessError } = await supabase
      .from('businesses')
      .select('id, slug, name')
      .eq('slug', slug)
      .single();

    if (businessError || !data) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const business = data as { id: string; slug: string; name: string };

    // Publish the config
    const result = await publishSiteConfig(business.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to publish config' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Site published successfully',
    });
  } catch (error) {
    console.error('Error publishing site config:', error);
    return NextResponse.json(
      { error: 'Failed to publish site config' },
      { status: 500 }
    );
  }
}
