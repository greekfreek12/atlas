// Run migration script using postgres package
import postgres from 'postgres';

const connectionString = process.env.DIRECT_URL || 'postgresql://postgres.poenzlvrvicrqkxworlb:qzdV1tEUz7Wwarfo@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

async function runMigration() {
  console.log('🔧 Running CRM Admin migrations...\n');

  try {
    // Check if update_updated_at_column function exists, create if not
    console.log('1. Creating update_updated_at_column function...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;
    console.log('   ✓ Function created\n');

    // Create profiles table
    console.log('2. Creating profiles table...');
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
        email TEXT NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✓ Profiles table created\n');

    // Enable RLS
    console.log('3. Enabling Row Level Security...');
    await sql`ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`;
    console.log('   ✓ RLS enabled\n');

    // Create policies
    console.log('4. Creating RLS policies...');

    // Drop existing policies if they exist (to avoid conflicts)
    await sql`DROP POLICY IF EXISTS "Users can view own profile" ON profiles`;
    await sql`DROP POLICY IF EXISTS "Users can update own profile" ON profiles`;
    await sql`DROP POLICY IF EXISTS "Service role has full access" ON profiles`;

    await sql`
      CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id)
    `;
    await sql`
      CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id)
    `;
    await sql`
      CREATE POLICY "Service role has full access" ON profiles
      FOR ALL USING (auth.jwt() ->> 'role' = 'service_role')
    `;
    console.log('   ✓ Policies created\n');

    // Create trigger for updated_at
    console.log('5. Creating update trigger...');
    await sql`DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles`;
    await sql`
      CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log('   ✓ Trigger created\n');

    // Create handle_new_user function and trigger
    console.log('6. Creating auto-profile on signup...');
    await sql`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (
          new.id,
          new.email,
          new.raw_user_meta_data->>'full_name',
          'user'
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER
    `;

    // Drop and recreate trigger
    await sql`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`;
    await sql`
      CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user()
    `;
    console.log('   ✓ Auto-profile trigger created\n');

    // Create index
    console.log('7. Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role)`;
    console.log('   ✓ Index created\n');

    console.log('✅ Migration complete!\n');

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
