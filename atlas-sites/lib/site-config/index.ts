/**
 * Site Config Module
 *
 * Re-exports all site configuration types and functions.
 */

// Types
export * from './types';

// Registry
export {
  registerSection,
  getSection,
  hasSection,
  getAllSectionTypes,
  getRegisteredSectionCount,
  getSectionMetadata,
  getAllSectionMetadata,
  getAvailableSectionTypes,
} from './registry';
export type { SectionComponentProps, SectionMetadata } from './registry';

// Defaults
export {
  DEFAULT_THEME,
  generateDefaultConfig,
  createDefaultHeroSection,
  createDefaultTrustBarSection,
  createDefaultServicesSection,
  createDefaultReviewsSection,
  createDefaultCtaSection,
  createDefaultContactFormSection,
} from './defaults';

// Utils
export {
  generateId,
  getSectionLabel,
  getSectionIconName,
  deepMerge,
  validateConfig,
  getThemeCssVariables,
  findSectionById,
  slugify,
} from './utils';

// Data operations
export {
  getSiteConfig,
  getPublishedSiteConfig,
  getSiteConfigBySlug,
  getOrCreateSiteConfig,
  saveSiteConfig,
  publishSiteConfig,
  saveConfigHistory,
  updateSection,
  addSection,
  removeSection,
  reorderSections,
  updateTheme,
} from './data';
