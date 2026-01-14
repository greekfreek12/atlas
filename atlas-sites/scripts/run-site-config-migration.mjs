import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Pool } = pg;

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Running site_configs migration...\n');

    // Create site_configs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        version INTEGER NOT NULL DEFAULT 1,
        is_draft BOOLEAN NOT NULL DEFAULT true,
        published_at TIMESTAMPTZ,
        config JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(business_id, is_draft)
      )
    `);
    console.log('✓ Created site_configs table');

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_site_configs_business_id ON site_configs(business_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_site_configs_published ON site_configs(business_id, is_draft) WHERE is_draft = false`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_site_configs_config ON site_configs USING GIN (config)`);
    console.log('✓ Created indexes');

    // Create history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_config_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_config_id UUID NOT NULL REFERENCES site_configs(id) ON DELETE CASCADE,
        config JSONB NOT NULL,
        version INTEGER NOT NULL,
        change_description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✓ Created site_config_history table');

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_site_config_history_config ON site_config_history(site_config_id, version DESC)`);
    console.log('✓ Created history index');

    console.log('\n✓ Migration complete!');

    // Verify tables exist
    const { rows: tables } = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('site_configs', 'site_config_history')
      ORDER BY table_name
    `);

    console.log('\nTables created:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    // Show column info for site_configs
    const { rows: columns } = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'site_configs'
      ORDER BY ordinal_position
    `);

    console.log('\nsite_configs columns:');
    columns.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
