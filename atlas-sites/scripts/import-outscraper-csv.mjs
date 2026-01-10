// Import Outscraper CSV into businesses and leads tables
import postgres from 'postgres';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

const connectionString = process.env.DIRECT_URL || 'postgresql://postgres.poenzlvrvicrqkxworlb:qzdV1tEUz7Wwarfo@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

const csvPath = '/workspaces/atlas/Outscraper-20251210025614xxl87_plumber - Sheet1 (2).csv';

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function calculateScore(rating, reviews, hasWebsite, hasPhone) {
  let score = 0;

  // Rating contributes up to 40 points
  if (rating) {
    score += Math.round((rating / 5) * 40);
  }

  // Reviews contribute up to 30 points (log scale, max at 200 reviews)
  if (reviews) {
    const reviewScore = Math.min(reviews, 200) / 200;
    score += Math.round(reviewScore * 30);
  }

  // Website adds 15 points
  if (hasWebsite) score += 15;

  // Phone adds 15 points
  if (hasPhone) score += 15;

  return Math.min(score, 100);
}

async function importCSV() {
  console.log('📊 Importing Outscraper CSV...\n');

  // Get plumber niche ID
  const niches = await sql`SELECT id FROM niches WHERE slug = 'plumber'`;
  const nicheId = niches[0]?.id;

  if (!nicheId) {
    console.error('❌ Plumber niche not found. Run migration first.');
    process.exit(1);
  }

  const records = [];

  // Parse CSV
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

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const record of records) {
    const name = record.name?.trim();
    if (!name) {
      skipped++;
      continue;
    }

    const slug = createSlug(name);

    try {
      // Check if business exists
      const existing = await sql`SELECT id FROM businesses WHERE slug = ${slug}`;

      if (existing.length > 0) {
        console.log(`⏭️  ${name} - already exists`);
        skipped++;
        continue;
      }

      // Parse data
      const phone = record.phone?.replace(/[^\d+]/g, '') || null;
      const city = record.city?.trim() || null;
      const state = record.state?.trim() || record.us_state?.trim() || null;
      const postalCode = record.postal_code?.trim() || null;
      const street = record.street?.trim() || null;
      const fullAddress = record.full_address?.trim() || null;
      const latitude = record.latitude ? parseFloat(record.latitude) : null;
      const longitude = record.longitude ? parseFloat(record.longitude) : null;
      const rating = record.rating ? parseFloat(record.rating) : null;
      const reviews = record.reviews ? parseInt(record.reviews) : null;
      const reviewsLink = record.reviews_link || null;
      const placeId = record.place_id || null;
      const website = record.site?.trim() || null;
      const facebook = record.facebook?.trim() || null;
      const instagram = record.instagram?.trim() || null;
      const photo = record.photo?.trim() || null;

      // Parse working hours JSON
      let workingHours = null;
      try {
        if (record.working_hours && record.working_hours.startsWith('{')) {
          workingHours = JSON.parse(record.working_hours.replace(/'/g, '"'));
        }
      } catch (e) {
        // Ignore parse errors for hours
      }

      // Calculate lead score
      const score = calculateScore(rating, reviews, !!website, !!phone);

      // Insert business
      const businessResult = await sql`
        INSERT INTO businesses (
          slug, name, phone, full_address, street, city, state, postal_code,
          latitude, longitude, google_rating, google_reviews_count, google_reviews_link,
          google_place_id, working_hours, facebook_url, instagram_url, niche_id,
          status, is_published
        ) VALUES (
          ${slug}, ${name}, ${phone}, ${fullAddress}, ${street}, ${city}, ${state}, ${postalCode},
          ${latitude}, ${longitude}, ${rating}, ${reviews}, ${reviewsLink},
          ${placeId}, ${workingHours ? JSON.stringify(workingHours) : null}::jsonb,
          ${facebook}, ${instagram}, ${nicheId},
          'prospect', true
        )
        RETURNING id
      `;

      const businessId = businessResult[0].id;

      // Insert lead
      const contactName = record.name_for_emails?.trim() || name.split(/[',]/)[0].trim();
      const email = record.email_1?.trim() || record.email_2?.trim() || null;

      await sql`
        INSERT INTO leads (
          business_id, status, score, contact_name, contact_phone, contact_email, source
        ) VALUES (
          ${businessId}, 'new', ${score}, ${contactName}, ${phone}, ${email}, 'outscraper'
        )
      `;

      // Store raw data in outscraper_imports
      await sql`
        INSERT INTO outscraper_imports (raw_data, processed)
        VALUES (${JSON.stringify(record)}::jsonb, true)
      `;

      console.log(`✅ ${name} (${city}, ${state}) - Score: ${score}`);
      imported++;

    } catch (error) {
      console.error(`❌ ${name}: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);

  // Show lead distribution
  const leadStats = await sql`SELECT status, COUNT(*) as count FROM leads GROUP BY status ORDER BY count DESC`;
  console.log(`\n📈 Leads by status:`);
  leadStats.forEach(row => {
    console.log(`   ${row.status}: ${row.count}`);
  });

  await sql.end();
}

importCSV().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
