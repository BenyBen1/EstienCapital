import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

// Create a Supabase client with the service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Create a Supabase client with the anon key for client operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Types for our database tables
export type Tables = {
  profiles: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    date_of_birth: string;
    gender: string;
    occupation: string;
    source_of_wealth: string;
    physical_address: string;
    postal_address: string;
    postal_code: string;
    country: string;
    kyc_status: 'pending' | 'approved' | 'rejected';
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
  };
  kyc_submissions: {
    id: string;
    user_id: string;
    id_type: string;
    id_number: string;
    id_document_url: string;
    kra_pin: string;
    passport_photo_url: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
  };
  wallets: {
    id: string;
    user_id: string;
    balance: number;
    currency: string;
    created_at: string;
    updated_at: string;
  };
  transactions: {
    id: string;
    user_id: string;
    type: 'deposit' | 'withdrawal' | 'buy' | 'sell';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    reference: string;
    description: string;
    fee?: number;
    created_at: string;
    updated_at: string;
  };
  investments: {
    id: string;
    user_id: string;
    fund_id: string;
    amount: number;
    units: number;
    status: 'active' | 'sold';
    created_at: string;
    updated_at: string;
  };
  goals: {
    id: string;
    user_id: string;
    title: string;
    description: string;
    target_amount: number;
    current_amount: number;
    target_date: string;
    status: 'active' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
  };
  goal_contributions: {
    id: string;
    goal_id: string;
    amount: number;
    date: string;
    created_at: string;
  };
  notification_preferences: {
    id: string;
    user_id: string;
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    created_at: string;
    updated_at: string;
  };
  security_settings: {
    id: string;
    user_id: string;
    two_factor_enabled: boolean;
    two_factor_secret?: string;
    last_password_change: string;
    created_at: string;
    updated_at: string;
  };
  activity_logs: {
    id: string;
    user_id: string;
    action: string;
    details: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
  };
  error_logs: {
    id: string;
    user_id?: string;
    error_message: string;
    stack_trace: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
  };
}; 