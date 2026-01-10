// Seed demo data for testing the admin dashboard
import postgres from 'postgres';

const connectionString = process.env.DIRECT_URL || 'postgresql://postgres.poenzlvrvicrqkxworlb:qzdV1tEUz7Wwarfo@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

const demoBusinesses = [
  { name: "Marco's Plumbing", city: "Naples", state: "FL", phone: "(239) 555-0101", rating: 4.9, reviews: 127, score: 92 },
  { name: "Joe's Drain Service", city: "Fort Myers", state: "FL", phone: "(239) 555-0102", rating: 4.7, reviews: 89, score: 85 },
  { name: "ABC Plumbing Co", city: "Cape Coral", state: "FL", phone: "(239) 555-0103", rating: 4.5, reviews: 203, score: 78 },
  { name: "Quick Fix Plumbers", city: "Bonita Springs", state: "FL", phone: "(239) 555-0104", rating: 4.8, reviews: 156, score: 88 },
  { name: "All Star Plumbing", city: "Estero", state: "FL", phone: "(239) 555-0105", rating: 4.3, reviews: 67, score: 65 },
  { name: "Premier Drain Solutions", city: "Naples", state: "FL", phone: "(239) 555-0106", rating: 4.6, reviews: 94, score: 72 },
  { name: "Reliable Plumbing", city: "Fort Myers", state: "FL", phone: "(239) 555-0107", rating: 4.9, reviews: 231, score: 95 },
  { name: "Expert Pipe Works", city: "Lehigh Acres", state: "FL", phone: "(239) 555-0108", rating: 4.4, reviews: 78, score: 68 },
  { name: "24/7 Emergency Plumbing", city: "Naples", state: "FL", phone: "(239) 555-0109", rating: 4.7, reviews: 145, score: 82 },
  { name: "Gulf Coast Plumbing", city: "Marco Island", state: "FL", phone: "(239) 555-0110", rating: 4.8, reviews: 112, score: 87 },
  { name: "SwiftFlow Plumbing", city: "Sanibel", state: "FL", phone: "(239) 555-0111", rating: 4.5, reviews: 56, score: 70 },
  { name: "Dave's Drain Masters", city: "Fort Myers Beach", state: "FL", phone: "(239) 555-0112", rating: 4.6, reviews: 189, score: 80 },
];

const statuses = ['new', 'new', 'new', 'contacted', 'contacted', 'interested', 'interested', 'demo', 'customer', 'customer', 'lost', 'new'];

async function seedData() {
  console.log('🌱 Seeding demo data...\n');

  try {
    // Get niche ID
    const niches = await sql`SELECT id FROM niches WHERE slug = 'plumber'`;
    const nicheId = niches[0]?.id;

    for (let i = 0; i < demoBusinesses.length; i++) {
      const b = demoBusinesses[i];
      const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      console.log(`Creating ${b.name}...`);

      // Check if business exists
      const existing = await sql`SELECT id FROM businesses WHERE slug = ${slug}`;
      let businessId;

      if (existing.length > 0) {
        businessId = existing[0].id;
        console.log(`   Already exists, using existing ID`);
      } else {
        // Insert business
        const result = await sql`
          INSERT INTO businesses (slug, name, phone, city, state, google_rating, google_reviews_count, niche_id, status, is_published)
          VALUES (${slug}, ${b.name}, ${b.phone}, ${b.city}, ${b.state}, ${b.rating}, ${b.reviews}, ${nicheId}, 'prospect', true)
          RETURNING id
        `;
        businessId = result[0].id;
        console.log(`   Business created`);
      }

      // Check if lead exists
      const existingLead = await sql`SELECT id FROM leads WHERE business_id = ${businessId}`;
      if (existingLead.length === 0) {
        // Insert lead
        await sql`
          INSERT INTO leads (business_id, status, score, contact_name, contact_phone, source)
          VALUES (${businessId}, ${statuses[i]}, ${b.score}, ${b.name.split("'")[0]}, ${b.phone}, 'outscraper')
        `;
        console.log(`   Lead created with status: ${statuses[i]}`);
      } else {
        console.log(`   Lead already exists`);
      }
    }

    // Create a sample campaign
    console.log('\nCreating sample SMS campaign...');
    const existingCampaign = await sql`SELECT id FROM sms_campaigns WHERE name = 'Initial Outreach'`;
    if (existingCampaign.length === 0) {
      await sql`
        INSERT INTO sms_campaigns (name, message_template, status, target_criteria, total_sent, total_delivered, total_responded)
        VALUES (
          'Initial Outreach',
          'Hi {first_name}! This is Atlas Sites. We noticed {business_name} doesn''t have a modern website yet. We build professional plumber websites that rank on Google. Interested in a free demo? Reply YES!',
          'draft',
          '{"status": ["new"], "min_score": 70}'::jsonb,
          0, 0, 0
        )
      `;
      console.log('   Campaign created');
    } else {
      console.log('   Campaign already exists');
    }

    console.log('\n✅ Demo data seeded successfully!\n');

    // Summary
    const leadCounts = await sql`SELECT status, COUNT(*) as count FROM leads GROUP BY status ORDER BY status`;
    console.log('📊 Leads by status:');
    leadCounts.forEach(row => {
      console.log(`   ${row.status}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

seedData().catch(console.error);
