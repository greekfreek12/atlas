/**
 * Site Config Utilities
 *
 * Helper functions for working with site configurations.
 */

import { SectionType, IconName } from './types';

/**
 * Generate a unique ID for sections, pages, etc.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Get a human-readable label for a section type
 */
export function getSectionLabel(type: SectionType): string {
  const labels: Record<SectionType, string> = {
    hero: 'Hero Banner',
    'trust-bar': 'Trust Bar',
    services: 'Services',
    reviews: 'Reviews',
    cta: 'Call to Action',
    'contact-form': 'Contact Form',
    'service-area': 'Service Area',
    faq: 'FAQ',
    gallery: 'Gallery',
    'text-block': 'Text Block',
    features: 'Features',
  };
  return labels[type] || type;
}

/**
 * Get the icon name for a section type (for admin UI)
 */
export function getSectionIconName(type: SectionType): IconName {
  const icons: Record<SectionType, IconName> = {
    hero: 'home',
    'trust-bar': 'shield-check',
    services: 'wrench',
    reviews: 'star',
    cta: 'zap',
    'contact-form': 'mail',
    'service-area': 'map-pin',
    faq: 'check-circle',
    gallery: 'home', // TODO: add image icon
    'text-block': 'check', // TODO: add text icon
    features: 'check-circle',
  };
  return icons[type] || 'check';
}

/**
 * Deep merge two objects, with source overriding target
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      // Recursively merge objects
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else if (sourceValue !== undefined) {
      // Override with source value
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Convert a section type to a URL-friendly slug
 */
export function sectionTypeToSlug(type: SectionType): string {
  return type.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Validate that a config object has required fields
 */
export function validateConfig(config: unknown): boolean {
  if (!config || typeof config !== 'object') return false;

  const c = config as Record<string, unknown>;

  // Check required top-level fields
  if (!c.version || !c.theme || !c.pages || !c.globals) return false;

  // Check pages array
  if (!Array.isArray(c.pages) || c.pages.length === 0) return false;

  return true;
}

/**
 * Get CSS variable declarations from theme colors
 */
export function getThemeCssVariables(colors: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(colors).map(([key, value]) => [
      `--color-${camelToKebab(key)}`,
      value,
    ])
  );
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Find a section by ID in a pages array
 */
export function findSectionById(
  pages: Array<{ sections: Array<{ id: string }> }>,
  sectionId: string
): { pageIndex: number; sectionIndex: number } | null {
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    const sectionIndex = page.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex !== -1) {
      return { pageIndex, sectionIndex };
    }
  }
  return null;
}

/**
 * Create a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
