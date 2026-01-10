// Rebuild businesses table with correct columns from CSV
import postgres from 'postgres';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

const connectionString = 'postgresql://postgres.poenzlvrvicrqkxworlb:qzdV1tEUz7Wwarfo@aws-0-us-west-2.pooler.supabase.com:5432/postgres';
const csvPath = '/workspaces/atlas/Outscraper-20251210025614xxl87_plumber - Sheet1 (2).csv';

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function rebuild() {
  console.log('🔄 Rebuilding businesses table...\n');

  // Get niche ID
  const niches = await sql`SELECT id FROM niches WHERE slug = 'plumber'`;
  const nicheId = niches[0]?.id;

  // Drop dependent tables first, then businesses
  console.log('Dropping old tables...');
  await sql`DROP TABLE IF EXISTS lead_activities CASCADE`;
  await sql`DROP TABLE IF EXISTS sms_messages CASCADE`;
  await sql`DROP TABLE IF EXISTS leads CASCADE`;
  await sql`DROP TABLE IF EXISTS business_customizations CASCADE`;
  await sql`DROP TABLE IF EXISTS business_research CASCADE`;
  await sql`DROP TABLE IF EXISTS businesses CASCADE`;

  // Recreate businesses with all the columns you need
  console.log('Creating new businesses table...');
  await sql`
    CREATE TABLE businesses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      niche_id UUID REFERENCES niches(id),
      slug VARCHAR(255) UNIQUE NOT NULL,

      -- Basic Info
      name VARCHAR(255) NOT NULL,
      site TEXT,
      phone VARCHAR(50),
      phone_carrier_type VARCHAR(50),
      full_address TEXT,
      street VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(50),
      postal_code VARCHAR(20),

      -- Location
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),

      -- Google Data
      google_place_id VARCHAR(255),
      google_rating DECIMAL(2, 1),
      google_reviews_count INTEGER,
      google_reviews_link TEXT,
      verified BOOLEAN DEFAULT false,
      photos_count INTEGER,

      -- Contact
      email VARCHAR(255),
      email_status VARCHAR(50),

      -- Social
      facebook TEXT,
      instagram TEXT,
      linkedin TEXT,
      tiktok TEXT,
      twitter TEXT,
      youtube TEXT,

      -- Media
      logo TEXT,
      photo TEXT,

      -- Hours
      working_hours JSONB,

      -- Status
      status VARCHAR(50) DEFAULT 'active',
      is_published BOOLEAN DEFAULT true,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX idx_businesses_slug ON businesses(slug)`;
  await sql`CREATE INDEX idx_businesses_niche ON businesses(niche_id)`;
  await sql`CREATE INDEX idx_businesses_city ON businesses(city)`;
  await sql`ALTER TABLE businesses ENABLE ROW LEVEL SECURITY`;
  await sql`CREATE POLICY "Public can view published businesses" ON businesses FOR SELECT USING (is_published = true)`;
  await sql`CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

  // Recreate business_customizations (empty for now)
  console.log('Creating business_customizations...');
  await sql`
    CREATE TABLE business_customizations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
      primary_color VARCHAR(7),
      accent_color VARCHAR(7),
      headline TEXT,
      tagline TEXT,
      about TEXT,
      hero_image_url TEXT,
      gallery_images JSONB,
      is_customized BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE business_customizations ENABLE ROW LEVEL SECURITY`;

  // Recreate business_research (empty for now)
  console.log('Creating business_research...');
  await sql`
    CREATE TABLE business_research (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
      facebook_data JSONB,
      instagram_data JSONB,
      website_content JSONB,
      website_images JSONB,
      research_status VARCHAR(50) DEFAULT 'pending',
      researched_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE business_research ENABLE ROW LEVEL SECURITY`;

  // Recreate leads
  console.log('Creating leads...');
  await sql`
    CREATE TABLE leads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
      status VARCHAR(50) DEFAULT 'new',
      contact_name VARCHAR(255),
      contact_phone VARCHAR(50),
      contact_email VARCHAR(255),
      score INTEGER DEFAULT 0,
      source VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX idx_leads_status ON leads(status)`;
  await sql`CREATE INDEX idx_leads_score ON leads(score DESC)`;
  await sql`ALTER TABLE leads ENABLE ROW LEVEL SECURITY`;
  await sql`CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

  // Recreate lead_activities
  console.log('Creating lead_activities...');
  await sql`
    CREATE TABLE lead_activities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
      activity_type VARCHAR(50) NOT NULL,
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id)`;
  await sql`ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY`;

  // Recreate sms_messages
  console.log('Creating sms_messages...');
  await sql`
    CREATE TABLE sms_messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      campaign_id UUID REFERENCES sms_campaigns(id) ON DELETE SET NULL,
      lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
      to_phone VARCHAR(50) NOT NULL,
      from_phone VARCHAR(50) NOT NULL,
      message_body TEXT NOT NULL,
      direction VARCHAR(10) DEFAULT 'outbound',
      status VARCHAR(20) DEFAULT 'queued',
      sent_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX idx_sms_messages_lead ON sms_messages(lead_id)`;
  await sql`ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY`;

  console.log('\n📥 Importing from CSV...\n');

  // Parse CSV
  const records = [];
  const parser = createReadStream(csvPath).pipe(
    parse({ columns: true, skip_empty_lines: true, relax_column_count: true })
  );

  for await (const r of parser) {
    records.push(r);
  }

  console.log(`Found ${records.length} records\n`);

  let imported = 0;
  let skipped = 0;

  for (const r of records) {
    const name = r.name?.trim();
    if (!name) {
      skipped++;
      continue;
    }

    const slug = createSlug(name);

    // Check for duplicate slug
    const existing = await sql`SELECT id FROM businesses WHERE slug = ${slug}`;
    if (existing.length > 0) {
      console.log(`⏭️  ${name} - duplicate slug`);
      skipped++;
      continue;
    }

    // Parse working hours
    let workingHours = null;
    try {
      if (r.working_hours && r.working_hours.startsWith('{')) {
        workingHours = JSON.parse(r.working_hours.replace(/'/g, '"'));
      }
    } catch (e) {}

    // Insert business
    const result = await sql`
      INSERT INTO businesses (
        niche_id, slug, name, site, phone, phone_carrier_type,
        full_address, street, city, state, postal_code,
        latitude, longitude,
        google_place_id, google_rating, google_reviews_count, google_reviews_link,
        verified, photos_count,
        email, email_status,
        facebook, instagram, linkedin, tiktok, twitter, youtube,
        logo, photo, working_hours
      ) VALUES (
        ${nicheId},
        ${slug},
        ${name},
        ${r.site || null},
        ${r.phone || null},
        ${r['phone.phones_enricher.carrier_type'] || null},
        ${r.full_address || null},
        ${r.street || null},
        ${r.city || null},
        ${r.state || r.us_state || null},
        ${r.postal_code || null},
        ${r.latitude ? parseFloat(r.latitude) : null},
        ${r.longitude ? parseFloat(r.longitude) : null},
        ${r.place_id || null},
        ${r.rating ? parseFloat(r.rating) : null},
        ${r.reviews ? parseInt(r.reviews) : null},
        ${r.reviews_link || null},
        ${r.verified === '1' || r.verified === 'true'},
        ${r.photos_count ? parseInt(r.photos_count) : null},
        ${r.email_1 || null},
        ${r['email_1.emails_validator.status'] || null},
        ${r.facebook || null},
        ${r.instagram || null},
        ${r.linkedin || null},
        ${r.tiktok || null},
        ${r.twitter || null},
        ${r.youtube || null},
        ${r.logo || null},
        ${r.photo || null},
        ${workingHours ? JSON.stringify(workingHours) : null}::jsonb
      )
      RETURNING id
    `;

    const businessId = result[0].id;

    // Calculate score
    const rating = r.rating ? parseFloat(r.rating) : 0;
    const reviews = r.reviews ? parseInt(r.reviews) : 0;
    let score = 0;
    if (rating) score += Math.round((rating / 5) * 40);
    if (reviews) score += Math.round(Math.min(reviews, 200) / 200 * 30);
    if (r.site) score += 15;
    if (r.phone) score += 15;
    score = Math.min(score, 100);

    // Create lead
    await sql`
      INSERT INTO leads (business_id, status, contact_name, contact_phone, contact_email, score, source)
      VALUES (
        ${businessId},
        'new',
        ${r.name_for_emails || name.split(/[',]/)[0].trim()},
        ${r.phone || null},
        ${r.email_1 || null},
        ${score},
        'outscraper'
      )
    `;

    console.log(`✅ ${name} (${r.city || 'no city'}) - Score: ${score}`);
    imported++;
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);

  // Also store raw imports
  console.log('\n📦 Storing raw CSV data...');
  await sql`DELETE FROM raw_imports WHERE source = 'outscraper'`;
  for (const r of records) {
    await sql`INSERT INTO raw_imports (source, raw_data, processed) VALUES ('outscraper', ${JSON.stringify(r)}::jsonb, true)`;
  }
  console.log(`   ✓ ${records.length} raw records stored`);

  // Final count
  const bizCount = await sql`SELECT COUNT(*) as count FROM businesses`;
  const leadCount = await sql`SELECT COUNT(*) as count FROM leads`;
  console.log(`\n✅ Done! ${bizCount[0].count} businesses, ${leadCount[0].count} leads`);

  await sql.end();
}

rebuild().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
