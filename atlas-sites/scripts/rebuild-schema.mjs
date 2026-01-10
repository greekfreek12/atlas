// Rebuild database with clean schema
import postgres from 'postgres';

const connectionString = 'postgresql://postgres.poenzlvrvicrqkxworlb:qzdV1tEUz7Wwarfo@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

async function rebuild() {
  console.log('🔄 Rebuilding database schema...\n');

  // ========================================
  // STEP 1: Backup existing data
  // ========================================
  console.log('📦 Step 1: Backing up data...');

  const businesses = await sql`SELECT * FROM businesses`;
  const leads = await sql`SELECT * FROM leads`;
  const campaigns = await sql`SELECT * FROM sms_campaigns`;
  const messages = await sql`SELECT * FROM sms_messages`;
  const activities = await sql`SELECT * FROM lead_activities`;
  const niches = await sql`SELECT * FROM niches`;
  const profiles = await sql`SELECT * FROM profiles`;

  console.log(`   Businesses: ${businesses.length}`);
  console.log(`   Leads: ${leads.length}`);
  console.log(`   Campaigns: ${campaigns.length}`);
  console.log(`   Messages: ${messages.length}`);
  console.log(`   Activities: ${activities.length}`);
  console.log(`   Niches: ${niches.length}`);
  console.log(`   Profiles: ${profiles.length}\n`);

  // ========================================
  // STEP 2: Drop all tables
  // ========================================
  console.log('🗑️  Step 2: Dropping old tables...');

  await sql`DROP TABLE IF EXISTS lead_activities CASCADE`;
  await sql`DROP TABLE IF EXISTS sms_messages CASCADE`;
  await sql`DROP TABLE IF EXISTS sms_campaigns CASCADE`;
  await sql`DROP TABLE IF EXISTS leads CASCADE`;
  await sql`DROP TABLE IF EXISTS services CASCADE`;
  await sql`DROP TABLE IF EXISTS default_services CASCADE`;
  await sql`DROP TABLE IF EXISTS analytics_events CASCADE`;
  await sql`DROP TABLE IF EXISTS page_views CASCADE`;
  await sql`DROP TABLE IF EXISTS form_submissions CASCADE`;
  await sql`DROP TABLE IF EXISTS businesses CASCADE`;
  await sql`DROP TABLE IF EXISTS niches CASCADE`;
  await sql`DROP TABLE IF EXISTS profiles CASCADE`;

  console.log('   ✓ All tables dropped\n');

  // ========================================
  // STEP 3: Create clean schema
  // ========================================
  console.log('🏗️  Step 3: Creating new schema...\n');

  // Enable UUID
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // Update function
  console.log('   Creating update_updated_at function...');
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql'
  `;

  // PROFILES (admin auth)
  console.log('   Creating profiles...');
  await sql`
    CREATE TABLE profiles (
      id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
      email TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`;
  await sql`CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id)`;
  await sql`CREATE INDEX idx_profiles_role ON profiles(role)`;

  // NICHES
  console.log('   Creating niches...');
  await sql`
    CREATE TABLE niches (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      slug VARCHAR(50) UNIQUE NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      schema_type VARCHAR(100) DEFAULT 'LocalBusiness',
      default_headline TEXT,
      default_tagline TEXT,
      default_about TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE niches ENABLE ROW LEVEL SECURITY`;
  await sql`CREATE POLICY "Public can view niches" ON niches FOR SELECT USING (true)`;

  // RAW_IMPORTS (store original CSV data)
  console.log('   Creating raw_imports...');
  await sql`
    CREATE TABLE raw_imports (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      source VARCHAR(50) NOT NULL,
      raw_data JSONB NOT NULL,
      processed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX idx_raw_imports_source ON raw_imports(source)`;
  await sql`CREATE INDEX idx_raw_imports_processed ON raw_imports(processed)`;

  // BUSINESSES (core site info)
  console.log('   Creating businesses...');
  await sql`
    CREATE TABLE businesses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      niche_id UUID REFERENCES niches(id),
      slug VARCHAR(255) UNIQUE NOT NULL,

      -- Basic info
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      email VARCHAR(255),
      website VARCHAR(500),

      -- Location
      full_address TEXT,
      street VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(50),
      postal_code VARCHAR(20),
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),

      -- Google data
      google_place_id VARCHAR(255),
      google_rating DECIMAL(2, 1),
      google_reviews_count INTEGER,
      google_reviews_link TEXT,

      -- Hours
      working_hours JSONB,

      -- Social
      facebook_url TEXT,
      instagram_url TEXT,

      -- Status
      status VARCHAR(50) DEFAULT 'active',
      is_published BOOLEAN DEFAULT true,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX idx_businesses_slug ON businesses(slug)`;
  await sql`CREATE INDEX idx_businesses_niche ON businesses(niche_id)`;
  await sql`CREATE INDEX idx_businesses_status ON businesses(status)`;
  await sql`ALTER TABLE businesses ENABLE ROW LEVEL SECURITY`;
  await sql`CREATE POLICY "Public can view published businesses" ON businesses FOR SELECT USING (is_published = true)`;
  await sql`CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

  // BUSINESS_CUSTOMIZATIONS (colors, images, custom content)
  console.log('   Creating business_customizations...');
  await sql`
    CREATE TABLE business_customizations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,

      -- Colors
      primary_color VARCHAR(7),
      accent_color VARCHAR(7),

      -- Custom content
      headline TEXT,
      tagline TEXT,
      about TEXT,

      -- Images
      logo_url TEXT,
      hero_image_url TEXT,
      gallery_images JSONB,

      -- Flags
      is_customized BOOLEAN DEFAULT false,
      approved_at TIMESTAMPTZ,
      approved_by VARCHAR(255),

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX idx_business_customizations_business ON business_customizations(business_id)`;
  await sql`ALTER TABLE business_customizations ENABLE ROW LEVEL SECURITY`;
  await sql`CREATE TRIGGER update_business_customizations_updated_at BEFORE UPDATE ON business_customizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

  // BUSINESS_RESEARCH (scraped social media, website data)
  console.log('   Creating business_research...');
  await sql`
    CREATE TABLE business_research (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,

      -- Social media
      facebook_data JSONB,
      instagram_data JSONB,

      -- Website scrape
      website_content JSONB,
      website_images JSONB,

      -- Status
      researched_at TIMESTAMPTZ,
      research_status VARCHAR(50) DEFAULT 'pending',

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX idx_business_research_business ON business_research(business_id)`;
  await sql`CREATE INDEX idx_business_research_status ON business_research(research_status)`;
  await sql`ALTER TABLE business_research ENABLE ROW LEVEL SECURITY`;
  await sql`CREATE TRIGGER update_business_research_updated_at BEFORE UPDATE ON business_research FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

  // ANALYTICS (single table for all tracking)
  console.log('   Creating analytics...');
  await sql`
    CREATE TABLE analytics (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,

      event_type VARCHAR(50) NOT NULL,
      session_id VARCHAR(255),
      page_path VARCHAR(255),
      referrer TEXT,
      user_agent TEXT,
      metadata JSONB DEFAULT '{}',

      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX idx_analytics_business ON analytics(business_id)`;
  await sql`CREATE INDEX idx_analytics_type ON analytics(event_type)`;
  await sql`CREATE INDEX idx_analytics_created ON analytics(created_at)`;
  await sql`CREATE INDEX idx_analytics_session ON analytics(session_id)`;
  await sql`ALTER TABLE analytics ENABLE ROW LEVEL SECURITY`;
  await sql`CREATE POLICY "Anyone can log analytics" ON analytics FOR INSERT WITH CHECK (true)`;

  // LEADS (CRM tracking)
  console.log('   Creating leads...');
  await sql`
    CREATE TABLE leads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,

      -- Status
      status VARCHAR(50) DEFAULT 'new',

      -- Contact
      contact_name VARCHAR(255),
      contact_phone VARCHAR(50),
      contact_email VARCHAR(255),

      -- Scoring
      score INTEGER DEFAULT 0,

      -- Attribution
      source VARCHAR(100),

      -- Notes
      notes TEXT,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX idx_leads_business ON leads(business_id)`;
  await sql`CREATE INDEX idx_leads_status ON leads(status)`;
  await sql`CREATE INDEX idx_leads_score ON leads(score DESC)`;
  await sql`ALTER TABLE leads ENABLE ROW LEVEL SECURITY`;
  await sql`CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

  // LEAD_ACTIVITIES
  console.log('   Creating lead_activities...');
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
  await sql`CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type)`;
  await sql`ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY`;

  // SMS_CAMPAIGNS
  console.log('   Creating sms_campaigns...');
  await sql`
    CREATE TABLE sms_campaigns (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      message_template TEXT NOT NULL,
      target_criteria JSONB,

      status VARCHAR(20) DEFAULT 'draft',

      total_sent INTEGER DEFAULT 0,
      total_delivered INTEGER DEFAULT 0,
      total_responded INTEGER DEFAULT 0,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY`;
  await sql`CREATE TRIGGER update_sms_campaigns_updated_at BEFORE UPDATE ON sms_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

  // SMS_MESSAGES
  console.log('   Creating sms_messages...');
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
  await sql`CREATE INDEX idx_sms_messages_campaign ON sms_messages(campaign_id)`;
  await sql`ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY`;

  console.log('   ✓ All tables created\n');

  // ========================================
  // STEP 4: Restore data
  // ========================================
  console.log('📥 Step 4: Restoring data...\n');

  // Restore niches
  if (niches.length > 0) {
    console.log('   Restoring niches...');
    for (const n of niches) {
      await sql`
        INSERT INTO niches (id, slug, display_name, schema_type, default_headline, default_tagline, default_about, created_at)
        VALUES (${n.id}, ${n.slug}, ${n.display_name}, ${n.schema_type}, ${n.default_headline_template}, ${n.default_tagline_template}, ${n.default_about_template}, ${n.created_at})
        ON CONFLICT (slug) DO NOTHING
      `;
    }
    console.log(`   ✓ ${niches.length} niches`);
  }

  // Restore businesses
  if (businesses.length > 0) {
    console.log('   Restoring businesses...');
    for (const b of businesses) {
      await sql`
        INSERT INTO businesses (id, niche_id, slug, name, phone, email, website, full_address, street, city, state, postal_code, latitude, longitude, google_place_id, google_rating, google_reviews_count, google_reviews_link, working_hours, facebook_url, instagram_url, status, is_published, created_at, updated_at)
        VALUES (${b.id}, ${b.niche_id}, ${b.slug}, ${b.name}, ${b.phone}, ${b.email}, null, ${b.full_address}, ${b.street}, ${b.city}, ${b.state}, ${b.postal_code}, ${b.latitude}, ${b.longitude}, ${b.google_place_id}, ${b.google_rating}, ${b.google_reviews_count}, ${b.google_reviews_link}, ${b.working_hours}, ${b.facebook_url}, ${b.instagram_url}, ${b.status || 'active'}, ${b.is_published}, ${b.created_at}, ${b.updated_at})
        ON CONFLICT (slug) DO NOTHING
      `;
    }
    console.log(`   ✓ ${businesses.length} businesses`);
  }

  // Restore leads
  if (leads.length > 0) {
    console.log('   Restoring leads...');
    for (const l of leads) {
      await sql`
        INSERT INTO leads (id, business_id, status, contact_name, contact_phone, contact_email, score, source, notes, created_at, updated_at)
        VALUES (${l.id}, ${l.business_id}, ${l.status}, ${l.contact_name}, ${l.contact_phone}, ${l.contact_email}, ${l.score}, ${l.source}, ${l.notes}, ${l.created_at}, ${l.updated_at})
        ON CONFLICT (business_id) DO NOTHING
      `;
    }
    console.log(`   ✓ ${leads.length} leads`);
  }

  // Restore campaigns
  if (campaigns.length > 0) {
    console.log('   Restoring campaigns...');
    for (const c of campaigns) {
      await sql`
        INSERT INTO sms_campaigns (id, name, message_template, target_criteria, status, total_sent, total_delivered, total_responded, created_at, updated_at)
        VALUES (${c.id}, ${c.name}, ${c.message_template}, ${c.target_criteria}, ${c.status}, ${c.total_sent}, ${c.total_delivered}, ${c.total_responded}, ${c.created_at}, ${c.updated_at})
      `;
    }
    console.log(`   ✓ ${campaigns.length} campaigns`);
  }

  // Restore messages
  if (messages.length > 0) {
    console.log('   Restoring messages...');
    for (const m of messages) {
      await sql`
        INSERT INTO sms_messages (id, campaign_id, lead_id, to_phone, from_phone, message_body, direction, status, sent_at, delivered_at, created_at)
        VALUES (${m.id}, ${m.campaign_id}, ${m.lead_id}, ${m.to_phone}, ${m.from_phone}, ${m.message_body}, ${m.direction}, ${m.status}, ${m.sent_at}, ${m.delivered_at}, ${m.created_at})
      `;
    }
    console.log(`   ✓ ${messages.length} messages`);
  }

  // Restore activities
  if (activities.length > 0) {
    console.log('   Restoring activities...');
    for (const a of activities) {
      await sql`
        INSERT INTO lead_activities (id, lead_id, activity_type, description, metadata, created_at)
        VALUES (${a.id}, ${a.lead_id}, ${a.activity_type}, ${a.description}, ${a.metadata}, ${a.created_at})
      `;
    }
    console.log(`   ✓ ${activities.length} activities`);
  }

  // ========================================
  // DONE
  // ========================================
  console.log('\n✅ Schema rebuild complete!\n');

  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log('📋 Final tables:');
  tables.forEach(t => console.log(`   - ${t.table_name}`));

  const leadCount = await sql`SELECT COUNT(*) as count FROM leads`;
  const bizCount = await sql`SELECT COUNT(*) as count FROM businesses`;
  console.log(`\n📊 Data: ${bizCount[0].count} businesses, ${leadCount[0].count} leads`);

  await sql.end();
}

rebuild().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
