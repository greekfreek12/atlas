// Template types
export type TemplateName = 'plumbing';

// Business status
export type BusinessStatus = 'prospect' | 'active' | 'churned' | 'paused';

// Logo quality for ML training
export type LogoQuality = 'good' | 'bad' | 'unlabeled';

// ============================================
// Lead & CRM Types
// ============================================

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'demo' | 'customer' | 'lost';
export type LeadStage = 'awareness' | 'consideration' | 'decision';

export interface Lead {
  id: string;
  business_id: string;
  status: LeadStatus;
  stage: LeadStage;
  // Business owner info
  owner_name: string | null;
  owner_email: string | null;
  // Contact info (from form submissions, etc.)
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
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;

  // Logo
  logo: string | null;

  // Custom domain for white-label sites
  custom_domain: string | null;

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

// ============================================
// Business Reviews
// ============================================

export interface BusinessReview {
  id: string;
  business_id: string;
  review_id: string | null;
  reviewer_name: string | null;
  reviewer_link: string | null;
  is_local_guide: boolean;
  reviewer_reviews_count: number | null;
  reviewer_photos_count: number | null;
  rating: number;
  review_text: string | null;
  review_date: string | null;
  published_at: string | null;
  photos: string[] | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewScrapeJob {
  id: string;
  business_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  reviews_found: number;
  reviews_imported: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// Database type for Supabase (simplified - only core tables)
export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: Business;
        Insert: Omit<Business, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Business, 'id'>>;
      };
      business_reviews: {
        Row: BusinessReview;
        Insert: Omit<BusinessReview, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BusinessReview, 'id'>>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Lead, 'id'>>;
      };
      sms_messages: {
        Row: SMSMessage;
        Insert: Omit<SMSMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<SMSMessage, 'id'>>;
      };
    };
  };
}

// Helper type for business with services
export interface BusinessWithServices extends Business {
  services: Service[];
}
