-- Atlas Sites V1 - Database Schema
-- Multi-niche website generation platform
-- Run this in your Supabase SQL Editor
-- Then run migrations/002_atlas_v2_schema.sql for full V2 support

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  template VARCHAR(50) DEFAULT 'clean',

  -- Basic info (from Outscraper)
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),

  -- Location
  full_address TEXT,
  street VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Google data
  google_rating DECIMAL(2, 1),
  google_reviews_count INTEGER,
  google_reviews_link TEXT,
  google_place_id VARCHAR(255),

  -- Hours (store as JSON)
  working_hours JSONB,

  -- Social links
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,

  -- Site customizations (can override defaults)
  custom_headline TEXT,
  custom_tagline TEXT,
  custom_about TEXT,
  primary_color VARCHAR(7),
  accent_color VARCHAR(7),

  -- Status
  status VARCHAR(50) DEFAULT 'prospect',
  is_published BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services offered (many per business)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page view tracking
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  page_path VARCHAR(255),
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Raw Outscraper imports (keep all original data)
CREATE TABLE outscraper_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raw_data JSONB NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT false
);

-- Create indexes for common queries
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_page_views_business ON page_views(business_id);
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_created ON page_views(created_at);

-- Default services (templates for each niche)
CREATE TABLE default_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  niche VARCHAR(50) DEFAULT 'plumber',
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0
);

-- Insert default plumber services
INSERT INTO default_services (niche, name, description, icon, sort_order) VALUES
('plumber', 'Emergency Plumbing', 'Available 24/7 for burst pipes, severe leaks, and plumbing emergencies. Fast response when you need it most.', 'alert-triangle', 1),
('plumber', 'Drain Cleaning', 'Professional drain cleaning for clogged sinks, showers, and main sewer lines. We clear the toughest blockages.', 'droplets', 2),
('plumber', 'Water Heater Services', 'Installation, repair, and maintenance for tank and tankless water heaters. Hot water when you need it.', 'flame', 3),
('plumber', 'Leak Detection & Repair', 'Advanced leak detection to find hidden leaks before they cause major damage. Expert repairs that last.', 'search', 4),
('plumber', 'Fixture Installation', 'Professional installation of faucets, toilets, sinks, and showers. Quality workmanship guaranteed.', 'wrench', 5),
('plumber', 'Pipe Repair & Replacement', 'From minor pipe repairs to complete repiping. We work with all pipe materials and sizes.', 'cylinder', 6),
('plumber', 'Sewer Line Services', 'Sewer line inspection, cleaning, and repair. We diagnose and fix sewer problems fast.', 'arrow-down-circle', 7),
('plumber', 'Water Treatment', 'Water softeners, filtration systems, and water quality testing. Better water for your home.', 'droplet', 8);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Policies for public read access to published businesses
CREATE POLICY "Public can view published businesses" ON businesses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view services" ON services
  FOR SELECT USING (true);

-- Policies for form submissions (public can insert)
CREATE POLICY "Anyone can submit contact forms" ON form_submissions
  FOR INSERT WITH CHECK (true);

-- Policies for page views (public can insert)
CREATE POLICY "Anyone can log page views" ON page_views
  FOR INSERT WITH CHECK (true);

-- Analytics events table (for tracking clicks, form starts, etc.)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_business ON analytics_events(business_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for businesses table
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
