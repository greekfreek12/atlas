/**
 * Site Agent API Route
 *
 * Handles chat-based site editing using Claude with custom tools.
 * Streams responses as NDJSON for real-time UI updates.
 *
 * Uses the basic Anthropic SDK (not Agent SDK) because:
 * - Agent SDK spawns subprocesses which don't work well in serverless
 * - We still get tool consolidation through our MCP server definitions
 * - Streaming works better with direct API calls
 */

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@/lib/supabase';
import {
  getSiteConfig,
  getSiteConfigBySlug,
  getOrCreateSiteConfig,
  updateSection as updateSectionData,
  addSection as addSectionData,
  removeSection as removeSectionData,
  reorderSections as reorderSectionsData,
  updateTheme as updateThemeData,
  saveSiteConfig,
} from '@/lib/site-config/data';
import type { SiteConfig, SectionConfig, SectionType } from '@/lib/site-config/types';
import type { Business } from '@/lib/types';
import { generateId } from '@/lib/site-config/utils';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// COMPONENT AUTO-GENERATION
// =============================================================================

const BUILT_IN_SECTIONS = new Set([
  'hero', 'trust-bar', 'services', 'reviews', 'cta', 'contact-form'
]);

function sectionComponentExists(sectionType: string): boolean {
  if (BUILT_IN_SECTIONS.has(sectionType)) return true;
  const componentName = sectionType.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Section';
  const generatedPath = path.join(process.cwd(), 'components', 'sections', 'generated', `${componentName}.tsx`);
  return fs.existsSync(generatedPath);
}

function generateComponentCode(sectionType: string): string {
  const componentName = sectionType.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Section';

  const templates: Record<string, string> = {
    gallery: `'use client';
import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { BaseSectionConfig } from '@/lib/site-config/types';
interface GallerySectionConfig extends BaseSectionConfig { type: 'gallery'; content: { headline?: string; tagline?: string; images: Array<{ url?: string; src?: string; alt: string }>; }; }
export function GallerySection({ config }: SectionComponentProps<GallerySectionConfig>) {
  const { content } = config;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = content.images || [];
  if (images.length === 0) return (<section className="py-16 bg-[var(--color-background-alt)]" data-section-id={config.id} data-section-type={config.type}><div className="max-w-7xl mx-auto px-4 text-center"><h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">{content.headline || 'Gallery'}</h2><p className="text-[var(--color-text-muted)]">No images added yet.</p></div></section>);
  return (<><section className="py-16 lg:py-24 bg-[var(--color-background-alt)]" data-section-id={config.id} data-section-type={config.type}><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{content.headline && (<div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">{content.headline}</h2>{content.tagline && <p className="text-lg text-[var(--color-text-muted)]">{content.tagline}</p>}</div>)}<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{images.map((image, index) => (<button key={index} onClick={() => { setCurrentIndex(index); setLightboxOpen(true); }} className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"><Image src={image.url || image.src || '/placeholder.jpg'} alt={image.alt || 'Gallery image'} fill className="object-cover transition-transform duration-500 group-hover:scale-110" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" /></button>))}</div></div></section>{lightboxOpen && (<div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}><button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"><X className="w-8 h-8" /></button>{images.length > 1 && (<><button onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex - 1 + images.length) % images.length); }} className="absolute left-4 p-2 text-white/70 hover:text-white"><ChevronLeft className="w-10 h-10" /></button><button onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex + 1) % images.length); }} className="absolute right-4 p-2 text-white/70 hover:text-white"><ChevronRight className="w-10 h-10" /></button></>)}<div className="relative max-w-5xl max-h-[80vh] w-full h-full m-8" onClick={(e) => e.stopPropagation()}><Image src={images[currentIndex].url || images[currentIndex].src || '/placeholder.jpg'} alt={images[currentIndex].alt || ''} fill className="object-contain" /></div><div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">{currentIndex + 1} / {images.length}</div></div>)}</>);
}`,
    faq: `'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { BaseSectionConfig } from '@/lib/site-config/types';
interface FaqSectionConfig extends BaseSectionConfig { type: 'faq'; content: { heading: string; subheading?: string; faqs: Array<{ id: string; question: string; answer: string }>; }; }
export function FaqSection({ config }: SectionComponentProps<FaqSectionConfig>) {
  const { content } = config;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = content.faqs || [];
  return (<section className="py-16 lg:py-24 bg-[var(--color-background)]" data-section-id={config.id} data-section-type={config.type}><div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">{content.heading}</h2>{content.subheading && <p className="text-lg text-[var(--color-text-muted)]">{content.subheading}</p>}</div><div className="space-y-4">{faqs.map((faq, index) => (<div key={faq.id || index} className="border border-[var(--color-text)]/10 rounded-xl overflow-hidden"><button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-center justify-between p-5 text-left bg-[var(--color-background-alt)] hover:bg-[var(--color-background-alt)]/80 transition-colors"><span className="font-semibold text-[var(--color-text)] pr-4">{faq.question}</span><ChevronDown className={\`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-300 \${openIndex === index ? 'rotate-180' : ''}\`} /></button><div className={\`overflow-hidden transition-all duration-300 \${openIndex === index ? 'max-h-96' : 'max-h-0'}\`}><div className="p-5 pt-0 text-[var(--color-text-muted)] leading-relaxed">{faq.answer}</div></div></div>))}</div></div></section>);
}`,
    features: `'use client';
import { CheckCircle } from 'lucide-react';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { BaseSectionConfig } from '@/lib/site-config/types';
interface FeaturesSectionConfig extends BaseSectionConfig { type: 'features'; content: { eyebrow?: string; heading: string; features: Array<{ id: string; icon?: string; title: string; description: string }>; }; }
export function FeaturesSection({ config }: SectionComponentProps<FeaturesSectionConfig>) {
  const { content } = config;
  const features = content.features || [];
  return (<section className="py-16 lg:py-24 bg-[var(--color-background)]" data-section-id={config.id} data-section-type={config.type}><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-12">{content.eyebrow && <span className="text-[var(--color-accent)] font-semibold text-sm uppercase tracking-wider">{content.eyebrow}</span>}<h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mt-2">{content.heading}</h2></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{features.map((feature) => (<div key={feature.id} className="p-6 rounded-xl bg-[var(--color-background-alt)] border border-[var(--color-text)]/5"><div className="w-12 h-12 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center mb-4"><CheckCircle className="w-6 h-6 text-[var(--color-accent)]" /></div><h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{feature.title}</h3><p className="text-[var(--color-text-muted)]">{feature.description}</p></div>))}</div></div></section>);
}`,
    'text-block': `'use client';
import Image from 'next/image';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { BaseSectionConfig } from '@/lib/site-config/types';
interface TextBlockSectionConfig extends BaseSectionConfig { type: 'text-block'; content: { heading?: string; body: string; image?: { src: string; alt: string }; imagePosition?: 'left' | 'right'; }; }
export function TextBlockSection({ config }: SectionComponentProps<TextBlockSectionConfig>) {
  const { content } = config;
  const imagePosition = content.imagePosition || 'right';
  return (<section className="py-16 lg:py-24 bg-[var(--color-background)]" data-section-id={config.id} data-section-type={config.type}><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className={\`flex flex-col \${imagePosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center\`}><div className="flex-1">{content.heading && <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-6">{content.heading}</h2>}<div className="prose prose-lg text-[var(--color-text-muted)]" dangerouslySetInnerHTML={{ __html: content.body }} /></div>{content.image && (<div className="flex-1 relative aspect-video lg:aspect-square rounded-xl overflow-hidden"><Image src={content.image.src} alt={content.image.alt || ''} fill className="object-cover" /></div>)}</div></div></section>);
}`,
    'service-area': `'use client';
import { MapPin } from 'lucide-react';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { BaseSectionConfig } from '@/lib/site-config/types';
interface ServiceAreaSectionConfig extends BaseSectionConfig { type: 'service-area'; content: { heading: string; subheading?: string; areas: string[]; ctaText?: string; }; }
export function ServiceAreaSection({ config }: SectionComponentProps<ServiceAreaSectionConfig>) {
  const { content } = config;
  const areas = content.areas || [];
  return (<section className="py-16 lg:py-24 bg-[var(--color-background-alt)]" data-section-id={config.id} data-section-type={config.type}><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">{content.heading}</h2>{content.subheading && <p className="text-lg text-[var(--color-text-muted)]">{content.subheading}</p>}</div><div className="flex flex-wrap justify-center gap-4">{areas.map((area, index) => (<div key={index} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><MapPin className="w-4 h-4" /><span className="font-medium">{area}</span></div>))}</div>{content.ctaText && <p className="text-center mt-8 text-[var(--color-text-muted)]">{content.ctaText}</p>}</div></section>);
}`,
  };

  if (templates[sectionType]) return templates[sectionType];

  return `'use client';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { BaseSectionConfig } from '@/lib/site-config/types';
interface ${componentName}Config extends BaseSectionConfig { type: '${sectionType}'; content: Record<string, unknown>; }
export function ${componentName}({ config }: SectionComponentProps<${componentName}Config>) {
  const { content } = config;
  return (<section className="py-16 lg:py-24 bg-[var(--color-background)]" data-section-id={config.id} data-section-type={config.type}><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center"><h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">{(content as any).heading || (content as any).headline || '${componentName.replace('Section', '')}'}</h2>{(content as any).subheading && <p className="text-lg text-[var(--color-text-muted)]">{(content as any).subheading}</p>}</div></div></section>);
}`;
}

function createSectionComponent(sectionType: string): { success: boolean; error?: string } {
  const componentName = sectionType.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Section';
  const sectionsDir = path.join(process.cwd(), 'components', 'sections');
  const generatedDir = path.join(sectionsDir, 'generated');
  const componentPath = path.join(generatedDir, `${componentName}.tsx`);
  const indexPath = path.join(generatedDir, 'index.ts');

  try {
    if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

    const componentCode = generateComponentCode(sectionType);
    fs.writeFileSync(componentPath, componentCode, 'utf-8');

    const existingComponents: string[] = [];
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      const regex = /export \{ (\w+) \}/g;
      let match;
      while ((match = regex.exec(indexContent)) !== null) {
        if (match[1] !== componentName) existingComponents.push(match[1]);
      }
    }
    existingComponents.push(componentName);

    const newIndexContent = `/**
 * Generated Section Components - Auto-generated by site-agent
 */
import { registerSection } from '@/lib/site-config/registry';
${existingComponents.map(name => {
  const type = name.replace('Section', '').replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);
  return `import { ${name} } from './${name}';\nregisterSection('${type}', ${name});\nexport { ${name} };`;
}).join('\n')}
`;
    fs.writeFileSync(indexPath, newIndexContent, 'utf-8');
    console.log(`[createSectionComponent] Created ${componentName} for type '${sectionType}'`);
    return { success: true };
  } catch (err) {
    console.error(`[createSectionComponent] Failed:`, err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// =============================================================================
// ANTHROPIC CLIENT
// =============================================================================

const anthropic = new Anthropic();

// =============================================================================
// STREAMING HELPERS
// =============================================================================

interface StreamMessage {
  type: 'text' | 'tool_call' | 'tool_result' | 'error' | 'done';
  content?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_result?: string;
  session_id?: string;
}

function createStreamMessage(msg: StreamMessage): string {
  return JSON.stringify(msg) + '\n';
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

const tools: Anthropic.Tool[] = [
  {
    name: 'get_site_config',
    description: `Read the current site configuration for a business. Call this FIRST before making any edits.

Returns:
- Full site config including all pages, sections, theme, and global components
- Section IDs needed for update_section calls
- Current theme colors and fonts`,
    input_schema: {
      type: 'object' as const,
      properties: {
        business_slug: {
          type: 'string',
          description: 'The URL slug of the business (e.g., "orleans-plumbing")',
        },
      },
      required: ['business_slug'],
    },
  },
  {
    name: 'update_section',
    description: `Update content or styles of an existing section. Use this to:
- Change headlines, text, CTAs
- Update images
- Modify colors, spacing, variants
- Enable/disable sections

IMPORTANT:
- Get section ID from get_site_config first
- Use nested objects for complex updates`,
    input_schema: {
      type: 'object' as const,
      properties: {
        business_slug: {
          type: 'string',
          description: 'The URL slug of the business',
        },
        page_slug: {
          type: 'string',
          description: 'Page slug ("" for homepage, "about", "services", etc.)',
        },
        section_id: {
          type: 'string',
          description: 'The section ID to update (from get_site_config)',
        },
        updates: {
          type: 'object',
          description: 'Object with fields to update. Keys can be "content", "styles", "enabled"',
        },
      },
      required: ['business_slug', 'page_slug', 'section_id', 'updates'],
    },
  },
  {
    name: 'add_section',
    description: `Add a new section to a page.

Available section types:
- hero: Main hero with headline, tagline, background image, CTAs
- trust-bar: Trust points with icons (Licensed, Insured, etc.)
- services: Grid of service cards
- reviews: Customer testimonials
- cta: Call-to-action banner
- contact-form: Contact form with customizable fields
- service-area: Service area map and city list
- faq: FAQ accordion`,
    input_schema: {
      type: 'object' as const,
      properties: {
        business_slug: {
          type: 'string',
          description: 'The URL slug of the business',
        },
        page_slug: {
          type: 'string',
          description: 'Page slug ("" for homepage)',
        },
        section_type: {
          type: 'string',
          enum: ['hero', 'trust-bar', 'services', 'reviews', 'cta', 'contact-form', 'service-area', 'faq', 'gallery', 'text-block', 'features'],
          description: 'Type of section to add',
        },
        content: {
          type: 'object',
          description: 'Section content object matching the type schema',
        },
        position: {
          type: 'number',
          description: 'Position in page (0 = first). Omit to add at end.',
        },
        styles: {
          type: 'object',
          description: 'Optional styles for the section',
        },
      },
      required: ['business_slug', 'page_slug', 'section_type'],
    },
  },
  {
    name: 'remove_section',
    description: 'Remove a section from a page. This permanently deletes the section from the draft config.',
    input_schema: {
      type: 'object' as const,
      properties: {
        business_slug: {
          type: 'string',
          description: 'The URL slug of the business',
        },
        page_slug: {
          type: 'string',
          description: 'Page slug ("" for homepage)',
        },
        section_id: {
          type: 'string',
          description: 'The section ID to remove',
        },
      },
      required: ['business_slug', 'page_slug', 'section_id'],
    },
  },
  {
    name: 'reorder_sections',
    description: 'Change the order of sections on a page. Provide section IDs in the desired order.',
    input_schema: {
      type: 'object' as const,
      properties: {
        business_slug: {
          type: 'string',
          description: 'The URL slug of the business',
        },
        page_slug: {
          type: 'string',
          description: 'Page slug ("" for homepage)',
        },
        section_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of section IDs in desired order',
        },
      },
      required: ['business_slug', 'page_slug', 'section_ids'],
    },
  },
  {
    name: 'update_theme',
    description: `Update global theme settings including colors and fonts.

Color options: primary, primaryDark, primaryLight, accent, accentHover, background, backgroundAlt, text, textMuted

Font options: heading, body

Border radius: "none" | "sm" | "md" | "lg" | "xl"`,
    input_schema: {
      type: 'object' as const,
      properties: {
        business_slug: {
          type: 'string',
          description: 'The URL slug of the business',
        },
        colors: {
          type: 'object',
          description: 'Color updates (e.g., { primary: "#1e40af" })',
        },
        fonts: {
          type: 'object',
          properties: {
            heading: { type: 'string' },
            body: { type: 'string' },
          },
          description: 'Font updates',
        },
        border_radius: {
          type: 'string',
          enum: ['none', 'sm', 'md', 'lg', 'xl'],
          description: 'Border radius setting',
        },
      },
      required: ['business_slug'],
    },
  },
  {
    name: 'list_businesses',
    description: 'List all businesses the user has access to. Use this to help users find their business slug.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'create_section_component',
    description: `Create a new React section component. Use this when a section type doesn't exist yet.

This writes a new .tsx file and registers it so it can be used immediately.

The component receives these props:
- config: { id, type, enabled, content, styles } - the section config from JSON
- business: Business object with name, phone, city, etc.
- basePath: string for internal links

Use Tailwind CSS for styling. Use CSS variables for theme colors:
- var(--color-primary), var(--color-accent), var(--color-text), etc.

Example component structure:
export function GallerySection({ config, business }: SectionComponentProps<GallerySectionConfig>) {
  const { content, styles } = config;
  return (
    <section className="py-16 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Your JSX here */}
      </div>
    </section>
  );
}`,
    input_schema: {
      type: 'object' as const,
      properties: {
        section_type: {
          type: 'string',
          description: 'The section type name in kebab-case (e.g., "gallery", "faq", "pricing-table")',
        },
        component_code: {
          type: 'string',
          description: 'The full React component code including imports and export',
        },
        content_schema: {
          type: 'object',
          description: 'Default content structure for this section type',
        },
      },
      required: ['section_type', 'component_code'],
    },
  },
];

// =============================================================================
// TOOL EXECUTION
// =============================================================================

async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Business;
}

async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  const supabase = createServerClient();

  try {
    switch (name) {
      case 'get_site_config': {
        const { business_slug } = input as { business_slug: string };
        console.log('[get_site_config] Looking up business:', business_slug);
        const business = await getBusinessBySlug(business_slug);

        if (!business) {
          console.log('[get_site_config] Business not found:', business_slug);
          return JSON.stringify({ error: `Business not found: ${business_slug}` });
        }

        console.log('[get_site_config] Found business:', business.id, business.name);
        const config = await getOrCreateSiteConfig(business);

        // DEBUG: Log sections the AI will see
        const homePage = config.pages.find(p => p.slug === '');
        console.log('[get_site_config] Home page sections:', homePage?.sections.map(s => ({ id: s.id, type: s.type, enabled: s.enabled })));

        // Format for readability
        const summary = formatConfigSummary(config);

        return JSON.stringify({
          business: {
            id: business.id,
            name: business.name,
            slug: business.slug,
            phone: business.phone,
            city: business.city,
            state: business.state,
          },
          summary,
          config,
        });
      }

      case 'update_section': {
        const { business_slug, page_slug, section_id, updates } = input as {
          business_slug: string;
          page_slug: string;
          section_id: string;
          updates: Record<string, unknown>;
        };

        console.log('[update_section] Input:', { business_slug, page_slug, section_id, updates });

        const business = await getBusinessBySlug(business_slug);
        if (!business) {
          console.log('[update_section] Business not found:', business_slug);
          return JSON.stringify({ error: `Business not found: ${business_slug}` });
        }

        console.log('[update_section] Found business:', business.id, business.name);

        const result = await updateSectionData(business.id, page_slug, section_id, updates);

        console.log('[update_section] Result:', result);

        if (!result.success) {
          return JSON.stringify({ error: result.error });
        }

        return JSON.stringify({
          success: true,
          message: `Updated section "${section_id}" on page "${page_slug || 'home'}"`,
        });
      }

      case 'add_section': {
        const { business_slug, page_slug, section_type, content, position, styles } = input as {
          business_slug: string;
          page_slug: string;
          section_type: string;
          content?: Record<string, unknown>;
          position?: number;
          styles?: Record<string, unknown>;
        };

        const business = await getBusinessBySlug(business_slug);
        if (!business) {
          return JSON.stringify({ error: `Business not found: ${business_slug}` });
        }

        // Auto-create component if it doesn't exist
        if (!sectionComponentExists(section_type)) {
          console.log(`[add_section] Component for '${section_type}' not found, creating...`);
          const createResult = createSectionComponent(section_type);
          if (!createResult.success) {
            return JSON.stringify({
              error: `Failed to create component for section type '${section_type}': ${createResult.error}`
            });
          }
          console.log(`[add_section] Created component for '${section_type}'`);
        }

        const sectionId = `${section_type}-${Date.now()}`;
        const defaultContent = getDefaultContent(section_type);
        const defaultStyles = getDefaultStyles(section_type);

        // Type assertion through unknown for dynamic section creation
        const section = {
          id: sectionId,
          type: section_type as SectionType,
          enabled: true,
          content: content ? { ...defaultContent, ...content } : defaultContent,
          styles: styles ? { ...defaultStyles, ...styles } : defaultStyles,
        } as unknown as SectionConfig;

        // DEBUG: Log section being added
        console.log('[add_section] Adding section:', {
          businessId: business.id,
          businessSlug: business.slug,
          pageSlug: page_slug,
          sectionId,
          sectionType: section_type,
          enabled: section.enabled,
        });

        const result = await addSectionData(business.id, page_slug, section, position);
        console.log('[add_section] Result:', result);

        if (!result.success) {
          return JSON.stringify({ error: result.error });
        }

        return JSON.stringify({
          success: true,
          message: `Added ${section_type} section with ID "${sectionId}". Refresh the page to see changes.`,
          section_id: sectionId,
          component_created: !sectionComponentExists(section_type),
        });
      }

      case 'remove_section': {
        const { business_slug, page_slug, section_id } = input as {
          business_slug: string;
          page_slug: string;
          section_id: string;
        };

        const business = await getBusinessBySlug(business_slug);
        if (!business) {
          return JSON.stringify({ error: `Business not found: ${business_slug}` });
        }

        const result = await removeSectionData(business.id, page_slug, section_id);

        if (!result.success) {
          return JSON.stringify({ error: result.error });
        }

        return JSON.stringify({
          success: true,
          message: `Removed section "${section_id}"`,
        });
      }

      case 'reorder_sections': {
        const { business_slug, page_slug, section_ids } = input as {
          business_slug: string;
          page_slug: string;
          section_ids: string[];
        };

        const business = await getBusinessBySlug(business_slug);
        if (!business) {
          return JSON.stringify({ error: `Business not found: ${business_slug}` });
        }

        const result = await reorderSectionsData(business.id, page_slug, section_ids);

        if (!result.success) {
          return JSON.stringify({ error: result.error });
        }

        return JSON.stringify({
          success: true,
          message: 'Sections reordered',
        });
      }

      case 'update_theme': {
        const { business_slug, colors, fonts, border_radius } = input as {
          business_slug: string;
          colors?: Record<string, string>;
          fonts?: { heading?: string; body?: string };
          border_radius?: string;
        };

        const business = await getBusinessBySlug(business_slug);
        if (!business) {
          return JSON.stringify({ error: `Business not found: ${business_slug}` });
        }

        // Build theme updates with partial types
        const themeUpdates: Partial<SiteConfig['theme']> = {};
        if (colors) themeUpdates.colors = colors as unknown as SiteConfig['theme']['colors'];
        if (fonts) themeUpdates.fonts = fonts as unknown as SiteConfig['theme']['fonts'];
        if (border_radius) themeUpdates.borderRadius = border_radius as SiteConfig['theme']['borderRadius'];

        const result = await updateThemeData(business.id, themeUpdates);

        if (!result.success) {
          return JSON.stringify({ error: result.error });
        }

        return JSON.stringify({
          success: true,
          message: 'Theme updated',
        });
      }

      case 'list_businesses': {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, slug, phone, city, state')
          .order('name');

        if (error) {
          return JSON.stringify({ error: error.message });
        }

        return JSON.stringify({
          businesses: data || [],
        });
      }

      case 'create_section_component': {
        const { section_type, component_code, content_schema } = input as {
          section_type: string;
          component_code: string;
          content_schema?: Record<string, unknown>;
        };

        // Convert kebab-case to PascalCase for component name
        const componentName = section_type
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('') + 'Section';

        // Paths
        const sectionsDir = path.join(process.cwd(), 'components', 'sections');
        const generatedDir = path.join(sectionsDir, 'generated');
        const componentPath = path.join(generatedDir, `${componentName}.tsx`);
        const indexPath = path.join(generatedDir, 'index.ts');

        try {
          // Ensure generated directory exists
          if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
          }

          // Write the component file
          fs.writeFileSync(componentPath, component_code, 'utf-8');

          // Read existing index or create new
          let indexContent = '';
          const existingComponents: string[] = [];

          if (fs.existsSync(indexPath)) {
            indexContent = fs.readFileSync(indexPath, 'utf-8');
            // Extract existing component names using exec loop
            const regex = /export \{ (\w+) \}/g;
            let match;
            while ((match = regex.exec(indexContent)) !== null) {
              if (match[1] !== componentName) {
                existingComponents.push(match[1]);
              }
            }
          }

          // Add new component to list
          existingComponents.push(componentName);

          // Generate new index.ts
          const newIndexContent = `/**
 * Generated Section Components
 * Auto-generated by site-agent. Do not edit manually.
 */

import { registerSection } from '@/lib/site-config/registry';

${existingComponents.map(name => {
  const type = name.replace('Section', '').replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);
  return `import { ${name} } from './${name}';
registerSection('${type}', ${name});
export { ${name} };`;
}).join('\n\n')}
`;

          fs.writeFileSync(indexPath, newIndexContent, 'utf-8');

          // Store default content schema if provided
          if (content_schema) {
            const schemasPath = path.join(generatedDir, 'schemas.json');
            let schemas: Record<string, unknown> = {};
            if (fs.existsSync(schemasPath)) {
              schemas = JSON.parse(fs.readFileSync(schemasPath, 'utf-8'));
            }
            schemas[section_type] = content_schema;
            fs.writeFileSync(schemasPath, JSON.stringify(schemas, null, 2), 'utf-8');
          }

          return JSON.stringify({
            success: true,
            message: `Created ${componentName} component. The section type "${section_type}" is now available.`,
            component_path: componentPath,
            section_type: section_type,
          });
        } catch (err) {
          return JSON.stringify({
            error: `Failed to create component: ${err instanceof Error ? err.message : 'Unknown error'}`,
          });
        }
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error) {
    console.error(`Tool execution error (${name}):`, error);
    return JSON.stringify({
      error: error instanceof Error ? error.message : 'Tool execution failed',
    });
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatConfigSummary(config: SiteConfig): string {
  const pages = config.pages.map(page => {
    const sections = page.sections.map(s =>
      `    - ${s.id} (${s.type})${!s.enabled ? ' [disabled]' : ''}`
    ).join('\n');
    return `  ${page.slug || 'home'} (${page.title}):\n${sections}`;
  }).join('\n');

  return `Pages:\n${pages}\n\nTheme: primary=${config.theme.colors.primary}, accent=${config.theme.colors.accent}`;
}

function getDefaultContent(sectionType: string): Record<string, unknown> {
  switch (sectionType) {
    case 'hero':
      return {
        headline: 'Your Headline Here',
        tagline: 'Add your compelling tagline',
        backgroundImage: { src: '', alt: '' },
        primaryCta: { text: 'Get Started', action: 'link', target: '/contact', variant: 'primary' },
        trustBadges: [],
        showRating: false,
      };
    case 'trust-bar':
      return {
        heading: 'Why Choose Us',
        points: [],
      };
    case 'services':
      return {
        eyebrow: 'Our Services',
        heading: 'What We Offer',
        subheading: '',
        services: [],
        showViewAll: false,
      };
    case 'reviews':
      return {
        heading: 'Customer Reviews',
        subheading: '',
        showGoogleRating: true,
        showGoogleLink: true,
        displayMode: 'carousel',
        maxReviews: 5,
      };
    case 'cta':
      return {
        heading: 'Ready to Get Started?',
        subheading: 'Contact us today',
        primaryCta: { text: 'Contact Us', action: 'link', target: '/contact', variant: 'primary' },
      };
    case 'contact-form':
      return {
        heading: 'Contact Us',
        subheading: '',
        fields: [
          { id: 'name', type: 'text', name: 'name', label: 'Name', required: true },
          { id: 'email', type: 'email', name: 'email', label: 'Email', required: true },
          { id: 'phone', type: 'phone', name: 'phone', label: 'Phone', required: false },
          { id: 'message', type: 'textarea', name: 'message', label: 'Message', required: true },
        ],
        submitButtonText: 'Send Message',
        successMessage: 'Thank you! We will be in touch soon.',
      };
    case 'faq':
      return {
        heading: 'Frequently Asked Questions',
        subheading: '',
        faqs: [],
      };
    case 'service-area':
      return {
        heading: 'Service Area',
        subheading: '',
        showMap: true,
        areas: [],
      };
    case 'gallery':
      return {
        headline: 'Our Work',
        tagline: 'See examples of our quality workmanship',
        images: [],
      };
    case 'features':
      return {
        eyebrow: '',
        heading: 'Why Choose Us',
        features: [],
      };
    case 'text-block':
      return {
        heading: '',
        body: '<p>Add your content here...</p>',
        imagePosition: 'right',
      };
    default:
      return { heading: 'New Section', subheading: '' };
  }
}

function getDefaultStyles(sectionType: string): Record<string, unknown> {
  switch (sectionType) {
    case 'hero':
      return { overlayOpacity: 70, textAlignment: 'left', minHeight: 'large', paddingY: 'none' };
    case 'trust-bar':
      return { variant: 'dark', layout: 'horizontal', paddingY: 'lg' };
    case 'services':
      return { columns: 3, cardStyle: 'elevated', paddingY: 'xl' };
    case 'reviews':
      return { variant: 'light', paddingY: 'xl' };
    case 'cta':
      return { variant: 'banner', paddingY: 'lg' };
    case 'contact-form':
      return { paddingY: 'xl' };
    default:
      return { paddingY: 'lg' };
  }
}

// =============================================================================
// SYSTEM PROMPT
// =============================================================================

const SYSTEM_PROMPT = `You are an expert site editor for Atlas, a platform that creates websites for local service businesses (plumbers, electricians, HVAC, contractors, etc.).

## MANDATORY FIRST ACTION - NO EXCEPTIONS
Before responding to ANY user message, you MUST FIRST call the get_site_config tool.
This is not optional. Do not skip this step. Do not use conversation history.
Call get_site_config FIRST, then respond based on the tool result.

Even if you think you know the answer from previous messages, YOU ARE WRONG.
The database is the source of truth. Your memory is always stale.
CALL get_site_config FIRST. ALWAYS. EVERY SINGLE TIME.

## Your Capabilities
- View and understand site configurations
- Update section content (headlines, text, images, colors, CTAs)
- Change site themes (colors, fonts, border radius)
- Add, remove, or reorder sections
- Help users achieve specific design goals

## Design Principles (from frontend-design skill)

### Trust-First Design
Local service businesses need immediate credibility:
- Clean, professional layouts
- High-quality imagery (real work, not stock)
- Visible certifications and badges
- Customer ratings prominently displayed

### Conversion-Focused
Primary goal: phone calls and form submissions
- Phone number: LARGE, clickable, always visible
- Clear headline stating what + where
- Trust badges (Licensed, Insured, etc.)

### Color Guidelines by Trade
- Plumbing: Blues, Teals (water, trust)
- Electrical: Oranges, Yellows (energy, alertness)
- HVAC: Blues, Greens (comfort, freshness)
- Roofing: Browns, Oranges (durability)
- General: Navy, Grays (professionalism)

### Typography
- Headlines: Bold sans-serif (Outfit, Poppins, Inter)
- Body: 16px+ for readability
- Phone numbers: Large and tappable

## Workflow
1. FIRST: Call get_site_config to understand current state
2. DISCUSS: Confirm changes before making them
3. EXECUTE: Make changes incrementally
4. EXPLAIN: Tell the user what you did

## Available Section Types
- hero: Main hero with headline, tagline, background, CTAs
- trust-bar: Trust points with icons
- services: Grid of service cards
- reviews: Customer testimonials
- cta: Call-to-action banner
- contact-form: Lead capture form
- service-area: Service area map
- faq: FAQ accordion

## Creating Custom Sections
If a user requests a section type that doesn't exist (like gallery, pricing, team, etc.), use the create_section_component tool to generate a new React component.

When creating components, use these exact imports:
\`\`\`tsx
import React from 'react';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { BaseSectionConfig } from '@/lib/site-config/types';
\`\`\`

Component structure:
\`\`\`tsx
interface MySectionConfig extends BaseSectionConfig {
  type: 'my-section';
  content: { /* your content fields */ };
}

export function MySection({ config, business }: SectionComponentProps<MySectionConfig>) {
  const { content, styles } = config;
  return (
    <section className="py-16 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Your JSX */}
      </div>
    </section>
  );
}
\`\`\`

Use Tailwind CSS and theme variables: var(--color-primary), var(--color-accent), var(--color-text), var(--color-text-muted).

Be conversational and helpful. Guide users to good design decisions.`;

// =============================================================================
// API HANDLER - STREAMING
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, business_slug, session_id } = body as {
      messages: Anthropic.MessageParam[];
      business_slug?: string;
      session_id?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Messages array required' }, { status: 400 });
    }

    // Filter out messages with empty content
    const validMessages = messages.filter((msg) => {
      if (typeof msg.content === 'string') {
        return msg.content.trim() !== '';
      }
      if (Array.isArray(msg.content)) {
        return msg.content.length > 0;
      }
      return Boolean(msg.content);
    });

    // Build system prompt with business context
    let systemPrompt = SYSTEM_PROMPT;
    if (business_slug) {
      systemPrompt += `\n\nCurrent business slug: "${business_slug}". Use this when calling tools.`;
    }

    // Generate session ID if not provided
    const currentSessionId = session_id || `session-${Date.now()}`;

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send initial session message
        controller.enqueue(encoder.encode(createStreamMessage({
          type: 'text',
          content: '',
          session_id: currentSessionId,
        })));

        try {
          // Create message with streaming
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: systemPrompt,
            tools,
            messages: validMessages,
            stream: true,
          });

          let currentText = '';
          let toolCalls: Array<{ id: string; name: string; input: string }> = [];
          let currentToolId = '';
          let currentToolName = '';
          let currentToolInput = '';

          // Process stream events
          for await (const event of response) {
            if (event.type === 'content_block_start') {
              if (event.content_block.type === 'text') {
                // Text block starting
              } else if (event.content_block.type === 'tool_use') {
                currentToolId = event.content_block.id;
                currentToolName = event.content_block.name;
                currentToolInput = '';
                controller.enqueue(encoder.encode(createStreamMessage({
                  type: 'tool_call',
                  tool_name: currentToolName,
                })));
              }
            } else if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                currentText += event.delta.text;
                controller.enqueue(encoder.encode(createStreamMessage({
                  type: 'text',
                  content: event.delta.text,
                })));
              } else if (event.delta.type === 'input_json_delta') {
                currentToolInput += event.delta.partial_json;
              }
            } else if (event.type === 'content_block_stop') {
              if (currentToolId && currentToolName) {
                toolCalls.push({
                  id: currentToolId,
                  name: currentToolName,
                  input: currentToolInput,
                });
                currentToolId = '';
                currentToolName = '';
                currentToolInput = '';
              }
            } else if (event.type === 'message_stop') {
              // Message complete
            }
          }

          // If there were tool calls, execute them and continue
          if (toolCalls.length > 0) {
            // Build tool results
            const toolResults: Anthropic.ToolResultBlockParam[] = [];

            for (const tool of toolCalls) {
              let input: Record<string, unknown> = {};
              try {
                input = JSON.parse(tool.input || '{}');
              } catch {
                // Handle malformed JSON
              }

              const result = await executeTool(tool.name, input);
              toolResults.push({
                type: 'tool_result',
                tool_use_id: tool.id,
                content: result,
              });

              controller.enqueue(encoder.encode(createStreamMessage({
                type: 'tool_result',
                tool_name: tool.name,
                tool_result: result,
              })));
            }

            // Continue conversation with tool results
            // Use ContentBlockParam instead of ContentBlock since we're building message params
            const assistantContent: Anthropic.ContentBlockParam[] = [];
            if (currentText) {
              assistantContent.push({ type: 'text', text: currentText });
            }
            for (const tool of toolCalls) {
              let input: Record<string, unknown> = {};
              try {
                input = JSON.parse(tool.input || '{}');
              } catch {
                // Handle malformed JSON
              }
              assistantContent.push({
                type: 'tool_use',
                id: tool.id,
                name: tool.name,
                input,
              });
            }

            const updatedMessages: Anthropic.MessageParam[] = [
              ...validMessages,
              { role: 'assistant', content: assistantContent },
              { role: 'user', content: toolResults },
            ];

            // Get follow-up response (streaming)
            const followUp = await anthropic.messages.create({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 4096,
              system: systemPrompt,
              tools,
              messages: updatedMessages,
              stream: true,
            });

            for await (const event of followUp) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                controller.enqueue(encoder.encode(createStreamMessage({
                  type: 'text',
                  content: event.delta.text,
                })));
              }
            }
          }

          // Send done message
          controller.enqueue(encoder.encode(createStreamMessage({
            type: 'done',
            session_id: currentSessionId,
          })));

        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(createStreamMessage({
            type: 'error',
            content: error instanceof Error ? error.message : 'Stream error',
          })));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Site agent error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Agent error' },
      { status: 500 }
    );
  }
}
