-- Atlas V2 Schema Migration
-- Adds: niches, research pipeline, CRM, site customizations
-- Run this after the initial schema (001)

-- ============================================
-- 1. NICHES TABLE (Multi-Niche Support)
-- ============================================

CREATE TABLE niches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  schema_type VARCHAR(100) DEFAULT 'LocalBusiness',
  default_headline_template TEXT,
  default_tagline_template TEXT,
  default_about_template TEXT,
  hero_images JSONB,
  icon_set VARCHAR(50) DEFAULT 'lucide',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add niche_id to businesses
ALTER TABLE businesses ADD COLUMN niche_id UUID REFERENCES niches(id);

-- Add niche_id to default_services (replace old varchar niche column)
ALTER TABLE default_services ADD COLUMN niche_id UUID REFERENCES niches(id);

-- Create index for niche lookups
CREATE INDEX idx_businesses_niche ON businesses(niche_id);
CREATE INDEX idx_default_services_niche ON default_services(niche_id);

-- ============================================
-- 2. NICHE IMAGE MAPPINGS
-- ============================================

CREATE TABLE niche_image_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  niche_id UUID REFERENCES niches(id) ON DELETE CASCADE,
  service_slug VARCHAR(100) NOT NULL,
  images JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(niche_id, service_slug)
);

-- ============================================
-- 3. RESEARCH DATA TABLES
-- ============================================

CREATE TABLE business_research (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,

  -- Social media data
  facebook_data JSONB,
  instagram_data JSONB,

  -- Website scraping
  website_url TEXT,
  website_images JSONB,
  website_content JSONB,

  -- AI-generated content
  generated_headline TEXT,
  generated_tagline TEXT,
  generated_about TEXT,
  generated_service_descriptions JSONB,

  -- Research completion timestamps
  outscraper_completed_at TIMESTAMP WITH TIME ZONE,
  social_completed_at TIMESTAMP WITH TIME ZONE,
  website_completed_at TIMESTAMP WITH TIME ZONE,
  ai_copy_completed_at TIMESTAMP WITH TIME ZONE,

  -- Quality scores (0-100)
  profile_completeness_score INTEGER,
  data_quality_score INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE research_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL,  -- 'outscraper', 'apify_social', 'website', 'ai_copy'
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'running', 'completed', 'failed'
  priority INTEGER DEFAULT 5,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_research_jobs_status ON research_jobs(status, priority);
CREATE INDEX idx_research_jobs_business ON research_jobs(business_id);
CREATE INDEX idx_business_research_business ON business_research(business_id);

-- ============================================
-- 4. CRM TABLES
-- ============================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,

  -- Lead status
  status VARCHAR(50) DEFAULT 'new',  -- 'new', 'contacted', 'interested', 'demo', 'customer', 'lost'
  stage VARCHAR(50) DEFAULT 'awareness',  -- 'awareness', 'consideration', 'decision'

  -- Contact info (may differ from business contact)
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),

  -- Lead scoring
  score INTEGER DEFAULT 0,  -- 0-100
  score_factors JSONB,

  -- Attribution
  source VARCHAR(100),  -- 'outscraper', 'cold_outreach', 'referral'
  utm_data JSONB,

  -- Assignment
  assigned_to VARCHAR(255),

  -- Notes
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sms_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  niche_id UUID REFERENCES niches(id),

  -- Campaign content
  message_template TEXT NOT NULL,
  follow_up_templates JSONB,

  -- Targeting
  target_criteria JSONB,

  -- Status
  status VARCHAR(20) DEFAULT 'draft',  -- 'draft', 'active', 'paused', 'completed'

  -- Stats
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_responded INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES sms_campaigns(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,

  -- Message details
  to_phone VARCHAR(50) NOT NULL,
  from_phone VARCHAR(50) NOT NULL,
  message_body TEXT NOT NULL,

  -- TextGrid integration
  textgrid_message_id VARCHAR(255),

  -- Status
  direction VARCHAR(10) DEFAULT 'outbound',  -- 'outbound', 'inbound'
  status VARCHAR(20) DEFAULT 'queued',  -- 'queued', 'sent', 'delivered', 'failed', 'received'
  error_message TEXT,

  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,

  activity_type VARCHAR(50) NOT NULL,  -- 'sms_sent', 'sms_received', 'site_view', 'form_submit', 'status_change', 'note_added'
  description TEXT,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leads_business ON leads(business_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_sms_messages_lead ON sms_messages(lead_id);
CREATE INDEX idx_sms_messages_campaign ON sms_messages(campaign_id);
CREATE INDEX idx_sms_messages_status ON sms_messages(status);
CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type);

-- ============================================
-- 5. SITE CUSTOMIZATION TRACKING
-- ============================================

CREATE TABLE site_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,

  -- Customization status
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'in_progress', 'review', 'approved', 'published'

  -- Applied customizations
  headline_customized BOOLEAN DEFAULT false,
  tagline_customized BOOLEAN DEFAULT false,
  about_customized BOOLEAN DEFAULT false,
  services_customized BOOLEAN DEFAULT false,
  images_customized BOOLEAN DEFAULT false,
  colors_customized BOOLEAN DEFAULT false,

  -- Review tracking
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_site_customizations_business ON site_customizations(business_id);
CREATE INDEX idx_site_customizations_status ON site_customizations(status);

-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE niche_image_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_customizations ENABLE ROW LEVEL SECURITY;

-- Public read access to niches
CREATE POLICY "Public can view niches" ON niches
  FOR SELECT USING (true);

CREATE POLICY "Public can view niche image mappings" ON niche_image_mappings
  FOR SELECT USING (true);

-- Service role has full access (for backend operations)
-- These will use the service_role key, not anon key

-- ============================================
-- 7. UPDATE TRIGGERS
-- ============================================

CREATE TRIGGER update_business_research_updated_at
  BEFORE UPDATE ON business_research
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_campaigns_updated_at
  BEFORE UPDATE ON sms_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_customizations_updated_at
  BEFORE UPDATE ON site_customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. INSERT PLUMBER NICHE
-- ============================================

INSERT INTO niches (slug, display_name, schema_type, default_headline_template, default_tagline_template, default_about_template)
VALUES (
  'plumber',
  'Plumber',
  'Plumber',
  '{name} - Your Trusted {city} Plumber',
  'Professional plumbing services for {city} and surrounding areas',
  '{name} has been providing professional plumbing services to {city}, {state} and surrounding communities. Our team of licensed plumbers is committed to delivering quality workmanship and exceptional customer service on every job.'
);

-- Link existing default_services to plumber niche
UPDATE default_services
SET niche_id = (SELECT id FROM niches WHERE slug = 'plumber')
WHERE niche = 'plumber';

-- ============================================
-- 9. INSERT PLUMBER IMAGE MAPPINGS
-- ============================================

INSERT INTO niche_image_mappings (niche_id, service_slug, images)
SELECT
  (SELECT id FROM niches WHERE slug = 'plumber'),
  service_slug,
  images::jsonb
FROM (VALUES
  ('emergency-plumbing', '["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'),
  ('drain-cleaning', '["https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800", "https://images.unsplash.com/photo-1558618047-f4f8a1f4b6c9?w=800"]'),
  ('water-heater-services', '["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'),
  ('leak-detection', '["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800", "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800"]'),
  ('fixture-installation', '["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800", "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800"]'),
  ('pipe-repair', '["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'),
  ('sewer-line-services', '["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800", "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800"]'),
  ('water-treatment', '["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800", "https://images.unsplash.com/photo-1558618047-f4f8a1f4b6c9?w=800"]')
) AS t(service_slug, images);
