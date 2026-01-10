// Import raw CSV into raw_imports table (no trimming, store as-is)
import postgres from 'postgres';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

const connectionString = 'postgresql://postgres.poenzlvrvicrqkxworlb:qzdV1tEUz7Wwarfo@aws-0-us-west-2.pooler.supabase.com:5432/postgres';
const csvPath = '/workspaces/atlas/Outscraper-20251210025614xxl87_plumber - Sheet1 (2).csv';

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

async function importRaw() {
  console.log('📥 Importing raw CSV to raw_imports...\n');

  const records = [];

  // Parse CSV - keep all columns as-is
  const parser = createReadStream(csvPath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    })
  );

  for await (const record of parser) {
    records.push(record);
  }

  console.log(`Found ${records.length} records\n`);

  // Clear existing raw imports from this source
  await sql`DELETE FROM raw_imports WHERE source = 'outscraper'`;
  console.log('Cleared existing outscraper imports\n');

  // Insert all records
  let count = 0;
  for (const record of records) {
    await sql`
      INSERT INTO raw_imports (source, raw_data, processed)
      VALUES ('outscraper', ${JSON.stringify(record)}::jsonb, true)
    `;
    count++;
    if (count % 20 === 0) {
      console.log(`   Imported ${count}/${records.length}...`);
    }
  }

  console.log(`\n✅ Imported ${count} raw records to raw_imports table`);

  // Show sample
  const sample = await sql`SELECT raw_data FROM raw_imports WHERE source = 'outscraper' LIMIT 1`;
  console.log('\nSample record keys:');
  const keys = Object.keys(sample[0].raw_data);
  console.log(`   ${keys.length} columns: ${keys.slice(0, 10).join(', ')}...`);

  await sql.end();
}

importRaw().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
