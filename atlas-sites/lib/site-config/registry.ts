/**
 * Section Component Registry
 *
 * Maps section types to their React components.
 * Components register themselves on import.
 */

import { ComponentType } from 'react';
import { SectionConfig, SectionType } from './types';
import { Business } from '@/lib/types';

// =============================================================================
// COMPONENT PROPS INTERFACE
// =============================================================================

/**
 * Props passed to all section components
 */
export interface SectionComponentProps<T extends SectionConfig = SectionConfig> {
  /** Section configuration from site config */
  config: T;

  /** Business data from database */
  business: Business;

  /** Base path for links (e.g., "/plumbing-marco-plumbing") */
  basePath: string;

  /** Whether component is being rendered in edit mode */
  isEditing?: boolean;
}

// =============================================================================
// REGISTRY
// =============================================================================

/**
 * Registry mapping section types to their components
 */
const sectionRegistry = new Map<
  SectionType,
  ComponentType<SectionComponentProps<SectionConfig>>
>();

/**
 * Register a section component
 *
 * @param type - The section type identifier
 * @param component - The React component to render this section
 *
 * @example
 * ```tsx
 * registerSection('hero', HeroSection);
 * ```
 */
export function registerSection<T extends SectionConfig>(
  type: T['type'],
  component: ComponentType<SectionComponentProps<T>>
): void {
  sectionRegistry.set(
    type,
    component as ComponentType<SectionComponentProps<SectionConfig>>
  );
}

/**
 * Get a section component by type
 *
 * @param type - The section type to look up
 * @returns The component or undefined if not registered
 */
export function getSection(
  type: SectionType
): ComponentType<SectionComponentProps<SectionConfig>> | undefined {
  return sectionRegistry.get(type);
}

/**
 * Check if a section type is registered
 */
export function hasSection(type: SectionType): boolean {
  return sectionRegistry.has(type);
}

/**
 * Get all registered section types
 */
export function getAllSectionTypes(): SectionType[] {
  return Array.from(sectionRegistry.keys());
}

/**
 * Get the count of registered sections
 */
export function getRegisteredSectionCount(): number {
  return sectionRegistry.size;
}

// =============================================================================
// SECTION METADATA
// =============================================================================

/**
 * Metadata about a section type for the admin UI
 */
export interface SectionMetadata {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
  category: 'content' | 'layout' | 'conversion';
}

const sectionMetadata: SectionMetadata[] = [
  {
    type: 'hero',
    label: 'Hero Banner',
    description: 'Large banner with headline, tagline, and call-to-action',
    icon: 'layout',
    category: 'layout',
  },
  {
    type: 'trust-bar',
    label: 'Trust Bar',
    description: 'Highlight key trust signals and value propositions',
    icon: 'shield',
    category: 'conversion',
  },
  {
    type: 'services',
    label: 'Services',
    description: 'Grid of service offerings with images and descriptions',
    icon: 'grid',
    category: 'content',
  },
  {
    type: 'reviews',
    label: 'Reviews',
    description: 'Display customer testimonials and ratings',
    icon: 'star',
    category: 'conversion',
  },
  {
    type: 'cta',
    label: 'Call to Action',
    description: 'Prominent banner encouraging user action',
    icon: 'megaphone',
    category: 'conversion',
  },
  {
    type: 'contact-form',
    label: 'Contact Form',
    description: 'Form for collecting leads and inquiries',
    icon: 'mail',
    category: 'conversion',
  },
  // Future sections
  {
    type: 'service-area',
    label: 'Service Area',
    description: 'Map and list of areas served',
    icon: 'map',
    category: 'content',
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Frequently asked questions accordion',
    icon: 'help-circle',
    category: 'content',
  },
  {
    type: 'gallery',
    label: 'Gallery',
    description: 'Image gallery or portfolio',
    icon: 'image',
    category: 'content',
  },
  {
    type: 'text-block',
    label: 'Text Block',
    description: 'Rich text content with optional image',
    icon: 'type',
    category: 'content',
  },
  {
    type: 'features',
    label: 'Features',
    description: 'List of features or benefits',
    icon: 'check-circle',
    category: 'content',
  },
];

/**
 * Get metadata for a section type
 */
export function getSectionMetadata(type: SectionType): SectionMetadata | undefined {
  return sectionMetadata.find((m) => m.type === type);
}

/**
 * Get all section metadata (for admin UI section picker)
 */
export function getAllSectionMetadata(): SectionMetadata[] {
  return sectionMetadata;
}

/**
 * Get available section types (only those that are implemented)
 */
export function getAvailableSectionTypes(): SectionMetadata[] {
  return sectionMetadata.filter((m) => hasSection(m.type));
}
