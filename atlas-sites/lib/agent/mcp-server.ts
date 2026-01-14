/**
 * MCP Server for Site Config Operations
 *
 * Provides tools for the Claude Agent SDK to read and modify site configurations.
 * All tools use the existing site-config data layer for database operations.
 */

import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod/v4';
import {
  getSiteConfig,
  getSiteConfigBySlug,
  updateSection,
  addSection,
  removeSection,
  reorderSections,
  updateTheme,
  saveSiteConfig,
} from '@/lib/site-config/data';
import { createServerClient } from '@/lib/supabase';
import type { SiteConfig, SectionConfig, SectionType, IconName } from '@/lib/site-config/types';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get business ID from slug
 */
async function getBusinessIdFromSlug(slug: string): Promise<string | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return (data as { id: string }).id;
}

interface BusinessRecord {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  city?: string;
  state?: string;
}

/**
 * Get business with full info from slug
 */
async function getBusinessFromSlug(slug: string): Promise<BusinessRecord | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as BusinessRecord;
}

/**
 * Format config for display to agent
 */
function formatConfigForAgent(config: SiteConfig): string {
  const pages = config.pages.map(page => {
    const sections = page.sections.map(s =>
      `    - ${s.id} (${s.type})${!s.enabled ? ' [disabled]' : ''}`
    ).join('\n');
    return `  ${page.slug || 'home'} (${page.title}):\n${sections}`;
  }).join('\n');

  const theme = `  colors: primary=${config.theme.colors.primary}, accent=${config.theme.colors.accent}
  fonts: heading=${config.theme.fonts.heading}, body=${config.theme.fonts.body}`;

  return `Site Config v${config.version}:
Pages:
${pages}

Theme:
${theme}`;
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

const getSiteConfigTool = tool(
  'get_site_config',
  `Read the current site configuration for a business. Call this FIRST before making any edits to understand the current state.

Returns:
- Full site config including all pages, sections, theme, and global components
- Section IDs needed for update_section calls
- Current theme colors and fonts`,
  {
    business_slug: z.string().describe('The URL slug of the business (e.g., "orleans-plumbing")'),
  },
  async ({ business_slug }) => {
    const config = await getSiteConfigBySlug(business_slug);

    if (!config) {
      return {
        content: [{ type: 'text' as const, text: `Error: No site config found for business "${business_slug}"` }],
        isError: true,
      };
    }

    // Return both formatted summary and full JSON
    const summary = formatConfigForAgent(config);

    return {
      content: [
        { type: 'text' as const, text: summary },
        { type: 'text' as const, text: `\n\nFull JSON config:\n${JSON.stringify(config, null, 2)}` },
      ],
    };
  }
);

const updateSectionTool = tool(
  'update_section',
  `Update content or styles of an existing section. Use this to:
- Change headlines, text, CTAs
- Update images
- Modify colors, spacing, variants
- Enable/disable sections

IMPORTANT:
- Get section ID from get_site_config first
- Use dot notation for nested updates (e.g., "content.headline")
- Pass the full nested object for complex updates`,
  {
    business_slug: z.string().describe('The URL slug of the business'),
    page_slug: z.string().describe('Page slug ("" for homepage, "about", "services", etc.)'),
    section_id: z.string().describe('The section ID to update (from get_site_config)'),
    updates: z.record(z.string(), z.unknown()).describe('Object with fields to update. Keys can be "content", "styles", "enabled", or nested like "content.headline"'),
  },
  async ({ business_slug, page_slug, section_id, updates }) => {
    const businessId = await getBusinessIdFromSlug(business_slug);
    if (!businessId) {
      return {
        content: [{ type: 'text' as const, text: `Error: Business "${business_slug}" not found` }],
        isError: true,
      };
    }

    const result = await updateSection(businessId, page_slug, section_id, updates);

    if (!result.success) {
      return {
        content: [{ type: 'text' as const, text: `Error updating section: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: `Successfully updated section "${section_id}" on page "${page_slug || 'home'}". Changes saved to draft.`
      }],
    };
  }
);

const addSectionTool = tool(
  'add_section',
  `Add a new section to a page. Creates a new section with the specified type and content.

Available section types:
- hero: Main hero with headline, tagline, background image, CTAs
- trust-bar: Trust points with icons (Licensed, Insured, etc.)
- services: Grid of service cards
- reviews: Customer testimonials
- cta: Call-to-action banner
- contact-form: Contact form with customizable fields
- service-area: Service area map and city list
- faq: FAQ accordion
- gallery: Image gallery
- text-block: Rich text content with optional image
- features: Feature grid with icons`,
  {
    business_slug: z.string().describe('The URL slug of the business'),
    page_slug: z.string().describe('Page slug ("" for homepage)'),
    section_type: z.enum(['hero', 'trust-bar', 'services', 'reviews', 'cta', 'contact-form', 'service-area', 'faq', 'gallery', 'text-block', 'features']).describe('Type of section to add'),
    content: z.record(z.string(), z.unknown()).describe('Section content object matching the type schema'),
    position: z.number().optional().describe('Position in page (0 = first). Omit to add at end.'),
    styles: z.record(z.string(), z.unknown()).optional().describe('Optional styles for the section'),
  },
  async ({ business_slug, page_slug, section_type, content, position, styles }) => {
    const businessId = await getBusinessIdFromSlug(business_slug);
    if (!businessId) {
      return {
        content: [{ type: 'text' as const, text: `Error: Business "${business_slug}" not found` }],
        isError: true,
      };
    }

    // Generate unique ID for new section
    const sectionId = `${section_type}-${Date.now()}`;

    // Type assertion through unknown for dynamic section creation
    const section = {
      id: sectionId,
      type: section_type as SectionType,
      enabled: true,
      content,
      ...(styles && { styles }),
    } as unknown as SectionConfig;

    const result = await addSection(businessId, page_slug, section, position);

    if (!result.success) {
      return {
        content: [{ type: 'text' as const, text: `Error adding section: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: `Successfully added new ${section_type} section with ID "${sectionId}" to page "${page_slug || 'home'}".`
      }],
    };
  }
);

const removeSectionTool = tool(
  'remove_section',
  `Remove a section from a page. This permanently deletes the section from the draft config.`,
  {
    business_slug: z.string().describe('The URL slug of the business'),
    page_slug: z.string().describe('Page slug ("" for homepage)'),
    section_id: z.string().describe('The section ID to remove'),
  },
  async ({ business_slug, page_slug, section_id }) => {
    const businessId = await getBusinessIdFromSlug(business_slug);
    if (!businessId) {
      return {
        content: [{ type: 'text' as const, text: `Error: Business "${business_slug}" not found` }],
        isError: true,
      };
    }

    const result = await removeSection(businessId, page_slug, section_id);

    if (!result.success) {
      return {
        content: [{ type: 'text' as const, text: `Error removing section: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: `Successfully removed section "${section_id}" from page "${page_slug || 'home'}".`
      }],
    };
  }
);

const reorderSectionsTool = tool(
  'reorder_sections',
  `Change the order of sections on a page. Provide section IDs in the desired order.`,
  {
    business_slug: z.string().describe('The URL slug of the business'),
    page_slug: z.string().describe('Page slug ("" for homepage)'),
    section_ids: z.array(z.string()).describe('Array of section IDs in desired order'),
  },
  async ({ business_slug, page_slug, section_ids }) => {
    const businessId = await getBusinessIdFromSlug(business_slug);
    if (!businessId) {
      return {
        content: [{ type: 'text' as const, text: `Error: Business "${business_slug}" not found` }],
        isError: true,
      };
    }

    const result = await reorderSections(businessId, page_slug, section_ids);

    if (!result.success) {
      return {
        content: [{ type: 'text' as const, text: `Error reordering sections: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: `Successfully reordered sections on page "${page_slug || 'home'}".`
      }],
    };
  }
);

const updateThemeTool = tool(
  'update_theme',
  `Update global theme settings including colors and fonts.

Color options:
- primary, primaryDark, primaryLight: Main brand colors
- accent, accentHover, accentMuted, accentLight: CTA and highlight colors
- background, backgroundAlt: Page backgrounds
- text, textMuted: Text colors

Font options:
- heading: Display font for headlines (e.g., "Outfit", "Poppins")
- body: Body text font (e.g., "Inter", "Open Sans")

Other options:
- borderRadius: "none" | "sm" | "md" | "lg" | "xl"`,
  {
    business_slug: z.string().describe('The URL slug of the business'),
    colors: z.record(z.string(), z.string()).optional().describe('Color updates (e.g., { primary: "#1e40af" })'),
    fonts: z.object({
      heading: z.string().optional(),
      body: z.string().optional(),
    }).optional().describe('Font updates'),
    border_radius: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional().describe('Border radius setting'),
  },
  async ({ business_slug, colors, fonts, border_radius }) => {
    const businessId = await getBusinessIdFromSlug(business_slug);
    if (!businessId) {
      return {
        content: [{ type: 'text' as const, text: `Error: Business "${business_slug}" not found` }],
        isError: true,
      };
    }

    const themeUpdates: Record<string, unknown> = {};
    if (colors) themeUpdates.colors = colors;
    if (fonts) themeUpdates.fonts = fonts;
    if (border_radius) themeUpdates.borderRadius = border_radius;

    const result = await updateTheme(businessId, themeUpdates);

    if (!result.success) {
      return {
        content: [{ type: 'text' as const, text: `Error updating theme: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: `Successfully updated theme settings. Changes saved to draft.`
      }],
    };
  }
);

const uploadImageTool = tool(
  'upload_image',
  `Upload an image to Supabase Storage and get a public URL.
Use this when the user provides an image to use in their site.
Returns the URL to use in section content.`,
  {
    business_slug: z.string().describe('The URL slug of the business'),
    image_data: z.string().describe('Base64-encoded image data'),
    filename: z.string().describe('Filename with extension (e.g., "hero-bg.jpg")'),
    content_type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']).describe('MIME type of the image'),
  },
  async ({ business_slug, image_data, filename, content_type }) => {
    const business = await getBusinessFromSlug(business_slug);
    if (!business) {
      return {
        content: [{ type: 'text' as const, text: `Error: Business "${business_slug}" not found` }],
        isError: true,
      };
    }

    const supabase = createServerClient();

    // Convert base64 to buffer
    const buffer = Buffer.from(image_data, 'base64');

    // Upload to storage
    const path = `sites/${business.id}/${Date.now()}-${filename}`;
    const { data, error } = await supabase.storage
      .from('site-assets')
      .upload(path, buffer, {
        contentType: content_type,
        upsert: true,
      });

    if (error) {
      return {
        content: [{ type: 'text' as const, text: `Error uploading image: ${error.message}` }],
        isError: true,
      };
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('site-assets')
      .getPublicUrl(path);

    return {
      content: [{
        type: 'text' as const,
        text: `Image uploaded successfully!\nURL: ${publicUrl.publicUrl}\n\nUse this URL in the "src" field of ImageRef objects when updating sections.`
      }],
    };
  }
);

const listBusinessesTool = tool(
  'list_businesses',
  `List all businesses the user has access to. Use this to help users find their business slug.`,
  {},
  async () => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, slug, phone, city, state')
      .order('name');

    if (error) {
      return {
        content: [{ type: 'text' as const, text: `Error listing businesses: ${error.message}` }],
        isError: true,
      };
    }

    if (!data || data.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No businesses found.' }],
      };
    }

    const businesses = data as BusinessRecord[];
    const list = businesses.map(b =>
      `- ${b.name} (slug: "${b.slug}") - ${b.city || 'N/A'}, ${b.state || 'N/A'}`
    ).join('\n');

    return {
      content: [{
        type: 'text' as const,
        text: `Available businesses:\n${list}`
      }],
    };
  }
);

// =============================================================================
// CREATE MCP SERVER
// =============================================================================

export const siteConfigMcpServer = createSdkMcpServer({
  name: 'site-config',
  version: '1.0.0',
  tools: [
    getSiteConfigTool,
    updateSectionTool,
    addSectionTool,
    removeSectionTool,
    reorderSectionsTool,
    updateThemeTool,
    uploadImageTool,
    listBusinessesTool,
  ],
});

export default siteConfigMcpServer;
