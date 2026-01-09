const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Use Supabase pooler (session mode)
const connectionString = 'postgresql://postgres.mmtkczgpkgraydcnxlbm:Zzeab5j5UbxP1u5u@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseWorkingHours(hoursStr) {
  if (!hoursStr) return null;
  try {
    // Handle the JSON format from Outscraper
    const cleaned = hoursStr.replace(/'/g, '"');
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

async function importCSV(filePath) {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!\n');

    // Read and parse CSV
    console.log(`Reading CSV from: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true
    });
    console.log(`Found ${records.length} records\n`);

    // Get default services for plumbers
    const defaultServicesResult = await client.query(
      `SELECT * FROM default_services WHERE niche = 'plumber' ORDER BY sort_order`
    );
    const defaultServices = defaultServicesResult.rows;
    console.log(`Loaded ${defaultServices.length} default services\n`);

    let imported = 0;
    let skipped = 0;
    const usedSlugs = new Set();

    for (const row of records) {
      try {
        // Skip if no name
        if (!row.name) {
          skipped++;
          continue;
        }

        // Generate unique slug
        let baseSlug = slugify(row.name);
        let slug = baseSlug;
        let counter = 1;
        while (usedSlugs.has(slug)) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        usedSlugs.add(slug);

        // Parse working hours
        const workingHours = parseWorkingHours(row.working_hours);

        // Check if business already exists
        const existingResult = await client.query(
          'SELECT id FROM businesses WHERE slug = $1',
          [slug]
        );

        if (existingResult.rows.length > 0) {
          console.log(`  Skipping (exists): ${row.name}`);
          skipped++;
          continue;
        }

        // Insert business
        const insertResult = await client.query(
          `INSERT INTO businesses (
            slug, name, phone, email,
            full_address, street, city, state, postal_code,
            latitude, longitude,
            google_rating, google_reviews_count, google_reviews_link, google_place_id,
            working_hours,
            facebook_url, instagram_url, youtube_url,
            template, status, is_published
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7, $8, $9,
            $10, $11,
            $12, $13, $14, $15,
            $16,
            $17, $18, $19,
            $20, $21, $22
          ) RETURNING id`,
          [
            slug,
            row.name,
            row.phone || null,
            row.email_1 || null,
            row.full_address || null,
            row.street || null,
            row.city || null,
            row.state || null,
            row.postal_code?.toString() || null,
            row.latitude ? parseFloat(row.latitude) : null,
            row.longitude ? parseFloat(row.longitude) : null,
            row.rating ? parseFloat(row.rating) : null,
            row.reviews ? parseInt(row.reviews) : null,
            row.reviews_link || null,
            row.place_id || null,
            workingHours ? JSON.stringify(workingHours) : null,
            row.facebook || null,
            row.instagram || null,
            row.youtube || null,
            'clean', // default template
            'prospect',
            true
          ]
        );

        const businessId = insertResult.rows[0].id;

        // Clone default services for this business
        for (const service of defaultServices) {
          await client.query(
            `INSERT INTO services (business_id, name, description, icon, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [businessId, service.name, service.description, service.icon, service.sort_order]
          );
        }

        console.log(`✓ Imported: ${row.name} → /${slug}`);
        imported++;

      } catch (err) {
        console.error(`✗ Error importing ${row.name}:`, err.message);
        skipped++;
      }
    }

    console.log(`\n========================================`);
    console.log(`Import complete!`);
    console.log(`  Imported: ${imported}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`========================================\n`);

    // Store raw import data
    console.log('Storing raw import data...');
    await client.query(
      `INSERT INTO outscraper_imports (raw_data, processed) VALUES ($1, true)`,
      [JSON.stringify(records)]
    );
    console.log('Raw data stored.\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

// Get CSV path from command line or use default
const csvPath = process.argv[2] || path.join(__dirname, '../../Outscraper-20251210025614xxl87_plumber - Sheet1 (2).csv');
console.log(`\nImporting from: ${csvPath}\n`);

importCSV(csvPath);
