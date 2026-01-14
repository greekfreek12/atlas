-- Site Configs table for JSON-based site builder
-- Run with: node scripts/run-site-config-migration.mjs

-- Main site configs table
CREATE TABLE IF NOT EXISTS site_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Version control
  version INTEGER NOT NULL DEFAULT 1,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ,

  -- The main config JSON containing all site content/styling
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each business can have one draft and one published config
  UNIQUE(business_id, is_draft)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_configs_business_id ON site_configs(business_id);
CREATE INDEX IF NOT EXISTS idx_site_configs_published ON site_configs(business_id, is_draft) WHERE is_draft = false;
CREATE INDEX IF NOT EXISTS idx_site_configs_config ON site_configs USING GIN (config);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_site_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_configs_updated_at ON site_configs;
CREATE TRIGGER site_configs_updated_at
  BEFORE UPDATE ON site_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_site_configs_updated_at();

-- Config history table for undo/audit
CREATE TABLE IF NOT EXISTS site_config_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_config_id UUID NOT NULL REFERENCES site_configs(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  version INTEGER NOT NULL,
  change_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_config_history_config ON site_config_history(site_config_id, version DESC);
