// Template types
export type TemplateName = 'industrial' | 'clean' | 'friendly';

// Business status
export type BusinessStatus = 'prospect' | 'active' | 'churned' | 'paused';

// ============================================
// V2: Niches
// ============================================

export interface Niche {
  id: string;
  slug: string;
  display_name: string;
  schema_type: string;
  default_headline_template: string | null;
  default_tagline_template: string | null;
  default_about_template: string | null;
  hero_images: string[] | null;
  icon_set: string;
  created_at: string;
}

export interface NicheImageMapping {
  id: string;
  niche_id: string;
  service_slug: string;
  images: string[];
  created_at: string;
}

// ============================================
// V2: Lead & CRM Types
// ============================================

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'demo' | 'customer' | 'lost';
export type LeadStage = 'awareness' | 'consideration' | 'decision';

export interface Lead {
  id: string;
  business_id: string;
  status: LeadStatus;
  stage: LeadStage;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  score: number;
  score_factors: Record<string, number> | null;
  source: string | null;
  utm_data: Record<string, string> | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadWithBusiness extends Lead {
  business: Business;
}

export type SMSCampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface SMSCampaign {
  id: string;
  name: string;
  niche_id: string | null;
  message_template: string;
  follow_up_templates: string[] | null;
  target_criteria: Record<string, unknown> | null;
  status: SMSCampaignStatus;
  total_sent: number;
  total_delivered: number;
  total_responded: number;
  total_converted: number;
  created_at: string;
  updated_at: string;
}

export type SMSDirection = 'outbound' | 'inbound';
export type SMSStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'received';

export interface SMSMessage {
  id: string;
  campaign_id: string | null;
  lead_id: string;
  to_phone: string;
  from_phone: string;
  message_body: string;
  textgrid_message_id: string | null;
  direction: SMSDirection;
  status: SMSStatus;
  error_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export type LeadActivityType =
  | 'sms_sent'
  | 'sms_received'
  | 'site_view'
  | 'form_submit'
  | 'status_change'
  | 'note_added'
  | 'score_updated';

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: LeadActivityType;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ============================================
// V2: Research Types
// ============================================

export interface BusinessResearch {
  id: string;
  business_id: string;
  facebook_data: Record<string, unknown> | null;
  instagram_data: Record<string, unknown> | null;
  website_url: string | null;
  website_images: string[] | null;
  website_content: Record<string, unknown> | null;
  generated_headline: string | null;
  generated_tagline: string | null;
  generated_about: string | null;
  generated_service_descriptions: Record<string, string> | null;
  outscraper_completed_at: string | null;
  social_completed_at: string | null;
  website_completed_at: string | null;
  ai_copy_completed_at: string | null;
  profile_completeness_score: number | null;
  data_quality_score: number | null;
  created_at: string;
  updated_at: string;
}

export type ResearchJobType = 'outscraper' | 'apify_social' | 'website' | 'ai_copy';
export type ResearchJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ResearchJob {
  id: string;
  business_id: string;
  job_type: ResearchJobType;
  status: ResearchJobStatus;
  priority: number;
  input_data: Record<string, unknown> | null;
  output_data: Record<string, unknown> | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// ============================================
// V2: Site Customization Types
// ============================================

export type CustomizationStatus = 'pending' | 'in_progress' | 'review' | 'approved' | 'published';

export interface SiteCustomization {
  id: string;
  business_id: string;
  status: CustomizationStatus;
  headline_customized: boolean;
  tagline_customized: boolean;
  about_customized: boolean;
  services_customized: boolean;
  images_customized: boolean;
  colors_customized: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Working hours structure
export interface WorkingHours {
  Monday?: string;
  Tuesday?: string;
  Wednesday?: string;
  Thursday?: string;
  Friday?: string;
  Saturday?: string;
  Sunday?: string;
}

// Main business type
export interface Business {
  id: string;
  slug: string;
  template: TemplateName;
  niche_id: string | null;

  // Basic info
  name: string;
  phone: string | null;
  email: string | null;

  // Location
  full_address: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;

  // Google data
  google_rating: number | null;
  google_reviews_count: number | null;
  google_reviews_link: string | null;
  google_place_id: string | null;

  // Hours
  working_hours: WorkingHours | null;

  // Social links
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;

  // Customizations
  custom_headline: string | null;
  custom_tagline: string | null;
  custom_about: string | null;
  primary_color: string | null;
  accent_color: string | null;

  // Status
  status: BusinessStatus;
  is_published: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Service type
export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

// Form submission type
export interface FormSubmission {
  id: string;
  business_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  created_at: string;
}

// Page view type
export interface PageView {
  id: string;
  business_id: string;
  session_id: string | null;
  page_path: string | null;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

// Default service (for niche templates)
export interface DefaultService {
  id: string;
  niche: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

// Database type for Supabase
export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: Business;
        Insert: Omit<Business, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Business, 'id'>>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, 'id' | 'created_at'>;
        Update: Partial<Omit<Service, 'id'>>;
      };
      form_submissions: {
        Row: FormSubmission;
        Insert: Omit<FormSubmission, 'id' | 'created_at'>;
        Update: Partial<Omit<FormSubmission, 'id'>>;
      };
      page_views: {
        Row: PageView;
        Insert: Omit<PageView, 'id' | 'created_at'>;
        Update: Partial<Omit<PageView, 'id'>>;
      };
      default_services: {
        Row: DefaultService;
        Insert: Omit<DefaultService, 'id'>;
        Update: Partial<Omit<DefaultService, 'id'>>;
      };
      outscraper_imports: {
        Row: {
          id: string;
          raw_data: Record<string, unknown>;
          imported_at: string;
          processed: boolean;
        };
        Insert: {
          raw_data: Record<string, unknown>;
          processed?: boolean;
        };
        Update: {
          processed?: boolean;
        };
      };
    };
  };
}

// Helper type for business with services
export interface BusinessWithServices extends Business {
  services: Service[];
}

// Template config type
export interface TemplateConfig {
  name: TemplateName;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    display: string;
    body: string;
  };
}

// Template configurations
export const TEMPLATE_CONFIGS: Record<TemplateName, TemplateConfig> = {
  industrial: {
    name: 'industrial',
    displayName: 'Industrial',
    colors: {
      primary: '#1a1a1a',
      secondary: '#4a5568',
      accent: '#b87333',
      background: '#0f0f0f',
      text: '#ffffff',
    },
    fonts: {
      display: 'Oswald',
      body: 'Source Sans 3',
    },
  },
  clean: {
    name: 'clean',
    displayName: 'Clean',
    colors: {
      primary: '#1e3a5f',
      secondary: '#ffffff',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#1e3a5f',
    },
    fonts: {
      display: 'Playfair Display',
      body: 'DM Sans',
    },
  },
  friendly: {
    name: 'friendly',
    displayName: 'Friendly',
    colors: {
      primary: '#2563eb',
      secondary: '#faf7f2',
      accent: '#f59e0b',
      background: '#faf7f2',
      text: '#1f2937',
    },
    fonts: {
      display: 'Nunito',
      body: 'Nunito',
    },
  },
};
