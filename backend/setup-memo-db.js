const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createMemoTables() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Create memos table
    console.log('Creating memos table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS memos (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        title text NOT NULL,
        summary text,
        content text NOT NULL,
        author text NOT NULL DEFAULT 'Estien Capital CIO',
        category text NOT NULL,
        status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        send_email boolean DEFAULT true,
        send_app_notification boolean DEFAULT true,
        publish_immediately boolean DEFAULT false,
        scheduled_publish_at timestamp with time zone,
        published_at timestamp with time zone,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        created_by uuid
      );
    `);
    console.log('✅ Memos table created');

    // Create memo_deliveries table
    console.log('Creating memo_deliveries table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS memo_deliveries (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        memo_id uuid NOT NULL,
        user_id uuid NOT NULL,
        email_sent boolean DEFAULT false,
        email_sent_at timestamp with time zone,
        email_opened boolean DEFAULT false,
        email_opened_at timestamp with time zone,
        app_notification_sent boolean DEFAULT false,
        app_notification_sent_at timestamp with time zone,
        read_in_app boolean DEFAULT false,
        read_in_app_at timestamp with time zone,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        FOREIGN KEY (memo_id) REFERENCES memos(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Memo deliveries table created');

    // Create indexes
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_memos_status ON memos(status);
      CREATE INDEX IF NOT EXISTS idx_memos_published_at ON memos(published_at);
      CREATE INDEX IF NOT EXISTS idx_memo_deliveries_memo_id ON memo_deliveries(memo_id);
      CREATE INDEX IF NOT EXISTS idx_memo_deliveries_user_id ON memo_deliveries(user_id);
    `);
    console.log('✅ Indexes created');

    // Create RLS policies
    console.log('Setting up RLS policies...');
    await client.query(`
      ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
      ALTER TABLE memo_deliveries ENABLE ROW LEVEL SECURITY;
    `);

    // Drop existing policies if they exist
    await client.query(`
      DROP POLICY IF EXISTS "Admins can manage all memos" ON memos;
      DROP POLICY IF EXISTS "Users can view published memos" ON memos;
      DROP POLICY IF EXISTS "Users can view own deliveries" ON memo_deliveries;
      DROP POLICY IF EXISTS "Admins can manage all deliveries" ON memo_deliveries;
    `);

    // Create policies
    await client.query(`
      CREATE POLICY "Admins can manage all memos" ON memos
        FOR ALL USING (true);

      CREATE POLICY "Users can view published memos" ON memos
        FOR SELECT USING (status = 'published');

      CREATE POLICY "Users can view own deliveries" ON memo_deliveries
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Admins can manage all deliveries" ON memo_deliveries
        FOR ALL USING (true);
    `);
    console.log('✅ RLS policies created');

    console.log('🎉 Memo system database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await client.end();
  }
}

createMemoTables();
