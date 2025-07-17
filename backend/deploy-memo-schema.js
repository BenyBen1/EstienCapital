const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const memoSchema = `
-- Create memos table for CIO communications
CREATE TABLE IF NOT EXISTS memos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  summary text,
  content text NOT NULL,
  author text NOT NULL DEFAULT 'Estien Capital CIO',
  category text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Delivery settings
  send_email boolean DEFAULT true,
  send_app_notification boolean DEFAULT true,
  
  -- Scheduling
  publish_immediately boolean DEFAULT false,
  scheduled_publish_at timestamp with time zone,
  published_at timestamp with time zone,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create memo delivery tracking table
CREATE TABLE IF NOT EXISTS memo_deliveries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  memo_id uuid REFERENCES memos(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Delivery status
  email_sent boolean DEFAULT false,
  email_sent_at timestamp with time zone,
  email_opened boolean DEFAULT false,
  email_opened_at timestamp with time zone,
  
  -- App engagement
  app_notification_sent boolean DEFAULT false,
  app_notification_sent_at timestamp with time zone,
  read_in_app boolean DEFAULT false,
  read_in_app_at timestamp with time zone,
  
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memos_status ON memos(status);
CREATE INDEX IF NOT EXISTS idx_memos_published_at ON memos(published_at);
CREATE INDEX IF NOT EXISTS idx_memos_scheduled_publish_at ON memos(scheduled_publish_at);
CREATE INDEX IF NOT EXISTS idx_memo_deliveries_memo_id ON memo_deliveries(memo_id);
CREATE INDEX IF NOT EXISTS idx_memo_deliveries_user_id ON memo_deliveries(user_id);
`;

const rlsPolicies = `
-- RLS policies for memos
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_deliveries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all memos" ON memos;
DROP POLICY IF EXISTS "Users can view published memos" ON memos;
DROP POLICY IF EXISTS "Users can view own deliveries" ON memo_deliveries;
DROP POLICY IF EXISTS "Admins can manage all deliveries" ON memo_deliveries;

-- Admin can manage all memos
CREATE POLICY "Admins can manage all memos" ON memos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Users can view published memos
CREATE POLICY "Users can view published memos" ON memos
  FOR SELECT USING (status = 'published');

-- Users can view their own delivery records
CREATE POLICY "Users can view own deliveries" ON memo_deliveries
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all deliveries
CREATE POLICY "Admins can manage all deliveries" ON memo_deliveries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
`;

async function deploySchema() {
  try {
    console.log('Deploying memo schema...');
    
    // Execute the schema creation
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: memoSchema
    });
    
    if (schemaError) {
      console.error('Schema creation error:', schemaError);
      return;
    }
    
    console.log('Schema created successfully!');
    
    // Execute RLS policies
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: rlsPolicies
    });
    
    if (rlsError) {
      console.error('RLS policies error:', rlsError);
      return;
    }
    
    console.log('RLS policies applied successfully!');
    console.log('✅ Memo system database schema deployed successfully!');
    
  } catch (error) {
    console.error('Deployment failed:', error);
  }
}

deploySchema();
