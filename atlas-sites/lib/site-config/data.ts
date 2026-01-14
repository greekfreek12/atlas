/**
 * Site Config Data Operations
 *
 * Functions for reading and writing site configurations to the database.
 */

import { createServerClient } from '@/lib/supabase';
import { Business } from '@/lib/types';
import { SiteConfig, SiteConfigRow, SectionConfig } from './types';
import { generateDefaultConfig } from './defaults';
import { deepMerge } from './utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any;

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get the site config for a business (draft version)
 *
 * @param businessId - UUID of the business
 * @returns SiteConfig or null if not found
 */
export async function getSiteConfig(businessId: string): Promise<SiteConfig | null> {
  const supabase = createServerClient() as AnySupabaseClient;

  console.log('[getSiteConfig] Querying for businessId:', businessId);

  const { data, error } = await supabase
    .from('site_configs')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_draft', true)
    .single();

  if (error || !data) {
    console.log('[getSiteConfig] Error or no data:', error?.message || 'no data');
    return null;
  }

  const config = (data as SiteConfigRow).config;
  const homePage = config.pages.find(p => p.slug === '');
  console.log('[getSiteConfig] Found config, sections:', homePage?.sections.map(s => s.type));

  return config;
}

/**
 * Get the published site config for a business
 */
export async function getPublishedSiteConfig(businessId: string): Promise<SiteConfig | null> {
  const supabase = createServerClient() as AnySupabaseClient;

  const { data, error } = await supabase
    .from('site_configs')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_draft', false)
    .single();

  if (error || !data) {
    return null;
  }

  return (data as SiteConfigRow).config;
}

/**
 * Get site config by business slug
 */
export async function getSiteConfigBySlug(slug: string): Promise<SiteConfig | null> {
  const supabase = createServerClient() as AnySupabaseClient;

  // First get the business ID
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .single();

  if (businessError || !business) {
    return null;
  }

  return getSiteConfig(business.id);
}

/**
 * Get or create a default config for a business
 */
export async function getOrCreateSiteConfig(
  business: Business
): Promise<SiteConfig> {
  // Try to get existing config
  const existing = await getSiteConfig(business.id);
  if (existing) {
    return existing;
  }

  // Generate and save default config
  const defaultConfig = generateDefaultConfig(business);
  await saveSiteConfig(business.id, defaultConfig);

  return defaultConfig;
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Save a site config (creates or updates draft)
 */
export async function saveSiteConfig(
  businessId: string,
  config: SiteConfig
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient() as AnySupabaseClient;

  // Check if draft exists
  const { data: existing } = await supabase
    .from('site_configs')
    .select('id, version')
    .eq('business_id', businessId)
    .eq('is_draft', true)
    .single();

  if (existing) {
    // Update existing draft
    const { error } = await supabase
      .from('site_configs')
      .update({
        config,
        version: existing.version + 1,
      })
      .eq('id', existing.id);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Create new draft
    const { error } = await supabase.from('site_configs').insert({
      business_id: businessId,
      config,
      is_draft: true,
      version: 1,
    });

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

/**
 * Publish a site config (copy draft to published)
 */
export async function publishSiteConfig(
  businessId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient() as AnySupabaseClient;

  // Get current draft
  const { data: draft, error: draftError } = await supabase
    .from('site_configs')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_draft', true)
    .single();

  if (draftError || !draft) {
    return { success: false, error: 'No draft config found' };
  }

  const draftRow = draft as SiteConfigRow;

  // Check if published version exists
  const { data: published } = await supabase
    .from('site_configs')
    .select('id')
    .eq('business_id', businessId)
    .eq('is_draft', false)
    .single();

  if (published) {
    // Update published version
    const { error } = await supabase
      .from('site_configs')
      .update({
        config: draftRow.config,
        version: draftRow.version,
        published_at: new Date().toISOString(),
      })
      .eq('id', published.id);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Create published version
    const { error } = await supabase.from('site_configs').insert({
      business_id: businessId,
      config: draftRow.config,
      is_draft: false,
      version: draftRow.version,
      published_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

/**
 * Save a version to history (for undo functionality)
 */
export async function saveConfigHistory(
  siteConfigId: string,
  config: SiteConfig,
  version: number,
  changeDescription?: string
): Promise<void> {
  const supabase = createServerClient() as AnySupabaseClient;

  await supabase.from('site_config_history').insert({
    site_config_id: siteConfigId,
    config,
    version,
    change_description: changeDescription,
  });
}

// =============================================================================
// SECTION OPERATIONS
// =============================================================================

/**
 * Update a specific section in a config
 */
export async function updateSection(
  businessId: string,
  pageSlug: string,
  sectionId: string,
  updates: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const config = await getSiteConfig(businessId);
  if (!config) {
    return { success: false, error: 'Config not found' };
  }

  // Find the page
  const page = config.pages.find((p) => p.slug === pageSlug);
  if (!page) {
    return { success: false, error: 'Page not found' };
  }

  // Find and update the section
  const sectionIndex = page.sections.findIndex((s) => s.id === sectionId);
  if (sectionIndex === -1) {
    return { success: false, error: 'Section not found' };
  }

  // Deep merge the updates
  const currentSection = page.sections[sectionIndex] as SectionConfig & Record<string, unknown>;
  page.sections[sectionIndex] = deepMerge(
    currentSection,
    updates as Partial<typeof currentSection>
  ) as SectionConfig;

  return saveSiteConfig(businessId, config);
}

/**
 * Add a new section to a page
 */
export async function addSection(
  businessId: string,
  pageSlug: string,
  section: SiteConfig['pages'][0]['sections'][0],
  position?: number
): Promise<{ success: boolean; error?: string }> {
  console.log('[addSection] Getting config for business:', businessId);
  const config = await getSiteConfig(businessId);
  if (!config) {
    console.log('[addSection] Config not found for business:', businessId);
    return { success: false, error: 'Config not found' };
  }

  console.log('[addSection] Found config with pages:', config.pages.map(p => p.slug));
  const page = config.pages.find((p) => p.slug === pageSlug);
  if (!page) {
    console.log('[addSection] Page not found:', pageSlug);
    return { success: false, error: 'Page not found' };
  }

  console.log('[addSection] Found page with existing sections:', page.sections.length);
  if (position !== undefined && position >= 0) {
    page.sections.splice(position, 0, section);
  } else {
    page.sections.push(section);
  }
  console.log('[addSection] After adding section, page has:', page.sections.length, 'sections');

  const result = await saveSiteConfig(businessId, config);
  console.log('[addSection] Save result:', result);
  return result;
}

/**
 * Remove a section from a page
 */
export async function removeSection(
  businessId: string,
  pageSlug: string,
  sectionId: string
): Promise<{ success: boolean; error?: string }> {
  const config = await getSiteConfig(businessId);
  if (!config) {
    return { success: false, error: 'Config not found' };
  }

  const page = config.pages.find((p) => p.slug === pageSlug);
  if (!page) {
    return { success: false, error: 'Page not found' };
  }

  const sectionIndex = page.sections.findIndex((s) => s.id === sectionId);
  if (sectionIndex === -1) {
    return { success: false, error: 'Section not found' };
  }

  page.sections.splice(sectionIndex, 1);

  return saveSiteConfig(businessId, config);
}

/**
 * Reorder sections on a page
 */
export async function reorderSections(
  businessId: string,
  pageSlug: string,
  sectionIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const config = await getSiteConfig(businessId);
  if (!config) {
    return { success: false, error: 'Config not found' };
  }

  const page = config.pages.find((p) => p.slug === pageSlug);
  if (!page) {
    return { success: false, error: 'Page not found' };
  }

  // Create a map of current sections
  const sectionMap = new Map(page.sections.map((s) => [s.id, s]));

  // Reorder based on provided IDs
  const reordered = sectionIds
    .map((id) => sectionMap.get(id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  // Add any sections not in the provided order at the end
  const providedIds = new Set(sectionIds);
  const remaining = page.sections.filter((s) => !providedIds.has(s.id));

  page.sections = [...reordered, ...remaining];

  return saveSiteConfig(businessId, config);
}

// =============================================================================
// THEME OPERATIONS
// =============================================================================

/**
 * Update theme settings
 */
export async function updateTheme(
  businessId: string,
  themeUpdates: Partial<SiteConfig['theme']>
): Promise<{ success: boolean; error?: string }> {
  const config = await getSiteConfig(businessId);
  if (!config) {
    return { success: false, error: 'Config not found' };
  }

  config.theme = {
    ...config.theme,
    ...themeUpdates,
    colors: {
      ...config.theme.colors,
      ...(themeUpdates.colors || {}),
    },
    fonts: {
      ...config.theme.fonts,
      ...(themeUpdates.fonts || {}),
    },
  };

  return saveSiteConfig(businessId, config);
}
