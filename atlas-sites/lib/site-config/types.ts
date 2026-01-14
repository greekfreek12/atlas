/**
 * Site Config Types
 *
 * Defines the complete JSON structure for configurable sites.
 * Every section, style, and content field is defined here.
 */

// =============================================================================
// MAIN CONFIG STRUCTURE
// =============================================================================

export interface SiteConfig {
  /** Schema version for future migrations */
  version: 1;

  /** Global theme settings (colors, fonts, etc.) */
  theme: ThemeConfig;

  /** Page configurations */
  pages: PageConfig[];

  /** Global components (header, footer) */
  globals: GlobalComponentsConfig;
}

// =============================================================================
// THEME CONFIG
// =============================================================================

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: ThemeFonts;
  borderRadius: BorderRadius;
}

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentHover: string;
  accentMuted: string;
  accentLight: string;
  background: string;
  backgroundAlt: string;
  text: string;
  textMuted: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

// =============================================================================
// PAGE CONFIG
// =============================================================================

export interface PageConfig {
  /** Unique identifier */
  id: string;

  /** URL path: "" for home, "about", "contact", "services/emergency-plumbing" */
  slug: string;

  /** Page title for SEO */
  title: string;

  /** Meta description for SEO */
  description?: string;

  /** Ordered list of sections */
  sections: SectionConfig[];
}

// =============================================================================
// GLOBAL COMPONENTS
// =============================================================================

export interface GlobalComponentsConfig {
  header: HeaderConfig;
  footer: FooterConfig;
}

export interface HeaderConfig {
  variant: 'standard' | 'minimal' | 'centered';
  showLogo: boolean;
  showPhone: boolean;
  navigation: NavItem[];
  ctaButton?: CtaButton;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface FooterConfig {
  variant: 'standard' | 'minimal' | 'expanded';
  columns: FooterColumn[];
  showSocialLinks: boolean;
  bottomText?: string;
}

export interface FooterColumn {
  title: string;
  type: 'links' | 'contact' | 'hours' | 'text';
  links?: { label: string; href: string }[];
  content?: string;
}

// =============================================================================
// SECTION TYPES
// =============================================================================

// Built-in section types
export type BuiltInSectionType =
  | 'hero'
  | 'trust-bar'
  | 'services'
  | 'reviews'
  | 'cta'
  | 'contact-form'
  | 'service-area'
  | 'faq'
  | 'gallery'
  | 'text-block'
  | 'features';

// Allow any string for dynamically generated sections
export type SectionType = BuiltInSectionType | (string & {});

/** Base interface for all sections */
export interface BaseSectionConfig {
  /** Unique identifier for this section instance */
  id: string;

  /** Section type determines which component renders */
  type: SectionType;

  /** Whether this section is visible */
  enabled: boolean;

  /** Optional custom styles */
  styles?: SectionStyles;
}

/** Common section styling options */
export interface SectionStyles {
  backgroundColor?: string;
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/** Generic section config for dynamically generated sections */
export interface GenericSectionConfig extends BaseSectionConfig {
  type: string;
  content: Record<string, unknown>;
  styles?: SectionStyles;
}

/** Union type of all section configs */
export type SectionConfig =
  | HeroSectionConfig
  | TrustBarSectionConfig
  | ServicesSectionConfig
  | ReviewsSectionConfig
  | CtaSectionConfig
  | ContactFormSectionConfig
  | ServiceAreaSectionConfig
  | FaqSectionConfig
  | GallerySectionConfig
  | TextBlockSectionConfig
  | FeaturesSectionConfig
  | GenericSectionConfig;

// =============================================================================
// HERO SECTION
// =============================================================================

export interface HeroSectionConfig extends BaseSectionConfig {
  type: 'hero';
  content: HeroContent;
  styles?: HeroStyles;
}

export interface HeroContent {
  headline: string;
  tagline: string;
  backgroundImage: ImageRef;
  primaryCta: CtaButton;
  secondaryCta?: CtaButton;
  trustBadges: string[];
  showRating: boolean;
}

export interface HeroStyles extends SectionStyles {
  overlayOpacity?: number; // 0-100
  textAlignment?: 'left' | 'center';
  minHeight?: 'small' | 'medium' | 'large' | 'full';
}

// =============================================================================
// TRUST BAR SECTION
// =============================================================================

export interface TrustBarSectionConfig extends BaseSectionConfig {
  type: 'trust-bar';
  content: TrustBarContent;
  styles?: TrustBarStyles;
}

export interface TrustBarContent {
  heading?: string;
  points: TrustPoint[];
}

export interface TrustPoint {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

export interface TrustBarStyles extends SectionStyles {
  variant?: 'dark' | 'light' | 'accent';
  layout?: 'horizontal' | 'grid';
}

// =============================================================================
// SERVICES SECTION
// =============================================================================

export interface ServicesSectionConfig extends BaseSectionConfig {
  type: 'services';
  content: ServicesContent;
  styles?: ServicesStyles;
}

export interface ServicesContent {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  services: ServiceItem[];
  showViewAll: boolean;
  viewAllLink?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  image?: ImageRef;
  icon?: IconName;
  link?: string;
}

export interface ServicesStyles extends SectionStyles {
  columns?: 2 | 3 | 4;
  cardStyle?: 'minimal' | 'elevated' | 'bordered';
}

// =============================================================================
// REVIEWS SECTION
// =============================================================================

export interface ReviewsSectionConfig extends BaseSectionConfig {
  type: 'reviews';
  content: ReviewsContent;
  styles?: ReviewsStyles;
}

export interface ReviewsContent {
  heading: string;
  subheading?: string;
  showGoogleRating: boolean;
  showGoogleLink: boolean;
  displayMode: 'carousel' | 'grid';
  maxReviews: number;
  /** Custom reviews (falls back to database reviews if empty) */
  customReviews?: CustomReview[];
}

export interface CustomReview {
  id: string;
  name: string;
  location?: string;
  text: string;
  rating: number;
}

export interface ReviewsStyles extends SectionStyles {
  variant?: 'dark' | 'light';
}

// =============================================================================
// CTA SECTION
// =============================================================================

export interface CtaSectionConfig extends BaseSectionConfig {
  type: 'cta';
  content: CtaContent;
  styles?: CtaStyles;
}

export interface CtaContent {
  heading: string;
  subheading?: string;
  primaryCta: CtaButton;
  secondaryCta?: CtaButton;
  backgroundImage?: ImageRef;
}

export interface CtaStyles extends SectionStyles {
  variant?: 'simple' | 'split' | 'banner';
}

// =============================================================================
// CONTACT FORM SECTION
// =============================================================================

export interface ContactFormSectionConfig extends BaseSectionConfig {
  type: 'contact-form';
  content: ContactFormContent;
  styles?: SectionStyles;
}

export interface ContactFormContent {
  heading: string;
  subheading?: string;
  fields: FormField[];
  submitButtonText: string;
  successMessage: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
}

// =============================================================================
// SERVICE AREA SECTION (Future)
// =============================================================================

export interface ServiceAreaSectionConfig extends BaseSectionConfig {
  type: 'service-area';
  content: ServiceAreaContent;
  styles?: SectionStyles;
}

export interface ServiceAreaContent {
  heading: string;
  subheading?: string;
  showMap: boolean;
  areas: string[];
  ctaText?: string;
}

// =============================================================================
// FAQ SECTION (Future)
// =============================================================================

export interface FaqSectionConfig extends BaseSectionConfig {
  type: 'faq';
  content: FaqContent;
  styles?: SectionStyles;
}

export interface FaqContent {
  heading: string;
  subheading?: string;
  faqs: FaqItem[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// =============================================================================
// GALLERY SECTION (Future)
// =============================================================================

export interface GallerySectionConfig extends BaseSectionConfig {
  type: 'gallery';
  content: GalleryContent;
  styles?: GalleryStyles;
}

export interface GalleryContent {
  heading?: string;
  images: ImageRef[];
}

export interface GalleryStyles extends SectionStyles {
  columns?: 2 | 3 | 4;
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

// =============================================================================
// TEXT BLOCK SECTION (Future)
// =============================================================================

export interface TextBlockSectionConfig extends BaseSectionConfig {
  type: 'text-block';
  content: TextBlockContent;
  styles?: SectionStyles;
}

export interface TextBlockContent {
  heading?: string;
  body: string; // Supports markdown or HTML
  image?: ImageRef;
  imagePosition?: 'left' | 'right' | 'top' | 'bottom';
}

// =============================================================================
// FEATURES SECTION (Future)
// =============================================================================

export interface FeaturesSectionConfig extends BaseSectionConfig {
  type: 'features';
  content: FeaturesContent;
  styles?: FeaturesStyles;
}

export interface FeaturesContent {
  eyebrow?: string;
  heading: string;
  features: FeatureItem[];
}

export interface FeatureItem {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

export interface FeaturesStyles extends SectionStyles {
  layout?: 'grid' | 'list' | 'alternating';
}

// =============================================================================
// SHARED TYPES
// =============================================================================

/** Reference to an image (either URL or Supabase Storage path) */
export interface ImageRef {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

/** Call-to-action button configuration */
export interface CtaButton {
  text: string;
  action: 'phone' | 'email' | 'link' | 'scroll';
  target?: string; // Phone number, email, URL, or section ID
  variant: 'primary' | 'secondary' | 'outline';
}

/** Available icon names (Lucide icons) */
export type IconName =
  | 'phone'
  | 'mail'
  | 'map-pin'
  | 'clock'
  | 'star'
  | 'shield'
  | 'shield-check'
  | 'wrench'
  | 'home'
  | 'dollar-sign'
  | 'check'
  | 'check-circle'
  | 'arrow-right'
  | 'droplets'
  | 'flame'
  | 'search'
  | 'alert-triangle'
  | 'cylinder'
  | 'users'
  | 'award'
  | 'thumbs-up'
  | 'heart'
  | 'zap';

// =============================================================================
// DATABASE ROW TYPE
// =============================================================================

export interface SiteConfigRow {
  id: string;
  business_id: string;
  version: number;
  is_draft: boolean;
  published_at: string | null;
  config: SiteConfig;
  created_at: string;
  updated_at: string;
}

export interface SiteConfigHistoryRow {
  id: string;
  site_config_id: string;
  config: SiteConfig;
  version: number;
  change_description: string | null;
  created_at: string;
}
