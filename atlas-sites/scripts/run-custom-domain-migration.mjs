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
    console.log('Adding custom_domain column to businesses table...');

    await pool.query(`
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_businesses_custom_domain
      ON businesses(custom_domain)
      WHERE custom_domain IS NOT NULL;
    `);

    console.log('✓ Migration complete');

    // Show current businesses
    const { rows } = await pool.query(`
      SELECT slug, name, custom_domain FROM businesses LIMIT 10;
    `);
    console.log('\nBusinesses (first 10):');
    rows.forEach(b => console.log(`  ${b.slug}: ${b.custom_domain || '(no domain)'}`));

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
