const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use Supabase pooler (session mode) for DDL operations
const connectionString = 'postgresql://postgres.mmtkczgpkgraydcnxlbm:Zzeab5j5UbxP1u5u@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

async function setupDatabase() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');

    // Read the schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Running schema...');
    await client.query(schema);
    console.log('Schema created successfully!');

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\nTables created:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));

  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('already exists')) {
      console.log('\nTables may already exist. Checking...');
      try {
        const result = await client.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `);
        console.log('Existing tables:');
        result.rows.forEach(row => console.log(`  - ${row.table_name}`));
      } catch (e) {
        console.error('Could not check tables:', e.message);
      }
    }
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

setupDatabase();
