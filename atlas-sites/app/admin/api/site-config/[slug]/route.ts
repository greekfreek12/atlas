import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  getSiteConfigBySlug,
  saveSiteConfig,
  getOrCreateSiteConfig,
  generateDefaultConfig,
} from '@/lib/site-config';
import { SiteConfig, SectionConfig } from '@/lib/site-config/types';
import { Business } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /admin/api/site-config/[slug]
 *
 * Retrieve site config for a business by slug.
 * Creates default config if none exists.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = createServerClient() as AnySupabaseClient;

    // Get business by slug
    const { data, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single();

    if (businessError || !data) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const business = data as Business;

    // Get or create site config
    const config = await getOrCreateSiteConfig(business);

    return NextResponse.json({
      success: true,
      config,
      business: {
        id: business.id,
        slug: business.slug,
        name: business.name,
        template: business.template,
      },
    });
  } catch (error) {
    console.error('Error fetching site config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site config' },
      { status: 500 }
    );
  }
}

/**
 * PUT /admin/api/site-config/[slug]
 *
 * Update site config for a business.
 * Supports full config replacement or partial updates.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
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

    // Validate config structure
    const config = body.config as SiteConfig;
    if (!config || !config.version || !config.theme || !config.pages) {
      return NextResponse.json(
        { error: 'Invalid config structure' },
        { status: 400 }
      );
    }

    // Save the config
    const result = await saveSiteConfig(business.id, config);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to save config' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Config saved successfully',
    });
  } catch (error) {
    console.error('Error saving site config:', error);
    return NextResponse.json(
      { error: 'Failed to save site config' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /admin/api/site-config/[slug]
 *
 * Partial update for specific parts of the config.
 * Supports updating theme, sections, or globals individually.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const supabase = createServerClient() as AnySupabaseClient;

    // Get business by slug
    const { data, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single();

    if (businessError || !data) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const business = data as Business;

    // Get existing config
    let config = await getSiteConfigBySlug(slug);
    if (!config) {
      config = generateDefaultConfig(business);
    }

    // Apply partial updates
    const { action, ...updateData } = body;

    switch (action) {
      case 'update_theme':
        config.theme = { ...config.theme, ...updateData.theme };
        break;

      case 'update_section': {
        const { pageSlug, sectionId, updates } = updateData;
        const page = config.pages.find((p) => p.slug === pageSlug);
        if (page) {
          const sectionIndex = page.sections.findIndex((s) => s.id === sectionId);
          if (sectionIndex !== -1) {
            page.sections[sectionIndex] = {
              ...page.sections[sectionIndex],
              ...updates,
            };
          }
        }
        break;
      }

      case 'add_section': {
        const { pageSlug: addPageSlug, section, position } = updateData;
        const addPage = config.pages.find((p) => p.slug === addPageSlug);
        if (addPage && section) {
          if (position !== undefined && position >= 0) {
            addPage.sections.splice(position, 0, section);
          } else {
            addPage.sections.push(section);
          }
        }
        break;
      }

      case 'remove_section': {
        const { pageSlug: removePageSlug, sectionId: removeSectionId } = updateData;
        const removePage = config.pages.find((p) => p.slug === removePageSlug);
        if (removePage) {
          removePage.sections = removePage.sections.filter(
            (s) => s.id !== removeSectionId
          );
        }
        break;
      }

      case 'reorder_sections': {
        const { pageSlug: reorderPageSlug, sectionIds } = updateData;
        const reorderPage = config.pages.find((p) => p.slug === reorderPageSlug);
        if (reorderPage && Array.isArray(sectionIds)) {
          const sectionMap = new Map(
            reorderPage.sections.map((s) => [s.id, s])
          );
          reorderPage.sections = sectionIds
            .map((id: string) => sectionMap.get(id))
            .filter(Boolean) as SectionConfig[];
        }
        break;
      }

      case 'update_header':
        config.globals.header = { ...config.globals.header, ...updateData.header };
        break;

      case 'update_footer':
        config.globals.footer = { ...config.globals.footer, ...updateData.footer };
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    // Save updated config
    const result = await saveSiteConfig(business.id, config);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to save config' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Config updated successfully',
      config,
    });
  } catch (error) {
    console.error('Error updating site config:', error);
    return NextResponse.json(
      { error: 'Failed to update site config' },
      { status: 500 }
    );
  }
}
