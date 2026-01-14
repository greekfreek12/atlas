-- Add custom_domain field to businesses for custom domain routing
-- Run with: psql $DATABASE_URL -f scripts/migrations/011_custom_domain.sql

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_businesses_custom_domain ON businesses(custom_domain) WHERE custom_domain IS NOT NULL;

-- Example: UPDATE businesses SET custom_domain = 'marcoplumbing.com' WHERE slug = 'marco-plumbing';
