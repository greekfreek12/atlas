// Run full database migration
import postgres from 'postgres';

const connectionString = process.env.DIRECT_URL || 'postgresql://postgres.poenzlvrvicrqkxworlb:qzdV1tEUz7Wwarfo@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

async function runMigration() {
  console.log('🔧 Running Atlas Full Schema Migration...\n');

  try {
    // ========================================
    // BASE SCHEMA
    // ========================================
    console.log('📦 PHASE 1: Base Schema\n');

    console.log('1. Enabling UUID extension...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    console.log('   ✓ Done\n');

    console.log('2. Creating businesses table...');
    await sql`
      CREATE TABLE IF NOT EXISTS businesses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug VARCHAR(255) UNIQUE NOT NULL,
        template VARCHAR(50) DEFAULT 'clean',
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        full_address TEXT,
        street VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(50),
        postal_code VARCHAR(20),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        google_rating DECIMAL(2, 1),
        google_reviews_count INTEGER,
        google_reviews_link TEXT,
        google_place_id VARCHAR(255),
        working_hours JSONB,
        facebook_url TEXT,
        instagram_url TEXT,
        youtube_url TEXT,
        custom_headline TEXT,
        custom_tagline TEXT,
        custom_about TEXT,
        primary_color VARCHAR(7),
        accent_color VARCHAR(7),
        status VARCHAR(50) DEFAULT 'prospect',
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✓ Done\n');

    console.log('3. Creating services table...');
    await sql`
      CREATE TABLE IF NOT EXISTS services (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✓ Done\n');

    console.log('4. Creating form_submissions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        name VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✓ Done\n');

    console.log('5. Creating page_views table...');
    await sql`
      CREATE TABLE IF NOT EXISTS page_views (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        session_id VARCHAR(255),
        page_path VARCHAR(255),
        referrer TEXT,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✓ Done\n');

    console.log('6. Creating outscraper_imports table...');
    await sql`
      CREATE TABLE IF NOT EXISTS outscraper_imports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        raw_data JSONB NOT NULL,
        imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        processed BOOLEAN DEFAULT false
      )
    `;
    console.log('   ✓ Done\n');

    console.log('7. Creating default_services table...');
    await sql`
      CREATE TABLE IF NOT EXISTS default_services (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        niche VARCHAR(50) DEFAULT 'plumber',
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        sort_order INTEGER DEFAULT 0
      )
    `;
    console.log('   ✓ Done\n');

    console.log('8. Creating analytics_events table...');
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✓ Done\n');

    console.log('9. Creating base indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_page_views_business ON page_views(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_events_business ON analytics_events(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at)`;
    console.log('   ✓ Done\n');

    console.log('10. Enabling RLS on base tables...');
    await sql`ALTER TABLE businesses ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE services ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE page_views ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY`;
    console.log('   ✓ Done\n');

    console.log('11. Creating RLS policies...');
    await sql`DROP POLICY IF EXISTS "Public can view published businesses" ON businesses`;
    await sql`CREATE POLICY "Public can view published businesses" ON businesses FOR SELECT USING (is_published = true)`;
    await sql`DROP POLICY IF EXISTS "Public can view services" ON services`;
    await sql`CREATE POLICY "Public can view services" ON services FOR SELECT USING (true)`;
    await sql`DROP POLICY IF EXISTS "Anyone can submit contact forms" ON form_submissions`;
    await sql`CREATE POLICY "Anyone can submit contact forms" ON form_submissions FOR INSERT WITH CHECK (true)`;
    await sql`DROP POLICY IF EXISTS "Anyone can log page views" ON page_views`;
    await sql`CREATE POLICY "Anyone can log page views" ON page_views FOR INSERT WITH CHECK (true)`;
    await sql`DROP POLICY IF EXISTS "Anyone can log analytics events" ON analytics_events`;
    await sql`CREATE POLICY "Anyone can log analytics events" ON analytics_events FOR INSERT WITH CHECK (true)`;
    console.log('   ✓ Done\n');

    console.log('12. Creating update trigger function...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    await sql`DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses`;
    await sql`
      CREATE TRIGGER update_businesses_updated_at
      BEFORE UPDATE ON businesses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log('   ✓ Done\n');

    console.log('13. Inserting default plumber services...');
    // Check if default services exist first
    const existing = await sql`SELECT COUNT(*) as count FROM default_services WHERE niche = 'plumber'`;
    if (existing[0].count === 0) {
      await sql`
        INSERT INTO default_services (niche, name, description, icon, sort_order) VALUES
        ('plumber', 'Emergency Plumbing', 'Available 24/7 for burst pipes, severe leaks, and plumbing emergencies. Fast response when you need it most.', 'alert-triangle', 1),
        ('plumber', 'Drain Cleaning', 'Professional drain cleaning for clogged sinks, showers, and main sewer lines. We clear the toughest blockages.', 'droplets', 2),
        ('plumber', 'Water Heater Services', 'Installation, repair, and maintenance for tank and tankless water heaters. Hot water when you need it.', 'flame', 3),
        ('plumber', 'Leak Detection & Repair', 'Advanced leak detection to find hidden leaks before they cause major damage. Expert repairs that last.', 'search', 4),
        ('plumber', 'Fixture Installation', 'Professional installation of faucets, toilets, sinks, and showers. Quality workmanship guaranteed.', 'wrench', 5),
        ('plumber', 'Pipe Repair & Replacement', 'From minor pipe repairs to complete repiping. We work with all pipe materials and sizes.', 'cylinder', 6),
        ('plumber', 'Sewer Line Services', 'Sewer line inspection, cleaning, and repair. We diagnose and fix sewer problems fast.', 'arrow-down-circle', 7),
        ('plumber', 'Water Treatment', 'Water softeners, filtration systems, and water quality testing. Better water for your home.', 'droplet', 8)
      `;
      console.log('   ✓ Inserted 8 default services\n');
    } else {
      console.log('   ✓ Default services already exist\n');
    }

    // ========================================
    // V2 SCHEMA - NICHES & CRM
    // ========================================
    console.log('📦 PHASE 2: V2 Schema (Niches & CRM)\n');

    console.log('14. Creating niches table...');
    await sql`
      CREATE TABLE IF NOT EXISTS niches (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        schema_type VARCHAR(100) DEFAULT 'LocalBusiness',
        default_headline_template TEXT,
        default_tagline_template TEXT,
        default_about_template TEXT,
        hero_images JSONB,
        icon_set VARCHAR(50) DEFAULT 'lucide',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✓ Done\n');

    console.log('15. Adding niche_id to businesses and default_services...');
    // Check if column exists before adding
    const businessCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'niche_id'`;
    if (businessCols.length === 0) {
      await sql`ALTER TABLE businesses ADD COLUMN niche_id UUID REFERENCES niches(id)`;
    }
    const serviceCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'default_services' AND column_name = 'niche_id'`;
    if (serviceCols.length === 0) {
      await sql`ALTER TABLE default_services ADD COLUMN niche_id UUID REFERENCES niches(id)`;
    }
    await sql`CREATE INDEX IF NOT EXISTS idx_businesses_niche ON businesses(niche_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_default_services_niche ON default_services(niche_id)`;
    console.log('   ✓ Done\n');

    console.log('16. Creating niche_image_mappings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS niche_image_mappings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        niche_id UUID REFERENCES niches(id) ON DELETE CASCADE,
        service_slug VARCHAR(100) NOT NULL,
        images JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(niche_id, service_slug)
      )
    `;
    console.log('   ✓ Done\n');

    console.log('17. Creating business_research table...');
    await sql`
      CREATE TABLE IF NOT EXISTS business_research (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
        facebook_data JSONB,
        instagram_data JSONB,
        website_url TEXT,
        website_images JSONB,
        website_content JSONB,
        generated_headline TEXT,
        generated_tagline TEXT,
        generated_about TEXT,
        generated_service_descriptions JSONB,
        outscraper_completed_at TIMESTAMP WITH TIME ZONE,
        social_completed_at TIMESTAMP WITH TIME ZONE,
        website_completed_at TIMESTAMP WITH TIME ZONE,
        ai_copy_completed_at TIMESTAMP WITH TIME ZONE,
        profile_completeness_score INTEGER,
        data_quality_score INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✓ Done\n');

    console.log('18. Creating research_jobs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS research_jobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        job_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        priority INTEGER DEFAULT 5,
        input_data JSONB,
        output_data JSONB,
        error_message TEXT,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_research_jobs_status ON research_jobs(status, priority)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_research_jobs_business ON research_jobs(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_business_research_business ON business_research(business_id)`;
    console.log('   ✓ Done\n');

    // ========================================
    // CRM TABLES
    // ========================================
    console.log('📦 PHASE 3: CRM Tables\n');

    console.log('19. Creating leads table...');
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
        status VARCHAR(50) DEFAULT 'new',
        stage VARCHAR(50) DEFAULT 'awareness',
        contact_name VARCHAR(255),
        contact_phone VARCHAR(50),
        contact_email VARCHAR(255),
        score INTEGER DEFAULT 0,
        score_factors JSONB,
        source VARCHAR(100),
        utm_data JSONB,
        assigned_to VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_business ON leads(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC)`;
    console.log('   ✓ Done\n');

    console.log('20. Creating sms_campaigns table...');
    await sql`
      CREATE TABLE IF NOT EXISTS sms_campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        niche_id UUID REFERENCES niches(id),
        message_template TEXT NOT NULL,
        follow_up_templates JSONB,
        target_criteria JSONB,
        status VARCHAR(20) DEFAULT 'draft',
        total_sent INTEGER DEFAULT 0,
        total_delivered INTEGER DEFAULT 0,
        total_responded INTEGER DEFAULT 0,
        total_converted INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✓ Done\n');

    console.log('21. Creating sms_messages table...');
    await sql`
      CREATE TABLE IF NOT EXISTS sms_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        campaign_id UUID REFERENCES sms_campaigns(id) ON DELETE SET NULL,
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        to_phone VARCHAR(50) NOT NULL,
        from_phone VARCHAR(50) NOT NULL,
        message_body TEXT NOT NULL,
        textgrid_message_id VARCHAR(255),
        direction VARCHAR(10) DEFAULT 'outbound',
        status VARCHAR(20) DEFAULT 'queued',
        error_message TEXT,
        sent_at TIMESTAMP WITH TIME ZONE,
        delivered_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_sms_messages_lead ON sms_messages(lead_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sms_messages_campaign ON sms_messages(campaign_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sms_messages_status ON sms_messages(status)`;
    console.log('   ✓ Done\n');

    console.log('22. Creating lead_activities table...');
    await sql`
      CREATE TABLE IF NOT EXISTS lead_activities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities(lead_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(activity_type)`;
    console.log('   ✓ Done\n');

    console.log('23. Creating site_customizations table...');
    await sql`
      CREATE TABLE IF NOT EXISTS site_customizations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
        status VARCHAR(20) DEFAULT 'pending',
        headline_customized BOOLEAN DEFAULT false,
        tagline_customized BOOLEAN DEFAULT false,
        about_customized BOOLEAN DEFAULT false,
        services_customized BOOLEAN DEFAULT false,
        images_customized BOOLEAN DEFAULT false,
        colors_customized BOOLEAN DEFAULT false,
        reviewed_by VARCHAR(255),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        review_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_site_customizations_business ON site_customizations(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_site_customizations_status ON site_customizations(status)`;
    console.log('   ✓ Done\n');

    console.log('24. Enabling RLS on new tables...');
    await sql`ALTER TABLE niches ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE niche_image_mappings ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE business_research ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE research_jobs ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE leads ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE site_customizations ENABLE ROW LEVEL SECURITY`;
    console.log('   ✓ Done\n');

    console.log('25. Creating V2 RLS policies...');
    await sql`DROP POLICY IF EXISTS "Public can view niches" ON niches`;
    await sql`CREATE POLICY "Public can view niches" ON niches FOR SELECT USING (true)`;
    await sql`DROP POLICY IF EXISTS "Public can view niche image mappings" ON niche_image_mappings`;
    await sql`CREATE POLICY "Public can view niche image mappings" ON niche_image_mappings FOR SELECT USING (true)`;
    console.log('   ✓ Done\n');

    console.log('26. Creating update triggers for new tables...');
    await sql`DROP TRIGGER IF EXISTS update_business_research_updated_at ON business_research`;
    await sql`CREATE TRIGGER update_business_research_updated_at BEFORE UPDATE ON business_research FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    await sql`DROP TRIGGER IF EXISTS update_leads_updated_at ON leads`;
    await sql`CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    await sql`DROP TRIGGER IF EXISTS update_sms_campaigns_updated_at ON sms_campaigns`;
    await sql`CREATE TRIGGER update_sms_campaigns_updated_at BEFORE UPDATE ON sms_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    await sql`DROP TRIGGER IF EXISTS update_site_customizations_updated_at ON site_customizations`;
    await sql`CREATE TRIGGER update_site_customizations_updated_at BEFORE UPDATE ON site_customizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    console.log('   ✓ Done\n');

    console.log('27. Inserting plumber niche...');
    const existingNiche = await sql`SELECT id FROM niches WHERE slug = 'plumber'`;
    if (existingNiche.length === 0) {
      await sql`
        INSERT INTO niches (slug, display_name, schema_type, default_headline_template, default_tagline_template, default_about_template)
        VALUES (
          'plumber',
          'Plumber',
          'Plumber',
          '{name} - Your Trusted {city} Plumber',
          'Professional plumbing services for {city} and surrounding areas',
          '{name} has been providing professional plumbing services to {city}, {state} and surrounding communities. Our team of licensed plumbers is committed to delivering quality workmanship and exceptional customer service on every job.'
        )
      `;
      console.log('   ✓ Inserted plumber niche\n');
    } else {
      console.log('   ✓ Plumber niche already exists\n');
    }

    console.log('28. Linking default_services to plumber niche...');
    await sql`
      UPDATE default_services
      SET niche_id = (SELECT id FROM niches WHERE slug = 'plumber')
      WHERE niche = 'plumber' AND niche_id IS NULL
    `;
    console.log('   ✓ Done\n');

    console.log('29. Inserting niche image mappings...');
    const nicheId = await sql`SELECT id FROM niches WHERE slug = 'plumber'`;
    if (nicheId.length > 0) {
      const mappings = [
        { slug: 'emergency-plumbing', images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'] },
        { slug: 'drain-cleaning', images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800', 'https://images.unsplash.com/photo-1558618047-f4f8a1f4b6c9?w=800'] },
        { slug: 'water-heater-services', images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'] },
        { slug: 'leak-detection', images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800'] },
        { slug: 'fixture-installation', images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800'] },
        { slug: 'pipe-repair', images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'] },
        { slug: 'sewer-line-services', images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800'] },
        { slug: 'water-treatment', images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', 'https://images.unsplash.com/photo-1558618047-f4f8a1f4b6c9?w=800'] },
      ];

      for (const m of mappings) {
        await sql`
          INSERT INTO niche_image_mappings (niche_id, service_slug, images)
          VALUES (${nicheId[0].id}, ${m.slug}, ${JSON.stringify(m.images)}::jsonb)
          ON CONFLICT (niche_id, service_slug) DO NOTHING
        `;
      }
      console.log('   ✓ Inserted 8 image mappings\n');
    }

    console.log('\n✅ Full migration complete!\n');

    // Show summary
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
    console.log('📋 Tables in database:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.code) console.error('   Error code:', error.code);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration().catch((err) => {
  console.error(err);
  process.exit(1);
});
